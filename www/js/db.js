/**
 * IndexedDB — schemaVersion 5
 */
const DB_NAME = 'hamrah350';
const SCHEMA_VERSION = 5;
let dbInstance = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    const req = indexedDB.open(DB_NAME, SCHEMA_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      const old = e.oldVersion;
      if (old < 1) {
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (old < 2) {
        if (!db.objectStoreNames.contains('schedule')) {
          const s = db.createObjectStore('schedule', { keyPath: 'id' });
          s.createIndex('by_type', 'type', { unique: false });
        }
        if (!db.objectStoreNames.contains('completions')) {
          const s = db.createObjectStore('completions', { keyPath: 'id' });
          s.createIndex('by_date', 'date', { unique: false });
        }
      }
      if (old < 3) {
        if (!db.objectStoreNames.contains('habits')) {
          const s = db.createObjectStore('habits', { keyPath: 'id' });
          s.createIndex('by_domain', 'domain', { unique: false });
        }
        if (!db.objectStoreNames.contains('habitLogs')) {
          const s = db.createObjectStore('habitLogs', { keyPath: 'id' });
          s.createIndex('by_date', 'date', { unique: false });
          s.createIndex('by_habit', 'habitId', { unique: false });
        }
        if (!db.objectStoreNames.contains('scores')) db.createObjectStore('scores', { keyPath: 'date' });
      }
      if (old < 4) {
        if (!db.objectStoreNames.contains('goals')) {
          const s = db.createObjectStore('goals', { keyPath: 'id' });
          s.createIndex('by_domain', 'domain', { unique: false });
        }
        if (!db.objectStoreNames.contains('milestones')) db.createObjectStore('milestones', { keyPath: 'day' });
        if (!db.objectStoreNames.contains('domainLogs')) {
          const s = db.createObjectStore('domainLogs', { keyPath: 'id' });
          s.createIndex('by_domain', 'domain', { unique: false });
        }
      }
      if (old < 5) {
        if (!db.objectStoreNames.contains('dailyLogs')) db.createObjectStore('dailyLogs', { keyPath: 'date' });
        if (!db.objectStoreNames.contains('journal')) {
          const s = db.createObjectStore('journal', { keyPath: 'id' });
          s.createIndex('by_date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains('letters')) db.createObjectStore('letters', { keyPath: 'day' });
      }
    };
    req.onsuccess = () => { dbInstance = req.result; resolve(dbInstance); };
    req.onerror = () => reject(req.error);
  });
}

async function getStore(name, mode = 'readonly') {
  const db = await openDB();
  return db.transaction(name, mode).objectStore(name);
}

