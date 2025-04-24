// script.js (محدَّث كامل مع دعم Web Share Target، Service Worker، تثبيت PWA، قراءة رابط IMDb، وتسجيل الدخول عبر Google)

// --------------------
// 1. إعدادات API
// --------------------
const API = {
  baseUrl: 'https://yts.mx/api/v2',
  endpoints: {
    list: '/list_movies.json',
    details: '/movie_details.json'
  },
  defaultParams: {
    sort_by: 'year',
    limit: 20,
    page: 1
  }
};

// --------------------
// 2. إعداد Google Identity Services
// --------------------
// استدعاء دالة المعالجة بعد تحميل مكتبة GSI
function handleCredentialResponse(response) {
  const idToken = response.credential;
  // فك payload من JWT
  const payload = JSON.parse(atob(idToken.split('.')[1]));
  console.log('User info:', payload);
  // عرض معلومات المستخدم في الواجهة
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    userInfo.innerHTML = `
      <img src="${payload.picture}" alt="avatar" class="user-avatar" />
      <p class="user-name">${payload.name}</p>
      <button id="signoutBtn">تسجيل الخروج</button>
    `;
    document.getElementById('signoutBtn').addEventListener('click', () => {
      google.accounts.id.disableAutoSelect();
      userInfo.innerHTML = '';
    });
  }
}

// تهيئة GSI
window.onload = () => {
  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.initialize({
      client_id: '566285861664-pogmk4kjt3bk235uu22fe4dao9flttnr.apps.googleusercontent.com',
      callback: handleCredentialResponse,
      ux_mode: 'popup'
    });
    // عرض زر تسجيل الدخول
    google.accounts.id.renderButton(
      document.getElementById('googleSignInBtn'),
      { type: 'standard', size: 'large', theme: 'outline', text: 'signin_with' }
    );
    // تفعيل One Tap
    google.accounts.id.prompt();
  }
};

// --------------------
// 3. دوال مساعدة
// --------------------
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

function sanitize(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateMagnetLink(torrent, title) {
  const trackers = [
    'udp://open.demonii.com:1337/announce',
    'udp://tracker.openbittorrent.com:80/announce',
    'udp://tracker.coppersurfer.tk:6969/announce'
  ];
  const params = [
    `xt=urn:btih:${torrent.hash}`,
    `dn=${encodeURIComponent(title)}`,
    ...trackers.map(t => `tr=${encodeURIComponent(t)}`)
  ];
  return `magnet:?${params.join('&')}`;
}

// --------------------
// 4. عناصر DOM وحالة التطبيق
// --------------------
const searchForm       = document.getElementById('searchForm');
const searchInput      = document.getElementById('searchInput');
const moviesContainer  = document.getElementById('moviesContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const loadMoreBtn      = document.getElementById('loadMoreBtn');
const noResults        = document.getElementById('noResults');
const installBtn       = document.getElementById('installBtn');
let currentQuery = '';
let currentPage  = 1;
let deferredPrompt;

// --------------------
// 5. تسجيل Service Worker
// --------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.warn('SW registration failed:', err));
}

// --------------------
// 6. قراءة معامل q من URL
// --------------------
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('q')) {
  currentQuery = urlParams.get('q');
  searchInput.value = currentQuery;
  // تنفيذ البحث فوراً
  fetchAndDisplay(false);
}

// --------------------
// 7. معالجة نموذج البحث
// --------------------
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  updateURL(currentQuery);
  fetchAndDisplay(false);
});

// --------------------
// 8. تحميل المزيد
// --------------------
loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  fetchAndDisplay(true);
});

// --------------------
// 9. تحديث URL
// --------------------
function updateURL(query) {
  const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
  window.history.replaceState(null, '', newUrl);
}

// --------------------
// 10. beforeinstallprompt
// --------------------
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.hidden = false;
});
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    installBtn.hidden = true;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log('User choice:', choice.outcome);
    deferredPrompt = null;
  });
}

// --------------------
// 11. جلب وعرض البيانات
// --------------------
const fetchAndDisplay = debounce(async (append = false) => {
  if (!append) {
    moviesContainer.innerHTML = '';
    noResults.hidden = true;
    loadMoreBtn.hidden = true;
  }
  loadingIndicator.hidden = false;

  const imdbMatch = currentQuery.match(/tt\d+/);
  if (imdbMatch) {
    try {
      const res = await fetch(`${API.baseUrl}${API.endpoints.details}?imdb_id=${imdbMatch[0]}`);
      const json = await res.json();
      const movie = json.data.movie;
      if (movie) displayMovies([movie], false);
      else {
        noResults.textContent = '⚠️ لا توجد بيانات لهذا المعرف IMDb'; noResults.hidden = false;
      }
    } catch (err) {
      console.error('خطأ في جلب تفاصيل IMDb:', err);
      noResults.textContent = '⚠️ خطأ في جلب بيانات الفيلم'; noResults.hidden = false;
    } finally { loadingIndicator.hidden = true; }
    return;
  }

  const params = new URLSearchParams({
    ...API.defaultParams,
    query_term: currentQuery,
    page: currentPage
  });
  try {
    const res = await fetch(`${API.baseUrl}${API.endpoints.list}?${params}`);
    const data = await res.json();
    const movies = data.data.movies || [];
    if (!append && movies.length === 0) noResults.hidden = false;
    displayMovies(movies, append);
    loadMoreBtn.hidden = movies.length < API.defaultParams.limit;
  } catch (err) {
    console.error('خطأ في جلب قائمة الأفلام:', err);
    noResults.textContent = '⚠️ خطأ في جلب البيانات'; noResults.hidden = false;
  } finally { loadingIndicator.hidden = true; }
}, 300);

// --------------------
// 12. عرض الأفلام
// --------------------
function displayMovies(movies, append) {
  const fragment = document.createDocumentFragment();
  movies.forEach(movie => {
    const card = document.createElement('div'); card.className = 'movie-card';
    const img = document.createElement('img');
    img.className = 'movie-poster'; img.src = movie.medium_cover_image; img.alt = movie.title; img.loading = 'lazy';
    const info = document.createElement('div'); info.className = 'movie-info';
    info.innerHTML = `
      <h3>${sanitize(movie.title)}</h3>
      <p>📅 السنة: ${movie.year}</p>
      <p>⭐ التقييم: ${movie.rating}/10</p>
    `;
    const torrentsList = document.createElement('div'); torrentsList.className = 'torrents-list';
    movie.torrents.forEach(t => {
      const a = document.createElement('a');
      a.className = `torrent-btn quality-${t.quality}`; a.href = generateMagnetLink(t, movie.title);
      a.textContent = `${t.quality} (${t.size})`;
      torrentsList.appendChild(a);
    });
    info.appendChild(torrentsList); card.appendChild(img); card.appendChild(info); fragment.appendChild(card);
  });
  append ? moviesContainer.appendChild(fragment) : moviesContainer.replaceChildren(fragment);
}

// --------------------
// 13. بدء أولي
// --------------------
fetchAndDisplay();

