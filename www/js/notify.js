function getPlugin() {
  try {
    if (window.Capacitor?.Plugins?.LocalNotifications) return window.Capacitor.Plugins.LocalNotifications;
  } catch (e) {}
  return null;
}

export async function requestNotificationPermission() {
  const plugin = getPlugin();
  if (!plugin) return { granted: false, message: 'فقط در نسخه اندروید (APK) فعال است.' };
  try {
    const result = await plugin.requestPermissions();
    return { granted: result.display === 'granted', message: result.display === 'granted' ? 'مجوز داده شد' : 'مجوز داده نشد' };
  } catch (e) { return { granted: false, message: e.message }; }
}

export async function checkPermission() {
  const plugin = getPlugin();
  if (!plugin) return { granted: false };
  try {
    const result = await plugin.checkPermissions();
    return { granted: result.display === 'granted' };
  } catch (e) { return { granted: false }; }
}

export async function scheduleNotification(opts) {
  const plugin = getPlugin();
  if (!plugin) return { ok: false, message: 'فقط در APK' };
  try {
    await plugin.schedule({
      notifications: [{
        id: Number(opts.id) || Math.floor(Math.random() * 100000),
        title: opts.title || 'همراه ۳۵۰',
        body: opts.body || '',
        schedule: { at: opts.scheduleAt, allowWhileIdle: true },
        sound: 'default',
        autoCancel: true,
        extra: opts.extra || {}
      }]
    });
    return { ok: true };
  } catch (e) { return { ok: false, message: e.message }; }
}

export async function cancelAllNotifications() {
  const plugin = getPlugin();
  if (!plugin) return;
  try { await plugin.cancelAll(); } catch (e) {}
}

export async function rescheduleDailyReminders(scheduleItems, habits, gymSettings) {
  const plugin = getPlugin();
  if (!plugin) return { ok: false, message: 'فقط در APK' };
  await cancelAllNotifications();
  return { ok: true, count: 0 };
}

export function setupNotificationListeners(callback) {
  const plugin = getPlugin();
  if (!plugin) return;
  try {
    plugin.addListener('localNotificationActionPerformed', (n) => { if (callback) callback(n); });
  } catch (e) {}
}
