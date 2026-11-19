import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { WorkActivity, PenilaianResiko, StatusPekerjaan } from './src/types/monitoring.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const SPREADSHEET_ID =
  process.env.GOOGLE_SPREADSHEET_ID || '17vjzy0BlZPA07EVWHFSXiglcMHPsZaprDcUmTb_CpZI';
const APPS_SCRIPT_WEBHOOK_URL = (process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL || '').trim();
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;
const CACHE_TTL_MS = 15_000; // 15 seconds lightweight cache

interface SheetCache {
  activities: WorkActivity[];
  fetchedAt: number;
}

let cache: SheetCache | null = null;

function getTodayJakartaISO(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === 'year')?.value ?? '2026';
  const m = parts.find(p => p.type === 'month')?.value ?? '01';
  const d = parts.find(p => p.type === 'day')?.value ?? '01';
  return `${y}-${m}-${d}`;
}

function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (ch === '\r' && next === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += ch;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function parseFlexibleDateToISO(raw: string): string | null {
  const val = (raw || '').trim();
  if (!val) return null;

  // YYYY-MM-DD
  const isoMatch = val.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  }

  // M/D/YYYY or M/D/YYYY HH:mm:ss
  const slashMatch = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+.*)?$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}

function addDaysToISO(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function estimateDaysFromDuration(durationText: string): number | null {
  const lower = (durationText || '').toLowerCase().trim();
  if (!lower) return null;
  const numMatch = lower.match(/(\d+)/);
  if (!numMatch) return null;
  const n = Number(numMatch[1]);
  if (lower.includes('minggu')) return n * 7;
  if (lower.includes('bulan')) return n * 30;
  if (lower.includes('tahun')) return n * 365;
  // default days if "hari" or bare number
  return n;
}

function parseWorkerCount(raw: string): number {
  const match = (raw || '').match(/\d+/);
  return match ? Math.max(1, Number(match[0])) : 1;
}

function sanitizePhoneForDisplay(raw: string): string {
  const input = (raw || '').trim();
  if (!input) return '';
  const mobileMatch = input.match(/(?:\+?62|0)8[\d\s\-().]{6,}/);
  let digits = (mobileMatch ? mobileMatch[0] : input).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('62') && digits.length >= 10) {
    digits = '0' + digits.slice(2);
  } else if (digits.startsWith('8') && digits.length >= 9) {
    digits = '0' + digits;
  }
  return digits.slice(0, 15);
}

function isValidWhatsAppNumber(raw: string): boolean {
  const sanitized = sanitizePhoneForDisplay(raw);
  return /^08\d{8,13}$/.test(sanitized) || /^0\d{8,14}$/.test(sanitized);
}

function extractPhoneClean(raw: string): string {
  const digits = sanitizePhoneForDisplay(raw);
  if (!digits) return '';
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return '62' + digits;
}

function normalizeRisk(raw: string): PenilaianResiko {
  const val = (raw || '').trim().toLowerCase();
  if (val.includes('tinggi')) return 'Tinggi';
  if (val.includes('sedang')) return 'Sedang';
  return 'Rendah';
}

function determineStatus(
  startDateISO: string,
  endDateISO: string | undefined,
  evaluasiRaw: string,
  todayISO: string
): StatusPekerjaan {
  const evalLower = (evaluasiRaw || '').trim().toLowerCase();
  if (evalLower === 'selesai' || evalLower.includes('status: selesai')) return 'Selesai';
  if (evalLower === 'berlangsung' || evalLower.includes('status: berlangsung')) return 'Berlangsung';
  if (evalLower === 'terjadwal' || evalLower.includes('status: terjadwal')) return 'Terjadwal';

  if (startDateISO && todayISO < startDateISO) {
    return 'Terjadwal';
  }
  if (endDateISO && todayISO > endDateISO) {
    return 'Selesai';
  }
  return 'Berlangsung';
}

