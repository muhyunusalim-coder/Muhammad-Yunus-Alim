
import React from 'react';
import { Users, Calendar, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { DashboardStats as StatsType } from '../types';

interface Props {
  stats: StatsType;
}

const StatCard = ({ title, value, icon: Icon, color, subtext, trend, delay }: { title: string, value: string, icon: any, color: 'blue' | 'amber' | 'emerald', subtext: string, trend?: string, delay: string }) => {
    
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            gradient: 'from-blue-500 to-indigo-600',
            shadow: 'shadow-blue-500/10',
            iconBg: 'bg-blue-100/50'
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            gradient: 'from-amber-400 to-orange-500',
            shadow: 'shadow-amber-500/10',
            iconBg: 'bg-amber-100/50'
        },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            gradient: 'from-emerald-400 to-teal-500',
            shadow: 'shadow-emerald-500/10',
            iconBg: 'bg-emerald-100/50'
        }
    };

    const theme = colorClasses[color];

    return (
        <div className={`relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl ${theme.shadow} border border-white/40 group hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 ${delay}`}>
            {/* Background Decoration (Subtle Blob) */}
            <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${theme.gradient} opacity-[0.08] rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700`}></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl ${theme.iconBg} ${theme.text} backdrop-blur-sm shadow-sm ring-1 ring-black/5`}>
                        <Icon size={26} />
                    </div>
                    {trend && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                            <TrendingUp size={10} />
                            {trend}
                        </span>
                    )}
                </div>
                
                <div>
                    <h3 className="text-4xl md:text-5xl font-display font-bold text-slate-800 mb-2 tracking-tight">
                        {value}
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">{title}</p>
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50/50">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.gradient}`}></span>
                        <span className="text-xs text-slate-500 font-medium">{subtext}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Total Pegawai" 
        value={stats.totalEmployees.toString()} 
        icon={Users} 
        color="blue"
        subtext="Database Aktif Terintegrasi"
        delay="delay-0"
      />
      <StatCard 
        title="KGB Akan Datang" 
        value={stats.upcomingKGB.toString()} 
        icon={Calendar} 
        color="amber"
        subtext="Dalam Antrian Proses"
        delay="delay-100"
      />
      <StatCard 
        title="KGB Terproses" 
        value={stats.processedKGB.toString()} 
        icon={CheckCircle} 
        color="emerald"
        subtext="Dokumen SK Terbit"
        trend="+12%"
        delay="delay-200"
      />
    </div>
  );
};

export default DashboardStats;
