import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface YearlySalaryTrendChartProps {
  data: any[];
}

const YearlySalaryTrendChart: React.FC<YearlySalaryTrendChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="year" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8', fontWeight: 600}} dy={10} />
        <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} />
        <Tooltip 
          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '16px', fontFamily: 'Inter' }}
          formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Rata-rata Gaji']}
          labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}
        />
        <Line 
          type="monotone" 
          dataKey="salary" 
          stroke="#10b981" 
          strokeWidth={3} 
          dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default YearlySalaryTrendChart;
