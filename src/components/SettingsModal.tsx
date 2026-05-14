import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Monitor, Bell, Globe, Shield, Activity, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  theme, 
  onThemeChange 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-xl h-fit max-h-[90vh] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl shadow-2xl z-[60] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-header)] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">System Configuration</h2>
                  <p className="text-[10px] text-[var(--text-secondary)] font-mono">NODE_PREFERENCES_STATION</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Theme Selection */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-indigo-400" />
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aesthetic Interface</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'dark', label: 'Dark Mode', icon: Moon, description: 'Optimized for low-light matrix operations.' },
                    { id: 'light', label: 'Light Mode', icon: Sun, description: 'High visibility for daylight surveillance.' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => onThemeChange(mode.id as 'dark' | 'light')}
                      className={cn(
                        "flex flex-col items-start p-4 rounded-2xl border transition-all text-left group",
                        theme === mode.id 
                          ? "bg-indigo-500/10 border-indigo-500/50" 
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg mb-4 transition-colors",
                        theme === mode.id ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                      )}>
                        <mode.icon size={18} />
                      </div>
                      <p className="text-xs font-bold mb-1">{mode.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">{mode.description}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Other Settings */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-indigo-400" />
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Notifications</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Critical Alert Sound', description: 'Auditory feedback for high-priority directive changes.', enabled: true },
                    { label: 'Sync Status Notifications', description: 'Visual confirmation of real-time operational synchronization.', enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold">{item.label}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{item.description}</p>
                      </div>
                      <div className={cn(
                        "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                        item.enabled ? "bg-indigo-600" : "bg-slate-800"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          item.enabled ? "right-1" : "left-1"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Regional Settings */}
              <section className="space-y-4 pb-4">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-indigo-400" />
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Regional Directives</h3>
                </div>
                <button className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                      <Globe size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Language Protocol</p>
                      <p className="text-[10px] text-slate-500 font-medium font-mono uppercase">SYSTEM_DEFAULT (EN-US)</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              </section>
            </div>
            
            <div className="p-6 bg-slate-950 border-t border-[var(--border-color)] flex items-center justify-between">
               <p className="text-[10px] font-mono text-slate-600">CLIENT_VERSION: 2.4.12-PROD</p>
               <button 
                 onClick={onClose}
                 className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-all"
               >
                 COMMIT CHANGES
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
