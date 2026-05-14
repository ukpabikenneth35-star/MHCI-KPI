import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KPI } from '../types';
import { cn } from '../lib/utils';

interface KPICardProps {
  kpi: KPI;
  isSelected?: boolean;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, isSelected, onClick }) => {
  const isPositive = kpi.change > 0;
  
  // Progress calculation for performance cards (Goal: 50)
  const progressPercent = Math.min((kpi.value / 50) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "bg-[var(--bg-card)] p-5 md:p-6 rounded-2xl border transition-all cursor-pointer shadow-sm backdrop-blur-sm",
        isSelected 
          ? "border-indigo-500 ring-2 ring-indigo-500/10" 
          : "border-[var(--border-color)] hover:border-slate-700"
      )}
    >
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{kpi.name}</span>
        <div className={cn(
          "flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full text-[10px] font-bold border",
          isPositive 
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
        )}>
          {isPositive ? <ArrowUpRight size={10} className="md:size-3" /> : <ArrowDownRight size={10} className="md:size-3" />}
          {Math.abs(kpi.change).toFixed(1)}%
        </div>
      </div>
      
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-mono">
            {kpi.displayValue || kpi.value.toLocaleString()}
            {kpi.unit}
          </span>
        </div>

        {/* Efficiency Sparkline */}
        {kpi.type === 'efficiency' && kpi.sparkline && (
          <div className="h-10 flex items-end gap-1 px-1">
            {kpi.sparkline.map((val, i) => (
              <div 
                key={i} 
                className="flex-1 bg-indigo-500/20 rounded-t-sm" 
                style={{ height: `${(val / Math.max(...kpi.sparkline)) * 100}%` }}
              />
            ))}
          </div>
        )}

        {/* Performance Progress Bar */}
        {kpi.type === 'performance' && (
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-indigo-500" 
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>PROGRESS</span>
              <span>{Math.round(progressPercent)}% OF GOAL</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
        <span>PREV: {kpi.previousValue.toLocaleString()}</span>
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            kpi.trend === 'up' ? "bg-emerald-500" : kpi.trend === 'down' ? "bg-rose-500" : "bg-slate-600"
          )} />
          <span className="uppercase tracking-tighter">{kpi.trend}</span>
        </div>
      </div>
    </motion.div>
  );
};
