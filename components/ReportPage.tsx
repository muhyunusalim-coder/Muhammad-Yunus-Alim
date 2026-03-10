import React, { useState, useMemo } from 'react';
import { 
  FileText, Printer, Filter, Calendar, 
  Search, FileSpreadsheet,
  History, ListFilter, Loader2
} from 'lucide-react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
  currentUser: Employee | null;
}

const ADMIN_NIP = '199601192025061007';

const ReportPage: React.FC<Props> = ({ employees, currentUser }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'history'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  // Helper untuk parsing tanggal
  const getTmtDate = (tmt: string) => {
    if (tmt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(tmt);
    } 
    else if (tmt.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) {
        const parts = tmt.split(/[-/]/);
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return null;
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    // 1. Filter dasar (pencarian nama/NIP)
    let data = employees.filter(emp => 
        emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.nip.includes(searchTerm)
    );

    if (viewMode === 'monthly') {
        data = data.filter(emp => {
            const tmtDate = getTmtDate(emp.tmt);
            if (!tmtDate) return false;

            const empYear = tmtDate.getFullYear();
            const empMonthIdx = tmtDate.getMonth();

            // Filter Tahun
            if (empYear !== selectedYear) return false;

            // Filter Bulan
            if (selectedMonth !== 'All') {
                const selectedMonthIdx = months.indexOf(selectedMonth);
                if (empMonthIdx !== selectedMonthIdx) return false;
            }

            return true;
        });
    } else {
        // Mode History: Hanya tampilkan yang statusnya 'Processed'
        data = data.filter(emp => emp.status === 'Processed');
        
        // Sort descending by TMT (Terbaru/Masa Depan ke Lama)
        data.sort((a, b) => {
            const dateA = getTmtDate(a.tmt)?.getTime() || 0;
            const dateB = getTmtDate(b.tmt)?.getTime() || 0;
            return dateB - dateA;
        });
    }

    return data;
  }, [employees, viewMode, selectedYear, selectedMonth, searchTerm]);

  // Export Excel with Dynamic Import (Optimization)
  const handleExportExcel = async () => {
    if (filteredData.length === 0) return;
    setIsExporting(true);

    try {
        // Dynamically import XLSX only when needed to save bundle size
        const XLSX = await import('xlsx');

        const dataForExcel = filteredData.map((emp, index) => {
          // Logic akses: Pemilik data ATAU Admin Khusus
          const hasAccess = currentUser?.nip === emp.nip || currentUser?.nip === ADMIN_NIP;
          
          return {
            "No": index + 1,
            "Nama Pegawai": emp.nama,
            "NIP": emp.nip,
            "Golongan": emp.pangkat,
            "Jabatan": emp.jabatan,
            "Unit Kerja": emp.unitKerja,
            "Gaji Lama": hasAccess ? emp.gajiLama : "******",
            "Gaji Baru": hasAccess ? emp.gajiBaru : "******",
            "Masa Kerja": emp.masaKerja,
            "TMT KGB": emp.tmt,
            "Status": emp.status === 'Processed' ? 'Selesai' : 'Belum di Proses'
          };
        });

        const ws = XLSX.utils.json_to_sheet(dataForExcel);
        
        // Auto width simple calculation
        const wscols = [
            { wch: 5 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, 
            { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, 
            { wch: 15 }, { wch: 15 }, { wch: 15 }
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        const sheetName = viewMode === 'monthly' 
            ? `Laporan_${selectedMonth}_${selectedYear}` 
            : `Riwayat_KGB_Processed`;
            
        XLSX.utils.book_append_sheet(wb, ws, "Data KGB");
        XLSX.writeFile(wb, `${sheetName}.xlsx`);
    } catch (error) {
        console.error("Failed to load export module", error);
    } finally {
        setIsExporting(false);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 print:p-0 print:space-y-0 print:bg-white print:w-full">
      {/* Header Section (Hidden on Print) */}
      <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-3xl p-8 shadow-xl relative overflow-hidden text-white print:hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transform translate-z-0"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none transform translate-z-0"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <FileText size={16} />
                    Pusat Laporan
                </div>
                <h1 className="text-3xl font-display font-bold mb-2">Rekapitulasi KGB</h1>
                <p className="text-slate-300">
                    Unduh dan cetak laporan nominatif kenaikan gaji berkala.
                </p>
            </div>
            
            <div className="flex gap-3">
                <button 
                    onClick={handleExportExcel}
                    disabled={filteredData.length === 0 || isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                    {isExporting ? 'Memproses...' : 'Ekspor Excel'}
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all border border-white/10"
                >
                    <Printer size={18} />
                    Cetak
                </button>
            </div>
        </div>
      </div>

      {/* Control Bar (Hidden on Print) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 print:hidden">
          {/* View Toggles */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit mb-6">
              <button 
                onClick={() => setViewMode('monthly')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <ListFilter size={16} />
                  Laporan Bulanan
              </button>
              <button 
                onClick={() => setViewMode('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <History size={16} />
                  Riwayat Proses
              </button>
          </div>

          {/* Filters - Conditional based on View Mode */}
          {viewMode === 'monthly' ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        {[2023, 2024, 2025, 2026, 2027, 2028].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="relative group">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="All">Semua Bulan</option>
                        {months.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Cari Nama / NIP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
             </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
                 <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Cari Riwayat Nama / NIP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
            </div>
          )}
      </div>

      {/* Report Summary & Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none print:rounded-none print:overflow-visible">
          
          {/* Header Print View Only - Formal Style */}
          <div className="hidden print:block mb-8 text-center text-black">
             <div className="flex flex-col items-center mb-4">
                <h1 className="text-xl font-bold uppercase tracking-widest">PEMERINTAH KABUPATEN / KOTA</h1>
                <h2 className="text-2xl font-extrabold uppercase tracking-tight">DINAS KESEHATAN / BKPSDM</h2>
                <p className="text-xs font-medium italic">Jl. Alamat Kantor No. XX, Kota, Provinsi - Kode Pos</p>
             </div>
             <div className="border-b-4 border-black w-full mb-1"></div>
             <div className="border-b border-black w-full mb-6"></div>

             <h2 className="text-lg font-bold uppercase tracking-wider mb-1">
                DAFTAR NOMINATIF KENAIKAN GAJI BERKALA (KGB)
             </h2>
             <h3 className="text-md font-bold uppercase mb-2">
                PEGAWAI NEGERI SIPIL & PPPK
             </h3>
             <p className="text-sm font-medium">
                {viewMode === 'monthly' ? `Periode: ${selectedMonth === 'All' ? 'Semua Bulan' : selectedMonth} ${selectedYear}` : 'Riwayat Proses (TMT Descending)'}
             </p>
          </div>

          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
              <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                      {viewMode === 'monthly' ? 'Data Nominatif' : 'Riwayat Proses'}
                  </h3>
                  <p className="text-slate-500 text-sm">
                      {viewMode === 'monthly' ? 'Menampilkan data berdasarkan filter periode.' : 'Menampilkan daftar KGB yang telah selesai diproses.'}
                  </p>
              </div>
              <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
                  Total: {filteredData.length} Pegawai
              </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left border-collapse print:border print:border-black print:text-xs">
                  <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-200 print:bg-gray-100 print:text-black print:border-black print:border-b-2">
                          <th className="px-6 py-4 w-12 text-center border-r border-slate-100 print:border print:border-black print:px-2 print:py-2">No</th>
                          <th className="px-6 py-4 border-r border-slate-100 print:border print:border-black print:px-2 print:py-2">Pegawai</th>
                          <th className="px-6 py-4 border-r border-slate-100 print:border print:border-black print:px-2 print:py-2">Unit Kerja</th>
                          <th className="px-6 py-4 border-r border-slate-100 print:border print:border-black print:px-2 print:py-2">Gaji Lama</th>
                          <th className="px-6 py-4 border-r border-slate-100 print:border print:border-black print:px-2 print:py-2">Gaji Baru</th>
                          <th className="px-6 py-4 border-r border-slate-100 print:border print:border-black print:px-2 print:py-2">Masa Kerja</th>
                          <th className="px-6 py-4 border-r border-slate-100 print:border print:border-black print:px-2 print:py-2">TMT</th>
                          <th className="px-6 py-4 text-center print:border print:border-black print:px-2 print:py-2">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm print:divide-black">
                      {filteredData.length > 0 ? (
                          filteredData.map((emp, index) => {
                              // Logic akses: Pemilik data ATAU Admin Khusus
                              const hasAccess = currentUser?.nip === emp.nip || currentUser?.nip === ADMIN_NIP;
                              
                              return (
                              <tr key={emp.id} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                                  <td className="px-6 py-4 text-center font-medium text-slate-500 border-r border-slate-100 print:border print:border-black print:text-black print:px-2 print:py-2">
                                      {index + 1}
                                  </td>
                                  <td className="px-6 py-4 border-r border-slate-100 print:border print:border-black print:px-2 print:py-2">
                                      <div className="font-bold text-slate-800 print:text-black">{emp.nama}</div>
                                      <div className="text-slate-500 text-xs font-mono mt-0.5 print:text-black">{emp.nip}</div>
                                      <div className="text-slate-400 text-xs mt-0.5 print:hidden">{emp.pangkat}</div>
                                      <div className="hidden print:block text-xs mt-0.5">{emp.pangkat}</div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-600 border-r border-slate-100 print:border print:border-black print:text-black print:px-2 print:py-2">
                                      {emp.unitKerja}
                                  </td>
                                  <td className="px-6 py-4 text-slate-600 border-r border-slate-100 print:border print:border-black print:text-black print:px-2 print:py-2">
                                      {hasAccess ? formatRupiah(emp.gajiLama) : 'Rp ******'}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-emerald-600 border-r border-slate-100 print:border print:border-black print:text-black print:font-normal print:px-2 print:py-2">
                                      {hasAccess ? formatRupiah(emp.gajiBaru) : 'Rp ******'}
                                  </td>
                                  <td className="px-6 py-4 border-r border-slate-100 print:border print:border-black print:text-black print:px-2 print:py-2">
                                      {emp.masaKerja}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap border-r border-slate-100 print:border print:border-black print:text-black print:px-2 print:py-2">
                                      <div className={`font-mono font-medium px-2 py-1 rounded border inline-block print:bg-transparent print:border-none print:p-0 ${
                                          viewMode === 'history' && (getTmtDate(emp.tmt)?.getFullYear() || 0) >= 2026 
                                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                          : 'bg-slate-50 text-slate-700 border-slate-200'
                                      }`}>
                                          {emp.tmt}
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-center print:border print:border-black print:px-2 print:py-2">
                                      {emp.status === 'Processed' ? (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 print:bg-transparent print:text-black print:font-normal print:p-0">
                                              Selesai
                                          </span>
                                      ) : (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 print:bg-transparent print:text-black print:font-normal print:p-0">
                                              Belum di Proses
                                          </span>
                                      )}
                                  </td>
                              </tr>
                          )})
                      ) : (
                          <tr>
                              <td colSpan={8} className="px-6 py-16 text-center text-slate-400 print:border print:border-black print:text-black print:py-8">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                      <Search size={32} className="opacity-20 print:hidden" />
                                      <p className="font-medium">Tidak ada data ditemukan untuk periode ini.</p>
                                  </div>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
      
      {/* Print Signature Area (Visible only on print) */}
      <div className="hidden print:flex flex-col items-end mt-16 pr-8 page-break-inside-avoid text-black">
          <div className="text-left w-64">
              <p className="mb-1">Ditetapkan di: ...........................</p>
              <p className="mb-6">Tanggal: ...........................</p>
          </div>
          <div className="text-center w-64">
              <p className="mb-20 font-bold">Mengetahui,<br/>Kepala Bidang Mutasi & Promosi</p>
              <p className="font-bold underline">......................................................</p>
              <p className="font-medium mt-1">NIP. ...........................................</p>
          </div>
      </div>
    </div>
  );
};

export default ReportPage;
