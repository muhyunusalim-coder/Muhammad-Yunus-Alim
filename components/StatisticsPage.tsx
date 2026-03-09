
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { 
  Users, Building2, TrendingUp, Wallet, PieChart as PieChartIcon, 
  BarChart3, Award 
} from 'lucide-react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const StatisticsPage: React.FC<Props> = ({ employees }) => {
  
  // 1. Statistik Ringkasan
  const summaryStats = useMemo(() => {
    const totalEmployees = employees.length;
    const totalSalary = employees.reduce((acc, curr) => acc + (curr.gajiBaru || 0), 0);
    const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;
    
    // Cari Unit Terbanyak
    const unitCounts: Record<string, number> = {};
    employees.forEach(e => { unitCounts[e.unitKerja] = (unitCounts[e.unitKerja] || 0) + 1; });
    const topUnit = Object.entries(unitCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalEmployees,
      totalSalary,
      avgSalary,
      topUnit: topUnit ? { name: topUnit[0], count: topUnit[1] } : { name: '-', count: 0 }
    };
  }, [employees]);

  // 2. Distribusi Unit Kerja (Top 10)
  const unitData = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
       // Bersihkan nama unit agar tidak terlalu panjang di chart
       let unitName = e.unitKerja.replace('Dinas ', '').replace('Badan ', '').replace('Kecamatan ', 'Kec. ');
       if(unitName.length > 15) unitName = unitName.substring(0, 15) + '...';
       counts[unitName] = (counts[unitName] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Ambil top 10
  }, [employees]);

  // 3. Distribusi Pangkat/Golongan
  const rankData = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
        // Ambil Golongan saja (misal III/a) dari string pangkat
        const match = e.pangkat.match(/\((.*?)\)/);
        const gol = match ? match[1] : e.pangkat.split(' ')[0]; // Fallback
        counts[gol] = (counts[gol] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
         // Custom sort logic for Roman Numerals could be added here, basic sort for now
         return a.name.localeCompare(b.name);
      });
  }, [employees]);

  // 4. Status Kepegawaian
  const statusData = useMemo(() => {
    const counts = { PNS: 0, PPPK: 0 };
    employees.forEach(e => {
        if (e.statusKepegawaian === 'PNS') counts.PNS++;
        else if (e.statusKepegawaian === 'PPPK') counts.PPPK++;
    });
    return [
        { name: 'PNS', value: counts.PNS },
        { name: 'PPPK', value: counts.PPPK }
    ].filter(i => i.value > 0);
  }, [employees]);

  // 5. Range Gaji
  const salaryRangeData = useMemo(() => {
      const ranges = {
          '< 3 Juta': 0,
          '3 - 4 Juta': 0,
          '4 - 5 Juta': 0,
          '> 5 Juta': 0
      };

      employees.forEach(e => {
          const gaji = e.gajiBaru;
          if (gaji < 3000000) ranges['< 3 Juta']++;
          else if (gaji < 4000000) ranges['3 - 4 Juta']++;
          else if (gaji < 5000000) ranges['4 - 5 Juta']++;
          else ranges['> 5 Juta']++;
      });

      return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  }, [employees]);


  const formatShortRupiah = (num: number) => {
     if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' M';
     if (num >= 1000000) return (num / 1000000).toFixed(1) + ' Jt';
     return num.toString();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <BarChart3 size={16} />
                Analisis Data
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Statistik Pegawai & Gaji</h1>
            <p className="text-slate-300">
                Gambaran menyeluruh mengenai distribusi ASN, komposisi pangkat, dan alokasi anggaran gaji berkala.
            </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="relative z-10">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                      <Users size={20} />
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Pegawai</p>
                  <h3 className="text-2xl font-display font-bold text-slate-800 mt-1">{summaryStats.totalEmployees}</h3>
                  <p className="text-xs text-slate-400 mt-1">Data Aktif</p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="relative z-10">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                      <Wallet size={20} />
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rata-rata Gaji</p>
                  <h3 className="text-2xl font-display font-bold text-slate-800 mt-1">{formatShortRupiah(summaryStats.avgSalary)}</h3>
                  <p className="text-xs text-slate-400 mt-1">Per Bulan</p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="relative z-10">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                      <TrendingUp size={20} />
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Est. Anggaran</p>
                  <h3 className="text-2xl font-display font-bold text-slate-800 mt-1">{formatShortRupiah(summaryStats.totalSalary)}</h3>
                  <p className="text-xs text-slate-400 mt-1">Total Gaji Pokok/Bulan</p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="relative z-10">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                      <Building2 size={20} />
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Unit Terbesar</p>
                  <h3 className="text-xl font-display font-bold text-slate-800 mt-1 truncate" title={summaryStats.topUnit.name}>
                      {summaryStats.topUnit.name.length > 12 ? summaryStats.topUnit.name.substring(0,12) + '..' : summaryStats.topUnit.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{summaryStats.topUnit.count} Pegawai</p>
              </div>
          </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart: Distribusi Unit Kerja */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Building2 size={18} />
                      </div>
                      <h3 className="font-bold text-slate-800">Distribusi Pegawai per Unit (Top 10)</h3>
                  </div>
              </div>
              <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={unitData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
                          <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                            formatter={(value: number) => [value, 'Pegawai']}
                          />
                          <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                            {unitData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Chart: Distribusi Pangkat */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Award size={18} />
                      </div>
                      <h3 className="font-bold text-slate-800">Sebaran Golongan Ruang</h3>
                  </div>
              </div>
              <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rankData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
                          <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value: number) => [value, 'Pegawai']}
                          />
                          <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Chart: Range Gaji */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <Wallet size={18} />
                      </div>
                      <h3 className="font-bold text-slate-800">Distribusi Range Gaji</h3>
                  </div>
              </div>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salaryRangeData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} />
                          <YAxis hide />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value: number) => [value, 'Pegawai']}
                          />
                          <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 8, 8]} barSize={50}>
                             {salaryRangeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 1 || index === 2 ? '#fbbf24' : '#f59e0b'} />
                            ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Chart: Status Kepegawaian */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                          <PieChartIcon size={18} />
                      </div>
                      <h3 className="font-bold text-slate-800">Proporsi Status ASN</h3>
                  </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                  <div className="w-full h-64">
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
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'PNS' ? '#6366f1' : '#f43f5e'} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                                formatter={(value: number) => [value, 'Pegawai']}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default StatisticsPage;
