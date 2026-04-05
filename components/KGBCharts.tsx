
import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Filter, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Employee } from '../types';

// Lazy load chart components
const MonthlyBarChart = lazy(() => import('./charts/MonthlyBarChart'));
const StaticStatusPieChart = lazy(() => import('./charts/StaticStatusPieChart'));
const YearlySalaryTrendChart = lazy(() => import('./charts/YearlySalaryTrendChart'));

interface Props {
  employees: Employee[];
  onMonthClick?: (month: string, year: number) => void;
  selectedMonth?: string | null;
}

// Skeleton loader for charts
const ChartSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-3xl animate-pulse border border-slate-100/50">
    <div className="relative flex items-center justify-center">
        <div className="w-32 h-32 border-4 border-slate-100 border-t-indigo-200 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full"></div>
        </div>
    </div>
  </div>
);

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

  const salaryTrendData = useMemo(() => {
      const yearlySalaries: Record<number, { total: number, count: number }> = {};
      employees.forEach(e => {
          const { year } = parseDate(e.tmt);
          if (year && e.gaji) {
              if (!yearlySalaries[year]) yearlySalaries[year] = { total: 0, count: 0 };
              yearlySalaries[year].total += e.gaji;
              yearlySalaries[year].count += 1;
          }
      });
      return Object.keys(yearlySalaries)
          .map(year => ({
              year: parseInt(year),
              salary: Math.round(yearlySalaries[parseInt(year)].total / yearlySalaries[parseInt(year)].count)
          }))
          .sort((a, b) => a.year - b.year);
  }, [employees]);

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
          <Suspense fallback={<ChartSkeleton />}>
            <MonthlyBarChart 
              data={monthlyData} 
              onMonthClick={onMonthClick} 
              selectedMonth={selectedMonth} 
              filterYear={filterYear} 
            />
          </Suspense>
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

                <Suspense fallback={<ChartSkeleton />}>
                    <StaticStatusPieChart data={statusData} totalASN={totalASN} />
                </Suspense>
            </div>
      </div>

      {/* Chart 3: Line Chart (Salary Trend) */}
      <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-white/60">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                <BarChart3 size={24} />
            </div>
            <div>
                <h3 className="text-lg font-display font-bold text-slate-800">Tren Kenaikan Gaji Rata-rata</h3>
                <p className="text-xs text-slate-400 font-medium font-bold uppercase tracking-wide">Per Tahun</p>
            </div>
        </div>

        <div className="h-80 w-full">
          <Suspense fallback={<ChartSkeleton />}>
            <YearlySalaryTrendChart data={salaryTrendData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default KGBCharts;
