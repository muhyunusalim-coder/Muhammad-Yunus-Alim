
import React, { useEffect, useState, useMemo, Suspense, lazy } from 'react';
import { LayoutDashboard, Calendar, X, Activity, LogOut, MessageCircle, Quote, Sparkles, User, CalendarCheck, Clock, AlertTriangle, Menu, BookOpen, BarChart2, ClipboardList, RefreshCw, ChevronRight } from 'lucide-react';
import DashboardStats from './components/DashboardStats';
import EmployeeTable from './components/EmployeeTable';
import AIAssistant from './components/AIAssistant';
import LoginPage from './components/LoginPage';
import { fetchEmployeeData } from './services/dataService';
import { Employee, DashboardStats as StatsType } from './types';

// Lazy Load Heavy Components to reduce initial bundle size
const KGBCharts = lazy(() => import('./components/KGBCharts'));
const StatisticsPage = lazy(() => import('./components/StatisticsPage'));
const ReportPage = lazy(() => import('./components/ReportPage'));
const FAQPage = lazy(() => import('./components/FAQPage'));

const MOTIVATIONAL_QUOTES = [
  "Setiap langkah kecil membawamu lebih dekat pada tujuan besar.",
  "Bekerjalah dengan hati, maka hasil tak akan mengkhianati.",
  "Hari ini adalah peluang baru untuk menjadi versi terbaik dirimu.",
  "Kesuksesan bukan kunci kebahagiaan. Kebahagiaanlah kunci kesuksesan.",
  "Jadikan lelahmu sebagai ibadah. Teruslah berkarya!",
  "Kualitas kerjamu adalah cerminan dirimu. Buatlah menjadi luar biasa.",
  "Integritas adalah melakukan hal yang benar, bahkan ketika tidak ada yang melihat.",
  "Melayani dengan hati adalah bentuk dedikasi tertinggi bagi negeri.",
  "Profesionalisme bukan sekadar keahlian, tapi juga tentang sikap dan etika.",
  "Jadilah ASN yang solutif, adaptif, dan inovatif untuk kemajuan bangsa.",
  "Rezeki tidak akan tertukar, tapi jemputlah dengan ikhtiar terbaik.",
  "Bersyukur membuat apa yang kita miliki menjadi cukup.",
  "Inovasi membedakan antara pemimpin dan pengikut.",
  "Cara terbaik memprediksi masa depan adalah dengan menciptakannya."
];

// Lightweight Loading Component for Suspense
const PageLoader = () => (
  <div className="w-full h-64 flex flex-col items-center justify-center gap-3 animate-pulse">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <span className="text-xs text-slate-400 font-medium">Memuat komponen...</span>
  </div>
);

