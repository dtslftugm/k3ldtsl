import React from 'react';
import { WorkActivity } from '../types/monitoring';
import {
  formatDateIndo,
  formatPhoneForWhatsApp,
  getRiskBadgeClasses,
  getApdBadgeStyle,
  getStatusBadgeClasses
} from '../utils/helpers';
import {
  MapPin,
  Users,
  Calendar,
  MessageCircle,
  Phone,
  ShieldAlert,
  Eye,
  Pencil,
  FileCheck2,
  Clock
} from 'lucide-react';

interface CardsViewProps {
  activities: WorkActivity[];
  onSelectActivity: (activity: WorkActivity) => void;
  onEditActivity: (activity: WorkActivity) => void;
  onDeleteActivity?: (id: string) => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
  activities,
  onSelectActivity,
  onEditActivity,
  onDeleteActivity
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.map((item) => {
        const riskStyles = getRiskBadgeClasses(item.penilaianResiko);
        const statusStyles = getStatusBadgeClasses(item.status);
        const waUrl = formatPhoneForWhatsApp(item.nomorKontak, item.namaPIC, item.namaKegiatan);

        return (
          <div
            key={item.id}
            className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
              item.penilaianResiko === 'Tinggi'
                ? 'border-rose-300 ring-1 ring-rose-200/50 shadow-xs'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskStyles.bg} ${riskStyles.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${riskStyles.dot}`}></span>
                  {riskStyles.label}
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${statusStyles.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></span>
                  {item.status}
                </span>
              </div>

              {/* 1. Nama Kegiatan */}
              <h3
                onClick={() => onSelectActivity(item)}
                className="mt-2.5 font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-amber-700 cursor-pointer transition"
              >
                {item.namaKegiatan}
              </h3>

              {item.tujuanKegiatan && (
                <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {item.tujuanKegiatan}
                </span>
              )}
            </div>

            {/* Card Body: Key Data points */}
            <div className="p-4 space-y-3 text-xs flex-1">
              {/* 2. Lokasi Pekerjaan */}
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Lokasi Pekerjaan
                  </span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                    {item.lokasiPekerjaan}
                  </span>
                </div>
              </div>

              {/* 3 & 4. Jumlah Pekerja & Tanggal Pelaksanaan */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Jumlah Pekerja
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Users className="w-4 h-4 text-slate-600" />
                    <span className="font-extrabold text-slate-900 text-sm">
                      {item.jumlahPekerja}
                    </span>
                    <span className="text-slate-500 text-xs">Personil</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Pelaksanaan
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {formatDateIndo(item.tanggalPelaksanaan)}
                    </span>
                  </div>
                  {item.durasiText && (
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      Durasi: {item.durasiText}
                    </span>
                  )}
                </div>
              </div>

              {/* 5 & 6. Nama PIC & Nomor Kontak */}
              <div className="pt-1 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                  Penanggung Jawab (PIC) & Kontak
                </span>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate text-xs sm:text-sm">{item.namaPIC}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{item.nomorKontak}</p>
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 shrink-0 transition"
                    title="Hubungi Penanggung Jawab via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                  </a>
                </div>
              </div>

              {/* 7. Kebutuhan APD */}
              <div className="pt-1 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Kebutuhan APD</span>
                  <span className="text-slate-400 font-normal">({item.kebutuhanAPD.length} item)</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.kebutuhanAPD.map((apd, idx) => {
                    const style = getApdBadgeStyle(apd);
                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}
                      >
                        <span>{style.iconSymbol}</span>
                        <span>{apd}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Dokumen K3 status */}
              {(item.dokumenJSAUrl || item.dokumenSafetyInductionUrl) && (
                <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>JSA & Safety Induction Dokumen Tersedia</span>
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
              <button
                onClick={() => onSelectActivity(item)}
                className="text-xs font-bold text-[#005B7F] hover:text-[#003B52] flex items-center gap-1 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Detail</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditActivity(item)}
                  title="Edit Kegiatan"
                  className="p-1.5 text-slate-500 hover:text-[#005B7F] hover:bg-white rounded transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
