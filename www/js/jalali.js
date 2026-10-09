/**
 * تقویم جلالی دقیق — هفته از شنبه
 */
function div(a, b) { return Math.floor(a / b); }
function mod(a, b) { return a - b * Math.floor(a / b); }

export function toJalali(gy, gm, gd) {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365 * gy + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400) + gd + gdm[gm - 1];
  let jy = -1595 + 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) { jy += div(days - 1, 365); days = (days - 1) % 365; }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

export function toGregorian(jy, jm, jd) {
  jy += 1595;
  let days = -355668 + 365 * jy + div(jy, 33) * 8 + div(mod(jy, 33) + 3, 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) { gy += 100 * div(--days, 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) { gy += div(days - 1, 365); days = (days - 1) % 365; }
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && gd > sal_a[gm]) { gd -= sal_a[gm]; gm++; }
  return { gy, gm, gd };
}

export function isLeapJalali(jy) {
  const r = mod(jy - (jy > 0 ? 474 : 473), 2820) + 474;
  return mod((r + 38) * 682, 2816) < 682;
}

export function daysInMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalali(jy) ? 30 : 29;
}

export function weekday(jy, jm, jd) {
  const g = toGregorian(jy, jm, jd);
  const d = new Date(Date.UTC(g.gy, g.gm - 1, g.gd));
  return (d.getUTCDay() + 1) % 7;
}

export function formatJalali(jy, jm, jd, separator = '/') {
  const p = (n) => String(n).padStart(2, '0');
  return `${toPersianDigits(jy)}${separator}${toPersianDigits(p(jm))}${separator}${toPersianDigits(p(jd))}`;
}

export function toPersianDigits(str) {
  return String(str).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

export function toEnglishDigits(str) {
  return String(str).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

export function todayJalali() {
  const n = new Date();
  return toJalali(n.getFullYear(), n.getMonth() + 1, n.getDate());
}

export function todayIso() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

export function jalaliToIso(jy, jm, jd) {
  const g = toGregorian(jy, jm, jd);
  return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
}

export function dayNumberFromStart(startIso) {
  if (!startIso) return null;
  const start = new Date(startIso + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - start) / 86400000) + 1;
  if (diff < 1) return 0;
  if (diff > 350) return 350;
  return diff;
}

export const WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
export const WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

export function firstWeekdayOfMonth(jy, jm) { return weekday(jy, jm, 1); }

export function getMonthMatrix(jy, jm) {
  const days = daysInMonth(jy, jm);
  const first = firstWeekdayOfMonth(jy, jm);
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function todayWeekday() {
  const t = todayJalali();
  return weekday(t.jy, t.jm, t.jd);
}

export function selfTest() {
  const tests = [
    { g: [2024, 3, 20], j: [1403, 1, 1] },
    { g: [2025, 3, 21], j: [1404, 1, 1] },
    { g: [2023, 3, 21], j: [1402, 1, 1] },
    { g: [2024, 9, 22], j: [1403, 7, 1] },
    { g: [2000, 1, 1], j: [1378, 10, 11] },
    { g: [1979, 2, 11], j: [1357, 11, 22] }
  ];
  let passed = 0;
  for (const t of tests) {
    const j = toJalali(...t.g);
    if (j.jy === t.j[0] && j.jm === t.j[1] && j.jd === t.j[2]) passed++;
  }
  if (isLeapJalali(1403) === true) passed++;
  if (isLeapJalali(1402) === false) passed++;
  console.log(`jalali selfTest: ${passed}/${tests.length + 2} passed`);
  return passed === tests.length + 2;
}
