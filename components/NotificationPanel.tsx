
import React, { useMemo, useState } from 'react';
import { X, Bell, Calendar, Briefcase, Clock, Download, ArrowRightCircle, Filter, AlertTriangle, Loader2 } from 'lucide-react';
import { Employee } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

const NotificationPanel: React.FC<Props> = ({ isOpen, onClose, employees }) => {
  const [filterDays, setFilterDays] = useState<number>(20);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filter employees whose TMT is:
  // 1. Overdue (Past date, not processed) -> "Sudah Waktunya"
  // 2. Current Month
  // 3. Urgent (H-20) OR H-30 based on selection
  // 4. Next Month (If today > 1st)
  const { notifications } = useMemo(() => {
    const now = new Date();
    
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Determine Next Month
    const nextMonthDate = new Date(now);
    nextMonthDate.setMonth(now.getMonth() + 1);
    const nextMonthIndex = nextMonthDate.getMonth();
    const nextMonthYear = nextMonthDate.getFullYear();

    const list = employees.filter(emp => {
      // Skip if already processed
      if (emp.status === 'Processed') return false;

      let tmtDate: Date | null = null;
      
      // Handle YYYY-MM-DD
      if (emp.tmt.match(/^\d{4}-\d{2}-\d{2}$/)) {
          tmtDate = new Date(emp.tmt);
      } 
      // Handle DD-MM-YYYY or DD/MM/YYYY
      else if (emp.tmt.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) {
          const parts = emp.tmt.split(/[-/]/);
          tmtDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }

      if (!tmtDate || isNaN(tmtDate.getTime())) return false;

      // Calculate diff for sorting/urgent logic
      const nowZero = new Date(now);
      nowZero.setHours(0,0,0,0);
      const diffTime = tmtDate.getTime() - nowZero.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const tmtMonth = tmtDate.getMonth();
      const tmtYear = tmtDate.getFullYear();

      // Condition 1: Current Month
      const isCurrentMonth = tmtMonth === currentMonth && tmtYear === currentYear;

      // Condition 2: Upcoming based on filterDays (H-20 or H-30)
      const isUpcoming = diffDays >= 0 && diffDays <= filterDays;

      // Condition 3: Next Month (Only if today > 1st)
      const isNextMonth = currentDay > 1 && tmtMonth === nextMonthIndex && tmtYear === nextMonthYear;

      // Condition 4: Overdue (Sudah Waktunya) - Negative days (past) and not processed
      const isOverdue = diffDays < 0;

      // Add properties for display
      emp.daysRemaining = diffDays;
      emp.isCurrentMonth = isCurrentMonth;
      emp.isNextMonth = isNextMonth;
      emp.isOverdue = isOverdue;

      return isCurrentMonth || isUpcoming || isNextMonth || isOverdue;
    });

    // Sort by soonest first (ascending daysRemaining). 
    // Negative numbers (overdue) will appear first.
    list.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return { notifications: list };
  }, [employees, filterDays]);

  const handleDownload = async () => {
    if (notifications.length === 0) return;
    setIsDownloading(true);

    try {
        // Dynamic import for performance
        const XLSX = await import('xlsx');

        // 1. Prepare data specifically for Excel
        const dataForExcel = notifications.map((emp, index) => {
            const days = emp.daysRemaining;
            const isNextMonth = emp.isNextMonth;

            let sisaWaktu = `${days} Hari`;
            if (days < 0) sisaWaktu = `Sudah Waktunya (Lewat ${Math.abs(days)} Hari)`;
            if (days === 0) sisaWaktu = "Hari Ini";
            if (isNextMonth) sisaWaktu = "Bulan Depan";

            return {
              "No": index + 1,
              "Nama Pegawai": emp.nama,
              "NIP": emp.nip,
              "Jabatan": emp.jabatan,
              "Pangkat/Gol": emp.pangkat,
              "Unit Kerja": emp.unitKerja,
              "TMT KGB Baru": emp.tmt,
              "Gaji Lama": emp.gajiLama,
              "Gaji Baru": emp.gajiBaru,
              "Status Waktu": sisaWaktu
            };
        });

        // 2. Create Worksheet
        const ws = XLSX.utils.json_to_sheet(dataForExcel);

        // 3. Set Column Widths
        const wscols = [
          { wch: 5 },  // No
          { wch: 30 }, // Nama Pegawai
          { wch: 22 }, // NIP
          { wch: 25 }, // Jabatan
          { wch: 20 }, // Pangkat/Gol
          { wch: 25 }, // Unit Kerja
          { wch: 15 }, // TMT KGB Baru
          { wch: 15 }, // Gaji Lama
          { wch: 15 }, // Gaji Baru
          { wch: 30 }, // Status Waktu
        ];
        ws['!cols'] = wscols;

        // 4. Create Workbook and append sheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Notifikasi KGB");

        // 5. Trigger Download
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `Jadwal_KGB_H${filterDays}_${dateStr}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
    } catch (e) {
        console.error("Download failed", e);
    } finally {
        setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
        <div className="w-screen max-w-md pointer-events-auto">
          <div className="flex flex-col h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Bell size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Peringatan KGB</h2>
                  <p className="text-xs text-blue-100 opacity-90">Jadwal Lewat, Bulan Ini & Akan Datang</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Filter Control */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between sticky top-0 z-0">
               <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Filter size={14} />
                  <span>Rentang Waktu:</span>
               </div>
               <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                 <button 
                   onClick={() => setFilterDays(20)}
                   className={`px-3 py-1.5 text-xs rounded-md transition-all ${filterDays === 20 ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                   H-20 (Mendesak)
                 </button>
                 <button 
                   onClick={() => setFilterDays(30)}
                   className={`px-3 py-1.5 text-xs rounded-md transition-all ${filterDays === 30 ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                   H-30 (Extended)
                 </button>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Daftar Pegawai ({notifications.length})
                    </span>
                    {filterDays === 20 ? (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 font-medium">
                        Filter: H-20
                      </span>
                    ) : (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 font-medium">
                        Filter: H-30
                      </span>
                    )}
                  </div>

                  {notifications.map((emp) => {
                    const days = emp.daysRemaining;
                    const isNextMonth = emp.isNextMonth;
                    
                    const isOverdue = days < 0;
                    const isUrgent = days >= 0 && days <= 7 && !isNextMonth;
                    const isWarning = days > 7 && days <= 20 && !isNextMonth;
                    
                    return (
                        <div 
                          key={emp.id} 
                          className={`p-4 rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden ${
                            isOverdue 
                                ? 'bg-gradient-to-br from-red-600 to-rose-600 border-red-500 shadow-red-500/30 transform hover:scale-[1.02]' // Prominent Red Style
                                : isUrgent 
                                    ? 'bg-white border-red-200 ring-1 ring-red-50' 
                                    : isWarning 
                                        ? 'bg-white border-orange-200 ring-1 ring-orange-50'
                                        : isNextMonth 
                                            ? 'bg-white border-indigo-100 ring-1 ring-indigo-50'
                                            : 'bg-white border-blue-100 ring-1 ring-blue-50'
                          }`}
                        >
                          {/* Background Glow for Overdue */}
                          {isOverdue && <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transform translate-z-0"></div>}

                          <div className="flex justify-between items-start mb-2 relative z-10">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                                isOverdue 
                                    ? 'bg-white/20 text-white backdrop-blur-sm' // Translucent white for red bg
                                    : isUrgent 
                                        ? 'bg-red-100 text-red-600' 
                                        : isWarning 
                                            ? 'bg-orange-100 text-orange-600'
                                            : isNextMonth 
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-blue-100 text-blue-600'
                              }`}>
                                {emp.nama.charAt(0)}
                              </div>
                              <div>
                                <h4 className={`text-sm font-bold ${isOverdue ? 'text-white' : 'text-gray-800'}`}>
                                    {emp.nama}
                                </h4>
                                <p className={`text-xs ${isOverdue ? 'text-red-100' : 'text-gray-500'}`}>
                                    {emp.nip}
                                </p>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            {(() => {
                                if (isOverdue) {
                                    return (
                                        <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 bg-white text-red-600 border-white/20 shadow-sm animate-pulse">
                                            <AlertTriangle size={12} className="animate-bounce" />
                                            SUDAH WAKTUNYA
                                        </span>
                                    );
                                }
                                if (isNextMonth) {
                                     return (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 bg-indigo-50 text-indigo-600 border-indigo-200">
                                            <ArrowRightCircle size={10} />
                                            Bulan Depan
                                        </span>
                                    );
                                }
                                if (days === 0) {
                                    return (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 bg-red-500 text-white border-red-600 animate-pulse">
                                            <Clock size={10} />
                                            HARI INI
                                        </span>
                                    );
                                } else {
                                    let badgeColor = "";
                                    if (days <= 7) badgeColor = "bg-red-50 text-red-600 border-red-100";
                                    else if (days <= 20) badgeColor = "bg-orange-50 text-orange-600 border-orange-100";
                                    else badgeColor = "bg-blue-50 text-blue-600 border-blue-100";

                                    return (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${badgeColor}`}>
                                            <Clock size={10} />
                                            H-{days}
                                        </span>
                                    );
                                }
                            })()}
                          </div>

                          <div className={`space-y-1.5 mt-3 pt-3 border-t relative z-10 ${isOverdue ? 'border-white/20' : 'border-gray-50'}`}>
                            <div className={`flex items-center gap-2 text-xs ${isOverdue ? 'text-red-50' : 'text-gray-600'}`}>
                              <Briefcase size={12} className={isOverdue ? 'text-red-200' : 'text-gray-400'} />
                              <span>{emp.jabatan}</span>
                              <span className={isOverdue ? 'text-red-300' : 'text-gray-300'}>|</span>
                              <span>{emp.unitKerja}</span>
                            </div>
                            <div className={`flex items-center justify-between text-xs ${isOverdue ? 'text-white' : 'text-gray-600'}`}>
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} className={isOverdue ? 'text-red-200' : 'text-gray-400'} />
                                    <span className={`font-medium ${isOverdue ? 'text-white' : 'text-gray-800'}`}>
                                        TMT: {emp.tmt}
                                    </span>
                                </div>
                                {isNextMonth && <span className="text-[10px] text-indigo-500 font-medium">Persiapan KGB</span>}
                                {isOverdue && <span className="text-[10px] text-white font-bold bg-white/20 px-2 py-0.5 rounded">Terlewat {Math.abs(days)} Hari</span>}
                                {days > 20 && <span className="text-[10px] text-blue-500 font-medium">Mendekati Jadwal</span>}
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Bell size={32} />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">Tidak Ada Notifikasi</h3>
                  <p className="text-sm text-gray-500">
                    {filterDays === 20 
                        ? "Tidak ada jadwal KGB mendesak (H-20) atau terlewat." 
                        : "Tidak ada jadwal KGB dalam 30 hari ke depan atau terlewat."}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3 relative z-10">
               {notifications.length > 0 && (
                   <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {isDownloading ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}
                     {isDownloading ? 'Menyiapkan Excel...' : `Unduh Excel (Rekap H-${filterDays})`}
                   </button>
               )}
               <button 
                onClick={onClose}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition"
               >
                 Tutup Panel
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
