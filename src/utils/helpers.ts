import { PenilaianResiko, WorkActivity } from '../types/monitoring';

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function sanitizeWhatsAppNumber(raw: string): string {
  const input = (raw || '').trim();
  if (!input) return '';

  // Prefer matching an Indonesian mobile number inside mixed text (e.g. "Purwanto N0 Hp 0813-2872-0613")
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

export function isValidWhatsAppNumber(raw: string): boolean {
  const sanitized = sanitizeWhatsAppNumber(raw);
  return /^08\d{8,13}$/.test(sanitized) || /^0\d{8,14}$/.test(sanitized);
}

export function formatPhoneForWhatsApp(phone: string, picName: string, activityName: string): string {
  if (!phone) return '#';
  const sanitized = sanitizeWhatsAppNumber(phone);
  if (!sanitized) return '#';
  let cleaned = sanitized;
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  const text = encodeURIComponent(
    `Halo ${picName}, kami dari Tim K3/Monitoring DTSL UGM terkait kegiatan "${activityName}". Mohon konfirmasi kepatuhan APD & progres keselamatan kerja lapangan.`
  );
  return `https://wa.me/${cleaned}?text=${text}`;
}

export function getRiskBadgeClasses(risk: PenilaianResiko): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
} {
  switch (risk) {
    case 'Tinggi':
      return {
        bg: 'bg-rose-50 text-rose-700',
        border: 'border-rose-200',
        text: 'text-rose-700',
        dot: 'bg-rose-500',
        label: 'Resiko Tinggi'
      };
    case 'Sedang':
      return {
        bg: 'bg-amber-50 text-amber-700',
        border: 'border-amber-200',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        label: 'Resiko Sedang'
      };
    case 'Rendah':
    default:
      return {
        bg: 'bg-emerald-50 text-emerald-700',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        label: 'Resiko Rendah'
      };
  }
}

export function getStatusBadgeClasses(status: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case 'Berlangsung':
      return { bg: 'bg-blue-50 border-blue-200 text-blue-700', text: 'text-blue-700', dot: 'bg-blue-500 animate-pulse' };
    case 'Selesai':
      return { bg: 'bg-slate-100 border-slate-200 text-slate-700', text: 'text-slate-600', dot: 'bg-slate-400' };
    case 'Terjadwal':
    default:
      return { bg: 'bg-purple-50 border-purple-200 text-purple-700', text: 'text-purple-700', dot: 'bg-purple-500' };
  }
}

export function getApdBadgeStyle(apdName: string): { bg: string; text: string; border: string; iconSymbol: string } {
  const lower = apdName.toLowerCase();
  if (lower.includes('harness')) {
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', iconSymbol: '🪢' };
  }
  if (lower.includes('helm')) {
    return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', iconSymbol: '⛑️' };
  }
  if (lower.includes('rompi')) {
    return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', iconSymbol: '🦺' };
  }
  if (lower.includes('sepatu') || lower.includes('boot')) {
    return { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', iconSymbol: '🥾' };
  }
  if (lower.includes('sarung tangan')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', iconSymbol: '🧤' };
  }
  if (lower.includes('wearpack')) {
    return { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', iconSymbol: '👔' };
  }
  if (lower.includes('kacamata') || lower.includes('shield')) {
    return { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', iconSymbol: '🥽' };
  }
  if (lower.includes('masker')) {
    return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', iconSymbol: '😷' };
  }
  return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', iconSymbol: '🛡️' };
}

export function exportActivitiesToCSV(activities: WorkActivity[]): void {
  const headers = [
    'ID',
    'Nama Kegiatan',
    'Lokasi Pekerjaan',
    'Jumlah Pekerja',
    'Tanggal Pelaksanaan',
    'Tanggal Selesai',
    'Durasi',
    'Nama Penanggung Jawab',
    'Nomor Kontak',
    'Kebutuhan APD',
    'Penilaian Resiko',
    'Status',
    'Tujuan Kegiatan',
    'Email PIC',
    'Jam Kerja Aman',
    'Dokumen JSA Link',
    'Dokumen Safety Induction Link'
  ];

  const rows = activities.map(item => [
    item.id,
    `"${item.namaKegiatan.replace(/"/g, '""')}"`,
    `"${item.lokasiPekerjaan.replace(/"/g, '""')}"`,
    item.jumlahPekerja,
    item.tanggalPelaksanaan,
    item.tanggalSelesai || '',
    item.durasiText || '',
    `"${item.namaPIC.replace(/"/g, '""')}"`,
    `"${item.nomorKontak}"`,
    `"${item.kebutuhanAPD.join(', ')}"`,
    item.penilaianResiko,
    item.status,
    `"${(item.tujuanKegiatan || '').replace(/"/g, '""')}"`,
    `"${(item.emailPIC || '').replace(/"/g, '""')}"`,
    item.jamKerjaAman || 0,
    item.dokumenJSAUrl || '',
    item.dokumenSafetyInductionUrl || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DTSL_Pemantauan_K3_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
