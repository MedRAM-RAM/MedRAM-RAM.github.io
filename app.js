// app.js — YTS Browser Application Logic

import './auth.js'; // تحميل معالجة Google Sign-In

// ----------- إعدادات API -----------
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

// ----------- عناصر DOM -----------
const searchForm       = document.getElementById('searchForm');
const searchInput      = document.getElementById('searchInput');
const moviesContainer  = document.getElementById('moviesContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const loadMoreBtn      = document.getElementById('loadMoreBtn');
const noResults        = document.getElementById('noResults');
const installBtn       = document.getElementById('installBtn');
const signoutBtn       = document.getElementById('signoutBtn');
const userInfo         = document.getElementById('userInfo');

let currentQuery = '';
let currentPage  = 1;
let deferredPrompt;

// ----------- تأمين الدخول -----------
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user) {
  window.location = 'login.html';
} else {
  userInfo.innerHTML = `
    <img src="${user.picture}" alt="avatar" class="user-avatar" />
    <span>${user.name}</span>
  `;
  signoutBtn.hidden = false;
  signoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    google.accounts.id.disableAutoSelect();
    window.location = 'login.html';
  });
}

// ----------- Service Worker -----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .catch(err => console.warn('SW registration failed:', err));
}

// ----------- قراءة q من URL -----------
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('q')) {
  currentQuery = urlParams.get('q');
  searchInput.value = currentQuery;
  fetchAndDisplay(false);
}

// ----------- معالجة البحث -----------
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  updateURL(currentQuery);
  fetchAndDisplay(false);
});

// ----------- تحميل المزيد -----------
loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  fetchAndDisplay(true);
});

// ----------- تحديث URL -----------
function updateURL(query) {
  window.history.replaceState(null, '', `${window.location.pathname}?q=${encodeURIComponent(query)}`);
}

// ----------- تثبيت PWA -----------
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  installBtn.hidden = true;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

// ----------- دوال مساعدة -----------
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

// ----------- جلب وعرض البيانات -----------
const fetchAndDisplay = debounce(async (append = false) => {
  if (!append) {
    moviesContainer.innerHTML = '';
    noResults.hidden = true;
    loadMoreBtn.hidden = true;
  }
  loadingIndicator.hidden = false;

  // إذا كان استعلام IMDb ID
  const imdbMatch = currentQuery.match(/tt\d+/);
  if (imdbMatch) {
    try {
      const res = await fetch(`${API.baseUrl}${API.endpoints.details}?imdb_id=${imdbMatch[0]}`);
      const movie = (await res.json()).data.movie;
      if (movie) displayMovies([movie], false);
      else noResults.hidden = false;
    } catch {
      noResults.textContent = '⚠️ خطأ في جلب بيانات الفيلم';
      noResults.hidden = false;
    } finally {
      loadingIndicator.hidden = true;
    }
    return;
  }

  // بحث عام
  const params = new URLSearchParams({
    ...API.defaultParams,
    query_term: currentQuery,
    page: currentPage
  });

  try {
    const json = await (await fetch(`${API.baseUrl}${API.endpoints.list}?${params}`)).json();
    const movies = json.data.movies || [];
    if (!append && movies.length === 0) noResults.hidden = false;
    displayMovies(movies, append);
    loadMoreBtn.hidden = movies.length < API.defaultParams.limit;
  } catch {
    noResults.textContent = '⚠️ خطأ في جلب القائمة';
    noResults.hidden = false;
  } finally {
    loadingIndicator.hidden = true;
  }
}, 300);

// ----------- عرض الأفلام -----------
function displayMovies(movies, append) {
  const fragment = document.createDocumentFragment();
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const img = document.createElement('img');
    img.className = 'movie-poster';
    img.src = movie.medium_cover_image;
    img.alt = movie.title;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'movie-info';
    info.innerHTML = `
      <h3>${sanitize(movie.title)}</h3>
      <p>📅 السنة: ${movie.year}</p>
      <p>⭐ التقييم: ${movie.rating}/10</p>
    `;

    const torrentsList = document.createElement('div');
    torrentsList.className = 'torrents-list';
    movie.torrents.forEach(t => {
      const a = document.createElement('a');
      a.className = `torrent-btn quality-${t.quality}`;
      a.href = generateMagnetLink(t, movie.title);
      a.textContent = `${t.quality} (${t.size})`;
      torrentsList.appendChild(a);
    });

    info.appendChild(torrentsList);
    card.appendChild(img);
    card.appendChild(info);
    fragment.appendChild(card);
  });

  if (append) moviesContainer.appendChild(fragment);
  else moviesContainer.replaceChildren(fragment);
}

// ----------- بدء أولي -----------
fetchAndDisplay();
