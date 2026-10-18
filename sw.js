/* Simpan tampilan aplikasi di HP agar terbuka cepat walau sinyal lemah.
   Data booking TIDAK disimpan di sini (selalu diambil dari server).
   Setiap kali index.html diubah, naikkan angka VERSI di bawah supaya HP mengambil versi baru. */
const VERSI = 'rf-1.4.2';
const BERKAS = ['./', 'index.html', 'manifest.webmanifest', 'logo-kso-gdsk-pid.png', 'ikon-64.png', 'ikon-192.png', 'ikon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(BERKAS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSI).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // API Apps Script tidak disentuh
  const halamanUtama = req.mode === 'navigate' && /\/(index\.html)?$/.test(new URL(req.url).pathname);
  const kunci = halamanUtama ? 'index.html' : req; // qr.html dan berkas lain diambil apa adanya
  e.respondWith(caches.open(VERSI).then(c => c.match(kunci, { ignoreSearch: true }).then(simpan => {
    const ambil = fetch(req).then(res => { if (res.ok) c.put(kunci, res.clone()); return res; }).catch(() => simpan);
    return simpan || ambil; // tampil langsung dari HP, diperbarui diam-diam di belakang
  })));
});
