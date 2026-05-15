const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'Admin'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      project TEXT,
      deadline TEXT,
      priority TEXT,
      duration TEXT,
      completed INTEGER DEFAULT 0,
      owner TEXT,
      createdAt TEXT,
      userId TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Seed initial members if empty
  db.get('SELECT count(*) as count FROM members', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare('INSERT INTO members (id, name) VALUES (?, ?)');
      ['Uwana', 'Adaeze', 'Ikanke', 'Bright'].forEach(name => {
        stmt.run(uuidv4(), name);
      });
      stmt.finalize();
    }
  });
});

// Helper for promises
db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = db;
