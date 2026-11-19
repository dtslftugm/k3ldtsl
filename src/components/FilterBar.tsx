import React from 'react';
import { Search, X, Table, LayoutGrid, BarChart3, Filter } from 'lucide-react';
import { ActivityFilter, ViewMode } from '../types/monitoring';
import { APD_MASTER_LIST } from '../data/initialData';

interface FilterBarProps {
  filter: ActivityFilter;
  onFilterChange: (newFilter: ActivityFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  locationsList: string[];
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  locationsList,
  totalResults
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  };

  const handleRiskChange = (risk: string) => {
    onFilterChange({ ...filter, penilaianResiko: risk });
  };

  const handleApdChange = (apd: string) => {
    onFilterChange({ ...filter, apd: filter.apd === apd ? 'all' : apd });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, lokasi: e.target.value });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filter, status: status });
  };

  const resetAllFilters = () => {
    onFilterChange({
      search: '',
      penilaianResiko: 'all',
      apd: 'all',
      lokasi: 'all',
      status: 'all',
      tujuan: 'all'
    });
  };

  const hasActiveFilters =
    filter.search !== '' ||
    filter.penilaianResiko !== 'all' ||
    filter.apd !== 'all' ||
    filter.lokasi !== 'all' ||
    filter.status !== 'all' ||
    filter.tujuan !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3.5">
      {/* Top row: Search, View Switcher & Counter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filter.search}
            onChange={handleSearchChange}
            placeholder="Cari nama kegiatan, PIC, lokasi, kontak..."
            className="w-full pl-9.5 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005B7F]/25 focus:border-[#005B7F] text-slate-900 transition"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ ...filter, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher buttons & Counter */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Tampilan:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => onViewModeChange('table')}
              title="Tampilan Tabel Data"
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                viewMode === 'table'
                  ? 'bg-[#005B7F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5 shrink-0" />
              <span>Tabel</span>
            </button>
            <button
              onClick={() => onViewModeChange('cards')}
              title="Tampilan Kartu Monitoring"
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                viewMode === 'cards'
                  ? 'bg-[#005B7F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span>Kartu</span>
            </button>
            <button
              onClick={() => onViewModeChange('analytics')}
              title="Analisis & Statistik K3"
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                viewMode === 'analytics'
                  ? 'bg-[#005B7F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span>Analisis K3</span>
            </button>
          </div>

          <div className="text-xs font-medium text-slate-600 bg-[#005B7F]/5 border border-[#005B7F]/20 px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0">
            <span className="font-bold text-[#003B52]">{totalResults}</span> Kegiatan
          </div>
        </div>
      </div>

      {/* Second row: Quick Filter Pills for Penilaian Resiko & Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5">
          {/* Risk filter group */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 mr-0.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Resiko:</span>
            </div>

            {['all', 'Tinggi', 'Sedang', 'Rendah'].map(risk => (
              <button
                key={risk}
                onClick={() => handleRiskChange(risk)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  filter.penilaianResiko === risk
                    ? risk === 'Tinggi'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : risk === 'Sedang'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : risk === 'Rendah'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#003B52] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {risk === 'all' ? 'Semua Resiko' : `Resiko ${risk}`}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-200"></div>

          {/* Status filter group */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 mr-0.5">
              <span>Status:</span>
            </div>
            {['all', 'Berlangsung', 'Terjadwal', 'Selesai'].map(st => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  filter.status === st
                    ? 'bg-[#003B52] text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st === 'all' ? 'Semua Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto">
          <select
            value={filter.lokasi}
            onChange={handleLocationChange}
            className="flex-1 sm:flex-initial max-w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#005B7F]"
          >
            <option value="all">Semua Lokasi</option>
            {locationsList.map(loc => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-1.5 py-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Third row: Quick APD Chips Filter */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
        <span className="text-[11px] font-bold text-[#003B52] uppercase tracking-wider mr-1">
          Filter APD:
        </span>
        {APD_MASTER_LIST.slice(0, 7).map(apd => {
          const isSelected = filter.apd === apd;
          return (
            <button
              key={apd}
              onClick={() => handleApdChange(apd)}
              className={`text-[11px] px-2.5 py-0.5 rounded-full border transition cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#005B7F]/10 text-[#003B52] border-[#005B7F]/40 font-bold shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 font-normal'
              }`}
            >
              {isSelected ? '✓ ' : ''}{apd}
            </button>
          );
        })}
      </div>
    </div>
  );
};
