import { getScoresInRange, getAllHabits, getSetting } from './db.js';
import { todayIso, dayNumberFromStart } from './jalali.js';

const LEVELS = [
  { level: 1, minScore: 0, title: 'شروع' },
  { level: 2, minScore: 300, title: 'پایدار' },
  { level: 3, minScore: 800, title: 'مصمم' },
  { level: 4, minScore: 1500, title: 'پیگیر' },
  { level: 5, minScore: 2500, title: 'قهرمان کوچک' },
  { level: 6, minScore: 4000, title: 'استاد عادت' },
  { level: 7, minScore: 6000, title: 'افسانه شخصی' }
];

export async function getGamificationState() {
  const startDate = await getSetting('startDate');
  const dayNum = dayNumberFromStart(startDate) || 0;
  const scores = await getScoresInRange(startDate || todayIso(), todayIso());
  const habits = await getAllHabits();
  const totalScore = scores.reduce((a, s) => a + (s.score || 0), 0);
  let currentLevel = LEVELS[0];
  for (const lv of LEVELS) if (totalScore >= lv.minScore) currentLevel = lv;
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1) || null;
  const progressToNext = nextLevel ? Math.min(100, Math.round(((totalScore - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100)) : 100;
  return { level: currentLevel, nextLevel, progressToNext, totalScore, dayNum, badges: [] };
}
