import { getSetting } from './db.js';
const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function getConfig() {
  return {
    apiKey: (await getSetting('apiKey')) || '',
    model: (await getSetting('apiModel')) || DEFAULT_MODEL,
    baseUrl: (await getSetting('apiBaseUrl')) || DEFAULT_BASE
  };
}

export async function callGemini(prompt, systemInstruction = '') {
  const { apiKey, model, baseUrl } = await getConfig();
  if (!apiKey) throw new Error('کلید API تنظیم نشده. از تنظیمات وارد کن.');
  const url = `${baseUrl.replace(/\/$/, '')}/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
  };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };
  const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!resp.ok) {
    if (resp.status === 400) throw new Error('درخواست نامعتبر.');
    if (resp.status === 403 || resp.status === 401) throw new Error('کلید API نامعتبر.');
    if (resp.status === 429) throw new Error('محدودیت نرخ.');
    throw new Error(`خطای سرور (${resp.status})`);
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('پاسخ خالی از مدل.');
  return text.trim();
}

export async function parseNaturalInput(sentence) {
  const system = `تو دستیار ثبت فعالیت هستی. فقط JSON خالص برگردان.
فرمت: {"type":"habit","title":"...","status":"done|minimal|rest|bad"} یا {"type":"daily","mood":1-5,"energy":1-5,"sleep":number,"note":"..."} یا {"type":"journal","title":"...","text":"..."} یا {"type":"unknown","message":"..."}`;
  try {
    const raw = await callGemini(`جمله: "${sentence}"`, system);
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { type: 'unknown', message: 'قابل پردازش نبود' };
  } catch (e) { return { type: 'error', message: e.message }; }
}

export async function nightlyReview(summaryData) {
  return callGemini(`خلاصه امروز: ${JSON.stringify(summaryData)}\n۳ سؤال مرور شبانه بپرس.`, 'لحن مهربان و صریح. فقط ۳ سؤال شماره‌گذاری‌شده.');
}

export async function suggestTomorrow(summaryData, existingSchedule) {
  return callGemini(`وضعیت: ${JSON.stringify(summaryData)}\nبرنامه: ${JSON.stringify(existingSchedule)}\nپیشنهاد برنامه سبک فردا (حداکثر ۵ آیتم).`, 'برنامه‌ریز واقع‌بین.');
}

export async function coachChat(userMessage, history = []) {
  let prompt = history.length ? 'تاریخچه:\n' + history.slice(-4).map(h => `${h.role}: ${h.text}`).join('\n') + '\n\n' : '';
  prompt += `کاربر: ${userMessage}`;
  return callGemini(prompt, 'مربی رشد شخصی. لحن صریح، مهربان، بدون سرزنش. پاسخ کوتاه.');
}

export async function crisisMode(userMessage) {
  return callGemini(`پیام: ${userMessage}`, 'وضعیت سخت. لحن بسیار مهربان. پیشنهاد صحبت با افراد مورد اعتماد. برنامه حداقلی.');
}

export async function summarizeLesson(text) {
  return callGemini(`متن درس:\n${text.slice(0, 8000)}\nخلاصه کن.`, 'خلاصه کوتاه + نکات کلیدی + پرسش‌های امتحان.');
}

export async function isAiAvailable() {
  return !!(await getSetting('apiKey'));
}
