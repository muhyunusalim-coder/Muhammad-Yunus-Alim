
import React, { useState, useMemo } from 'react';
import { Search, Briefcase, Clock, AlertTriangle, CheckCircle2, BadgeCheck, User, X, Building2, TrendingUp, Calendar, AlertCircle, ChevronRight, CalendarRange, Trash2 } from 'lucide-react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
  onStatusToggle: (id: string) => void;
  onDeleteEmployee?: (id: string) => void;
  currentUser: Employee | null;
}

const ADMIN_NIP = '199601192025061007';

const EmployeeTable: React.FC<Props> = ({ employees, onStatusToggle, onDeleteEmployee, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>('All'); // Changed from statusFilter to monthFilter
  const [unitFilter, setUnitFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentYear = new Date().getFullYear();

  const getDaysRemaining = (tmt: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let tmtDate: Date | null = null;
    
    // Handle YYYY-MM-DD
    if (tmt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        tmtDate = new Date(tmt);
    } 
    // Handle DD-MM-YYYY or DD/MM/YYYY
    else if (tmt.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) {
        const parts = tmt.split(/[-/]/);
        tmtDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }

    if (!tmtDate || isNaN(tmtDate.getTime())) return null;

    const diffTime = tmtDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper untuk menghitung siklus 2 tahunan
  const calculateCycleDates = (tmt: string) => {
    let tmtDate: Date | null = null;
    
    // Parsing logic matches existing getDaysRemaining
    if (tmt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        tmtDate = new Date(tmt);
    } else if (tmt.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) {
        const parts = tmt.split(/[-/]/);
        tmtDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }

    if (!tmtDate || isNaN(tmtDate.getTime())) return { prev: '-', next: '-' };

    // Previous (-2 years)
    const prevDate = new Date(tmtDate);
    prevDate.setFullYear(tmtDate.getFullYear() - 2);

    // Next (+2 years)
    const nextDate = new Date(tmtDate);
    nextDate.setFullYear(tmtDate.getFullYear() + 2);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

    return {
        prev: prevDate.toLocaleDateString('id-ID', options),
        next: nextDate.toLocaleDateString('id-ID', options)
    };
  };

  // Helper untuk format rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const uniqueUnits = useMemo(() => {
    const units = new Set(employees.map(e => e.unitKerja).filter(Boolean));
    return Array.from(units).sort();
  }, [employees]);

  const filtered = employees.filter(emp => {
    const matchesSearch = emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.nip.includes(searchTerm) ||
                          emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.unitKerja.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnit = unitFilter === 'All' || emp.unitKerja === unitFilter;
    const matchesType = typeFilter === 'All' || emp.statusKepegawaian === typeFilter;
    
    // Filter Periode (Bulan di Tahun Berjalan)
    let matchesPeriod = true;
    if (monthFilter !== 'All') {
        let tmtDate: Date | null = null;
        if (emp.tmt.match(/^\d{4}-\d{2}-\d{2}$/)) {
            tmtDate = new Date(emp.tmt);
        } else if (emp.tmt.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) {
            const parts = emp.tmt.split(/[-/]/);
            tmtDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }

        if (tmtDate && !isNaN(tmtDate.getTime())) {
            const tmtMonthIndex = tmtDate.getMonth();
            const tmtYear = tmtDate.getFullYear();
            const selectedMonthIndex = months.indexOf(monthFilter);
            
            // Logic: Tampilkan hanya jika Tahun = Tahun Ini DAN Bulan = Bulan Terpilih
            if (tmtYear === currentYear && tmtMonthIndex === selectedMonthIndex) {
                matchesPeriod = true;
            } else {
                matchesPeriod = false;
            }
        } else {
            matchesPeriod = false;
        }
    }

    return matchesSearch && matchesUnit && matchesType && matchesPeriod;
  });

  return (
    <>
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white relative z-10">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Daftar Pegawai</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Manajemen data kenaikan gaji berkala.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-grow md:flex-grow-0 group w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari Nama, NIP..." 
                className="pl-12 pr-6 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm w-full md:w-64 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {/* Unit Kerja Filter */}
                <div className="relative flex-shrink-0">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    className="pl-12 pr-10 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm appearance-none bg-slate-50 hover:bg-white text-slate-700 font-bold cursor-pointer w-full md:w-auto transition-all truncate max-w-[150px] md:max-w-[180px]"
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                  >
                    <option value="All">Semua Unit</option>
                    {uniqueUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                {/* Status Kepegawaian Filter */}
                <div className="relative flex-shrink-0">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    className="pl-12 pr-10 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm appearance-none bg-slate-50 hover:bg-white text-slate-700 font-bold cursor-pointer w-full md:w-auto transition-all"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="All">Jenis</option>
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                  </select>
                </div>
                
                {/* Periode Filter (Month of Current Year) */}
                <div className="relative flex-shrink-0">
                  <CalendarRange className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    className="pl-12 pr-10 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm appearance-none bg-slate-50 hover:bg-white text-slate-700 font-bold cursor-pointer w-full md:w-auto transition-all"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                  >
                    <option value="All">Semua Periode</option>
                    {months.map((month) => (
                      <option key={month} value={month}>{month} {currentYear}</option>
                    ))}
                  </select>
                </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 w-16 text-center hidden md:table-cell">#</th>
                <th className="px-6 py-4 w-full md:w-auto">Pegawai</th>
                <th className="px-6 py-4 hidden lg:table-cell">Detail</th>
                <th className="px-6 py-4 hidden xl:table-cell">Status</th>
                <th className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">Masa Kerja</th>
                <th className="px-6 py-4 hidden md:table-cell">TMT KGB</th>
                <th className="px-6 py-4 text-center">Status KGB</th>
                <th className="px-3 py-4 text-center md:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.length > 0 ? (
                filtered.map((emp, index) => (
                  <tr 
                    key={emp.id} 
                    onClick={() => setSelectedEmployee(emp)}
                    className="hover:bg-indigo-50/30 transition-colors group cursor-pointer active:bg-indigo-50"
                  >
                    <td className="px-6 py-5 text-center text-slate-400 font-medium text-xs hidden md:table-cell">
                      {index + 1}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-md transition-all">
                              {emp.nama.charAt(0)}
                          </div>
                          <div className="min-w-0">
                              <div className="font-bold text-slate-800 text-base mb-0.5 group-hover:text-indigo-600 transition-colors font-display truncate pr-2">{emp.nama}</div>
                              <div className="text-slate-400 text-xs font-mono">{emp.nip}</div>
                              {/* Mobile Only Extra Info */}
                              <div className="md:hidden text-xs text-slate-500 mt-1 truncate max-w-[150px]">{emp.unitKerja}</div>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-600 hidden lg:table-cell">
                      <div className="font-semibold text-slate-700 mb-1">{emp.jabatan}</div>
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{emp.unitKerja}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">{emp.pangkat}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 hidden xl:table-cell">
                      {emp.statusKepegawaian === 'PNS' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              <BadgeCheck size={12} /> PNS
                          </span>
                      )}
                      {emp.statusKepegawaian === 'PPPK' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                              <User size={12} /> PPPK
                          </span>
                      )}
                      {emp.statusKepegawaian === '-' && (
                          <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-slate-600 hidden xl:table-cell">
                      <span className="bg-slate-50 px-3 py-1.5 rounded-lg text-slate-600 font-bold text-xs border border-slate-200 whitespace-nowrap">
                          {emp.masaKerja}
                      </span>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                        <div className="font-mono text-slate-700 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg inline-block shadow-sm">
                            {emp.tmt}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                          const days = getDaysRemaining(emp.tmt);
                          
                          if (emp.status === 'Processed') {
                            return (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm" title="Selesai">
                                <CheckCircle2 size={14} className="flex-shrink-0" />
                                <span className="text-[11px] font-bold hidden sm:inline">Selesai</span>
                              </div>
                            );
                          }
                          
                          if (days !== null) {
                            if (days >= 0 && days <= 20) {
                              return (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shadow-sm animate-pulse" title={`Mendesak: H-${days}`}>
                                    <AlertTriangle size={14} className="flex-shrink-0" />
                                    <span className="text-[11px] font-bold hidden sm:inline">H-{days}</span>
                                  </div>
                              );
                            } else if (days < 0) {
                              return (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 shadow-sm" title={`Lewat ${Math.abs(days)} hari`}>
                                    <Clock size={14} className="flex-shrink-0" />
                                    <span className="text-[11px] font-bold hidden sm:inline">Telat</span>
                                  </div>
                              );
                            } else {
                              return (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200" title={`H-${days}`}>
                                    <ChevronRight size={14} className="flex-shrink-0 md:hidden" />
                                    <span className="text-[11px] font-bold hidden sm:inline">H-{days}</span>
                                  </div>
                              );
                            }
                          }

                          return <span className="text-slate-300">-</span>;
                        })()}

                        {emp.status === 'Processed' && onDeleteEmployee && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Hapus data ${emp.nama} dari daftar terproses?`)) {
                                onDeleteEmployee(emp.id);
                              }
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Hapus dari daftar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-5 text-center md:hidden">
                        <ChevronRight size={16} className="text-slate-300" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                              <Search size={32} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-500 text-lg">Tidak ada data ditemukan</p>
                              <p className="text-sm">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                          </div>
                      </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center flex justify-between px-8">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Data: {filtered.length}</span>
          <span className="text-xs text-slate-400 font-medium">Menampilkan hasil pencarian</span>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEmployee(null)}></div>
          
          <div className="relative bg-slate-50 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] animate-in scale-in-95 duration-200 flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 md:p-8 rounded-t-3xl relative overflow-hidden text-white flex-shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-[2px] shadow-lg flex-shrink-0">
                   <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                     {selectedEmployee.nama.charAt(0)}
                   </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-xl md:text-2xl font-display font-bold mb-1.5">{selectedEmployee.nama}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-slate-300 text-sm font-medium">
                    <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                      <BadgeCheck size={14} className="text-indigo-400" /> {selectedEmployee.nip}
                    </span>
                    <span className={`px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        selectedEmployee.statusKepegawaian === 'PNS' 
                        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' 
                        : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                    }`}>
                      <User size={14} /> {selectedEmployee.statusKepegawaian}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 flex-1 bg-white overflow-y-auto">
              
              {/* Section 1: Salary Hero Card (The most important info) */}
              <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                 
                 <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
                    {/* Old Salary */}
                    <div className="text-center md:text-left order-2 md:order-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gaji Pokok Lama</p>
                        <p className="text-lg md:text-xl font-bold text-slate-500 font-mono line-through decoration-slate-300 decoration-2">
                           {(currentUser?.nip === selectedEmployee.nip || currentUser?.nip === ADMIN_NIP) ? formatRupiah(selectedEmployee.gajiLama) : 'Rp *******'}
                        </p>
                    </div>

                    {/* Indicator */}
                    <div className="flex flex-col items-center justify-center order-1 md:order-2">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                             <TrendingUp size={20} />
                        </div>
                        {(currentUser?.nip === selectedEmployee.nip || currentUser?.nip === ADMIN_NIP) && (
                             <span className="text-[10px] font-bold text-emerald-600 mt-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                +{formatRupiah(selectedEmployee.gajiBaru - selectedEmployee.gajiLama)}
                             </span>
                        )}
                    </div>

                    {/* New Salary (Hero) */}
                    <div className="text-center md:text-right order-3">
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Gaji Pokok Baru</p>
                        <p className="text-2xl md:text-3xl font-bold text-indigo-700 font-mono">
                           {(currentUser?.nip === selectedEmployee.nip || currentUser?.nip === ADMIN_NIP) ? formatRupiah(selectedEmployee.gajiBaru) : 'Rp *******'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Berlaku TMT: <span className="font-bold text-slate-600">{selectedEmployee.tmt}</span></p>
                    </div>
                 </div>
              </div>

              {/* Section 2: Split Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Left Column: Employment Info */}
                 <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-slate-800 font-bold mb-5 text-sm uppercase tracking-wide border-b border-slate-50 pb-3">
                        <Briefcase size={16} className="text-slate-400" /> Informasi Kepegawaian
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <Building2 size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Unit Kerja</p>
                                <p className="text-sm font-bold text-slate-700">{selectedEmployee.unitKerja}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <BadgeCheck size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Jabatan</p>
                                <p className="text-sm font-bold text-slate-700">{selectedEmployee.jabatan}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Pangkat / Golongan</p>
                                <p className="text-sm font-bold text-slate-700">{selectedEmployee.pangkat}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Masa Kerja Golongan</p>
                                <p className="text-sm font-bold text-slate-700">{selectedEmployee.masaKerja}</p>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Right Column: Status & Timeline */}
                 <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
                    <h3 className="flex items-center gap-2 text-slate-800 font-bold mb-5 text-sm uppercase tracking-wide border-b border-slate-50 pb-3">
                        <TrendingUp size={16} className="text-slate-400" /> Status & Jadwal
                    </h3>

                    <div className="mb-6">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Status Proses KGB</p>
                        {selectedEmployee.status === 'Processed' ? (
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                                <CheckCircle2 size={20} className="flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Selesai Diproses</p>
                                    <p className="text-xs opacity-80">SK KGB telah diterbitkan.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
                                <AlertCircle size={20} className="flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Belum / Sedang Proses</p>
                                    <p className="text-xs opacity-80">Menunggu verifikasi BKPSDM.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pl-2">
                         {(() => {
                            const { prev, next } = calculateCycleDates(selectedEmployee.tmt);
                            return (
                                <div className="space-y-0 border-l-2 border-slate-100 ml-2 relative h-full">
                                    {/* Item 1 */}
                                    <div className="relative pl-6 pb-6">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                        <p className="text-xs text-slate-400 font-medium">Periode Sebelumnya</p>
                                        <p className="text-sm font-bold text-slate-500">{prev}</p>
                                    </div>
                                    
                                    {/* Item 2 (Active) */}
                                    <div className="relative pl-6 pb-6">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></div>
                                        <p className="text-xs text-indigo-600 font-bold uppercase mb-0.5">TMT Saat Ini</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedEmployee.tmt}</p>
                                    </div>

                                    {/* Item 3 */}
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-200 ring-4 ring-white"></div>
                                        <p className="text-xs text-slate-400 font-medium">Jadwal Berikutnya</p>
                                        <p className="text-sm font-bold text-slate-400">{next}</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                 </div>
              </div>

              {/* Section 3: Salary History */}
              {(selectedEmployee.salaryHistory && selectedEmployee.salaryHistory.length > 0) && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                   <h3 className="flex items-center gap-2 text-slate-800 font-bold mb-5 text-sm uppercase tracking-wide border-b border-slate-50 pb-3">
                       <Calendar size={16} className="text-slate-400" /> Riwayat Kenaikan Gaji
                   </h3>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                       <thead>
                         <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-50">
                           <th className="px-4 py-2">Tanggal TMT</th>
                           <th className="px-4 py-2">Keterangan</th>
                           <th className="px-4 py-2 text-right">Nominal</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                         {selectedEmployee.salaryHistory.map((history, idx) => (
                           <tr key={idx} className="hover:bg-slate-50 transition-colors">
                             <td className="px-4 py-3 font-mono text-slate-600">{history.date}</td>
                             <td className="px-4 py-3 text-slate-700 font-medium">{history.description}</td>
                             <td className="px-4 py-3 text-right font-bold text-slate-800">
                               {(currentUser?.nip === selectedEmployee.nip || currentUser?.nip === ADMIN_NIP) ? formatRupiah(history.amount) : 'Rp *******'}
                             </td>
                           </tr>
                         ))}
                         {/* Current New Salary as the latest entry */}
                         <tr className="bg-indigo-50/30">
                           <td className="px-4 py-3 font-mono text-indigo-600 font-bold">{selectedEmployee.tmt}</td>
                           <td className="px-4 py-3 text-indigo-700 font-bold">KGB Terbaru (Proses)</td>
                           <td className="px-4 py-3 text-right font-bold text-indigo-700">
                             {(currentUser?.nip === selectedEmployee.nip || currentUser?.nip === ADMIN_NIP) ? formatRupiah(selectedEmployee.gajiBaru) : 'Rp *******'}
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>
                </div>
              )}

            </div>
            
            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-3xl flex-shrink-0">
               <button 
                onClick={() => setSelectedEmployee(null)}
                className="w-full md:w-auto px-6 py-3.5 md:py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm active:scale-95"
               >
                 Tutup Detail
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeTable;
