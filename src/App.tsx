/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Settings, Users, BarChart3, Bell, Search, Calendar, Filter, UserPlus, Trash2, X, Plus } from 'lucide-react';
import { getDashboardData } from './data';
import { KPICard } from './components/KPICard';
import { TrendsChart } from './components/TrendsChart';
import { AIInsights } from './components/AIInsights';
import { TaskPanel } from './components/TaskPanel';
import { UserTaskMixChart } from './components/UserTaskMixChart';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskDetail } from './components/TaskDetail';
import { SettingsModal } from './components/SettingsModal';
import { format } from 'date-fns';
import { TimeRange, Task } from './types';

const INITIAL_TASKS: Task[] = [
  { 
    id: '1', 
    title: 'Complete performance audit', 
    description: 'Quarterly audit of team performance metrics and operational efficiency across all nodes.',
    project: 'Internal Strategy',
    deadline: '2026-06-01',
    priority: 'Critical',
    completed: false, 
    owner: 'Uwana', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: '2', 
    title: 'Update infrastructure nodes', 
    description: 'Patching and updating all AWS infrastructure nodes to the latest security baseline.',
    project: 'Operations Scalability',
    deadline: '2026-05-20',
    priority: 'Operational',
    completed: true, 
    owner: 'Uwana', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: '3', 
    title: 'Operational review Q3', 
    description: 'Review of Q3 operational goals and alignment with executive strategy.',
    project: 'Strategic Planning',
    deadline: '2026-08-15',
    priority: 'Logistical',
    completed: false, 
    owner: 'Adaeze', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: '4', 
    title: 'Security patch rollout', 
    description: 'Deployment of the critical security patch for the core API services.',
    project: 'Security Baseline',
    deadline: '2026-05-15',
    priority: 'Critical',
    completed: true, 
    owner: 'Bright', 
    createdAt: new Date().toISOString() 
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('Month');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeOwnerTasks, setActiveOwnerTasks] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quarterlyGoal, setQuarterlyGoal] = useState(50);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [teamMembers, setTeamMembers] = useState(['Uwana', 'Adaeze', 'Ikanke', 'Bright']);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const rawDashboardData = getDashboardData(timeRange);
  
  // Filter search results
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tasksDone = tasks.filter(t => t.completed).length;
  const tasksActive = tasks.filter(t => !t.completed).length;
  const successRate = tasks.length > 0 ? (tasksDone / tasks.length) * 100 : 0;
  const avgTasksDone = tasks.length > 0 ? (tasksDone / teamMembers.length).toFixed(1) : '0';

  const statusColor = tasksDone >= tasksActive ? 'text-emerald-400' : 'text-rose-400';
  const statusBg = tasksDone >= tasksActive ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  const statusBorder = tasksDone >= tasksActive ? 'border-emerald-500/20' : 'border-rose-500/20';

  // Dynamically update KPIs based on current task state
  const dashboardData = {
    ...rawDashboardData,
    kpis: rawDashboardData.kpis.map(kpi => {
      const ownerTasks = tasks.filter(t => t.owner === kpi.owner);
      if (kpi.type === 'performance') {
        const completedCount = ownerTasks.filter(t => t.completed).length;
        return { ...kpi, value: completedCount + (kpi.previousValue || 0) };
      }
      if (kpi.type === 'workload') {
        const activeCount = ownerTasks.filter(t => !t.completed).length;
        return { ...kpi, value: activeCount };
      }
      return kpi;
    }).filter(kpi => 
      kpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kpi.owner?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  const [selectedKpiId, setSelectedKpiId] = useState(dashboardData.kpis[0].id);

  const selectedKpi = dashboardData.kpis.find(k => k.id === selectedKpiId) || dashboardData.kpis[0];
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleAddTask = (owner: string, details: Partial<Task>) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: details.title || 'Untitled Objective',
      description: details.description || 'New operational objective initiated.',
      project: details.project || 'Ad-hoc Task',
      deadline: details.deadline || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      duration: details.duration || '',
      completed: false,
      owner,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim() && !teamMembers.includes(newMemberName.trim())) {
      setTeamMembers(prev => [...prev, newMemberName.trim()]);
      setNewMemberName('');
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = (name: string) => {
    setTeamMembers(prev => prev.filter(m => m !== name));
  };

  return (
    <div className={`min-h-screen ${theme} bg-[var(--bg-main)] flex text-[var(--text-primary)] font-sans selection:bg-indigo-500/30 transition-colors duration-300`}>
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            theme={theme}
            onThemeChange={setTheme}
          />
        )}
        {activeOwnerTasks && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveOwnerTasks(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <TaskPanel 
              owner={activeOwnerTasks}
              tasks={filteredTasks.filter(t => t.owner === activeOwnerTasks)}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onSelectTask={setSelectedTaskId}
              onClose={() => setActiveOwnerTasks(null)}
            />
          </>
        )}
        {selectedTask && (
          <TaskDetail 
            task={selectedTask}
            onClose={() => setSelectedTaskId(null)}
            onToggle={() => handleToggleTask(selectedTask.id)}
            onUpdate={handleUpdateTask}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-20 lg:w-64 bg-[var(--bg-main)] border-r border-[var(--border-color)] flex-col p-6 shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <BarChart3 size={24} />
          </div>
          <div className="hidden lg:block">
            <p className="font-bold text-lg leading-tight tracking-tighter text-[var(--text-primary)]">MHCI</p>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">KPI Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Performance' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'customers', icon: Users, label: 'Operations' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                ${activeTab === item.id 
                  ? 'bg-[var(--bg-card)] border border-[var(--border-color)] text-indigo-400 shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'}
              `}
            >
              <item.icon size={18} />
              <span className="hidden lg:block text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-[var(--border-color)] mt-auto space-y-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50 rounded-xl transition-all"
          >
            <Settings size={18} />
            <span className="hidden lg:block text-sm font-semibold">Settings</span>
          </button>
          
          <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
             <div className="hidden lg:block overflow-hidden">
                <p className="text-xs font-bold truncate text-[var(--text-primary)]">M. Chen</p>
                <p className="text-[10px] text-[var(--text-secondary)] uppercase">Admin</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[var(--bg-main)] pb-24 md:pb-0">
        {/* Header */}
        <header className="bg-[var(--bg-header)] backdrop-blur-xl sticky top-0 z-30 border-b border-[var(--border-color)] px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3 bg-[var(--bg-card)]/50 border border-[var(--border-color)] px-3 md:px-4 py-2 rounded-xl text-[var(--text-secondary)] focus-within:border-indigo-500/50 transition-all max-w-[180px] sm:max-w-xs md:max-w-md">
            <Search size={16} className="shrink-0" />
            <input 
              type="text" 
              placeholder="Matrix..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] md:text-xs w-full text-[var(--text-primary)] placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <div className="hidden sm:flex bg-[var(--bg-card)]/50 rounded-lg p-1 border border-[var(--border-color)]">
               {[
                 { label: 'D', value: 'Day' as TimeRange },
                 { label: 'W', value: 'Week' as TimeRange },
                 { label: 'M', value: 'Month' as TimeRange },
                 { label: 'Q', value: 'Quarter' as TimeRange }
               ].map((range) => (
                 <button 
                   key={range.value}
                   onClick={() => setTimeRange(range.value)}
                   className={`
                     px-2 md:px-3 py-1 text-[10px] font-bold transition-all
                     ${timeRange === range.value 
                       ? 'bg-indigo-600 text-white rounded shadow-lg' 
                       : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                   `}
                 >
                   {range.label}
                 </button>
               ))}
            </div>
            
            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-[#020617]" />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8">
          {activeTab === 'overview' && (
            <>
              {/* System Status Banner */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6 border rounded-3xl backdrop-blur-sm transition-colors duration-500 ${statusBg} ${statusBorder}`}
              >
                {[
                  { label: 'Average Task Done', value: avgTasksDone, trend: 'PER_NODE' },
                  { label: 'Tasks Done', value: tasksDone, trend: tasksDone >= tasksActive ? 'SURPLUS' : 'DEFICIT', highlight: true },
                  { label: 'Success Rate', value: `${successRate.toFixed(1)}%`, trend: 'TOTAL_PCT' },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-xl md:text-2xl font-mono font-bold tracking-tighter ${stat.highlight ? statusColor : 'text-white'}`}>{stat.value}</p>
                      <span className={`text-[9px] font-bold ${stat.highlight ? statusColor : 'text-indigo-400'}`}>{stat.trend}</span>
                    </div>
                  </div>
                ))}
                
                {/* Editable Goal */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quarterly Goal</p>
                  <div className="flex items-center gap-2">
                    {isEditingGoal ? (
                      <input 
                        type="number"
                        autoFocus
                        value={quarterlyGoal}
                        onChange={(e) => setQuarterlyGoal(parseInt(e.target.value) || 0)}
                        onBlur={() => setIsEditingGoal(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingGoal(false)}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <button 
                        onClick={() => setIsEditingGoal(true)}
                        className="text-xl md:text-2xl font-mono font-bold text-white tracking-tighter hover:text-indigo-400 transition-colors"
                      >
                        {quarterlyGoal}
                      </button>
                    )}
                    <span className="text-[9px] font-bold text-indigo-400">TARGET</span>
                  </div>
                </div>
              </motion.div>
              {/* Dashboard Intro */}
              <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Team Task Matrix</h1>
                  <p className="text-slate-400 text-xs md:text-sm font-medium">Operational throughput and milestone tracking</p>
                </div>
                
                <div className="flex items-center gap-2 md:gap-3">
                  <AnimatePresence>
                    {isAddingMember && (
                      <motion.form 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        onSubmit={handleAddMember}
                        className="flex items-center gap-2 overflow-hidden bg-slate-900 border border-slate-800 rounded-lg px-2 py-1"
                      >
                        <input 
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="Node name..."
                          className="bg-transparent border-none outline-none text-xs text-white w-24 md:w-32 placeholder:text-slate-600"
                          autoFocus
                          onBlur={() => {
                            if (!newMemberName) setIsAddingMember(false);
                          }}
                        />
                        <button type="submit" className="text-indigo-400 hover:text-indigo-300">
                          <Plus size={14} />
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={() => setIsAddingMember(!isAddingMember)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] md:text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    <UserPlus size={12} />
                    {isAddingMember ? 'CANCEL' : 'ADD NODE'}
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] md:text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all">
                    <Filter size={12} />
                    SEGMENT
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 bg-indigo-600 text-white rounded-lg text-[10px] md:text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all">
                    EXPORT
                  </button>
                </div>
              </section>

              {/* Team Member Sections */}
              <section className="space-y-12">
                {teamMembers.map((owner) => {
                  const ownerKpis = dashboardData.kpis.filter(k => k.owner === owner);
                  const hasTasks = filteredTasks.some(t => t.owner === owner);
                  
                  if (ownerKpis.length === 0 && !hasTasks && !owner.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return (
                      <div key={owner} className="space-y-4">
                        <div className="flex items-center gap-4 group">
                          <div className="h-[1px] flex-1 bg-slate-800/50" />
                          <div className="flex items-center gap-3">
                            <h2 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] px-2 md:px-4 shrink-0 transition-colors group-hover:text-slate-400">{owner}'s PERFORMANCE (INACTIVE)</h2>
                            <button 
                              onClick={() => handleRemoveMember(owner)}
                              className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Decommission Node"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className="h-[1px] flex-1 bg-slate-800/50" />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={owner} className="space-y-4 group">
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-slate-800/50" />
                        <div className="flex items-center gap-3">
                          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] px-2 md:px-4 shrink-0">{owner}'s PERFORMANCE</h2>
                          <button 
                            onClick={() => handleRemoveMember(owner)}
                            className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Decommission Node"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="h-[1px] flex-1 bg-slate-800/50" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {ownerKpis.map((kpi) => (
                          <KPICard 
                            key={kpi.id} 
                            kpi={kpi} 
                            isSelected={selectedKpiId === kpi.id}
                            onClick={() => {
                              setSelectedKpiId(kpi.id);
                              if (kpi.name === 'Active Tasks' || kpi.name === 'Completed Tasks') {
                                setActiveOwnerTasks(owner);
                              }
                            }}
                          />
                        ))}
                        <UserTaskMixChart 
                          owner={owner}
                          activeCount={tasks.filter(t => t.owner === owner && !t.completed).length + (dashboardData.kpis.find(k => k.owner === owner && k.type === 'workload')?.value || 0)}
                          completedCount={tasks.filter(t => t.owner === owner && t.completed).length + (dashboardData.kpis.find(k => k.owner === owner && k.type === 'performance')?.previousValue || 0)}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Detailed Analysis Section */}
              <div className="pt-8 border-t border-slate-800">
                <h2 className="text-lg md:text-xl font-bold text-white mb-6 tracking-tight">Focus Analysis: <span className="text-indigo-400">{selectedKpi.name}</span></h2>
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="md:col-span-1 lg:col-span-2">
                    <TrendsChart data={dashboardData.trends} title={`${selectedKpi.name.toUpperCase()} VARIANCE`} />
                  </div>
                  <div className="md:col-span-1 lg:col-span-1">
                    <AIInsights data={dashboardData} />
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView data={dashboardData} tasks={tasks} />
          )}

          {activeTab === 'customers' && (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center opacity-60">
              <Users size={48} className="text-slate-700 mb-6 md:size-64" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-300">Operations Feed</h2>
              <p className="text-slate-500 max-w-xs md:max-w-sm mt-2 text-xs md:text-sm">Historical operational records and direct client interaction logs will be processed here.</p>
            </div>
          )}

          {/* Footer Info */}
          <footer className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-600 text-[9px] md:text-[10px] font-mono tracking-wider text-center sm:text-left pb-4 md:pb-0">
            <div className="flex items-center gap-4">
              <span>SYNC_LATENCY: 42ms</span>
              <span className="text-slate-700 hidden sm:block">|</span>
              <span>NODE: AWS-USE-1</span>
            </div>
            <span className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              SYSTEMS_NOMINAL
            </span>
          </footer>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#09090b]/80 backdrop-blur-2xl border-t border-slate-800 flex items-center justify-around px-6 z-40">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'MATRIX' },
          { id: 'analytics', icon: BarChart3, label: 'INTEL' },
          { id: 'customers', icon: Users, label: 'OPS' },
          { id: 'settings', icon: Settings, label: 'CONFIG' },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              if (item.id === 'settings') {
                setIsSettingsOpen(true);
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`
              flex flex-col items-center gap-1 transition-all duration-300
              ${(activeTab === item.id && item.id !== 'settings') ? 'text-indigo-400' : 'text-slate-600'}
            `}
          >
            <item.icon size={20} />
            <span className="text-[9px] font-bold tracking-[0.1em] uppercase">{item.label}</span>
            {activeTab === item.id && item.id !== 'settings' && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="w-1 h-1 bg-indigo-500 rounded-full mt-1 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
