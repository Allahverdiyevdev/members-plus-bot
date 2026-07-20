const fs = require('fs').promises;
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

// simple promise-based mutex to serialize writes/transactions
let mutex = Promise.resolve();

async function ensureDB() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(DB_PATH);
    } catch (e) {
      const initial = { users: [], transactions: [], giftcodes: [], orders: [] };
      await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    }
  } catch (err) {
    throw err;
  }
}

async function readDB() {
  await ensureDB();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeDB(data) {
  const tmp = DB_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, DB_PATH);
}

// run a function with exclusive access to the DB. The function receives the parsed DB object and may mutate it.
// The mutations will be written back atomically after the function resolves. The return value of fn is returned.
function runExclusive(fn) {
  mutex = mutex.then(async () => {
    const db = await readDB();
    const result = await fn(db);
    await writeDB(db);
    return result;
  });
  return mutex;
}

// helper to get a consistent read-only snapshot without acquiring the exclusive lock
async function getSnapshot() {
  return readDB();
}

module.exports = { ensureDB, readDB, writeDB, runExclusive, getSnapshot };
