/**
 * پس از cap add android این اسکریپت را اجرا کنید تا مجوزهای اعلان و آلارم دقیق اضافه شود.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');

if (!fs.existsSync(manifestPath)) {
  console.error('AndroidManifest.xml پیدا نشد. اول npx cap add android را اجرا کنید.');
  process.exit(1);
}

let xml = fs.readFileSync(manifestPath, 'utf8');

const perms = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.USE_EXACT_ALARM',
  'android.permission.RECEIVE_BOOT_COMPLETED',
  'android.permission.VIBRATE',
  'android.permission.WAKE_LOCK'
];

let changed = false;
for (const p of perms) {
  if (!xml.includes(p)) {
    xml = xml.replace(
      /<manifest[^>]*>/,
      (m) => `${m}\n    <uses-permission android:name="${p}" />`
    );
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(manifestPath, xml, 'utf8');
  console.log('مجوزهای اعلان و آلارم دقیق اضافه شد.');
} else {
  console.log('مجوزها از قبل موجود بودند.');
}