// Comprehensive Dashboard Skeleton for Initial Load
const DashboardSkeleton = () => (
  <div className="w-full max-w-[1440px] mx-auto space-y-6 animate-pulse p-2">
    {/* Hero & Status Skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 h-[340px] bg-slate-200 rounded-[2.5rem]"></div>
      <div className="h-[340px] bg-slate-200 rounded-[2.5rem]"></div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-slate-200 rounded-[2.5rem]"></div>
      ))}
    </div>

    {/* Chart Skeleton */}
    <div className="h-64 bg-slate-200 rounded-[2.5rem]"></div>

    {/* Table Skeleton */}
    <div className="bg-white/60 rounded-[2.5rem] p-8 border border-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="h-8 w-48 bg-slate-300 rounded-lg"></div>
        <div className="h-10 w-full md:w-64 bg-slate-300 rounded-2xl"></div>
      </div>
      
      <div className="space-y-4">
        {/* Table Header */}
        <div className="h-10 bg-slate-200 rounded-xl w-full mb-4"></div>
        
        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-2 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-slate-300 shrink-0"></div>
            <div className="space-y-2 flex-1">
               <div className="h-4 w-3/4 bg-slate-300 rounded-lg"></div>
               <div className="h-3 w-1/2 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="hidden md:block w-32 h-8 bg-slate-200 rounded-lg"></div>
            <div className="hidden md:block w-24 h-8 bg-slate-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  const [quote, setQuote] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'faq' | 'statistics' | 'report'>('dashboard');
  const [greeting, setGreeting] = useState('Selamat Pagi');
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('kgb_auth_session');
    if (sessionAuth === 'true') {
        setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  // Update greeting based on time
  useEffect(() => {
    const updateGreeting = () => {
        const hours = new Date().getHours();
        if (hours >= 3 && hours < 11) setGreeting("Selamat Pagi");
        else if (hours >= 11 && hours < 15) setGreeting("Selamat Siang");
        else if (hours >= 15 && hours < 18) setGreeting("Selamat Sore");
        else setGreeting("Selamat Malam");
    };

    updateGreeting();
    // Reduce interval check to save CPU, greeting doesn't change often
    const interval = setInterval(updateGreeting, 300000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchEmployeeData();
        setEmployees(data);

        const sessionNip = sessionStorage.getItem('kgb_user_nip');
        if (sessionNip) {
            const user = data.find(e => e.nip === sessionNip);
            if (user) setCurrentUser(user);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated]);

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

  // Countdown Logic
  useEffect(() => {
    if (!currentUser) return;
    const targetDate = getTmtDate(currentUser.tmt);
    if (!targetDate) return;

    // Set target to midnight of the TMT date
    targetDate.setHours(0, 0, 0, 0);

    const updateTimer = () => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (diff <= 0) {
            setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);


  const handleLogin = (nip: string) => {
      setIsAuthenticated(true);
      sessionStorage.setItem('kgb_auth_session', 'true');
      sessionStorage.setItem('kgb_user_nip', nip);
      setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      sessionStorage.removeItem('kgb_auth_session');
      sessionStorage.removeItem('kgb_user_nip');
      setEmployees([]); 
      setCurrentUser(null);
  };

  const handleNewQuote = () => {
    let newQuote = quote;
    if (MOTIVATIONAL_QUOTES.length > 1) {
        do {
            newQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        } while (newQuote === quote);
    }
    setQuote(newQuote);
  };

  const handleStatusToggle = (id: string) => {
    setEmployees(currentEmployees => 
      currentEmployees.map(emp => {
        if (emp.id === id) {
          const newStatus = emp.status === 'Processed' ? 'Upcoming' : 'Processed';
          return { ...emp, status: newStatus };
        }
        return emp;
      })
    );
  };

  const getMonthName = (tmt: string) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const parts = tmt.split(/[-/]/);
    if (parts.length < 2) return '';
    const monthIdx = parseInt(parts[1]) - 1;
    if (monthIdx >= 0 && monthIdx < 12) return months[monthIdx];
    return '';
  };

  const displayedEmployees = useMemo(() => {
    if (!selectedMonth || !selectedYear) return employees;
    
    return employees.filter(e => {
        const tmtDate = getTmtDate(e.tmt);
        if (!tmtDate) return false;

        const isMonthMatch = getMonthName(e.tmt) === selectedMonth;
        const isYearMatch = tmtDate.getFullYear() === selectedYear;

        return isMonthMatch && isYearMatch;
    });
  }, [employees, selectedMonth, selectedYear]);

  const currentUserDaysRemaining = useMemo(() => {
      if (!currentUser) return null;
      const now = new Date();
      now.setHours(0,0,0,0);
      const tmtDate = getTmtDate(currentUser.tmt);
      if (!tmtDate) return null;
      
      const diff = tmtDate.getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [currentUser]);

  const stats: StatsType = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();

    const currentMonthCount = employees.filter(e => {
        const tmtDate = getTmtDate(e.tmt);
        if (!tmtDate || isNaN(tmtDate.getTime())) return false;
        return tmtDate.getMonth() === currentMonth && tmtDate.getFullYear() === currentYear;
    }).length;

    const processedCount = employees.filter(e => {
        const tmtDate = getTmtDate(e.tmt);
        if (!tmtDate || isNaN(tmtDate.getTime())) return false;
        
        const diffTime = tmtDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const isCurrentMonth = tmtDate.getMonth() === currentMonth && tmtDate.getFullYear() === currentYear;
        const isUrgent = diffDays >= 0 && diffDays <= 20;
        const isOverdue = diffDays < 0;

        return isCurrentMonth || isUrgent || isOverdue;
    }).length;

    const upcomingCount = employees.length - processedCount;

    return {
      totalEmployees: employees.length,
      upcomingKGB: upcomingCount,
      processedKGB: processedCount,
      currentMonthKGB: currentMonthCount
    };
  }, [employees]);

  if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
  }

  // Sidebar Menu Item Component
  const MenuItem = ({ view, icon: Icon, label, colorClass }: { view: string, icon: any, label: string, colorClass: string }) => (
    <button 
        onClick={() => { setCurrentView(view as any); setMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden ${
            currentView === view 
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25' 
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
        }`}
    >
        {currentView === view && (
             <div className="absolute inset-0 bg-white/10"></div>
        )}
        <Icon size={20} className={`${currentView === view ? 'text-white' : colorClass} relative z-10 transition-colors`} />
        <span className="text-sm font-semibold tracking-wide relative z-10">{label}</span>
        {currentView === view && <ChevronRight size={16} className="ml-auto opacity-70 relative z-10" />}
    </button>
  );

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Background Ambient Mesh (Optimized for performance: Static Gradients instead of heavy blurs) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50 print:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 opacity-60"></div>
          {/* Subtle static blobs using CSS gradient instead of multiple div elements with hardware acceleration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] transform translate-z-0 will-change-transform"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] transform translate-z-0 will-change-transform"></div>
      </div>

      {/* Modern Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0f172a] text-white transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:translate-x-0 md:static shadow-2xl flex flex-col border-r border-slate-800/50 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
        {/* Brand Area */}
        <div className="px-6 pt-8 pb-6">
            <div className="flex items-center gap-3.5 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                    L
                </div>
                <div>
                    <h1 className="font-display font-bold text-xl tracking-tight text-white leading-none">Layanan KGB</h1>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1 block opacity-80">Enterprise</span>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4 custom-scrollbar">
            <div className="px-4 mb-3 mt-1">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Menu Utama</p>
            </div>
            
            <MenuItem view="dashboard" icon={LayoutDashboard} label="Dashboard" colorClass="text-indigo-400" />
            <MenuItem view="statistics" icon={BarChart2} label="Statistik ASN" colorClass="text-emerald-400" />
            <MenuItem view="report" icon={ClipboardList} label="Laporan & Rekap" colorClass="text-amber-400" />
            <MenuItem view="faq" icon={BookOpen} label="Pusat Informasi" colorClass="text-cyan-400" />

            <div className="px-4 mb-3 mt-8">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Bantuan</p>
            </div>
            <a href="https://wa.me/6289656419609" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all group">
                <MessageCircle size={20} className="text-pink-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-semibold tracking-wide">Hubungi Admin</span>
            </a>
        </nav>

        {/* User Profile */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
             <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 p-[2px]">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                        {currentUser ? currentUser.nama.charAt(0) : 'U'}
                    </div>
                </div>
                <div className="overflow-hidden min-w-0">
                    <p className="text-sm font-bold text-white truncate font-display">{currentUser?.nama.split(',')[0]}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.nip}</p>
                </div>
             </div>
             <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider border border-rose-500/20 hover:border-rose-500 shadow-sm hover:shadow-rose-500/20">
                <LogOut size={14} /> Keluar Aplikasi
             </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-md" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 print:h-auto print:overflow-visible print:block">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm print:hidden">
             <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition">
                    <Menu size={24} />
                </button>
                <span className="font-display font-bold text-slate-800 text-lg">Layanan KGB</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {currentUser ? currentUser.nama.charAt(0) : 'U'}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar print:overflow-visible print:h-auto print:p-0">
            <div className="max-w-[1440px] mx-auto space-y-8 pb-10 print:max-w-none print:space-y-0 print:pb-0">
            
            {loading ? (
                <DashboardSkeleton />
            ) : (
                <Suspense fallback={<PageLoader />}>
                {currentView === 'dashboard' && (
                    <>
                    {/* Hero Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-[#2e36bf] text-white shadow-2xl shadow-indigo-500/20 p-8 md:p-10 flex flex-col justify-between min-h-[340px] group transition-all duration-500 hover:shadow-indigo-500/30">
                            {/* Stylish Background Gradients */}
                             <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4f46e5] opacity-100"></div>
                             {/* Static shapes for performance instead of animated heavy blur */}
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

                        {/* Status Card (Refined) */}
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
                        currentUser={currentUser}
                    />
                    </>
                )}

                {currentView === 'statistics' && (
                    <StatisticsPage employees={employees} />
                )}

                {currentView === 'report' && (
                    <ReportPage employees={employees} currentUser={currentUser} />
                )}

                {currentView === 'faq' && (
                    <FAQPage />
                )}
                </Suspense>
            )}
            </div>
        </div>
      </main>

      <AIAssistant employees={employees} />
    </div>
  );
}

export default App;
