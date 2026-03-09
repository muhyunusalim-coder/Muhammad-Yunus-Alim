
import React, { useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Cell 
} from 'recharts';
import { TrendingUp, Building2, Calendar } from 'lucide-react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16', '#f43f5e'];

const TrendCharts: React.FC<Props> = ({ employees }) => {
  
  const parseYear = (dateStr: string) => {
    if (!dateStr) return null;
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return parseInt(dateStr.split('-')[0]);
    } 
    else if (dateStr.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) {
        const parts = dateStr.split(/[-/]/);
        return parseInt(parts[2]);
    }
    return null;
  };

  // 1. Tren KGB Tahunan (Line Chart)
  const yearlyData = useMemo(() => {
    const counts: Record<number, number> = {};
    employees.forEach(e => {
      const year = parseYear(e.tmt);
      if (year) {
        counts[year] = (counts[year] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [employees]);

  // 2. Perbandingan KGB antar Unit Kerja (Bar Chart)
  const unitData = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      const unit = e.unitKerja || 'Lainnya';
      counts[unit] = (counts[unit] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 units
  }, [employees]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Line Chart: Tren Tahunan */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-white/60">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-slate-800">Tren KGB Tahunan</h3>
            <p className="text-xs text-slate-400 font-medium font-bold uppercase tracking-wide">Volume Kenaikan Gaji per Tahun</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                fontSize={12} 
                tick={{fill: '#94a3b8', fontWeight: 600}} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                fontSize={12} 
                tick={{fill: '#94a3b8'}} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '16px' }}
                formatter={(value: number) => [<span className="font-bold text-indigo-600">{value}</span>, 'Pegawai']}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#6366f1" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Perbandingan Unit Kerja */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-white/60">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-slate-800">KGB per Unit Kerja</h3>
            <p className="text-xs text-slate-400 font-medium font-bold uppercase tracking-wide">Perbandingan Jumlah KGB antar Unit</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={unitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                fontSize={10} 
                tick={{fill: '#94a3b8', fontWeight: 600}} 
                dy={10}
                formatter={(value: string) => value.length > 10 ? value.substring(0, 10) + '...' : value}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                fontSize={12} 
                tick={{fill: '#94a3b8'}} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '16px' }}
                cursor={{ fill: '#f8fafc', radius: 8 }}
                formatter={(value: number) => [<span className="font-bold text-emerald-600">{value}</span>, 'Pegawai']}
              />
              <Bar 
                dataKey="count" 
                radius={[8, 8, 0, 0]} 
                barSize={32}
              >
                {unitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TrendCharts;
