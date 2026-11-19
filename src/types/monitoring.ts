export type PenilaianResiko = 'Rendah' | 'Sedang' | 'Tinggi';

export type StatusPekerjaan = 'Berlangsung' | 'Terjadwal' | 'Selesai';

export interface WorkActivity {
  id: string;
  namaKegiatan: string;
  lokasiPekerjaan: string;
  jumlahPekerja: number;
  tanggalPelaksanaan: string; // ISO string YYYY-MM-DD
  durasiText?: string;
  tanggalSelesai?: string;
  namaPIC: string;
  nomorKontak: string;
  nomorKontakClean: string; // for wa.me/62...
  kebutuhanAPD: string[];
  penilaianResiko: PenilaianResiko;
  tujuanKegiatan?: string;
  emailPIC?: string;
  identitasPICUrl?: string;
  dokumenJSAUrl?: string;
  dokumenSafetyInductionUrl?: string;
  jamKerjaAman?: number;
  status: StatusPekerjaan;
  catatan?: string;
  createdAt: string;
  rowNumber?: number;
}

export interface ActivityFilter {
  search: string;
  penilaianResiko: string; // 'all' | 'Rendah' | 'Sedang' | 'Tinggi'
  apd: string; // 'all' | specific APD
  lokasi: string;
  status: string; // 'all' | 'Berlangsung' | 'Terjadwal' | 'Selesai'
  tujuan: string;
}

export type ViewMode = 'table' | 'cards' | 'analytics';
