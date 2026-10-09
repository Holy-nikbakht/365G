import { ensureDefaults, getSetting, setSetting, exportAll, importAll } from './db.js';
import { dayNumberFromStart, todayJalali, formatJalali, selfTest, toPersianDigits } from './jalali.js';
import { $, $$, showPage, faNum } from './ui.js';

async function init() {
  selfTest();
  await ensureDefaults();
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('./sw.js'); } catch (e) { console.warn(e); }
  }
  bindNav();
  bindSettings();
  showPage('now');
  await renderNow();
}

function bindNav() {
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      const page = btn.dataset.page;
      showPage(page);
      if (page === 'now') await renderNow();
      if (page === 'settings') await renderSettings();
    });
  });
}

async function renderNow() {
  const startDate = await getSetting('startDate');
  const appName = (await getSetting('appName')) || 'همراه ۳۵۰';
  const dayNum = dayNumberFromStart(startDate);
  const today = todayJalali();
  $('#now-app-name').textContent = appName;
  $('#now-date').textContent = formatJalali(today.jy, today.jm, today.jd);
  const el = $('#now-counter');
  if (!startDate) {
    el.innerHTML = '<div class="empty-state"><p>تاریخ شروع را از تنظیمات وارد کن.</p></div>';
  } else {
    el.innerHTML = `<div class="counter-big">${faNum(dayNum || 0)}</div><div class="muted" style="text-align:center">روز ${faNum(dayNum || 0)} از ${faNum(350)}</div>`;
  }
}

async function renderSettings() {
  $('#set-appName').value = (await getSetting('appName')) || '';
  $('#set-startDate').value = (await getSetting('startDate')) || '';
  $('#set-apiKey').value = (await getSetting('apiKey')) || '';
  $('#set-apiModel').value = (await getSetting('apiModel')) || 'gemini-2.0-flash';
}

function bindSettings() {
  $('#btn-save-settings').addEventListener('click', async () => {
    await setSetting('appName', $('#set-appName').value.trim() || 'همراه ۳۵۰');
    await setSetting('startDate', $('#set-startDate').value || null);
    await setSetting('apiKey', $('#set-apiKey').value.trim());
    await setSetting('apiModel', $('#set-apiModel').value.trim() || 'gemini-2.0-flash');
    $('#settings-msg').innerHTML = '<div class="success-box">ذخیره شد</div>';
    setTimeout(() => $('#settings-msg').innerHTML = '', 2000);
    await renderNow();
  });
  $('#btn-export').addEventListener('click', async () => {
    try {
      const data = await exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hamrah350-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('خطا: ' + e.message); }
  });
  $('#btn-import').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importAll(JSON.parse(await file.text()));
      alert('وارد شد');
      await renderSettings();
    } catch (err) { alert('خطا: ' + err.message); }
    e.target.value = '';
  });
}

document.addEventListener('DOMContentLoaded', init);
