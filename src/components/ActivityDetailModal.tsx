import React, { useState, useEffect } from 'react';
import { WorkActivity, StatusPekerjaan } from '../types/monitoring';
import {
  formatDateIndo,
  formatPhoneForWhatsApp,
  getRiskBadgeClasses,
  getApdBadgeStyle,
  getStatusBadgeClasses
} from '../utils/helpers';
import {
  X,
  MapPin,
  Users,
  Calendar,
  MessageCircle,
  ShieldAlert,
  FileText,
  ExternalLink,
  ShieldCheck,
  IdCard,
  Pencil,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ActivityDetailModalProps {
  activity: WorkActivity | null;
  onClose: () => void;
  onEdit: (activity: WorkActivity) => void;
  onStatusChange?: (activity: WorkActivity, newStatus: StatusPekerjaan) => Promise<void>;
  isUpdatingStatus?: boolean;
  statusError?: string | null;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onEdit,
  onStatusChange,
  isUpdatingStatus = false,
  statusError = null
}) => {
  const [pendingStatus, setPendingStatus] = useState<StatusPekerjaan | null>(null);

  useEffect(() => {
    setPendingStatus(null);
  }, [activity?.id, activity?.status]);

  if (!activity) return null;

  const riskStyles = getRiskBadgeClasses(activity.penilaianResiko);
  const statusStyles = getStatusBadgeClasses(activity.status);
  const waUrl = formatPhoneForWhatsApp(activity.nomorKontak, activity.namaPIC, activity.namaKegiatan);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header bar with risk banner in UGM Corporate Blue */}
        <div className="bg-gradient-to-r from-[#003B52] to-[#005B7F] text-white p-5 sm:p-6 relative border-b border-[#002838]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-sky-200 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${riskStyles.bg} border ${riskStyles.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${riskStyles.dot}`}></span>
              {riskStyles.label}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusStyles.bg} border`}
            >
              <span className={`w-2 h-2 rounded-full ${statusStyles.dot}`}></span>
              Status: {activity.status}
            </span>

            {activity.tujuanKegiatan && (
              <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                {activity.tujuanKegiatan}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {activity.namaKegiatan}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold text-slate-200">{activity.lokasiPekerjaan}</span>
          </div>
        </div>

        {/* Content Body: 8 Key Columns Displayed Prominently */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Grid of Key Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* 1. Lokasi Pekerjaan */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                1. Lokasi Pekerjaan
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{activity.lokasiPekerjaan}</span>
              </p>
            </div>

            {/* 2. Jumlah Pekerja */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                2. Jumlah Pekerja
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-base font-extrabold">{activity.jumlahPekerja}</span>
                <span className="text-xs text-slate-500 font-normal">Personil / Tukang</span>
              </p>
            </div>

            {/* 3. Tanggal Pelaksanaan */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                3. Tanggal Pelaksanaan
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{formatDateIndo(activity.tanggalPelaksanaan)}</span>
              </p>
              {activity.durasiText && (
                <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                  Durasi: {activity.durasiText}
                </span>
              )}
            </div>

            {/* 4. Nama Penanggung Jawab */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                4. Penanggung Jawab (PIC)
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1">
                {activity.namaPIC}
              </p>
              {activity.emailPIC && (
                <span className="text-[11px] text-slate-500 block mt-0.5 truncate" title={activity.emailPIC}>
                  {activity.emailPIC}
                </span>
              )}
            </div>

            {/* 5. Nomor Kontak PIC */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                5. Nomor Kontak PIC
              </span>
              <div className="mt-1 flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {activity.nomorKontak}
                </span>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* 6. Penilaian Resiko */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                6. Penilaian Resiko
              </span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskStyles.bg} ${riskStyles.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${riskStyles.dot}`}></span>
                  {riskStyles.label}
                </span>
              </div>
            </div>
          </div>

          {/* 7. Kebutuhan APD (Expanded Box) */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4.5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>7. Kebutuhan Alat Pelindung Diri (APD) Wajib</span>
              </h4>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {activity.kebutuhanAPD.length} Item Diwajibkan
              </span>
            </div>

            <p className="text-xs text-amber-900/80 mb-3">
              Seluruh pekerja dan pengawas lapangan wajib mengenakan APD berikut sebelum memasuki area kerja:
            </p>

            <div className="flex flex-wrap gap-2">
              {activity.kebutuhanAPD.map((apd, idx) => {
                const style = getApdBadgeStyle(apd);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-2xs ${style.bg} ${style.text} ${style.border}`}
                  >
                    <span className="text-base">{style.iconSymbol}</span>
                    <span>{apd}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety Documents & Drive Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dokumen Keselamatan & Verifikasi Identitas
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* JSA Document */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Dokumen JSA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Job Safety Analysis identifikasi potensi bahaya & langkah pencegahan.
                  </p>
                </div>
                {activity.dokumenJSAUrl ? (
                  <a
                    href={activity.dokumenJSAUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 py-1.5 px-3 rounded-lg transition"
                  >
                    <span>Buka JSA Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="mt-3 text-xs text-slate-400 italic">Belum diunggah</span>
                )}
              </div>

              {/* Safety Induction */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Safety Induction</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Bukti induksi keselamatan kerja bagi seluruh tenaga kerja lapangan.
                  </p>
                </div>
                {activity.dokumenSafetyInductionUrl ? (
                  <a
                    href={activity.dokumenSafetyInductionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-1.5 px-3 rounded-lg transition"
                  >
                    <span>Buka Induction Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="mt-3 text-xs text-slate-400 italic">Belum diunggah</span>
                )}
              </div>

              {/* Identitas PIC */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <IdCard className="w-4 h-4 text-purple-600" />
                    <span>Identitas PIC (KTP/KTM)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tanda pengenal penanggung jawab kegiatan yang terverifikasi.
                  </p>
                </div>
                {activity.identitasPICUrl ? (
                  <a
                    href={activity.identitasPICUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 py-1.5 px-3 rounded-lg transition"
                  >
                    <span>Buka Identitas</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="mt-3 text-xs text-slate-400 italic">Belum diunggah</span>
                )}
              </div>
            </div>
          </div>

          {/* Jam Kerja Aman & Catatan K3 */}
          {activity.catatan && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">Catatan K3 / Rekomendasi Pengawasan:</span>
              <p className="text-slate-600 leading-relaxed">{activity.catatan}</p>
            </div>
          )}

          {/* Quick status switcher */}
          {onStatusChange && (
            <div className="p-3.5 bg-slate-100 rounded-xl text-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-700">Perbarui Status Kegiatan:</span>
                <div className="flex items-center gap-1.5">
                  {(['Berlangsung', 'Terjadwal', 'Selesai'] as const).map(st => (
                    <button
                      type="button"
                      key={st}
                      disabled={isUpdatingStatus}
                      onClick={() => {
                        if (st !== activity.status) {
                          setPendingStatus(st);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer disabled:opacity-50 ${
                        (pendingStatus || activity.status) === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {pendingStatus && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2.5">
                  <p className="text-amber-950 font-semibold leading-relaxed">
                    Konfirmasi perubahan status kegiatan menjadi{' '}
                    <span className="font-black">"{pendingStatus}"</span> di Google Sheets
                    {activity.rowNumber ? ` (Baris #${activity.rowNumber})` : ''}?
                  </p>

                  {statusError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 text-[11px] text-rose-700 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{statusError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => setPendingStatus(null)}
                      className="px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={async () => {
                        await onStatusChange(activity, pendingStatus);
                        setPendingStatus(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-black text-[#003B52] bg-[#FFCF01] hover:bg-[#FFE052] rounded-lg border border-[#E5B800] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingStatus && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>{isUpdatingStatus ? 'Menyimpan...' : 'Konfirmasi Ubah Status'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEdit(activity);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-[#003B52] bg-[#FFCF01] hover:bg-[#FFE052] rounded-lg transition border border-[#E5B800] shadow-2xs cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-[#003B52]" />
            <span>Edit Informasi</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
