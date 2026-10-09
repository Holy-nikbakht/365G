import { getAllHabits, getHabitLogsByDate, getCompletionsByDate, getAllSchedule, getSetting, saveScore, getScoresInRange } from './db.js';
import { todayIso, todayWeekday } from './jalali.js';

function habitPoints(status) {
  switch (status) {
    case 'done': return 1.0;
    case 'minimal': return 0.6;
    case 'rest': return 1.0;
    case 'bad': return 0.3;
    default: return 0;
  }
}

export async function calculateAndSaveDayScore(dateIso = todayIso()) {
  const habits = await getAllHabits();
  const logs = await getHabitLogsByDate(dateIso);
  const logMap = {};
  logs.forEach(l => { logMap[l.habitId] = l; });
  const weights = (await getSetting('domainWeights')) || {};
  let totalWeight = 0, weightedSum = 0;
  const domainScores = {};

  for (const h of habits) {
    if (h.archived) continue;
    const w = (weights[h.domain] ?? 10) / 100;
    const status = logMap[h.id]?.status || 'skip';
    const pts = habitPoints(status);
    domainScores[h.domain] = (domainScores[h.domain] || 0) + pts;
    weightedSum += pts * w;
    totalWeight += w;
  }

  const wd = todayWeekday();
  const schedule = await getAllSchedule();
  const completions = await getCompletionsByDate(dateIso);
  const doneSet = new Set(completions.map(c => c.itemId));
  let scheduleTotal = 0, scheduleDone = 0;
  for (const item of schedule) {
    if (!(item.days || []).includes(wd)) continue;
    scheduleTotal++;
    if (doneSet.has(item.id)) scheduleDone++;
  }
  const gymDays = (await getSetting('gymDays')) || [2, 4, 6];
  if (gymDays.includes(wd)) {
    scheduleTotal++;
    if (doneSet.has('__gym__')) scheduleDone++;
  }
  const scheduleRatio = scheduleTotal > 0 ? scheduleDone / scheduleTotal : 1;
  const stabilityW = (weights.sleep ?? 8) / 100;
  weightedSum += scheduleRatio * stabilityW;
  totalWeight += stabilityW;

  const raw = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
  const score = Math.round(Math.min(100, Math.max(0, raw)));
  const obj = { date: dateIso, score, domainScores, scheduleRatio, calculatedAt: new Date().toISOString() };
  await saveScore(obj);
  return obj;
}

export async function getWeekStats(endIso = todayIso()) {
  const end = new Date(endIso + 'T00:00:00');
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  const from = start.toISOString().slice(0, 10);
  const scores = await getScoresInRange(from, endIso);
  if (!scores.length) return { avg: null, trend: 0, count: 0 };
  const avg = Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length);
  const mid = Math.ceil(scores.length / 2);
  const avg1 = scores.slice(0, mid).reduce((s, x) => s + x.score, 0) / (mid || 1);
  const avg2 = scores.slice(mid).reduce((s, x) => s + x.score, 0) / (scores.length - mid || 1);
  return { avg, trend: Math.round(avg2 - avg1), count: scores.length, scores };
}

export async function getMonthStats(yearMonth) {
  const from = yearMonth + '-01';
  const to = yearMonth + '-31';
  const scores = await getScoresInRange(from, to);
  if (!scores.length) return { avg: null, count: 0 };
  return { avg: Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length), count: scores.length, scores };
}
