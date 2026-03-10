
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatusPieChartProps {
  data: any[];
  totalASN: number;
}

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data, totalASN }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
                data={data}
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
                {data.map((entry, index) => (
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
  );
};

export default StatusPieChart;
