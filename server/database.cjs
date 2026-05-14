const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = new Database(path.join(__dirname, 'database.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'Admin'
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE
  );

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
  );
`);

// Seed initial members if empty
const membersCount = db.prepare('SELECT count(*) as count FROM members').get().count;
if (membersCount === 0) {
  const insertMember = db.prepare('INSERT INTO members (id, name) VALUES (?, ?)');
  ['Uwana', 'Adaeze', 'Ikanke', 'Bright'].forEach(name => {
    insertMember.run(uuidv4(), name);
  });
}

module.exports = db;
