import { Task, DashboardData } from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      return data;
    },
    register: async (username: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      return data;
    },
    logout: () => {
      localStorage.removeItem('token');
    },
  },
  tasks: {
    list: async (): Promise<Task[]> => {
      const res = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    create: async (task: Partial<Task>): Promise<Task> => {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    update: async (id: string, updates: Partial<Task>): Promise<Task> => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    delete: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete task');
    },
  },
  members: {
    list: async (): Promise<string[]> => {
      const res = await fetch(`${API_BASE}/members`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
    add: async (name: string): Promise<{ name: string }> => {
      const res = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to add member');
      return res.json();
    },
    remove: async (name: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/members/${name}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to remove member');
    },
  },
  dashboard: {
    get: async (): Promise<DashboardData> => {
      const res = await fetch(`${API_BASE}/dashboard`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
  },
};
