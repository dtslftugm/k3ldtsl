import React from 'react';
import { WorkActivity } from '../types/monitoring';
import { Users, HardHat, AlertTriangle, ShieldAlert } from 'lucide-react';

interface MetricsCardsProps {
  activities: WorkActivity[];
  onFilterRisk?: (risk: string) => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ activities, onFilterRisk }) => {
  const totalKegiatan = activities.length;
  const totalPekerja = activities.reduce((acc, curr) => acc + (curr.jumlahPekerja || 0), 0);

  const resikoTinggiCount = activities.filter(a => a.penilaianResiko === 'Tinggi').length;
  const resikoSedangCount = activities.filter(a => a.penilaianResiko === 'Sedang').length;
  const resikoRendahCount = activities.filter(a => a.penilaianResiko === 'Rendah').length;

  const harnessCount = activities.filter(a =>
    a.kebutuhanAPD.some(apd => apd.toLowerCase().includes('harness'))
  ).length;

  const aktifCount = activities.filter(a => a.status === 'Berlangsung').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Total Kegiatan */}
      <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md transition hover:border-[#005B7F]/40">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Kegiatan</p>
          <div className="w-9 h-9 rounded-lg bg-[#005B7F]/10 text-[#005B7F] flex items-center justify-center">
            <HardHat className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#003B52]">{totalKegiatan}</span>
          <span className="text-xs font-bold text-[#005B7F] bg-[#005B7F]/10 px-2 py-0.5 rounded-full">
            {aktifCount} Aktif
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#005B7F]"></span>
          Proyek Departemen & Riset DTSL
        </p>
      </div>

      {/* 2. Jumlah Tenaga Kerja */}
      <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah Pekerja</p>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalPekerja}</span>
          <span className="text-xs font-medium text-slate-500">Personil</span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Tercatat dalam Safety Induction
        </p>
      </div>

      {/* 3. Penilaian Resiko Pekerjaan */}
      <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Penilaian Resiko</p>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={() => onFilterRisk && onFilterRisk('Tinggi')}
            title="Klik untuk filter Resiko Tinggi"
            className="text-center group cursor-pointer"
          >
            <span className="text-xl sm:text-2xl font-extrabold text-rose-600 group-hover:underline">
              {resikoTinggiCount}
            </span>
            <span className="block text-[10px] font-bold uppercase text-rose-600">Tinggi</span>
          </button>
          <span className="text-slate-300 font-light text-lg">/</span>
          <button
            onClick={() => onFilterRisk && onFilterRisk('Sedang')}
            title="Klik untuk filter Resiko Sedang"
            className="text-center group cursor-pointer"
          >
            <span className="text-xl sm:text-2xl font-extrabold text-amber-600 group-hover:underline">
              {resikoSedangCount}
            </span>
            <span className="block text-[10px] font-bold uppercase text-amber-600">Sedang</span>
          </button>
          <span className="text-slate-300 font-light text-lg">/</span>
          <button
            onClick={() => onFilterRisk && onFilterRisk('Rendah')}
            title="Klik untuk filter Resiko Rendah"
            className="text-center group cursor-pointer"
          >
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 group-hover:underline">
              {resikoRendahCount}
            </span>
            <span className="block text-[10px] font-bold uppercase text-emerald-600">Rendah</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          {resikoTinggiCount > 0 ? (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              ⚠️ {resikoTinggiCount} Pekerjaan Ketinggian
            </span>
          ) : (
            'Semua resiko terkendali'
          )}
        </p>
      </div>

      {/* 4. APD Khusus (Safety Harness / Ketinggian) */}
      <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">APD Safety Harness</p>
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">{harnessCount}</span>
          <span className="text-xs font-medium text-slate-500">Proyek wajib</span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          Wajib Full Body Harness K3
        </p>
      </div>


    </div>
  );
};
