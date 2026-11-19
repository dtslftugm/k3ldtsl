import React, { useState, useEffect } from 'react';
import { WorkActivity, PenilaianResiko, StatusPekerjaan } from '../types/monitoring';
import { APD_MASTER_LIST } from '../data/initialData';
import { sanitizeWhatsAppNumber, isValidWhatsAppNumber } from '../utils/helpers';
import { X, ShieldCheck, Check, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ActivityFormModalProps {
  isOpen: boolean;
  activityToEdit: WorkActivity | null;
  onClose: () => void;
  onSave: (activity: WorkActivity) => Promise<void>;
  isSaving?: boolean;
  saveError?: string | null;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  activityToEdit,
  onClose,
  onSave,
  isSaving = false,
  saveError = null
}) => {
  const [formData, setFormData] = useState<Partial<WorkActivity>>({
    namaKegiatan: '',
    lokasiPekerjaan: '',
    jumlahPekerja: 4,
    tanggalPelaksanaan: new Date().toISOString().split('T')[0],
    tanggalSelesai: '',
    durasiText: '2 minggu',
    namaPIC: '',
    nomorKontak: '',
    emailPIC: '',
    identitasPICUrl: '',
    kebutuhanAPD: ['Helm', 'Rompi', 'Sepatu safety'],
    penilaianResiko: 'Rendah',
    tujuanKegiatan: 'Kegiatan/Proyek departemen',
    status: 'Berlangsung',
    dokumenJSAUrl: '',
    dokumenSafetyInductionUrl: '',
    catatan: ''
  });

  const [customApd, setCustomApd] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<WorkActivity | null>(null);

  useEffect(() => {
    setValidationError(null);
    setPendingConfirmation(null);
    if (activityToEdit) {
      setFormData({
        ...activityToEdit,
        nomorKontak: sanitizeWhatsAppNumber(activityToEdit.nomorKontak || '') || activityToEdit.nomorKontak || '',
        tanggalSelesai: activityToEdit.tanggalSelesai || '',
        emailPIC: activityToEdit.emailPIC || '',
        identitasPICUrl: activityToEdit.identitasPICUrl || '',
        catatan:
          activityToEdit.catatan === 'Menunggu verifikasi penilaian resiko pengawas K3.'
            ? ''
            : activityToEdit.catatan || ''
      });
    } else {
      setFormData({
        namaKegiatan: '',
        lokasiPekerjaan: '',
        jumlahPekerja: 4,
        tanggalPelaksanaan: new Date().toISOString().split('T')[0],
        tanggalSelesai: '',
        durasiText: '2 minggu',
        namaPIC: '',
        nomorKontak: '',
        emailPIC: '',
        identitasPICUrl: '',
        kebutuhanAPD: ['Helm', 'Rompi'],
        penilaianResiko: 'Rendah',
        tujuanKegiatan: 'Kegiatan/Proyek departemen',
        status: 'Berlangsung',
        dokumenJSAUrl: '',
        dokumenSafetyInductionUrl: '',
        catatan: ''
      });
    }
  }, [activityToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleApd = (apd: string) => {
    const current = formData.kebutuhanAPD || [];
    if (current.includes(apd)) {
      setFormData({ ...formData, kebutuhanAPD: current.filter(item => item !== apd) });
    } else {
      setFormData({ ...formData, kebutuhanAPD: [...current, apd] });
    }
  };

  const handleAddCustomApd = () => {
    if (!customApd.trim()) return;
    const current = formData.kebutuhanAPD || [];
    if (!current.includes(customApd.trim())) {
      setFormData({ ...formData, kebutuhanAPD: [...current, customApd.trim()] });
    }
    setCustomApd('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (
      !formData.namaKegiatan?.trim() ||
      !formData.lokasiPekerjaan?.trim() ||
      !formData.namaPIC?.trim() ||
      !formData.nomorKontak?.trim()
    ) {
      setValidationError('Mohon lengkapi data wajib: Nama Kegiatan, Lokasi, Nama PIC, dan Nomor Kontak.');
      return;
    }

    const sanitizedPhone = sanitizeWhatsAppNumber(formData.nomorKontak || '');
    if (!isValidWhatsAppNumber(sanitizedPhone)) {
      setValidationError(
        'Nomor WhatsApp tidak valid. Masukkan 10–15 digit angka yang diawali 08 atau 628 tanpa teks.'
      );
      return;
    }

    const cleanPhone = sanitizedPhone.startsWith('0')
      ? '62' + sanitizedPhone.substring(1)
      : sanitizedPhone;

    const savedItem: WorkActivity = {
      id: activityToEdit ? activityToEdit.id : `gs-new-${Date.now()}`,
      rowNumber: activityToEdit?.rowNumber,
      namaKegiatan: formData.namaKegiatan.trim(),
      lokasiPekerjaan: formData.lokasiPekerjaan.trim(),
      jumlahPekerja: Number(formData.jumlahPekerja) || 1,
      tanggalPelaksanaan: formData.tanggalPelaksanaan || new Date().toISOString().split('T')[0],
      tanggalSelesai: formData.tanggalSelesai || undefined,
      durasiText: formData.durasiText || '',
      namaPIC: formData.namaPIC.trim(),
      nomorKontak: sanitizedPhone,
      nomorKontakClean: cleanPhone,
      kebutuhanAPD:
        formData.kebutuhanAPD && formData.kebutuhanAPD.length > 0
          ? formData.kebutuhanAPD
          : ['Helm', 'Rompi'],
      penilaianResiko: (formData.penilaianResiko as PenilaianResiko) || 'Rendah',
      tujuanKegiatan: formData.tujuanKegiatan || 'Kegiatan/Proyek departemen',
      emailPIC: formData.emailPIC || '',
      identitasPICUrl: formData.identitasPICUrl || '',
      dokumenJSAUrl: formData.dokumenJSAUrl || '',
      dokumenSafetyInductionUrl: formData.dokumenSafetyInductionUrl || '',
      jamKerjaAman: formData.jamKerjaAman || Number(formData.jumlahPekerja || 1) * 40,
      status: (formData.status as StatusPekerjaan) || 'Berlangsung',
      catatan: formData.catatan || '',
      createdAt: activityToEdit ? activityToEdit.createdAt : new Date().toISOString()
    };

    // Mandatory explicit confirmation step before writing to Google Sheets
    setPendingConfirmation(savedItem);
  };

  const handleConfirmSave = async () => {
    if (!pendingConfirmation) return;
    await onSave(pendingConfirmation);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:hidden">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header in UGM Corporate Blue */}
        <div className="bg-gradient-to-r from-[#003B52] to-[#005B7F] text-white p-5 flex items-center justify-between border-b border-[#002838]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFCF01] text-[#003B52] flex items-center justify-center font-black shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                {pendingConfirmation
                  ? 'Konfirmasi Simpan ke Google Sheets'
                  : activityToEdit
                  ? 'Edit Data Kegiatan K3'
                  : 'Tambah Kegiatan Pemantauan Baru'}
              </h2>
              <p className="text-xs text-sky-200">
                Tersinkronisasi langsung dengan Google Sheets DTSL FT UGM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 text-sky-200 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen before Google Sheets write/update */}
        {pendingConfirmation ? (
          <div className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <p className="font-bold text-sm">
                  {activityToEdit?.rowNumber
                    ? `Perbarui Baris #${activityToEdit.rowNumber} di Google Sheets?`
                    : 'Tambahkan Data Kegiatan Baru?'}
                </p>
                <p className="text-amber-900/80 leading-relaxed">
                  Pastikan seluruh informasi kegiatan, lokasi, kontak WhatsApp, dan APD sudah sesuai sebelum disimpan ke sistem K3L DTSL FT UGM.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Nama Kegiatan</span>
                  <span className="font-bold text-slate-900">{pendingConfirmation.namaKegiatan}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Lokasi</span>
                  <span className="font-bold text-slate-900">{pendingConfirmation.lokasiPekerjaan}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">PIC & Kontak</span>
                  <span className="font-semibold text-slate-800">
                    {pendingConfirmation.namaPIC} ({pendingConfirmation.nomorKontak})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Jadwal & Pekerja</span>
                  <span className="font-semibold text-slate-800">
                    {pendingConfirmation.tanggalPelaksanaan} • {pendingConfirmation.jumlahPekerja} personil
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Resiko & Status</span>
                  <span className="font-semibold text-slate-800">
                    Resiko {pendingConfirmation.penilaianResiko} • {pendingConfirmation.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Kebutuhan APD</span>
                  <span className="font-medium text-slate-700">
                    {pendingConfirmation.kebutuhanAPD.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {saveError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingConfirmation(null)}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black text-[#003B52] bg-[#FFCF01] hover:bg-[#FFE052] active:bg-[#E5B800] rounded-lg shadow-sm hover:shadow transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isSaving ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            {validationError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* 1. Nama Kegiatan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                1. Nama Kegiatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.namaKegiatan}
                onChange={e => setFormData({ ...formData, namaKegiatan: e.target.value })}
                placeholder="Contoh: Pemasangan penangkal petir, Renovasi Mushola DTSL..."
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            {/* 2. Lokasi Pekerjaan & 3. Jumlah Pekerja */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  2. Lokasi Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lokasiPekerjaan}
                  onChange={e => setFormData({ ...formData, lokasiPekerjaan: e.target.value })}
                  placeholder="Contoh: Lab Struktur, Toilet MSTT lt 3..."
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  3. Jumlah Pekerja (Personil) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.jumlahPekerja}
                  onChange={e =>
                    setFormData({ ...formData, jumlahPekerja: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            {/* 4. Tanggal Pelaksanaan, Tanggal Selesai & Durasi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  4. Tanggal Mulai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggalPelaksanaan}
                  onChange={e => setFormData({ ...formData, tanggalPelaksanaan: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={formData.tanggalSelesai || ''}
                  onChange={e => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Durasi / Masa Kerja
                </label>
                <input
                  type="text"
                  value={formData.durasiText}
                  onChange={e => setFormData({ ...formData, durasiText: e.target.value })}
                  placeholder="Contoh: 3 minggu, 15 hari"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            {/* 5. Nama PIC & 6. Nomor Kontak PIC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  5. Nama Penanggung Jawab (PIC) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaPIC}
                  onChange={e => setFormData({ ...formData, namaPIC: e.target.value })}
                  placeholder="Nama lengkap PIC / Kontraktor / Peneliti"
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  6. Nomor Kontak (No WA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={24}
                  value={formData.nomorKontak}
                  onChange={e => {
                    const rawVal = e.target.value;
                    const sanitized = /[a-zA-Z]/.test(rawVal)
                      ? sanitizeWhatsAppNumber(rawVal)
                      : rawVal.replace(/[^\d]/g, '').replace(/^628/, '08').slice(0, 15);
                    setFormData({ ...formData, nomorKontak: sanitized });
                  }}
                  onBlur={() => {
                    if (formData.nomorKontak) {
                      setFormData(prev => ({
                        ...prev,
                        nomorKontak: sanitizeWhatsAppNumber(prev.nomorKontak || '')
                      }));
                    }
                  }}
                  placeholder="Contoh: 081804092191"
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
                <p className="text-[11px] mt-1 text-slate-500">
                  {formData.nomorKontak && isValidWhatsAppNumber(formData.nomorKontak) ? (
                    <span className="text-emerald-700 font-semibold">
                      Format WA valid: {sanitizeWhatsAppNumber(formData.nomorKontak)}
                    </span>
                  ) : (
                    'Hanya angka (10–15 digit, diawali 08). Teks/huruf dibersihkan otomatis.'
                  )}
                </p>
              </div>
            </div>

            {/* Email PIC & Link Identitas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email PIC
                </label>
                <input
                  type="email"
                  value={formData.emailPIC || ''}
                  onChange={e => setFormData({ ...formData, emailPIC: e.target.value })}
                  placeholder="nama@ugm.ac.id / email PIC"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Link Identitas PIC (KTP/KTM)
                </label>
                <input
                  type="url"
                  value={formData.identitasPICUrl || ''}
                  onChange={e => setFormData({ ...formData, identitasPICUrl: e.target.value })}
                  placeholder="https://drive.google.com/open?id=..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* 7. Kebutuhan APD (Checkboxes) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                7. Kebutuhan Alat Pelindung Diri (APD)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {APD_MASTER_LIST.map(apd => {
                  const checked = (formData.kebutuhanAPD || []).includes(apd);
                  return (
                    <button
                      type="button"
                      key={apd}
                      onClick={() => handleToggleApd(apd)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                        checked
                          ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          checked ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{apd}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom APD item */}
              <div className="flex gap-2 mt-2.5">
                <input
                  type="text"
                  value={customApd}
                  onChange={e => setCustomApd(e.target.value)}
                  placeholder="Tambah APD khusus lainnya..."
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomApd();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomApd}
                  className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>

            {/* 8. Penilaian Resiko */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                8. Penilaian Resiko Pekerjaan <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Rendah', 'Sedang', 'Tinggi'] as PenilaianResiko[]).map(risk => (
                  <label
                    key={risk}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs transition ${
                      formData.penilaianResiko === risk
                        ? risk === 'Tinggi'
                          ? 'bg-rose-50 text-rose-700 border-rose-400 ring-2 ring-rose-200'
                          : risk === 'Sedang'
                          ? 'bg-amber-50 text-amber-700 border-amber-400 ring-2 ring-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-400 ring-2 ring-emerald-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="penilaianResiko"
                      value={risk}
                      checked={formData.penilaianResiko === risk}
                      onChange={() => setFormData({ ...formData, penilaianResiko: risk })}
                      className="sr-only"
                    />
                    <span>Resiko {risk}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status & Tujuan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kategori Kegiatan
                </label>
                <select
                  value={formData.tujuanKegiatan}
                  onChange={e => setFormData({ ...formData, tujuanKegiatan: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Kegiatan/Proyek departemen">Kegiatan/Proyek departemen</option>
                  <option value="Penelitian S1">Penelitian S1</option>
                  <option value="Penelitian S2">Penelitian S2</option>
                  <option value="Penelitian S3">Penelitian S3</option>
                  <option value="Pemeliharaan Rutin Lab">Pemeliharaan Rutin Lab</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Status Pelaksanaan
                </label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData({ ...formData, status: e.target.value as StatusPekerjaan })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Berlangsung">Berlangsung</option>
                  <option value="Terjadwal">Terjadwal</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Links JSA & Safety Induction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Link Dokumen JSA (Google Drive)
                </label>
                <input
                  type="url"
                  value={formData.dokumenJSAUrl}
                  onChange={e => setFormData({ ...formData, dokumenJSAUrl: e.target.value })}
                  placeholder="https://drive.google.com/open?id=..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Link Dokumen Safety Induction
                </label>
                <input
                  type="url"
                  value={formData.dokumenSafetyInductionUrl}
                  onChange={e =>
                    setFormData({ ...formData, dokumenSafetyInductionUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/open?id=..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* Catatan K3 */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Evaluasi / Catatan K3
              </label>
              <textarea
                rows={2}
                value={formData.catatan}
                onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Catatan potensi bahaya, instruksi APD khusus, evaluasi pengawas..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              ></textarea>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-black text-[#003B52] bg-[#FFCF01] hover:bg-[#FFE052] active:bg-[#E5B800] rounded-lg shadow-sm hover:shadow transition cursor-pointer"
              >
                {activityToEdit ? 'Lanjut Simpan Perubahan' : 'Lanjut Tambah Kegiatan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
