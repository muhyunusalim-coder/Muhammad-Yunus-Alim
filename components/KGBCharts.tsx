
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
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
     return months.map(m => ({ name: m, Pegawai: counts[m] || 0 }));
  }, [employees, filterYear]);

  const statusData = useMemo(() => {
    let pns = 0;
    let pppk = 0;
    employees.forEach(e => {
        if (e.statusKepegawaian === 'PNS') pns++;
        else if (e.statusKepegawaian === 'PPPK') pppk++;
    });
    return [
        { name: 'PNS', value: pns, color: '#4f46e5' },
        { name: 'PPPK', value: pppk, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [employees]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BarChart3 size={20} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">Jadwal Bulanan</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Tahun {filterYear}</p>
                </div>
            </div>
            
            <select 
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-600 outline-none"
            >
                {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar 
                dataKey="Pegawai" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
                onClick={(data) => onMonthClick && onMonthClick(data.name, filterYear)}
                style={{ cursor: 'pointer' }}
              >
                {monthlyData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === selectedMonth ? '#312e81' : '#6366f1'} 
                    />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <PieChartIcon size={20} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">Komposisi ASN</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">PNS vs PPPK</p>
                </div>
            </div>
            
            <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800">{employees.length}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px' }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={30} 
                            iconType="circle"
                            formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
      </div>
    </div>
  );
};

export default KGBCharts;
