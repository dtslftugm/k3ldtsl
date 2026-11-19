import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WorkActivity, ActivityFilter, ViewMode, StatusPekerjaan } from './types/monitoring';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { FilterBar } from './components/FilterBar';
import { TableView } from './components/TableView';
import { CardsView } from './components/CardsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { ActivityFormModal } from './components/ActivityFormModal';
import { PrintReportView } from './components/PrintReportView';
import { exportActivitiesToCSV } from './utils/helpers';
import {
  ShieldCheck,
  Info,
  Phone,
  MessageSquare,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function App() {
  const [activities, setActivities] = useState<WorkActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Mutation states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Filtering state
  const [filter, setFilter] = useState<ActivityFilter>({
    search: '',
    penilaianResiko: 'all',
    apd: 'all',
    lokasi: 'all',
    status: 'all',
    tujuan: 'all'
  });

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedActivity, setSelectedActivity] = useState<WorkActivity | null>(null);
  const [activityToEdit, setActivityToEdit] = useState<WorkActivity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  const fetchActivities = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const res = await fetch(forceRefresh ? '/api/activities?refresh=true' : '/api/activities');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `Gagal mengambil data (HTTP ${res.status})`);
        }
        setActivities(Array.isArray(data.activities) ? data.activities : []);
        setLastSyncedAt(data.lastSyncedAt || new Date().toISOString());
        if (forceRefresh) {
          showNotification(
            `Data tersinkronisasi dari Google Sheets (${(data.activities || []).length} kegiatan).`
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Gagal memuat data dari Google Sheets.';
        setLoadError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [showNotification]
  );

  useEffect(() => {
    fetchActivities(false);
  }, [fetchActivities]);

  // Distinct locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    activities.forEach(a => {
      if (a.lokasiPekerjaan) set.add(a.lokasiPekerjaan);
    });
    return Array.from(set).sort();
  }, [activities]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter(item => {
      if (filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        const matchTitle = item.namaKegiatan.toLowerCase().includes(q);
        const matchLoc = item.lokasiPekerjaan.toLowerCase().includes(q);
        const matchPic = item.namaPIC.toLowerCase().includes(q);
        const matchContact = item.nomorKontak.toLowerCase().includes(q);
        const matchTujuan = (item.tujuanKegiatan || '').toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchPic && !matchContact && !matchTujuan) {
          return false;
        }
      }

      if (filter.penilaianResiko !== 'all' && item.penilaianResiko !== filter.penilaianResiko) {
        return false;
      }

      if (filter.apd !== 'all') {
        const hasApd = item.kebutuhanAPD.some(apd =>
          apd.toLowerCase().includes(filter.apd.toLowerCase())
        );
        if (!hasApd) return false;
      }

      if (filter.lokasi !== 'all' && item.lokasiPekerjaan !== filter.lokasi) {
        return false;
      }

      if (filter.status !== 'all' && item.status !== filter.status) {
        return false;
      }

      return true;
    });
  }, [activities, filter]);

  // Create / Update via Apps Script Webhook backend
  const handleSaveActivity = async (savedActivity: WorkActivity) => {
    setSaveError(null);
    const isEdit = Boolean(savedActivity.rowNumber);

    setIsSaving(true);
    try {
      const url = isEdit ? `/api/activities/${savedActivity.rowNumber}` : '/api/activities';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(savedActivity)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Gagal menyimpan data (HTTP ${res.status}).`);
      }

      if (Array.isArray(data.activities)) {
        setActivities(data.activities);
      }
      setLastSyncedAt(new Date().toISOString());
      setIsFormOpen(false);
      setActivityToEdit(null);
      showNotification(
        isEdit
          ? `Kegiatan "${savedActivity.namaKegiatan}" berhasil diperbarui.`
          : `Kegiatan baru "${savedActivity.namaKegiatan}" berhasil ditambahkan.`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (activity: WorkActivity, newStatus: StatusPekerjaan) => {
    setStatusError(null);
    if (!activity.rowNumber) {
      setStatusError('Nomor baris Google Sheets tidak ditemukan untuk kegiatan ini.');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/activities/${activity.rowNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...activity, status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Gagal memperbarui status (HTTP ${res.status}).`);
      }

      if (Array.isArray(data.activities)) {
        setActivities(data.activities);
        const updatedRow = data.activities.find(
          (a: WorkActivity) => a.rowNumber === activity.rowNumber
        );
        if (updatedRow) {
          setSelectedActivity(updatedRow);
        }
      }
      setLastSyncedAt(new Date().toISOString());
      showNotification(`Status kegiatan diperbarui menjadi "${newStatus}".`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Gagal memperbarui status kegiatan.';
      setStatusError(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportCSV = () => {
    exportActivitiesToCSV(filteredActivities);
    showNotification(`Berhasil mengekspor ${filteredActivities.length} data kegiatan ke file CSV.`);
  };

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : null;

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-sans text-slate-900 pb-16 overflow-x-clip print:min-h-0 print:bg-white print:pb-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 left-5 sm:left-auto z-50 bg-[#003B52] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-[#005B7F] animate-in fade-in slide-in-from-bottom-3 duration-200 print:hidden">
          <ShieldCheck className="w-4 h-4 text-[#FFCF01] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main App Bar */}
      <Header
        onAddClick={() => {
          setSaveError(null);
          setActivityToEdit(null);
          setIsFormOpen(true);
        }}
        onExportClick={handleExportCSV}
        onRefreshClick={() => fetchActivities(true)}
        isRefreshing={isRefreshing}
      />

      {/* Dashboard Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 print:hidden">
        {/* Sync Strip (without exposing spreadsheet URL to public) */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">Sumber Data: Database K3L DTSL</span>
            {formattedSyncTime && (
              <span className="text-[11px] text-slate-500">
                • Sinkron terakhir pukul {formattedSyncTime}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {activities.length} kegiatan tercatat
          </span>
        </div>

        {/* Initial Loading or Fatal Load Error */}
        {isLoading && activities.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
            <Loader2 className="w-8 h-8 text-[#005B7F] animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              Memuat data kegiatan K3 langsung dari Google Sheets...
            </p>
            <p className="text-xs text-slate-500">
              Mohon tunggu sebentar, sedang mengambil baris data terbaru.
            </p>
          </div>
        ) : loadError && activities.length === 0 ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-rose-900">Gagal Memuat Data Google Sheets</p>
              <p className="text-xs text-rose-700">{loadError}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchActivities(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Muat Ulang</span>
            </button>
          </div>
        ) : (
          <>
            {loadError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-2">
                <span>Peringatan sinkronisasi: {loadError}</span>
                <button
                  type="button"
                  onClick={() => fetchActivities(true)}
                  className="font-bold underline cursor-pointer shrink-0"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* Metric Summary Cards */}
            <MetricsCards
              activities={activities}
              onFilterRisk={risk => setFilter(prev => ({ ...prev, penilaianResiko: risk }))}
            />

            {/* Informative Guidance Banner in UGM Brand Scheme */}
            <div className="bg-gradient-to-r from-[#005B7F]/8 via-white to-[#FFCF01]/10 border border-[#005B7F]/25 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-800">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-[#005B7F]/10 text-[#005B7F] flex items-center justify-center shrink-0 mt-0.5 lg:mt-0">
                  <Info className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#005B7F]" />
                </div>
                <p className="text-slate-800 font-medium text-xs leading-relaxed min-w-0">
                  Seluruh penanggung jawab (PIC) wajib memastikan seluruh pekerja telah menggunakan APD lengkap sesuai dengan penilaian resiko kegiatan sebelum pekerjaan fisik dimulai.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 bg-white px-3 py-2 sm:py-1.5 rounded-xl border border-[#005B7F]/20 shadow-2xs w-full lg:w-auto shrink-0">
                <span className="font-semibold text-slate-700 whitespace-nowrap">Nomor Kontak Pengawas</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="tel:081213303959"
                    className="inline-flex items-center gap-1.5 font-bold font-mono text-[#005B7F] hover:text-[#003B52] transition-colors whitespace-nowrap"
                    title="Hubungi Pengawas K3 Lapangan"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#005B7F] shrink-0" />
                    <span>081213303959</span>
                  </a>
                  <a
                    href="https://wa.me/6281213303959?text=Halo%20Pengawas%20K3%20DTSL%2C%20saya%20PIC%20kegiatan%20ingin%20melaporkan%20kesiapan%20pekerjaan%20lapangan."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-all hover:scale-[1.02] shadow-2xs whitespace-nowrap"
                    title="Kirim pesan WhatsApp ke Pengawas K3"
                  >
                    <MessageSquare className="w-3 h-3 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Filter & View Switcher Bar */}
            <FilterBar
              filter={filter}
              onFilterChange={setFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              locationsList={uniqueLocations}
              totalResults={filteredActivities.length}
            />

            {/* View Mode Switching */}
            {viewMode === 'table' && (
              <TableView
                activities={filteredActivities}
                onSelectActivity={act => {
                  setStatusError(null);
                  setSelectedActivity(act);
                }}
                onEditActivity={activity => {
                  setSaveError(null);
                  setActivityToEdit(activity);
                  setIsFormOpen(true);
                }}
                onDeleteActivity={() => {}}
              />
            )}

            {viewMode === 'cards' && (
              <CardsView
                activities={filteredActivities}
                onSelectActivity={act => {
                  setStatusError(null);
                  setSelectedActivity(act);
                }}
                onEditActivity={activity => {
                  setSaveError(null);
                  setActivityToEdit(activity);
                  setIsFormOpen(true);
                }}
                onDeleteActivity={() => {}}
              />
            )}

            {viewMode === 'analytics' && <AnalyticsView activities={activities} />}
          </>
        )}
      </main>

      {/* Modals */}
      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => {
          setStatusError(null);
          setSelectedActivity(null);
        }}
        onEdit={act => {
          setSelectedActivity(null);
          setSaveError(null);
          setActivityToEdit(act);
          setIsFormOpen(true);
        }}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={isUpdatingStatus}
        statusError={statusError}
      />

      <ActivityFormModal
        isOpen={isFormOpen}
        activityToEdit={activityToEdit}
        onClose={() => {
          setSaveError(null);
          setIsFormOpen(false);
          setActivityToEdit(null);
        }}
        onSave={handleSaveActivity}
        isSaving={isSaving}
        saveError={saveError}
      />

      {/* Print View Component (Rendered strictly when window.print() is called) */}
      <PrintReportView activities={filteredActivities} />
    </div>
  );
}
