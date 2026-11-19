import { WorkActivity } from '../types/monitoring';

export const INITIAL_WORK_ACTIVITIES: WorkActivity[] = [
  {
    id: 'k3-000',
    namaKegiatan: 'contoh kegiatan',
    lokasiPekerjaan: 'Lab Komputasi Lantai 5 Gedung B',
    jumlahPekerja: 1,
    tanggalPelaksanaan: '2026-01-01',
    durasiText: '1 minggu',
    tanggalSelesai: '2026-01-07',
    namaPIC: 'Agus',
    nomorKontak: '08174114800',
    nomorKontakClean: '628174114800',
    kebutuhanAPD: ['Sepatu boot','Sepatu safety','Helm','Rompi','Wearpack','Safety harness','Sarung tangan'],
    penilaianResiko: 'Rendah',
    tujuanKegiatan: 'Kegiatan/Proyek departemen',
    emailPIC: 'pathub@gmail.com',
    identitasPICUrl: '',
    dokumenJSAUrl: '',
    dokumenSafetyInductionUrl: '',
    jamKerjaAman: 672,
    status: 'Selesai',
    catatan: '',
    createdAt: '2026-04-18 18:18:18'
  }
];

export const APD_MASTER_LIST = [
  'Helm',
  'Rompi',
  'Sepatu safety',
  'Sepatu boot',
  'Safety harness',
  'Sarung tangan',
  'Wearpack',
  'Kacamata / Face Shield',
  'Masker / Respirator'
];