export async function getMeta(key) {
  const s = await getStore('meta');
  return new Promise((res, rej) => { const r = s.get(key); r.onsuccess = () => res(r.result?.value ?? null); r.onerror = () => rej(r.error); });
}
export async function setMeta(key, value) {
  const s = await getStore('meta', 'readwrite');
  return new Promise((res, rej) => { const r = s.put({ key, value }); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}
export async function getSetting(key) {
  const s = await getStore('settings');
  return new Promise((res, rej) => { const r = s.get(key); r.onsuccess = () => res(r.result?.value ?? null); r.onerror = () => rej(r.error); });
}
export async function setSetting(key, value) {
  const s = await getStore('settings', 'readwrite');
  return new Promise((res, rej) => { const r = s.put({ key, value }); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}
export async function getAllSettings() {
  const s = await getStore('settings');
  return new Promise((res, rej) => {
    const r = s.getAll();
    r.onsuccess = () => { const o = {}; (r.result || []).forEach(row => o[row.key] = row.value); res(o); };
    r.onerror = () => rej(r.error);
  });
}

export async function getAllSchedule() {
  const s = await getStore('schedule');
  return new Promise((res, rej) => { const r = s.getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); });
}
export async function saveScheduleItem(item) {
  const s = await getStore('schedule', 'readwrite');
  return new Promise((res, rej) => { const r = s.put(item); r.onsuccess = () => res(item); r.onerror = () => rej(r.error); });
}
export async function deleteScheduleItem(id) {
  const s = await getStore('schedule', 'readwrite');
  return new Promise((res, rej) => { const r = s.delete(id); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}
export async function getCompletionsByDate(dateIso) {
  const s = await getStore('completions');
  return new Promise((res, rej) => { const r = s.index('by_date').getAll(dateIso); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); });
}
export async function setCompletion(dateIso, itemId, done = true) {
  const id = `${dateIso}_${itemId}`;
  const s = await getStore('completions', 'readwrite');
  if (done) return new Promise((res, rej) => { const r = s.put({ id, date: dateIso, itemId, done: true, doneAt: new Date().toISOString() }); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
  return new Promise((res, rej) => { const r = s.delete(id); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}

export async function getAllHabits() {
  const s = await getStore('habits');
  return new Promise((res, rej) => { const r = s.getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); });
}
export async function saveHabit(habit) {
  const s = await getStore('habits', 'readwrite');
  return new Promise((res, rej) => { const r = s.put(habit); r.onsuccess = () => res(habit); r.onerror = () => rej(r.error); });
}
export async function deleteHabit(id) {
  const s = await getStore('habits', 'readwrite');
  return new Promise((res, rej) => { const r = s.delete(id); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}
export async function getHabitLogsByDate(dateIso) {
  const s = await getStore('habitLogs');
  return new Promise((res, rej) => { const r = s.index('by_date').getAll(dateIso); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); });
}
export async function getHabitLogsByHabit(habitId) {
  const s = await getStore('habitLogs');
  return new Promise((res, rej) => { const r = s.index('by_habit').getAll(habitId); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); });
}
export async function setHabitLog(dateIso, habitId, status, note = '') {
  const id = `${dateIso}_${habitId}`;
  const s = await getStore('habitLogs', 'readwrite');
  return new Promise((res, rej) => { const r = s.put({ id, date: dateIso, habitId, status, note, loggedAt: new Date().toISOString() }); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}

export async function getScore(dateIso) {
  const s = await getStore('scores');
  return new Promise((res, rej) => { const r = s.get(dateIso); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); });
}
export async function saveScore(obj) {
  const s = await getStore('scores', 'readwrite');
  return new Promise((res, rej) => { const r = s.put(obj); r.onsuccess = () => res(obj); r.onerror = () => rej(r.error); });
}
export async function getScoresInRange(fromIso, toIso) {
  const s = await getStore('scores');
  return new Promise((res, rej) => {
    const r = s.getAll();
    r.onsuccess = () => {
      const list = (r.result || []).filter(x => x.date >= fromIso && x.date <= toIso);
      list.sort((a, b) => a.date.localeCompare(b.date));
      res(list);
    };
    r.onerror = () => rej(r.error);
  });
}

export async function getAllGoals() {
  const s = await getStore('goals');
  return new Promise((res, rej) => { const r = s.getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); });
}
export async function saveGoal(goal) {
  const s = await getStore('goals', 'readwrite');
  return new Promise((res, rej) => { const r = s.put(goal); r.onsuccess = () => res(goal); r.onerror = () => rej(r.error); });
}
export async function deleteGoal(id) {
  const s = await getStore('goals', 'readwrite');
  return new Promise((res, rej) => { const r = s.delete(id); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}
export async function getMilestone(day) {
  const s = await getStore('milestones');
  return new Promise((res, rej) => { const r = s.get(day); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); });
}
export async function saveMilestone(obj) {
  const s = await getStore('milestones', 'readwrite');
  return new Promise((res, rej) => { const r = s.put(obj); r.onsuccess = () => res(obj); r.onerror = () => rej(r.error); });
}
export async function saveDomainLog(log) {
  const s = await getStore('domainLogs', 'readwrite');
  return new Promise((res, rej) => { const r = s.put(log); r.onsuccess = () => res(log); r.onerror = () => rej(r.error); });
}
export async function getDomainLogs(domain, fromIso, toIso) {
  const s = await getStore('domainLogs');
  return new Promise((res, rej) => {
    const r = s.index('by_domain').getAll(domain);
    r.onsuccess = () => {
      let list = r.result || [];
      if (fromIso) list = list.filter(x => x.date >= fromIso);
      if (toIso) list = list.filter(x => x.date <= toIso);
      list.sort((a, b) => b.date.localeCompare(a.date));
      res(list);
    };
    r.onerror = () => rej(r.error);
  });
}

export async function getDailyLog(dateIso) {
  const s = await getStore('dailyLogs');
  return new Promise((res, rej) => { const r = s.get(dateIso); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); });
}
export async function saveDailyLog(log) {
  const s = await getStore('dailyLogs', 'readwrite');
  return new Promise((res, rej) => { const r = s.put(log); r.onsuccess = () => res(log); r.onerror = () => rej(r.error); });
}
export async function getAllJournal() {
  const s = await getStore('journal');
  return new Promise((res, rej) => { const r = s.getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); });
}
export async function saveJournalEntry(entry) {
  const s = await getStore('journal', 'readwrite');
  return new Promise((res, rej) => { const r = s.put(entry); r.onsuccess = () => res(entry); r.onerror = () => rej(r.error); });
}
export async function deleteJournalEntry(id) {
  const s = await getStore('journal', 'readwrite');
  return new Promise((res, rej) => { const r = s.delete(id); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}
export async function getLetter(day) {
  const s = await getStore('letters');
  return new Promise((res, rej) => { const r = s.get(day); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); });
}
export async function saveLetter(obj) {
  const s = await getStore('letters', 'readwrite');
  return new Promise((res, rej) => { const r = s.put(obj); r.onsuccess = () => res(obj); r.onerror = () => rej(r.error); });
}

export async function exportAll() {
  const db = await openDB();
  const result = { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString() };
  for (const name of db.objectStoreNames) {
    result[name] = await new Promise((res, rej) => {
      const tx = db.transaction(name, 'readonly');
      const r = tx.objectStore(name).getAll();
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return result;
}
export async function importAll(data) {
  if (!data || typeof data !== 'object') throw new Error('داده نامعتبر');
  const db = await openDB();
  for (const name of db.objectStoreNames) {
    if (!Array.isArray(data[name])) continue;
    const tx = db.transaction(name, 'readwrite');
    const store = tx.objectStore(name);
    for (const row of data[name]) store.put(row);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  }
}

export async function ensureDefaults() {
  const defaults = {
    appName: 'همراه ۳۵۰',
    startDate: null,
    apiKey: '',
    apiModel: 'gemini-2.0-flash',
    apiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    pinEnabled: false,
    pinHash: null,
    gymDays: [2, 4, 6],
    gymStart: '20:00',
    gymEnd: '22:00',
    domainWeights: {
      behavior: 12, body: 12, posture: 8, appearance: 8,
      income: 10, business: 8, family: 10, partner: 10, study: 14, sleep: 8
    },
    whyMe: '',
    examMode: false,
    lightWeekActive: false
  };
  for (const [k, v] of Object.entries(defaults)) {
    const existing = await getSetting(k);
    if (existing === null || existing === undefined) await setSetting(k, v);
  }
  const installed = await getMeta('installedAt');
  if (!installed) await setMeta('installedAt', new Date().toISOString());
}

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}