function mapRowToActivity(row: string[], rowIndexZeroBased: number, todayISO: string): WorkActivity | null {
  const namaKegiatan = (row[1] || '').trim();
  if (!namaKegiatan) return null;

  const timestampRaw = (row[0] || '').trim();
  const namaPIC = (row[2] || '').trim() || '-';
  const rawNomorKontak = (row[3] || '').trim();
  const nomorKontak = sanitizePhoneForDisplay(rawNomorKontak) || rawNomorKontak;
  const tujuanKegiatan = (row[4] || '').trim() || 'Kegiatan/Proyek departemen';
  const durasiCol = (row[5] || '').trim();
  const jumlahPekerja = parseWorkerCount(row[6] || '');
  const lokasiPekerjaan = (row[7] || '').trim() || '-';
  const identitasPICUrl = (row[8] || '').trim();
  const emailPIC = (row[9] || '').trim();
  const apdRaw = (row[10] || '').trim();
  const tanggalMulaiRaw = (row[11] || '').trim();
  const dokumenJSAUrl = (row[12] || '').trim();
  const dokumenSafetyInductionUrl = (row[13] || '').trim();
  const lamaPelaksanaanRaw = (row[14] || '').trim();
  const penilaianResikoRaw = (row[15] || '').trim();
  const evaluasiRaw = (row[16] || '').trim();

  const tanggalPelaksanaan =
    parseFlexibleDateToISO(tanggalMulaiRaw) ||
    parseFlexibleDateToISO(timestampRaw) ||
    todayISO;

  // Handle "Lama Pelaksanaan" column: can be an end date (11/20/2026) or duration ("7", "10 Minggu")
  let durasiText = durasiCol;
  let tanggalSelesai = parseFlexibleDateToISO(lamaPelaksanaanRaw) || undefined;

  if (!tanggalSelesai && lamaPelaksanaanRaw) {
    if (!durasiText) {
      durasiText = /^\d+$/.test(lamaPelaksanaanRaw)
        ? `${lamaPelaksanaanRaw} hari`
        : lamaPelaksanaanRaw;
    }
    const days = estimateDaysFromDuration(lamaPelaksanaanRaw);
    if (days !== null) {
      tanggalSelesai = addDaysToISO(tanggalPelaksanaan, days);
    }
  } else if (!tanggalSelesai && durasiText) {
    const days = estimateDaysFromDuration(durasiText);
    if (days !== null) {
      tanggalSelesai = addDaysToISO(tanggalPelaksanaan, days);
    }
  }

  const kebutuhanAPD = apdRaw
    ? apdRaw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : ['Helm', 'Rompi'];

  const penilaianResiko = normalizeRisk(penilaianResikoRaw);
  const status = determineStatus(tanggalPelaksanaan, tanggalSelesai, evaluasiRaw, todayISO);
  const rowNumber = rowIndexZeroBased + 1; // 1-based sheet row

  // Strip explicit status tag from displayed notes so it doesn't clutter catatan
  const cleanedEvaluasiNote = evaluasiRaw
    .replace(/\|?\s*Status:\s*(Berlangsung|Terjadwal|Selesai)\s*/gi, '')
    .replace(/^(Berlangsung|Terjadwal|Selesai)$/i, '')
    .trim();

  return {
    id: `gs-${rowNumber}`,
    rowNumber,
    namaKegiatan,
    lokasiPekerjaan,
    jumlahPekerja,
    tanggalPelaksanaan,
    durasiText: durasiText || undefined,
    tanggalSelesai,
    namaPIC,
    nomorKontak,
    nomorKontakClean: extractPhoneClean(nomorKontak),
    kebutuhanAPD,
    penilaianResiko,
    tujuanKegiatan,
    emailPIC,
    identitasPICUrl,
    dokumenJSAUrl,
    dokumenSafetyInductionUrl,
    jamKerjaAman: jumlahPekerja * 40,
    status,
    catatan: cleanedEvaluasiNote || (!penilaianResikoRaw ? 'Menunggu verifikasi penilaian resiko pengawas K3.' : ''),
    createdAt: timestampRaw || tanggalPelaksanaan
  };
}

