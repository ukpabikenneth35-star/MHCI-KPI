const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./database.cjs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_not_for_production';

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const stmt = db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)');
    stmt.run(id, username, hashedPassword);

    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id, username, role: 'Admin' } });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Member Routes
app.get('/api/members', authenticateToken, (req, res) => {
  const members = db.prepare('SELECT name FROM members').all();
  res.json(members.map(m => m.name));
});

app.post('/api/members', authenticateToken, (req, res) => {
  const { name } = req.body;
  try {
    const id = uuidv4();
    db.prepare('INSERT INTO members (id, name) VALUES (?, ?)').run(id, name);
    res.status(201).json({ name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/members/:name', authenticateToken, (req, res) => {
  const { name } = req.params;
  db.prepare('DELETE FROM members WHERE name = ?').run(name);
  res.sendStatus(204);
});

// Task Routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE userId = ?').all(req.user.id);
  res.json(tasks.map(t => ({ ...t, completed: !!t.completed })));
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const task = req.body;
  const id = task.id || uuidv4();
  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, project, deadline, priority, duration, completed, owner, createdAt, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    task.title,
    task.description || '',
    task.project || '',
    task.deadline || '',
    task.priority || 'Operational',
    task.duration || '',
    task.completed ? 1 : 0,
    task.owner,
    task.createdAt || new Date().toISOString(),
    req.user.id
  );
  res.status(201).json({ ...task, id, userId: req.user.id });
});

app.patch('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const currentTask = db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?').get(id, req.user.id);
  if (!currentTask) return res.sendStatus(404);

  const fields = Object.keys(updates).filter(f => ['title', 'description', 'project', 'deadline', 'priority', 'duration', 'completed', 'owner'].includes(f));
  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => f === 'completed' ? (updates[f] ? 1 : 0) : updates[f]);
  values.push(id, req.user.id);

  db.prepare(`UPDATE tasks SET ${setClause} WHERE id = ? AND userId = ?`).run(...values);
  res.json({ ...currentTask, ...updates });
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?').run(id, req.user.id);
  res.sendStatus(204);
});

// Dashboard Route
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE userId = ?').all(req.user.id);
  const members = db.prepare('SELECT name FROM members').all().map(m => m.name);

  const tasksDone = tasks.filter(t => t.completed).length;
  const tasksActive = tasks.filter(t => !t.completed).length;

  const kpis = [];
  members.forEach(member => {
    const memberTasks = tasks.filter(t => t.owner === member);
    const completed = memberTasks.filter(t => t.completed).length;
    const active = memberTasks.filter(t => !t.completed).length;

    kpis.push({
      id: `${member}-workload`,
      name: 'Active Tasks',
      value: active,
      previousValue: active,
      unit: '',
      trend: 'neutral',
      change: 0,
      category: 'Workload',
      owner: member,
      type: 'workload'
    });

    kpis.push({
      id: `${member}-performance`,
      name: 'Completed Tasks',
      value: completed,
      previousValue: completed,
      unit: '',
      trend: 'neutral',
      change: 0,
      category: 'Performance',
      owner: member,
      type: 'performance'
    });
  });

  const trends = Array.from({ length: 30 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    value: 10 + Math.random() * 90,
    target: 75
  }));

  res.json({
    lastUpdated: new Date().toISOString(),
    kpis,
    trends
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
