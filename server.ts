import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GoogleGenAI } from "@google/genai";
import { subDays, subHours, format } from 'date-fns';
import fs from 'fs/promises';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const DATA_FILE = join(process.cwd(), 'tasks.json');

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to load tasks from file
async function loadTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Initial tasks if file doesn't exist
    return [
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
  }
}

// Helper to save tasks to file
async function saveTasks(tasks: any[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Dashboard data helper
const getDashboardData = (range: string) => {
  const now = new Date();
  let dataPoints = 30;
  let dateFormat = 'MMM dd';

  switch(range) {
    case 'Day':
      dataPoints = 24;
      dateFormat = 'HH:00';
      break;
    case 'Week':
      dataPoints = 7;
      dateFormat = 'EEE';
      break;
    case 'Month':
      dataPoints = 30;
      dateFormat = 'MMM dd';
      break;
    case 'Quarter':
      dataPoints = 90;
      dateFormat = 'MMM dd';
      break;
  }

  const baseKpis = [
      { id: 'uw-01', name: 'Active Tasks', value: 2, previousValue: 3, unit: '', trend: 'down', change: -33.3, category: 'Workload', owner: 'Uwana', type: 'workload' },
      { id: 'uw-03', name: 'Completed Tasks', value: 15, previousValue: 10, unit: '', trend: 'up', change: 50.0, category: 'Performance', owner: 'Uwana', type: 'performance' },
      { id: 'ad-01', name: 'Active Tasks', value: 1, previousValue: 2, unit: '', trend: 'down', change: -50.0, category: 'Workload', owner: 'Adaeze', type: 'workload' },
      { id: 'ad-03', name: 'Completed Tasks', value: 42, previousValue: 40, unit: '', trend: 'up', change: 5.0, category: 'Performance', owner: 'Adaeze', type: 'performance' },
      { id: 'ik-01', name: 'Active Tasks', value: 4, previousValue: 5, unit: '', trend: 'down', change: -20.0, category: 'Workload', owner: 'Ikanke', type: 'workload' },
      { id: 'ik-03', name: 'Completed Tasks', value: 38, previousValue: 35, unit: '', trend: 'up', change: 8.5, category: 'Performance', owner: 'Ikanke', type: 'performance' },
      { id: 'br-01', name: 'Active Tasks', value: 3, previousValue: 2, unit: '', trend: 'up', change: 50.0, category: 'Workload', owner: 'Bright', type: 'workload' },
      { id: 'br-03', name: 'Completed Tasks', value: 48, previousValue: 45, unit: '', trend: 'up', change: 6.6, category: 'Performance', owner: 'Bright', type: 'performance' }
  ];

  return {
    lastUpdated: now.toISOString(),
    kpis: baseKpis,
    trends: Array.from({ length: dataPoints }).map((_, i) => {
      const date = range === 'Day' ? subHours(now, dataPoints - i) : subDays(now, dataPoints - i);
      return {
        date: format(date, dateFormat),
        value: 10 + Math.random() * 90,
        target: 75
      };
    })
  };
};

// Tasks API
app.get('/api/tasks', async (req, res) => {
  const tasks = await loadTasks();
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const tasks = await loadTasks();
  const newTask = {
    ...req.body,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  await saveTasks(tasks);
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { id: _, createdAt: __, ...updates } = req.body;

  let tasks = await loadTasks();
  let updatedTask = null;

  tasks = tasks.map((t: any) => {
    if (t.id === id) {
      updatedTask = { ...t, ...updates };
      return updatedTask;
    }
    return t;
  });

  if (!updatedTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  await saveTasks(tasks);
  res.json(updatedTask);
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  let tasks = await loadTasks();
  tasks = tasks.filter((t: any) => t.id !== id);
  await saveTasks(tasks);
  res.status(204).send();
});

// Dashboard API
app.get('/api/dashboard', (req, res) => {
  const range = (req.query.range as string) || 'Month';
  const data = getDashboardData(range);
  res.json(data);
});

// AI Insights API
app.post('/api/ai/insights', async (req, res) => {
  const { data } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      You are a project management strategist. Analyze the following team task KPI data and provide 3 concise, actionable insights for the team (Uwana, Adaeze, Ikanke, Bright).

      KPI Data:
      ${data.kpis.map((k: any) => `- ${k.owner} (${k.name}): ${k.value}${k.unit} (${k.trend} ${k.change}% trend)`).join('\n')}

      Focus on task completion rates, workload balance, and individual performance trends.
      Format your response as a bulleted list of 3 brief, high-impact tactical points.
    `;

    const result = await (ai as any).models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    res.json({ insight: result.text || "Unable to generate insights at this time." });
  } catch (error) {
    console.error("AI Insight Error:", error);
    res.status(500).json({ error: "Error generating insights" });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
