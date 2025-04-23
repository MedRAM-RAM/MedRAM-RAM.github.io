// script.js (محدَّث كامل مع دعم Web Share Target وقراءة رابط IMDb)

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
// 2. دوال مساعدة
// --------------------
// Debounce بسيط
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

// تعقيم بسيط لمنع XSS
function sanitize(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// توليد رابط المغناطيس
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
// 3. عناصر DOM وحالة التطبيق
// --------------------
const searchForm       = document.getElementById('searchForm');
const searchInput      = document.getElementById('searchInput');
const moviesContainer  = document.getElementById('moviesContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const loadMoreBtn      = document.getElementById('loadMoreBtn');
const noResults        = document.getElementById('noResults');

let currentQuery = '';
let currentPage  = 1;

// --------------------
// 4. تسجيل Service Worker (لتفعيل PWA و Web Share Target)
// --------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .catch(err => console.warn('ServiceWorker registration failed:', err));
}

// --------------------
// 5. قراءة معامل q من URL إذا موجود
// --------------------
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('q')) {
  currentQuery = urlParams.get('q');
  searchInput.value = currentQuery;
}

// --------------------
// 6. معالجة إرسال نموذج البحث
// --------------------
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  updateURL(currentQuery);
  fetchAndDisplay(false);
});

// --------------------
// 7. زر تحميل المزيد
// --------------------
loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  fetchAndDisplay(true);
});

// --------------------
// 8. تحديث URL بدون إعادة تحميل
// --------------------
function updateURL(query) {
  const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
  window.history.replaceState(null, '', newUrl);
}

// --------------------
// 9. جلب البيانات وعرضها
// --------------------
const fetchAndDisplay = debounce(async (append = false) => {
  if (!append) {
    moviesContainer.innerHTML = '';
    noResults.hidden = true;
    loadMoreBtn.hidden = true;
  }
  loadingIndicator.hidden = false;

  // 9.1: التحقق من رابط IMDb في currentQuery
  const imdbMatch = currentQuery.match(/tt\d+/);
  if (imdbMatch) {
    // Fetch by IMDb ID
    try {
      const detailsUrl = `${API.baseUrl}${API.endpoints.details}?imdb_id=${imdbMatch[0]}`;
      const res = await fetch(detailsUrl);
      const json = await res.json();
      const movie = json.data.movie;
      if (movie) {
        displayMovies([movie], false);
      } else {
        noResults.textContent = '⚠️ لا توجد بيانات لهذا المعرف IMDb';
        noResults.hidden = false;
      }
    } catch (err) {
      console.error('خطأ في جلب تفاصيل IMDb:', err);
      noResults.textContent = '⚠️ خطأ في جلب بيانات الفيلم';
      noResults.hidden = false;
    } finally {
      loadingIndicator.hidden = true;
    }
    return;
  }

  // 9.2: بحث عام عبر query_term
  const params = new URLSearchParams({
    ...API.defaultParams,
    query_term: currentQuery,
    page: currentPage
  });

  try {
    const res = await fetch(`${API.baseUrl}${API.endpoints.list}?${params}`);
    const data = await res.json();
    const movies = data.data.movies || [];
    if (!append && movies.length === 0) {
      noResults.hidden = false;
    }
    displayMovies(movies, append);
    loadMoreBtn.hidden = movies.length < API.defaultParams.limit;
  } catch (err) {
    console.error('خطأ في جلب قائمة الأفلام:', err);
    noResults.textContent = '⚠️ خطأ في جلب البيانات';
    noResults.hidden = false;
  } finally {
    loadingIndicator.hidden = true;
  }
}, 300);

// --------------------
// 10. دالة عرض الأفلام
// --------------------
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

  if (append) {
    moviesContainer.appendChild(fragment);
  } else {
    moviesContainer.replaceChildren(fragment);
  }
}

// --------------------
// 11. بدء العملية الأولى
// --------------------
fetchAndDisplay();
