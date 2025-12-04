const CACHE_NAME = 'movie-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/service-worker.js',
  '/service-worker-registration.js',
  // يمكنك إضافة المزيد من الأصول هنا
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح ذاكرة التخزين المؤقت');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // معالجة طلبات Web Share Target
  if (url.pathname.endsWith('/share-target/')) {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // العودة من ذاكرة التخزين المؤقت إذا كان متاحًا
        if (response) {
          return response;
        }
        
        // جلب من الشبكة وتخزينه مؤقتًا
        return fetch(event.request).then(
          response => {
            // تحقق مما إذا كنا قد تلقينا استجابة صالحة
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // استنساخ الاستجابة. الاستجابة هي دفق ولا يمكن استهلاكها إلا مرة واحدة.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * معالجة طلب Web Share Target
 * @param {Request} request - طلب HTTP
 * @returns {Response} - استجابة إعادة توجيه
 */
async function handleShareTarget(request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  
  // نفترض أن ID IMDb سيتم تمريره في حقل 'text' أو 'url'
  const sharedText = params.get('text') || params.get('url') || '';
  
  // محاولة استخراج ID IMDb (يبدأ بـ tt متبوعًا بأرقام)
  const imdbMatch = sharedText.match(/(tt\d+)/i);
  const imdbId = imdbMatch ? imdbMatch[1] : null;

  if (imdbId) {
    // إعادة التوجيه إلى الصفحة الرئيسية مع ID IMDb كمعامل بحث
    const redirectUrl = `/?imdb_id=\${imdbId}`;
    return Response.redirect(redirectUrl, 302);
  } else {
    // إعادة التوجيه إلى الصفحة الرئيسية إذا لم يتم العثور على ID IMDb
    return Response.redirect('/', 302);
  }
}
