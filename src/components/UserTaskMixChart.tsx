import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../lib/utils';

interface UserTaskMixChartProps {
  activeCount: number;
  completedCount: number;
  owner: string;
}

export const UserTaskMixChart: React.FC<UserTaskMixChartProps> = ({ activeCount, completedCount, owner }) => {
  const data = [
    { name: 'Active', value: activeCount, color: '#6366f1' },
    { name: 'Done', value: completedCount, color: '#10b981' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f172a] p-5 md:p-6 rounded-2xl border border-slate-800 backdrop-blur-sm h-full"
    >
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Composition</span>
        <span className="text-[10px] font-mono text-slate-500">TOTAL: {activeCount + completedCount}</span>
      </div>

      <div className="h-[120px] md:h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: -20, right: 10, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              width={50}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg shadow-xl">
                      <p className="text-[10px] font-bold text-slate-300 uppercase">{payload[0].payload.name}</p>
                      <p className="text-sm font-bold text-white">{payload[0].value} Tasks</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-4 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-indigo-500/80" />
          <span className="text-slate-400">ACTIVE: {activeCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-emerald-500/80" />
          <span className="text-slate-400">COMPLETED: {completedCount}</span>
        </div>
      </div>
    </motion.div>
  );
};
