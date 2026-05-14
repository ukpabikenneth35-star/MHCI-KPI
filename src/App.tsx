/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Settings, Users, BarChart3, Bell, Search, Calendar, Filter, UserPlus, Trash2, X, Plus, LogOut } from 'lucide-react';
import { getDashboardData } from './data';
import React, { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Settings, Users, BarChart3, Bell, Search, Calendar, Filter, UserPlus, Trash2, X, Plus } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { TrendsChart } from './components/TrendsChart';
import { AIInsights } from './components/AIInsights';
import { TaskPanel } from './components/TaskPanel';
import { UserTaskMixChart } from './components/UserTaskMixChart';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskDetail } from './components/TaskDetail';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { format } from 'date-fns';
import { TimeRange, Task, DashboardData } from './types';
import { api } from './lib/api';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('Month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeOwnerTasks, setActiveOwnerTasks] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quarterlyGoal, setQuarterlyGoal] = useState(50);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ username: 'Operator' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [fetchedTasks, fetchedMembers, fetchedDashboard] = await Promise.all([
        api.tasks.list(),
        api.members.list(),
        api.dashboard.get(),
      ]);
      setTasks(fetchedTasks);
      setTeamMembers(fetchedMembers);
      setDashboardData(fetchedDashboard);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setTasks([]);
    setTeamMembers([]);
    setDashboardData(null);
  };

  const filteredTasks = useMemo(() => tasks.filter(task =>
  
  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to connect to the task server.');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/dashboard?range=${timeRange}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to connect to the analytics server.');
    }
  };

  // Filter search results
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.owner.toLowerCase().includes(searchQuery.toLowerCase())
  ), [tasks, searchQuery]);

  const tasksDone = tasks.filter(t => t.completed).length;
  const tasksActive = tasks.filter(t => !t.completed).length;
  const successRate = tasks.length > 0 ? (tasksDone / tasks.length) * 100 : 0;
  const avgTasksDone = tasks.length > 0 ? (tasksDone / (teamMembers.length || 1)).toFixed(1) : '0';

  const statusColor = tasksDone >= tasksActive ? 'text-emerald-400' : 'text-rose-400';
  const statusBg = tasksDone >= tasksActive ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  const statusBorder = tasksDone >= tasksActive ? 'border-emerald-500/20' : 'border-rose-500/20';

  const finalDashboardData = useMemo(() => {
    const currentDashboardData = dashboardData || getDashboardData(timeRange);
    return {
      ...currentDashboardData,
      kpis: currentDashboardData.kpis.map(kpi => {
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
  }, [dashboardData, tasks, searchQuery, timeRange]);

  useEffect(() => {
    if (finalDashboardData.kpis.length > 0 && !selectedKpiId) {
      setSelectedKpiId(finalDashboardData.kpis[0].id);
    }
  }, [finalDashboardData.kpis, selectedKpiId]);

  const selectedKpi = finalDashboardData.kpis.find(k => k.id === selectedKpiId) || finalDashboardData.kpis[0];
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleAddTask = async (owner: string, details: Partial<Task>) => {
    try {
      const newTaskData = {
        title: details.title || 'Untitled Objective',
        description: details.description || 'New operational objective initiated.',
        project: details.project || 'Ad-hoc Task',
        deadline: details.deadline || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        duration: details.duration || '',
        completed: false,
        owner,
        createdAt: new Date().toISOString(),
      };
      const createdTask = await api.tasks.create(newTaskData);
      setTasks(prev => [createdTask, ...prev]);
    } catch (error) {
      console.error('Failed to add task', error);
  // Dynamically update KPIs based on current task state
  const processedDashboardData = dashboardData ? {
    ...dashboardData,
    kpis: dashboardData.kpis.map((kpi: any) => {
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
    }).filter((kpi: any) =>
      kpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kpi.owner?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  } : null;

  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  const selectedKpi = processedDashboardData?.kpis.find((k: any) => k.id === (selectedKpiId || processedDashboardData.kpis[0].id)) || processedDashboardData?.kpis[0];
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleAddTask = async (owner: string, details: Partial<Task>) => {
    const newTask = {
      title: details.title || 'Untitled Objective',
      description: details.description || 'New operational objective initiated.',
      project: details.project || 'Ad-hoc Task',
      deadline: details.deadline || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      duration: details.duration || '',
      completed: false,
      owner,
    };

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      const data = await res.json();
      setTasks(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const updatedTask = await api.tasks.update(id, { completed: !task.completed });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: updatedTask.completed } : t));
    } catch (error) {
      console.error('Failed to toggle task', error);

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const data = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? data : t));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.tasks.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task', error);
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await api.tasks.update(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedTask } : t));
    } catch (error) {
      console.error('Failed to update task', error);
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? data : t));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim() && !teamMembers.includes(newMemberName.trim())) {
      try {
        await api.members.add(newMemberName.trim());
        setTeamMembers(prev => [...prev, newMemberName.trim()]);
        setNewMemberName('');
        setIsAddingMember(false);
      } catch (error) {
        console.error('Failed to add member', error);
      }
    }
  };

  const handleRemoveMember = async (name: string) => {
    try {
      await api.members.remove(name);
      setTeamMembers(prev => prev.filter(m => m !== name));
    } catch (error) {
      console.error('Failed to remove member', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white font-mono p-4 text-center">
        <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mb-6 border border-rose-500/30">
           <Trash2 size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">SYSTEM_CONNECTION_FAILURE</h2>
        <p className="text-slate-500 text-sm max-w-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all"
        >
          RETRY_CONNECTION
        </button>
      </div>
    );
  }

  if (!processedDashboardData) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white font-mono">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.4s]" />
        </div>
        <div className="text-[10px] tracking-[0.2em] text-indigo-400">INITIALIZING_CORE_RESOURCES</div>
      </div>
    );
  }

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
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="hidden lg:block text-sm font-semibold">Logout</span>
          </button>

          <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-400">
               {user.username[0].toUpperCase()}
             </div>
             <div className="hidden lg:block overflow-hidden">
                <p className="text-xs font-bold truncate text-[var(--text-primary)]">{user.username}</p>
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
                  const ownerKpis = finalDashboardData.kpis.filter(k => k.owner === owner);
                  const ownerKpis = processedDashboardData.kpis.filter((k: any) => k.owner === owner);
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
                        {ownerKpis.map((kpi: any) => (
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
                          activeCount={tasks.filter(t => t.owner === owner && !t.completed).length + (finalDashboardData.kpis.find(k => k.owner === owner && k.type === 'workload')?.value || 0)}
                          completedCount={tasks.filter(t => t.owner === owner && t.completed).length + (finalDashboardData.kpis.find(k => k.owner === owner && k.type === 'performance')?.previousValue || 0)}
                          activeCount={tasks.filter(t => t.owner === owner && !t.completed).length + (processedDashboardData.kpis.find((k: any) => k.owner === owner && k.type === 'workload')?.value || 0)}
                          completedCount={tasks.filter(t => t.owner === owner && t.completed).length + (processedDashboardData.kpis.find((k: any) => k.owner === owner && k.type === 'performance')?.previousValue || 0)}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Detailed Analysis Section */}
              <div className="pt-8 border-t border-slate-800">
                <h2 className="text-lg md:text-xl font-bold text-white mb-6 tracking-tight">Focus Analysis: <span className="text-indigo-400">{selectedKpi?.name}</span></h2>
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="md:col-span-1 lg:col-span-2">
                    <TrendsChart data={finalDashboardData.trends} title={`${selectedKpi?.name.toUpperCase()} VARIANCE`} />
                  </div>
                  <div className="md:col-span-1 lg:col-span-1">
                    <AIInsights data={finalDashboardData} />
                    <TrendsChart data={processedDashboardData.trends} title={`${selectedKpi.name.toUpperCase()} VARIANCE`} />
                  </div>
                  <div className="md:col-span-1 lg:col-span-1">
                    <AIInsights data={processedDashboardData} />
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView data={finalDashboardData} tasks={tasks} />
            <AnalyticsView data={processedDashboardData} tasks={tasks} />
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
