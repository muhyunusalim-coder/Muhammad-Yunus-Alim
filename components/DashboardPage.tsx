import React, { Suspense } from 'react';
import { Sparkles, User, Clock, CalendarCheck, Quote, RefreshCw, Calendar, X } from 'lucide-react';
import { Employee } from '../types';
import DashboardStats from './DashboardStats';
import KGBCharts from './KGBCharts';
import EmployeeTable from './EmployeeTable';

interface Props {
  currentUser: Employee | null;
  currentUserDaysRemaining: number | null;
  countdown: { days: number; hours: number; minutes: number; seconds: number } | null;
  greeting: string;
  quote: string;
  handleNewQuote: () => void;
  stats: any;
  employees: Employee[];
  displayedEmployees: Employee[];
  selectedMonth: string | null;
  selectedYear: number | null;
  setSelectedMonth: (month: string | null) => void;
  setSelectedYear: (year: number | null) => void;
  handleStatusToggle: (id: string) => void;
  handleDeleteEmployee: (id: string) => void;
}

const DashboardPage: React.FC<Props> = ({
  currentUser,
  currentUserDaysRemaining,
  countdown,
  greeting,
  quote,
  handleNewQuote,
  stats,
  employees,
  displayedEmployees,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  handleStatusToggle,
  handleDeleteEmployee
}) => {
  return (
    <>
      {/* Hero Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-[#2e36bf] text-white shadow-2xl shadow-indigo-500/20 p-8 md:p-10 flex flex-col justify-between min-h-[340px] group transition-all duration-500 hover:shadow-indigo-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4f46e5] opacity-100"></div>
          <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-white/5 rounded-full blur-[60px] transform translate-z-0"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[80px] transform translate-z-0"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-100 text-[11px] font-bold uppercase tracking-wider mb-6 backdrop-blur-md shadow-sm">
              <Sparkles size={12} className="text-indigo-200" /> Dashboard Overview
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-2 tracking-tight">
              {greeting}, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 to-cyan-200 drop-shadow-sm">
                {currentUser ? currentUser.nama.split(',')[0] : 'Pegawai'}
              </span>
            </h1>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md max-w-2xl transition-all hover:bg-white/15 shadow-inner">
              <Quote className="text-indigo-200 shrink-0 mt-1" size={20} />
              <p className="text-indigo-50 text-sm md:text-base font-medium italic leading-relaxed flex-1 opacity-90">"{quote}"</p>
              <button onClick={handleNewQuote} className="p-2 text-indigo-300 hover:text-white hover:bg-white/20 rounded-xl transition-all" title="Ubah Kutipan">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Card */}
        {currentUser && (
          <div className="rounded-[2.5rem] bg-white/90 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/50 p-8 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/60">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none mix-blend-multiply transform translate-z-0"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <User size={14} className="text-indigo-500" /> Status Saya
                </p>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                  currentUserDaysRemaining !== null && currentUserDaysRemaining <= 30 
                  ? 'bg-amber-50 text-amber-600 border-amber-100' 
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {currentUserDaysRemaining !== null && currentUserDaysRemaining <= 30 ? 'Mendekati' : 'Aman'}
                </div>
              </div>
              
              <h3 className="text-slate-800 font-display font-bold text-2xl leading-tight mb-1">{currentUser.pangkat}</h3>
              <p className="text-slate-500 font-mono text-sm bg-slate-100/80 inline-block px-2 py-0.5 rounded-lg mb-6 border border-slate-200/50">{currentUser.nip}</p>
              
              {/* Countdown Section */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock size={12} /> Menuju Kenaikan
                </p>
                
                <div className="flex items-baseline gap-1 relative z-10">
                  {countdown ? (
                    countdown.days <= 0 && countdown.hours <= 0 && countdown.minutes <= 0 && countdown.seconds <= 0 && currentUserDaysRemaining !== null && currentUserDaysRemaining <= 0 ? (
                      <div className="w-full text-center py-2">
                        <span className="text-lg font-bold text-rose-500 animate-pulse bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 block shadow-sm">Waktunya Proses!</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-3 text-center w-full">
                        <div className="bg-white rounded-xl p-2 border border-indigo-100/50 shadow-[0_2px_10px_-2px_rgba(99,102,241,0.1)] flex flex-col items-center">
                          <div className="text-xl md:text-2xl font-bold text-indigo-600 font-display">{Math.max(0, countdown.days)}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Hari</div>
                        </div>
                        <div className="bg-white rounded-xl p-2 border border-indigo-100/50 shadow-[0_2px_10px_-2px_rgba(99,102,241,0.1)] flex flex-col items-center">
                          <div className="text-xl md:text-2xl font-bold text-indigo-600 font-display">{Math.max(0, countdown.hours)}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Jam</div>
                        </div>
                        <div className="bg-white rounded-xl p-2 border border-indigo-100/50 shadow-[0_2px_10px_-2px_rgba(99,102,241,0.1)] flex flex-col items-center">
                          <div className="text-xl md:text-2xl font-bold text-indigo-600 font-display">{Math.max(0, countdown.minutes)}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Mnt</div>
                        </div>
                        <div className="bg-white rounded-xl p-2 border border-indigo-100/50 shadow-[0_2px_10px_-2px_rgba(99,102,241,0.1)] flex flex-col items-center">
                          <div className="text-xl md:text-2xl font-bold text-indigo-600 font-display">{Math.max(0, countdown.seconds)}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Dtk</div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="w-full text-center">
                      <span className="text-xl font-bold text-slate-300">-</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Jadwal KGB Berikutnya</p>
                  <p className="text-xl font-bold text-slate-800 font-display">{currentUser.tmt}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  currentUserDaysRemaining !== null && currentUserDaysRemaining <= 30
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30'
                  : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30'
                }`}>
                  <CalendarCheck size={20} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <DashboardStats stats={stats} />
      </div>
        
      <div className="py-2">
        <Suspense fallback={<div className="h-64 bg-white/50 rounded-3xl animate-pulse" />}>
          <KGBCharts 
            employees={employees} 
            onMonthClick={(month, year) => {
              setSelectedMonth(month);
              setSelectedYear(year);
            }} 
            selectedMonth={selectedMonth} 
          />
        </Suspense>
      </div>
        
      {selectedMonth && selectedYear && (
        <div className="flex items-center justify-between bg-indigo-600 text-white p-5 rounded-3xl shadow-xl shadow-indigo-500/30 transform transition-all hover:scale-[1.005] mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transform translate-z-0"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
              <Calendar size={24} />
            </div>
            <div>
              <p className="font-bold font-display text-lg">Filter Aktif: {selectedMonth} {selectedYear}</p>
              <p className="text-indigo-100 text-sm font-medium opacity-90">Menampilkan {displayedEmployees.length} pegawai terseleksi</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setSelectedMonth(null);
              setSelectedYear(null);
            }}
            className="relative z-10 px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <X size={16} />
            Reset Filter
          </button>
        </div>
      )}

      <EmployeeTable 
        employees={displayedEmployees} 
        onStatusToggle={handleStatusToggle}
        onDeleteEmployee={handleDeleteEmployee}
        currentUser={currentUser}
      />
    </>
  );
};

export default DashboardPage;
