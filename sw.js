/* Service worker AvaTuber: офлайн-запуск з початкового екрана.
 *
 * Стратегія — «спершу кеш»: сторінка самодостатня (спрайти вбудовані), тож після першого
 * відкриття мережа не потрібна взагалі. Оновлення приходять так: tools/build_pwa.sh вписує
 * в VERSION хеш вмісту, браузер бачить змінений sw.js, ставить новий кеш і видаляє старий.
 */
const VERSION = '9fabec782d9b';
const CACHE = `avatuber-${VERSION}`;
const FILES = ['./', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('avatuber-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Будь-яка навігація (у т. ч. ?bg=green&panel=0) — це та сама сторінка './'
  const key = req.mode === 'navigate' ? './' : req;
  ev.respondWith(
    caches.match(key, { ignoreSearch: true }).then(hit => hit || fetch(req))
  );
});
