import React from 'react';
import { WorkActivity } from '../types/monitoring';
import { ShieldAlert, Users, HardHat, FileCheck2, CheckCircle2 } from 'lucide-react';
import { APD_MASTER_LIST } from '../data/initialData';
import { getApdBadgeStyle } from '../utils/helpers';

interface AnalyticsViewProps {
  activities: WorkActivity[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ activities }) => {
  const total = activities.length;

  // 1. Resiko breakdown
  const tinggiCount = activities.filter(a => a.penilaianResiko === 'Tinggi').length;
  const sedangCount = activities.filter(a => a.penilaianResiko === 'Sedang').length;
  const rendahCount = activities.filter(a => a.penilaianResiko === 'Rendah').length;

  // 2. APD breakdown
  const apdCounts: { [key: string]: number } = {};
  APD_MASTER_LIST.forEach(apd => {
    apdCounts[apd] = 0;
  });

  activities.forEach(act => {
    act.kebutuhanAPD.forEach(apd => {
      // Find matching or create
      const match = APD_MASTER_LIST.find(m => m.toLowerCase() === apd.toLowerCase());
      if (match) {
        apdCounts[match] = (apdCounts[match] || 0) + 1;
      } else {
        apdCounts[apd] = (apdCounts[apd] || 0) + 1;
      }
    });
  });

  const sortedApd = Object.entries(apdCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  // 3. Location breakdown
  const locationWorkers: { [loc: string]: number } = {};
  activities.forEach(act => {
    const loc = act.lokasiPekerjaan;
    locationWorkers[loc] = (locationWorkers[loc] || 0) + act.jumlahPekerja;
  });

  const topLocations = Object.entries(locationWorkers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // 4. Document compliance
  const hasJsa = activities.filter(a => !!a.dokumenJSAUrl).length;
  const hasInduction = activities.filter(a => !!a.dokumenSafetyInductionUrl).length;
  const complianceRate = total > 0 ? Math.round(((hasJsa + hasInduction) / (total * 2)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Safety Compliance in UGM Blue & Gold */}
      <div className="bg-gradient-to-r from-[#003B52] via-[#004B6E] to-[#005B7F] text-white rounded-xl p-5 border border-[#002B3C] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FFCF01] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#FFCF01]" />
            Tingkat Kepatuhan Administrasi K3L DTSL FT UGM
          </span>
          <h2 className="text-xl font-black mt-1">Indeks Kesiapan & Pengawasan Keselamatan Kerja</h2>
          <p className="text-xs text-sky-100 mt-1 max-w-xl">
            Seluruh data pemantauan terintegrasi dengan verifikasi identitas penanggung jawab (KTP/KTM), dokumen JSA (Job Safety Analysis), dan sertifikat safety induction.
          </p>
        </div>

        <div className="flex items-center justify-around md:justify-start gap-3 sm:gap-4 bg-white/10 backdrop-blur-xs px-4 sm:px-5 py-3 rounded-xl border border-white/15 w-full md:w-auto shrink-0">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#FFCF01]">{complianceRate}%</span>
            <span className="block text-[11px] text-sky-100 font-medium">Compliance JSA & Induction</span>
          </div>
          <div className="h-10 w-px bg-white/20"></div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white">{hasJsa}/{total}</span>
            <span className="block text-[11px] text-sky-100 font-medium">Dokumen JSA Terverifikasi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Distribusi Penilaian Resiko */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              <span>Matriks Penilaian Resiko Bahaya</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">{total} Total Proyek</span>
          </div>

          <div className="space-y-4">
            {/* Resiko Rendah */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Resiko Rendah (Pekerjaan Standar)
                </span>
                <span className="text-slate-700">
                  {rendahCount} Kegiatan ({total > 0 ? Math.round((rendahCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (rendahCount / total) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Aktivitas di permukaan tanah, renovasi interior ringan, dan pembuatan benda uji skala lab.
              </p>
            </div>

            {/* Resiko Sedang */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Resiko Sedang (Renovasi Kompleks)
                </span>
                <span className="text-slate-700">
                  {sedangCount} Kegiatan ({total > 0 ? Math.round((sedangCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (sedangCount / total) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pekerjaan renovasi struktural, instalasi plafon tinggi, debu semen, dan pemasangan kusen.
              </p>
            </div>

            {/* Resiko Tinggi */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Resiko Tinggi (Pekerjaan Ketinggian / Eksterior)
                </span>
                <span className="text-slate-700">
                  {tinggiCount} Kegiatan ({total > 0 ? Math.round((tinggiCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (tinggiCount / total) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                ⚠️ Memerlukan Surat Izin Kerja (Permit to Work), safety harness, dan pengawas K3 khusus.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Kebutuhan APD Teratas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-500" />
              <span>Kebutuhan APD Paling Banyak Digunakan</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Frekuensi Kebutuhan</span>
          </div>

          <div className="space-y-3">
            {sortedApd.map(([apd, count]) => {
              const style = getApdBadgeStyle(apd);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={apd} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-800">
                      <span>{style.iconSymbol}</span>
                      <span>{apd}</span>
                    </span>
                    <span className="text-slate-600 font-mono">
                      {count} proyek ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-800 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Konsentrasi Pekerja per Lokasi */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Persebaran Tenaga Kerja Berdasarkan Lokasi Pekerjaan</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Monitoring Kapasitas Lapangan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {topLocations.map(([loc, count], idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Lokasi #{idx + 1}
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1" title={loc}>
                  {loc}
                </p>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl font-black text-slate-900">{count}</span>
                  <span className="text-xs font-medium text-slate-500">Pekerja Lapangan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
