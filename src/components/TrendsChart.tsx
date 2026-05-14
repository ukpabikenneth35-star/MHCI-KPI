import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartData } from '../types';

interface TrendsChartProps {
  data: ChartData[];
  title: string;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ data, title }) => {
  return (
    <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm w-full h-[450px] backdrop-blur-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-widest font-medium">Last 30 days operational variance</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-slate-600 bg-transparent border-dashed" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Target</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-slate-200/10 dark:text-slate-800" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
            className="text-slate-500"
            dy={10}
          />
          <YAxis 
            hide 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px', 
              border: '1px solid var(--border-color)', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '12px',
              color: 'var(--text-primary)'
            }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={1500}
          />
          <Area 
            type="monotone" 
            dataKey="target" 
            stroke="#334155" 
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="transparent"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
