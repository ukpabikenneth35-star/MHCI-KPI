import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Briefcase, Info, CheckCircle2, Circle, Clock, Edit3, Save, RotateCcw } from 'lucide-react';
import { Task } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose, onToggle, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({
    title: task.title,
    description: task.description,
    project: task.project,
    deadline: task.deadline,
    duration: task.duration,
    priority: task.priority || 'Operational',
  });

  const handleSave = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditedTask({
      title: task.title,
      description: task.description,
      project: task.project,
      deadline: task.deadline,
      duration: task.duration,
      priority: task.priority || 'Operational',
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Info size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isEditing ? 'Modify Objective' : 'Objective Analysis'}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                {isEditing ? 'Configuration Mode' : 'Operational Detail'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                title="Edit Objective"
              >
                <Edit3 size={18} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Title & Status */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Headline</label>
                  <input 
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-lg font-bold text-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">{task.title}</h2>
              )}
              
              {!isEditing && (
                <button 
                  onClick={onToggle}
                  className={`
                    p-1.5 rounded-lg transition-all shrink-0
                    ${task.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400 hover:text-indigo-400'}
                  `}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
              )}
            </div>
            
            {!isEditing && (
              <div className="flex flex-wrap gap-3">
                <span className={`
                  px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                  ${task.completed 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}
                `}>
                  {task.completed ? 'Terminated' : 'Operational'}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  task.priority === 'Critical' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  task.priority === 'Operational' ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" :
                  "bg-slate-800 text-slate-500 border-slate-700"
                )}>
                  {task.priority || 'Logistical'}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase tracking-wider">
                  UUID: {task.id.slice(0, 8)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Info size={12} />
              Mission Briefing
            </h4>
            {isEditing ? (
              <textarea 
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Detail the operational goals..."
              />
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                {task.description || 'No detailed mission briefing provided for this objective.'}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={12} />
                Sector / Project
              </h4>
              {isEditing ? (
                <input 
                  type="text"
                  value={editedTask.project}
                  onChange={(e) => setEditedTask({ ...editedTask, project: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    <Briefcase size={16} />
                  </div>
                  <span className="text-sm font-bold text-white">{task.project || 'Unspecified'}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info size={12} />
                Urgency Level
              </h4>
              {isEditing ? (
                <select 
                  value={editedTask.priority}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all appearance-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="Operational">Operational</option>
                  <option value="Logistical">Logistical</option>
                </select>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    task.priority === 'Critical' ? "bg-rose-500/20 text-rose-500" :
                    task.priority === 'Operational' ? "bg-indigo-500/20 text-indigo-400" :
                    "bg-slate-800 text-slate-500"
                  )}>
                    <Info size={16} />
                  </div>
                  <span className="text-sm font-bold text-white">{task.priority || 'Operational'}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} />
                Temporal Deadline
              </h4>
              {isEditing ? (
                <input 
                  type="date"
                  value={editedTask.deadline}
                  onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {task.deadline ? format(new Date(task.deadline), 'MMM dd, yyyy') : 'Indefinite'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} />
                Est. Duration
              </h4>
              {isEditing ? (
                <input 
                  type="text"
                  value={editedTask.duration}
                  onChange={(e) => setEditedTask({ ...editedTask, duration: e.target.value })}
                  placeholder="e.g. 2h 30m"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    <Clock size={16} />
                  </div>
                  <span className="text-sm font-bold text-white">{task.duration || 'Not Estimated'}</span>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-wider">
              <div className="flex items-center gap-2">
                <Clock size={12} />
                <span>STAMP: {format(new Date(task.createdAt), 'HH:mm:ss')}</span>
              </div>
              <span>OWNER: {task.owner.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex gap-3 shrink-0">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
              >
                <Save size={18} />
                SAVE CONFIGURATION
              </button>
              <button 
                onClick={handleReset}
                className="px-6 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-bold text-sm hover:text-white transition-all"
              >
                <RotateCcw size={18} />
                ABORT
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onToggle}
                className={`
                  flex-1 py-3 rounded-xl font-bold text-sm transition-all
                  ${task.completed 
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-0.5'}
                `}
              >
                {task.completed ? 'REOPEN OBJECTIVE' : 'TERMINATE MISSION'}
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-bold text-sm hover:text-white transition-all"
              >
                DISMISS
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
