import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, CheckCircle2, Circle, Trash2, LayoutList } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface TaskPanelProps {
  owner: string;
  tasks: Task[];
  onAddTask: (owner: string, details: Partial<Task>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectTask: (id: string) => void;
  onClose: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ 
  owner, 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask, 
  onSelectTask,
  onClose 
}) => {
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    project: '',
    deadline: '',
    duration: '',
    priority: 'Operational',
  });
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title?.trim()) {
      onAddTask(owner, {
        ...newTask,
        title: newTask.title.trim(),
      });
      setNewTask({
        title: '',
        description: '',
        project: '',
        deadline: '',
        duration: '',
        priority: 'Operational',
      });
      setIsExpanded(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    filterPriority === 'All' || t.priority === filterPriority
  );

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--bg-main)] border-l border-[var(--border-color)] shadow-2xl z-50 flex flex-col"
    >
      <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-header)] backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <LayoutList size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{owner}'s Task Matrix</h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono tracking-widest uppercase">Operational Stream</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Add Task Form */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Initialization</h4>
          <form onSubmit={handleSubmit} className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl overflow-hidden focus-within:border-indigo-500/50 transition-all">
            <div className="relative">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Objective headline..."
                className="w-full bg-transparent px-4 py-4 text-sm text-[var(--text-primary)] placeholder:text-slate-600 focus:outline-none pr-12"
              />
              <button 
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`absolute right-12 top-4 p-1 text-slate-500 hover:text-indigo-400 transition-colors ${isExpanded ? 'text-indigo-400' : ''}`}
                title="Detailed Entry"
              >
                <Plus size={16} className={`transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
              </button>
              <button 
                type="submit"
                disabled={!newTask.title?.trim()}
                className="absolute right-3 top-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:grayscale"
              >
                <Plus size={18} />
              </button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-slate-800/50"
                >
                  <div className="p-4 space-y-4 bg-slate-950/30">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Briefing</label>
                      <textarea 
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Detail the mission goals..."
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:border-indigo-500/50 outline-none resize-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Sector</label>
                        <input 
                          type="text"
                          value={newTask.project}
                          onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                          placeholder="Project name"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Urgency</label>
                        <select 
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500/50 outline-none transition-all appearance-none"
                        >
                          <option value="Critical">Critical</option>
                          <option value="Operational">Operational</option>
                          <option value="Logistical">Logistical</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Deadline</label>
                        <input 
                          type="date"
                          value={newTask.deadline}
                          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Est. Duration</label>
                        <input 
                          type="text"
                          value={newTask.duration}
                          onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                          placeholder="e.g. 4h 20m"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Filters and Search Override */}
        <div className="flex items-center justify-between pb-2">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Active Directives 
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">{activeTasks.length}</span>
          </h4>
          <div className="flex gap-1">
            {['All', 'Critical', 'Operational'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-bold transition-all border",
                  filterPriority === p 
                    ? "bg-indigo-600 border-indigo-500 text-white" 
                    : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                )}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <section className="space-y-4">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {activeTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer"
                  onClick={() => onSelectTask(task.id)}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className="text-slate-600 hover:text-indigo-400 transition-colors shrink-0"
                  >
                    <Circle size={20} />
                  </button>
                  <div className="flex-1 flex flex-col">
                    <span className="text-sm text-slate-300 font-medium leading-none mb-1">{task.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[9px] font-bold px-1 rounded uppercase tracking-tighter",
                        task.priority === 'Critical' ? "bg-rose-500/10 text-rose-500" :
                        task.priority === 'Operational' ? "bg-indigo-500/10 text-indigo-400" :
                        "bg-slate-800 text-slate-500"
                      )}>
                        {task.priority || 'Logistical'}
                      </span>
                      {task.project && <span className="text-[9px] font-mono text-slate-600">{task.project}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {activeTasks.length === 0 && (
              <p className="text-xs text-slate-600 italic py-4 text-center">No active directives found.</p>
            )}
          </div>
        </section>

        {/* Completed Tasks */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Terminated Tasks
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">{completedTasks.length}</span>
          </h4>
          <div className="space-y-2 opacity-60">
            <AnimatePresence mode="popLayout">
              {completedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group flex items-center gap-3 p-3 bg-slate-900/20 border border-slate-800/50 rounded-xl cursor-pointer"
                  onClick={() => onSelectTask(task.id)}
                >
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                  <span className="flex-1 text-sm text-slate-500 line-through">{task.title}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="p-1.5 text-slate-700 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </motion.div>
  );
};