async function fetchActivitiesFromSheet(forceRefresh = false): Promise<SheetCache> {
  const now = Date.now();
  if (!forceRefresh && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }

  const response = await fetch(SHEET_CSV_URL, {
    headers: { 'Accept': 'text/csv' }
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data Google Sheets (HTTP ${response.status})`);
  }

  const csvText = await response.text();
  const rows = parseCsvRows(csvText);
  const todayISO = getTodayJakartaISO();

  const activities: WorkActivity[] = [];
  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const item = mapRowToActivity(rows[i], i, todayISO);
    if (item) {
      activities.push(item);
    }
  }

  // Sort newest rows first by execution date descending, then rowNumber descending
  activities.sort((a, b) => {
    const dateDiff = new Date(b.tanggalPelaksanaan).getTime() - new Date(a.tanggalPelaksanaan).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (b.rowNumber || 0) - (a.rowNumber || 0);
  });

  cache = { activities, fetchedAt: now };
  return cache;
}

function formatIsoToSheetDate(isoDate: string): string {
  const match = (isoDate || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate || '';
  return `${Number(match[2])}/${Number(match[3])}/${match[1]}`;
}

function formatNowSheetTimestamp(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const get = (t: string) => parts.find(p => p.type === t)?.value || '0';
  return `${get('month')}/${get('day')}/${get('year')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

function buildSheetRowValues(activity: Partial<WorkActivity>, existingTimestamp?: string): string[] {
  const timestamp = existingTimestamp || formatNowSheetTimestamp();
  const apdJoined = Array.isArray(activity.kebutuhanAPD) ? activity.kebutuhanAPD.join(', ') : '';
  const startDateFormatted = formatIsoToSheetDate(activity.tanggalPelaksanaan || getTodayJakartaISO());
  const endDateOrDuration = activity.tanggalSelesai
    ? formatIsoToSheetDate(activity.tanggalSelesai)
    : activity.durasiText || '';

  const rawNote = (activity.catatan || '').trim();
  const isAutoPlaceholder = rawNote === 'Menunggu verifikasi penilaian resiko pengawas K3.';
  const cleanNote = isAutoPlaceholder
    ? ''
    : rawNote.replace(/\|?\s*Status:\s*(Berlangsung|Terjadwal|Selesai)\s*/gi, '').trim();
  const statusTag = activity.status ? `Status: ${activity.status}` : '';
  const evaluasiValue = cleanNote
    ? statusTag
      ? `${cleanNote} | ${statusTag}`
      : cleanNote
    : statusTag;

  const sanitizedPhone = sanitizePhoneForDisplay(activity.nomorKontak || '');
  const sheetPhoneCell = sanitizedPhone ? `'${sanitizedPhone}` : '';

  return [
    timestamp, // A: Timestamp
    activity.namaKegiatan || '', // B: Deskripsi kegiatan
    activity.namaPIC || '', // C: Nama PIC
    sheetPhoneCell, // D: Narahubung (leading quote preserves leading 0 in Google Sheets)
    activity.tujuanKegiatan || 'Kegiatan/Proyek departemen', // E: Tujuan
    activity.durasiText || '', // F: Durasi
    String(activity.jumlahPekerja || 1), // G: Jumlah tukang/personil
    activity.lokasiPekerjaan || '', // H: Lokasi
    activity.identitasPICUrl || '', // I: Identitas PIC
    activity.emailPIC || '', // J: Email Address
    apdJoined, // K: Kebutuhan APD
    startDateFormatted, // L: Tanggal mulai kegiatan
    activity.dokumenJSAUrl || '', // M: Upload dokumen JSA
    activity.dokumenSafetyInductionUrl || '', // N: Upload dokumen safety induction
    endDateOrDuration, // O: Lama Pelaksanaan
    activity.penilaianResiko || 'Rendah', // P: Penilaian Resiko
    evaluasiValue // Q: Evaluasi
  ];
}

function isActiveOnDate(item: WorkActivity, targetDateISO: string): boolean {
  if (item.status === 'Berlangsung' && targetDateISO === getTodayJakartaISO()) {
    return true;
  }
  const start = item.tanggalPelaksanaan;
  const end = item.tanggalSelesai;
  if (!start) return false;
  if (targetDateISO < start) return false;
  if (end && targetDateISO > end) return false;
  return item.status !== 'Selesai';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // CORS headers so external AI assistants / tools can query the public GET endpoints cleanly
  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      publicSubmissionEnabled: Boolean(APPS_SCRIPT_WEBHOOK_URL),
      timestamp: new Date().toISOString()
    });
  });

  // Public REST API for Dashboard & AI Assistant queries
  app.get('/api/activities', async (req: Request, res: Response) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const { activities, fetchedAt } = await fetchActivitiesFromSheet(forceRefresh);

      const statusQ = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : '';
      const riskQ = typeof req.query.risk === 'string' ? req.query.risk.trim().toLowerCase() : '';
      const lokasiQ = typeof req.query.lokasi === 'string' ? req.query.lokasi.trim().toLowerCase() : '';
      const dateQ = typeof req.query.date === 'string' ? req.query.date.trim() : '';
      const searchQ = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';

      const targetDate = dateQ === 'today' ? getTodayJakartaISO() : dateQ;

      const filtered = activities.filter(item => {
        if (statusQ && statusQ !== 'all' && item.status.toLowerCase() !== statusQ) return false;
        if (riskQ && riskQ !== 'all' && item.penilaianResiko.toLowerCase() !== riskQ) return false;
        if (lokasiQ && lokasiQ !== 'all' && !item.lokasiPekerjaan.toLowerCase().includes(lokasiQ)) return false;
        if (targetDate && !isActiveOnDate(item, targetDate)) return false;
        if (searchQ) {
          const hay = [
            item.namaKegiatan,
            item.lokasiPekerjaan,
            item.namaPIC,
            item.nomorKontak,
            item.tujuanKegiatan || ''
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(searchQ)) return false;
        }
        return true;
      });

      res.json({
        source: 'google_sheets',
        publicSubmissionEnabled: Boolean(APPS_SCRIPT_WEBHOOK_URL),
        lastSyncedAt: new Date(fetchedAt).toISOString(),
        todayDate: getTodayJakartaISO(),
        count: filtered.length,
        activities: filtered
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal membaca data kegiatan';
      res.status(502).json({ error: message });
    }
  });

  // Concise AI-Assistant Summary Endpoint
  app.get('/api/activities/summary', async (req: Request, res: Response) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const { activities, fetchedAt } = await fetchActivitiesFromSheet(forceRefresh);
      const todayISO = getTodayJakartaISO();

      const activeToday = activities.filter(a => isActiveOnDate(a, todayISO));
      const highRiskAll = activities.filter(a => a.penilaianResiko === 'Tinggi');
      const highRiskActive = activeToday.filter(a => a.penilaianResiko === 'Tinggi');

      const locationMap: Record<string, { activities: number; workers: number }> = {};
      for (const item of activities) {
        const loc = item.lokasiPekerjaan || 'Tidak diketahui';
        if (!locationMap[loc]) {
          locationMap[loc] = { activities: 0, workers: 0 };
        }
        locationMap[loc].activities += 1;
        locationMap[loc].workers += item.jumlahPekerja;
      }

      res.json({
        department: 'Departemen Teknik Sipil dan Lingkungan (DTSL) FT UGM',
        source: 'google_sheets',
        lastSyncedAt: new Date(fetchedAt).toISOString(),
        dateToday: todayISO,
        totalActivities: activities.length,
        totalWorkers: activities.reduce((sum, a) => sum + a.jumlahPekerja, 0),
        activeTodayCount: activeToday.length,
        activeTodayWorkers: activeToday.reduce((sum, a) => sum + a.jumlahPekerja, 0),
        countsByStatus: {
          Berlangsung: activities.filter(a => a.status === 'Berlangsung').length,
          Terjadwal: activities.filter(a => a.status === 'Terjadwal').length,
          Selesai: activities.filter(a => a.status === 'Selesai').length
        },
        countsByRisk: {
          Tinggi: highRiskAll.length,
          Sedang: activities.filter(a => a.penilaianResiko === 'Sedang').length,
          Rendah: activities.filter(a => a.penilaianResiko === 'Rendah').length
        },
        activeTodayActivities: activeToday.map(a => ({
          id: a.id,
          namaKegiatan: a.namaKegiatan,
          lokasiPekerjaan: a.lokasiPekerjaan,
          penilaianResiko: a.penilaianResiko,
          jumlahPekerja: a.jumlahPekerja,
          namaPIC: a.namaPIC,
          nomorKontak: a.nomorKontak,
          tanggalPelaksanaan: a.tanggalPelaksanaan,
          tanggalSelesai: a.tanggalSelesai,
          kebutuhanAPD: a.kebutuhanAPD
        })),
        highRiskSummary: {
          totalHighRiskCount: highRiskAll.length,
          activeHighRiskCount: highRiskActive.length,
          locations: Array.from(new Set(highRiskAll.map(a => a.lokasiPekerjaan))),
          details: highRiskAll.map(a => ({
            id: a.id,
            namaKegiatan: a.namaKegiatan,
            lokasiPekerjaan: a.lokasiPekerjaan,
            status: a.status,
            jumlahPekerja: a.jumlahPekerja,
            namaPIC: a.namaPIC,
            nomorKontak: a.nomorKontak,
            tanggalPelaksanaan: a.tanggalPelaksanaan,
            tanggalSelesai: a.tanggalSelesai,
            kebutuhanAPD: a.kebutuhanAPD
          }))
        },
        locationsSummary: locationMap
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal membuat ringkasan K3';
      res.status(502).json({ error: message });
    }
  });

  // Helper to call Google Apps Script Webhook safely
  async function callAppsScriptWebhook(body: Record<string, unknown>): Promise<void> {
    if (!APPS_SCRIPT_WEBHOOK_URL) {
      throw new Error(
        'GOOGLE_APPS_SCRIPT_WEBHOOK_URL belum dikonfigurasi pada environment server.'
      );
    }

    const webhookRes = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const rawText = await webhookRes.text();
    let parsed: { ok?: boolean; error?: string } | null = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = null;
    }

    if (!webhookRes.ok || (parsed && parsed.ok === false)) {
      throw new Error(
        parsed?.error ||
          `Apps Script Webhook menolak permintaan (HTTP ${webhookRes.status}).`
      );
    }
  }

  // Append a new activity row to Google Sheets via Apps Script Webhook
  app.post('/api/activities', async (req: Request, res: Response) => {
    try {
      const payload = req.body as Partial<WorkActivity>;
      if (!payload?.namaKegiatan || !payload?.lokasiPekerjaan || !payload?.namaPIC || !payload?.nomorKontak) {
        res.status(400).json({
          error: 'Data wajib belum lengkap (Nama Kegiatan, Lokasi, Nama PIC, Nomor Kontak).'
        });
        return;
      }

      if (!isValidWhatsAppNumber(payload.nomorKontak)) {
        res.status(400).json({
          error: 'Nomor WhatsApp tidak valid. Harus berupa angka 10–15 digit (contoh: 081234567890) tanpa teks.'
        });
        return;
      }

      const rowValues = buildSheetRowValues(payload);
      await callAppsScriptWebhook({
        action: 'append',
        row: rowValues
      });

      cache = null; // Invalidate cache so next read is fresh
      const fresh = await fetchActivitiesFromSheet(true);

      res.status(201).json({
        message: 'Kegiatan berhasil ditambahkan ke Google Sheets.',
        activities: fresh.activities
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan ke Google Sheets';
      res.status(502).json({ error: message });
    }
  });

  // Update an existing row in Google Sheets via Apps Script Webhook
  app.put('/api/activities/:rowNumber', async (req: Request, res: Response) => {
    try {
      const rowNumber = Number(req.params.rowNumber);
      if (!Number.isInteger(rowNumber) || rowNumber < 2) {
        res.status(400).json({ error: 'Nomor baris spreadsheet tidak valid.' });
        return;
      }

      const payload = req.body as Partial<WorkActivity>;
      if (payload?.nomorKontak && !isValidWhatsAppNumber(payload.nomorKontak)) {
        res.status(400).json({
          error: 'Nomor WhatsApp tidak valid. Harus berupa angka 10–15 digit (contoh: 081234567890) tanpa teks.'
        });
        return;
      }

      const rowValues = buildSheetRowValues(payload, payload.createdAt);
      await callAppsScriptWebhook({
        action: 'update',
        rowNumber,
        row: rowValues
      });

      cache = null;
      const fresh = await fetchActivitiesFromSheet(true);

      res.json({
        message: 'Data kegiatan berhasil diperbarui di Google Sheets.',
        activities: fresh.activities
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui data di Google Sheets';
      res.status(502).json({ error: message });
    }
  });

  // Vite middleware in dev, static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`K3L DTSL server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
