import React from 'react';
import { WorkActivity } from '../types/monitoring';
import { formatDateIndo } from '../utils/helpers';

interface PrintReportViewProps {
  activities: WorkActivity[];
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ activities }) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalPekerja = activities.reduce((acc, c) => acc + c.jumlahPekerja, 0);
  const totalTinggi = activities.filter(a => a.penilaianResiko === 'Tinggi').length;
  const totalSedang = activities.filter(a => a.penilaianResiko === 'Sedang').length;
  const totalRendah = activities.filter(a => a.penilaianResiko === 'Rendah').length;

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans text-xs">
      {/* Official Header DTSL FT UGM */}
      <div className="border-b-2 border-black pb-4 mb-6 flex items-center justify-between gap-4">
        <img
          src="/assets/aistudio/LOGODTSL.png"
          alt="Logo DTSL UGM"
          className="w-16 h-16 object-contain rounded-full shrink-0"
        />
        <div className="flex-1 text-center">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 mt-0.5">
            DEPARTEMEN TEKNIK SIPIL DAN LINGKUNGAN (DTSL)
          </h2>
          <h1 className="text-base font-bold uppercase tracking-wide">
            FAKULTAS TEKNIK — UNIVERSITAS GADJAH MADA  
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Jl. Grafika No. 2, Kampus UGM, Yogyakarta 55281 | Sistem Informasi Keselamatan & Kesehatan Kerja (K3L)
          </p>
          <div className="mt-2 py-1 px-4 bg-slate-100 border border-slate-300 inline-block font-bold text-xs tracking-wide">
            LEMBAR REKAPITULASI PEMANTAUAN K3 & PEKERJAAN LAPANGAN
          </div>
        </div>
        <div className="w-16 h-16 shrink-0 invisible"></div>
      </div>

      {/* Meta info */}
      <div className="flex justify-between items-center mb-4 text-xs">
        <div>
          <p><strong>Tanggal Cetak:</strong> {currentDate}</p>
          <p><strong>Total Kegiatan Terpantau:</strong> {activities.length} Kegiatan</p>
          <p><strong>Total Tenaga Kerja:</strong> {totalPekerja} Personil</p>
        </div>
        <div className="text-right">
          <p><strong>Distribusi Resiko:</strong></p>
          <p>Resiko Rendah: {totalRendah} | Sedang: {totalSedang} | Resiko Tinggi: {totalTinggi}</p>
        </div>
      </div>

      {/* Main Table with 8 primary columns */}
      <table className="w-full border-collapse border border-black text-[11px] mb-8">
        <thead>
          <tr className="bg-slate-200 text-black font-bold text-center">
            <th className="border border-black p-1.5 w-7">No</th>
            <th className="border border-black p-1.5 min-w-[140px]">Nama Kegiatan</th>
            <th className="border border-black p-1.5 min-w-[110px]">Lokasi Pekerjaan</th>
            <th className="border border-black p-1.5 w-14">Jml Pkrj</th>
            <th className="border border-black p-1.5 w-20">Tgl Pelaksanaan</th>
            <th className="border border-black p-1.5 min-w-[110px]">Penanggung Jawab (PIC)</th>
            <th className="border border-black p-1.5 w-24">Nomor Kontak</th>
            <th className="border border-black p-1.5 min-w-[130px]">Kebutuhan APD</th>
            <th className="border border-black p-1.5 w-16">Penilaian Resiko</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((item, idx) => (
            <tr key={item.id} className="align-top">
              <td className="border border-black p-1.5 text-center font-mono">{idx + 1}</td>
              <td className="border border-black p-1.5 font-bold">
                {item.namaKegiatan}
                {item.tujuanKegiatan && (
                  <span className="block text-[10px] font-normal text-slate-600 italic">
                    ({item.tujuanKegiatan})
                  </span>
                )}
              </td>
              <td className="border border-black p-1.5">{item.lokasiPekerjaan}</td>
              <td className="border border-black p-1.5 text-center font-bold">
                {item.jumlahPekerja} org
              </td>
              <td className="border border-black p-1.5 whitespace-nowrap">
                {formatDateIndo(item.tanggalPelaksanaan)}
                {item.durasiText && (
                  <span className="block text-[10px] text-slate-500">{item.durasiText}</span>
                )}
              </td>
              <td className="border border-black p-1.5 font-medium">{item.namaPIC}</td>
              <td className="border border-black p-1.5 font-mono">{item.nomorKontak}</td>
              <td className="border border-black p-1.5 text-[10px]">
                {item.kebutuhanAPD.join(', ')}
              </td>
              <td className="border border-black p-1.5 text-center font-bold">
                <span
                  className={
                    item.penilaianResiko === 'Tinggi'
                      ? 'text-red-700'
                      : item.penilaianResiko === 'Sedang'
                      ? 'text-amber-700'
                      : 'text-green-800'
                  }
                >
                  {item.penilaianResiko}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature block */}
      <div className="grid grid-cols-2 gap-8 text-center pt-6 text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="font-bold">Pengawas K3 DTSL FT UGM</p>
          <div className="h-20"></div>
          <p className="font-bold underline">( .................................................... )</p>
          <p className="text-[10px] text-slate-500">NIP. / Tim HSE</p>
        </div>

        <div>
          <p>Yogyakarta, {currentDate}</p>
          <p className="font-bold">Koordinator Tim Pemantau Proyek Lapangan</p>
          <div className="h-20"></div>
          <p className="font-bold underline">( .................................................... )</p>
          <p className="text-[10px] text-slate-500">NIP. / Petugas Monitoring</p>
        </div>
      </div>
    </div>
  );
};
