import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { DashboardData, Task } from '../types';

interface AnalyticsViewProps {
  data: DashboardData;
  tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data, tasks }) => {
  // 1. Prepare Team Throughput Data
  const teamData = ['Uwana', 'Adaeze', 'Ikanke', 'Bright'].map(owner => {
    const ownerKpis = data.kpis.filter(k => k.owner === owner);
    const completed = ownerKpis.find(k => k.type === 'performance')?.value || 0;
    const active = ownerKpis.find(k => k.type === 'workload')?.value || 0;
    return { name: owner, completed, active, total: completed + active };
  });

  // 2. Prepare Category Distribution
  const categories = Array.from(new Set(data.kpis.map(k => k.category)));
  const categoryData = categories.map(cat => ({
    name: cat,
    value: data.kpis.filter(k => k.category === cat).reduce((acc, curr) => acc + curr.value, 0)
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Cross-Team Intelligence</h2>
        <p className="text-[var(--text-secondary)] text-sm">Deep analysis of operational velocity and task distribution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Team Productivity Comparison */}
        <div className="bg-[var(--bg-card)] p-5 md:p-8 rounded-3xl border border-[var(--border-color)] backdrop-blur-sm">
          <h3 className="text-xs md:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6 md:mb-8">Productivity Benchmark</h3>
          <div className="h-[250px] md:h-[300px] w-full text-[var(--text-secondary)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 9, fontWeight: 600 }} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: '15px' }} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="active" name="Active" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Task Diversity */}
        <div className="bg-[var(--bg-card)] p-5 md:p-8 rounded-3xl border border-[var(--border-color)] backdrop-blur-sm">
          <h3 className="text-xs md:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6 md:mb-8">Category Saturation</h3>
          <div className="h-auto md:h-[300px] w-full flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:flex-1 h-[200px] md:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] md:text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-tighter">{item.name}</span>
                  </div>
                  <span className="text-[10px] md:text-xs font-mono text-[var(--text-primary)] font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Velocity Trend */}
      <div className="bg-[var(--bg-card)] p-5 md:p-8 rounded-3xl border border-[var(--border-color)] backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h3 className="text-xs md:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Aggregate Velocity</h3>
            <p className="text-[9px] md:text-[10px] text-[var(--text-muted)] font-mono mt-1">TOTAL_SYSTEM_THROUGHPUT_MATRIX</p>
          </div>
        </div>
        <div className="h-[250px] md:h-[350px] w-full text-[var(--text-secondary)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trends}>
              <defs>
                <linearGradient id="velocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 9, fontWeight: 600 }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                itemStyle={{ color: '#6366f1', fontSize: '11px' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#velocity)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
