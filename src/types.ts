export type TimeRange = 'Day' | 'Week' | 'Month' | 'Quarter';

export interface KPI {
  id: string;
  name: string;
  value: number;
  displayValue?: string;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  change: number;
  category: string;
  owner?: string;
  type?: 'workload' | 'efficiency' | 'performance';
  sparkline?: number[];
}

export interface ChartData {
  date: string;
  value: number;
  target: number;
}

export type TaskPriority = 'Critical' | 'Operational' | 'Logistical';

export interface Task {
  id: string;
  title: string;
  description?: string;
  project?: string;
  deadline?: string;
  priority?: TaskPriority;
  duration?: string;
  completed: boolean;
  owner: string;
  createdAt: string;
}

export interface DashboardData {
  lastUpdated: string;
  kpis: KPI[];
  trends: ChartData[];
}
