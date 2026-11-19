import React from 'react';
import { Plus, Download, Printer, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onAddClick: () => void;
  onExportClick: () => void;
  onRefreshClick: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onAddClick,
  onExportClick,
  onRefreshClick,
  isRefreshing = false
}) => {
  const handlePrint = () => {
    window.print();
  };

  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-[#003B52] text-white border-b border-[#002738] sticky top-0 z-30 shadow-md print:hidden">
      {/* Top safety & UGM identity banner bar in Kuning UGM (PANTONE P 7-8 C) */}
      <div className="bg-[#FFCF01] text-[#003B52] px-3 sm:px-4 py-1.5 text-xs font-bold flex items-center justify-between gap-2 border-b border-[#E5B800] shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center bg-[#005B7F] text-[#FFCF01] font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-2xs shrink-0 whitespace-nowrap">
            K3L DTSL FT UGM
          </span>
          <span className="font-semibold text-[#002A3D] text-[11px] sm:text-xs leading-snug">
            Sistem Pemantauan Keselamatan & Kesehatan Kerja Lapangan — Utamakan Keselamatan
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[#003B52] font-semibold text-[11px] shrink-0 whitespace-nowrap">
          <span>{todayDate}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          {/* Logo DTSL UGM & Department Title */}
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="relative shrink-0 group">
              <img
                src="/assets/aistudio/LOGODTSL.png"
                alt="Logo DTSL UGM"
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-contain ring-2 ring-[#FFCF01] shadow-lg shadow-black/30 bg-[#005B7F] p-0.5 transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
                Pemantauan K3 & Pekerjaan
              </h1>
              <p className="text-[11px] sm:text-sm text-sky-100 font-medium mt-0.5 leading-snug">
                Departemen Teknik Sipil dan Lingkungan (DTSL) — Fakultas Teknik Universitas Gadjah Mada
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
            <button
              type="button"
              onClick={onRefreshClick}
              disabled={isRefreshing}
              title="Muat ulang data terbaru dari Google Sheets"
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-sky-100 hover:text-white bg-[#004B6A]/80 hover:bg-[#005B7F] rounded-lg border border-[#005B7F] transition flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-[#FFCF01] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Cetak Laporan Pemantauan K3"
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-sky-100 hover:text-white bg-[#004B6A]/80 hover:bg-[#005B7F] rounded-lg border border-[#005B7F] transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4 text-sky-200" />
              <span className="hidden md:inline">Cetak</span>
            </button>

            <button
              type="button"
              onClick={onExportClick}
              title="Export data ke format CSV / Excel"
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-sky-100 hover:text-white bg-[#004B6A]/80 hover:bg-[#005B7F] rounded-lg border border-[#005B7F] transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-[#FFCF01]" />
              <span className="hidden md:inline">CSV</span>
            </button>

            <button
              type="button"
              onClick={onAddClick}
              className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-black text-[#003B52] bg-[#FFCF01] hover:bg-[#FFE052] active:bg-[#E5B800] rounded-lg shadow-md shadow-[#FFCF01]/25 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span>Tambah Kegiatan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
