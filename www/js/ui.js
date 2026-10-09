/** توابع کمکی UI و XSS */

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function $(sel, root = document) { return root.querySelector(sel); }
export function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

export function showPage(id) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const page = $(`#page-${id}`);
  if (page) page.classList.add('active');
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === id));
}

export function faNum(n) {
  return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

export function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function nowMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}
