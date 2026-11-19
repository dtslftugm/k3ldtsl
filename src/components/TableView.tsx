import React, { useState } from 'react';
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
  FileText,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface TableViewProps {
  activities: WorkActivity[];
  onSelectActivity: (activity: WorkActivity) => void;
  onEditActivity?: (activity: WorkActivity) => void;
  onDeleteActivity?: (id: string) => void;
}

type SortField = 'namaKegiatan' | 'lokasiPekerjaan' | 'jumlahPekerja' | 'tanggalPelaksanaan' | 'namaPIC' | 'penilaianResiko';

export const TableView: React.FC<TableViewProps> = ({
  activities,
  onSelectActivity,
  onEditActivity,
  onDeleteActivity
}) => {
  const [sortField, setSortField] = useState<SortField>('tanggalPelaksanaan');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedActivities = [...activities].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'jumlahPekerja') {
      comparison = a.jumlahPekerja - b.jumlahPekerja;
    } else if (sortField === 'tanggalPelaksanaan') {
      comparison = new Date(a.tanggalPelaksanaan).getTime() - new Date(b.tanggalPelaksanaan).getTime();
    } else if (sortField === 'penilaianResiko') {
      const riskWeight = { Tinggi: 3, Sedang: 2, Rendah: 1 };
      comparison = (riskWeight[a.penilaianResiko] || 0) - (riskWeight[b.penilaianResiko] || 0);
    } else {
      const valA = (a[sortField] || '').toLowerCase();
      const valB = (b[sortField] || '').toLowerCase();
      comparison = valA.localeCompare(valB);
    }
    return sortAsc ? comparison : -comparison;
  });

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Tidak ada data kegiatan ditemukan</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Tidak ada kegiatan pekerjaan yang sesuai dengan kriteria filter saat ini. Silakan ubah filter atau kata kunci pencarian.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          {/* Table Header with 8 Primary Columns Styled in UGM Corporate Blue */}
          <thead>
            <tr className="bg-[#003B52] text-white text-xs uppercase tracking-wider font-bold border-b border-[#002838]">
              <th className="py-3.5 px-4 w-12 text-center text-sky-200 font-mono">No</th>
              
              {/* 1. Nama Kegiatan */}
              <th
                onClick={() => handleSort('namaKegiatan')}
                className="py-3.5 px-4 cursor-pointer hover:bg-[#004B6A] transition select-none min-w-[220px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Nama Kegiatan</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-sky-200" />
                </div>
              </th>

              {/* 2. Lokasi Pekerjaan */}
              <th
                onClick={() => handleSort('lokasiPekerjaan')}
                className="py-3.5 px-4 cursor-pointer hover:bg-[#004B6A] transition select-none min-w-[170px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Lokasi Pekerjaan</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-sky-200" />
                </div>
              </th>

              {/* 3. Jumlah Pekerja */}
              <th
                onClick={() => handleSort('jumlahPekerja')}
                className="py-3.5 px-3.5 text-center cursor-pointer hover:bg-[#004B6A] transition select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-200" />
                  <span>Jml Pekerja</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-sky-200" />
                </div>
              </th>

              {/* 4. Tanggal Pelaksanaan */}
              <th
                onClick={() => handleSort('tanggalPelaksanaan')}
                className="py-3.5 px-4 cursor-pointer hover:bg-[#004B6A] transition select-none min-w-[150px]"
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-200" />
                  <span>Tgl Pelaksanaan</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-sky-200" />
                </div>
              </th>

              {/* 5. Nama Penanggung Jawab */}
              <th
                onClick={() => handleSort('namaPIC')}
                className="py-3.5 px-4 cursor-pointer hover:bg-[#004B6A] transition select-none min-w-[170px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Nama Penanggung Jawab</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-sky-200" />
                </div>
              </th>

              {/* 6. Nomor Kontak Penanggung Jawab */}
              <th className="py-3.5 px-4 min-w-[160px]">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-200" />
                  <span>Nomor Kontak (PIC)</span>
                </div>
              </th>

              {/* 7. Kebutuhan APD */}
              <th className="py-3.5 px-4 min-w-[210px]">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-sky-200" />
                  <span>Kebutuhan APD</span>
                </div>
              </th>

              {/* 8. Penilaian Resiko */}
              <th
                onClick={() => handleSort('penilaianResiko')}
                className="py-3.5 px-4 text-center cursor-pointer hover:bg-[#004B6A] transition select-none min-w-[130px]"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Penilaian Resiko</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-sky-200" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-sans">
            {sortedActivities.map((item, idx) => {
              const riskStyles = getRiskBadgeClasses(item.penilaianResiko);
              const statusStyles = getStatusBadgeClasses(item.status);
              const waUrl = formatPhoneForWhatsApp(item.nomorKontak, item.namaPIC, item.namaKegiatan);

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectActivity(item)}
                  title="Klik untuk melihat detail & dokumen K3 kegiatan"
                  className={`hover:bg-[#005B7F]/6 cursor-pointer transition-colors group ${
                    item.penilaianResiko === 'Tinggi' ? 'bg-rose-50/20' : idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  {/* Row Number */}
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                    {idx + 1}
                  </td>

                  {/* 1. Nama Kegiatan */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-[#005B7F] transition">
                      {item.namaKegiatan}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.tujuanKegiatan && (
                        <span className="inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {item.tujuanKegiatan}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${statusStyles.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></span>
                        {item.status}
                      </span>
                    </div>
                  </td>

                  {/* 2. Lokasi Pekerjaan */}
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="font-medium text-xs sm:text-sm text-slate-800 leading-snug">
                        {item.lokasiPekerjaan}
                      </span>
                    </div>
                  </td>

                  {/* 3. Jumlah Pekerja */}
                  <td className="py-3.5 px-3.5 text-center">
                    <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-md">
                      <Users className="w-3 h-3 text-slate-600" />
                      <span>{item.jumlahPekerja}</span>
                      <span className="text-[10px] font-normal text-slate-500">org</span>
                    </span>
                  </td>

                  {/* 4. Tanggal Pelaksanaan */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateIndo(item.tanggalPelaksanaan)}</span>
                    </div>
                    {item.durasiText && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Durasi: {item.durasiText}</span>
                      </div>
                    )}
                  </td>

                  {/* 5. Nama Penanggung Jawab */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#005B7F]/15 text-[#003B52] text-[10px] font-black flex items-center justify-center shrink-0 uppercase border border-[#005B7F]/25">
                        {item.namaPIC.charAt(0)}
                      </div>
                      <span className="line-clamp-2">{item.namaPIC}</span>
                    </div>
                    {item.emailPIC && (
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[160px]" title={item.emailPIC}>
                        {item.emailPIC}
                      </div>
                    )}
                  </td>

                  {/* 6. Nomor Kontak Penanggung Jawab */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        title="Hubungi via WhatsApp"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-md border border-emerald-200 shadow-2xs transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                        <span className="font-mono text-xs">{item.nomorKontak}</span>
                      </a>
                    </div>
                  </td>

                  {/* 7. Kebutuhan APD */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {item.kebutuhanAPD.map((apd, apdIdx) => {
                        const style = getApdBadgeStyle(apd);
                        return (
                          <span
                            key={apdIdx}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}
                          >
                            <span>{style.iconSymbol}</span>
                            <span>{apd}</span>
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* 8. Penilaian Resiko */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${riskStyles.bg} ${riskStyles.border}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${riskStyles.dot}`}></span>
                      <span>{riskStyles.label}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span>Menampilkan <strong className="text-slate-700">{activities.length}</strong> kegiatan monitoring</span>
          <span>•</span>
          <span className="text-amber-800 font-medium bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">
            Klik baris untuk melihat detail & dokumen K3
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Rendah
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Sedang
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Tinggi
          </span>
        </div>
      </div>
    </div>
  );
};
