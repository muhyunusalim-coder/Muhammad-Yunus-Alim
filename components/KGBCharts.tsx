
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Filter, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
  onMonthClick?: (month: string, year: number) => void;
  selectedMonth?: string | null;
}

const KGBCharts: React.FC<Props> = ({ employees, onMonthClick, selectedMonth }) => {
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  const parseDate = (dateStr: string) => {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = dateStr.split('-');
        return { year: parseInt(parts[0]), monthIdx: parseInt(parts[1]) - 1 };
     } 
     else if (dateStr.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) {
        const parts = dateStr.split(/[-/]/);
        return { year: parseInt(parts[2]), monthIdx: parseInt(parts[1]) - 1 };
     }
     return { year: null, monthIdx: null };
  };

  const availableYears = useMemo(() => {
      const years = new Set<number>();
      years.add(new Date().getFullYear());
      employees.forEach(e => {
          const { year } = parseDate(e.tmt);
          if (year) years.add(year);
      });
      return Array.from(years).sort((a, b) => b - a);
  }, [employees]);

  const monthlyData = useMemo(() => {
     const counts: Record<string, number> = {};
     const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
     employees.forEach(e => {
         const { year, monthIdx } = parseDate(e.tmt);
         if (year === filterYear && monthIdx !== null && monthIdx >= 0 && monthIdx < 12) {
             const monthName = months[monthIdx];
             counts[monthName] = (counts[monthName] || 0) + 1;
         }
     });
     // Mengubah 'value' menjadi 'Pegawai'
     return months.map(m => ({ name: m, Pegawai: counts[m] || 0 }));
  }, [employees, filterYear]);

  const statusData = useMemo(() => {
    let pns = 0;
    let pppk = 0;
    
    // Filter hanya untuk ASN (PNS & PPPK)
    employees.forEach(e => {
        if (e.statusKepegawaian === 'PNS') pns++;
        else if (e.statusKepegawaian === 'PPPK') pppk++;
    });

    return [
        { name: 'PNS', value: pns, color: '#6366f1' }, // Indigo 500
        { name: 'PPPK', value: pppk, color: '#f59e0b' }, // Amber 500
    ].filter(item => item.value > 0);
  }, [employees]);

  // Hitung total untuk persentase
  const totalASN = useMemo(() => {
      return statusData.reduce((acc, curr) => acc + curr.value, 0);
  }, [statusData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Bar Chart (Monthly Schedule) */}
      <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-white/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-display font-bold text-slate-800">Distribusi Jadwal Bulanan</h3>
                    <p className="text-xs text-slate-400 font-medium font-bold uppercase tracking-wide">Klik grafik untuk memfilter tabel</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 self-start sm:self-auto hover:border-indigo-200 transition-colors shadow-sm">
                <Filter size={14} className="text-slate-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Tahun:</span>
                <select 
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number(e.target.value))}
                    className="bg-transparent text-sm font-bold text-indigo-600 focus:outline-none cursor-pointer"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#312e81" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#312e81" stopOpacity={0.6}/>
                  </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8', fontWeight: 600}} dy={10} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} allowDecimals={false} tick={{fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '16px', fontFamily: 'Inter' }}
                cursor={{ fill: '#f8fafc', radius: 8 }}
                formatter={(value: number) => [<span className="font-bold text-indigo-600">{value}</span>, 'Pegawai']}
                labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}
              />
              <Bar 
                dataKey="Pegawai" 
                radius={[8, 8, 8, 8]} 
                barSize={40}
                onClick={(data) => onMonthClick && onMonthClick(data.name, filterYear)}
                style={{ cursor: 'pointer' }}
              >
                {monthlyData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === selectedMonth ? 'url(#barGradientActive)' : 'url(#barGradient)'} 
                        className="transition-all duration-300 hover:opacity-80"
                    />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Pie Chart (Status Distribution) */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-white/60 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                    <PieChartIcon size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-display font-bold text-slate-800">Komposisi ASN</h3>
                    <p className="text-xs text-slate-400 font-medium font-bold uppercase tracking-wide">PNS vs PPPK</p>
                </div>
            </div>
            
            <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-4xl font-display font-bold text-slate-800">{employees.length}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="value"
                            labelLine={false}
                            stroke="none"
                            cornerRadius={6}
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-sm" />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '8px 12px', fontFamily: 'Inter', fontSize: '12px' }}
                            itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                            formatter={(value: number, name: string) => {
                                const percent = totalASN > 0 ? ((value / totalASN) * 100).toFixed(1) : 0;
                                return [`${value} Orang (${percent}%)`, name];
                            }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                            formatter={(value, entry: any) => {
                                const count = entry.payload.value;
                                const percent = totalASN > 0 ? ((count / totalASN) * 100).toFixed(1) : 0;
                                return <span className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wide">{value}: {count} ({percent}%)</span>;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
      </div>
    </div>
  );
};

export default KGBCharts;
