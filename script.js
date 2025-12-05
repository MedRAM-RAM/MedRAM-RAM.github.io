// الثوابت
const API_BASE_URL = 'https://yts.mx/api/v2/';
const CORS_PROXY_URL = 'https://corsproxy.io/?'; // وكيل CORS جديد وموثوق به

// المتغيرات
let currentPage = 1;
let currentQuery = '';

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // تهيئة المستمعين
  document.getElementById('search-form').addEventListener('submit', handleSearch);
  document.getElementById('prev-page').addEventListener('click', () => changePage(currentPage - 1));
  document.getElementById('next-page').addEventListener('click', () => changePage(currentPage + 1));
  

  
  // معالجة الروابط المشاركة
  handleSharedLinks();
  
  // تحميل الأفلام الافتراضية
  if (!window.location.search.includes('imdb_id')) {
    fetchMovies();
  }
});

/**
 * جلب قائمة الأفلام من API
 * @param {string} query - مصطلح البحث
 * @param {number} page - رقم الصفحة
 */
async function fetchMovies(query = '', page = 1) {
  showLoading(true);
  
  currentQuery = query;
  currentPage = page;
  
  try {
    const params = new URLSearchParams({
      limit: 20,
      page: page,
      query_term: query || '0', // '0' لجلب جميع الأفلام إذا لم يكن هناك بحث
      sort_by: 'download_count'
    });
    
    const response = await fetch(\`\${CORS_PROXY_URL}\${encodeURIComponent(\`\${API_BASE_URL}list_movies.json?\${params.toString()}\`)}\`);
    const data = await response.json();
    
    if (data.status === 'ok' && data.data.movies) {
      displayMovies(data.data.movies);
      updatePagination(data.data.movie_count, data.data.limit);
    } else {
      displayMovies([]);
      updatePagination(0, 0);
      showNotification('error', 'لم يتم العثور على أفلام');
    }
  } catch (error) {
    console.error('خطأ في جلب الأفلام:', error);
    showNotification('error', 'حدث خطأ أثناء جلب الأفلام');
  } finally {
    showLoading(false);
  }
}

/**
 * معالجة حدث البحث
 * @param {Event} event - حدث الإرسال
 */
function handleSearch(event) {
  event.preventDefault();
  const query = document.getElementById('search-input').value.trim();
  fetchMovies(query, 1);
}

/**
 * تغيير الصفحة
 * @param {number} newPage - رقم الصفحة الجديد
 */
function changePage(newPage) {
  if (newPage > 0) {
    fetchMovies(currentQuery, newPage);
    // إعادة التمرير في الصفحة الرئيسية
  }
}

/**
 * الحصول على تفاصيل الفيلم من API
 * @param {number} movieId - معرف الفيلم
 * @returns {Promise<Object>} - بيانات الفيلم
 */
async function getMovieDetails(movieId) {
  try {
    const params = new URLSearchParams({
      movie_id: movieId,
      with_images: true,
      with_cast: true
    });
    
    const response = await fetch(\`\${CORS_PROXY_URL}\${encodeURIComponent(\`\${API_BASE_URL}movie_details.json?\${params.toString()}\`)}\`);
    const data = await response.json();
    
    if (data.status === 'ok' && data.data.movie) {
      return data.data.movie;
    } else {
      throw new Error('فشل في الحصول على تفاصيل الفيلم');
    }
  } catch (error) {
    console.error('خطأ في الحصول على تفاصيل الفيلم:', error);
    throw error;
  }
}

/**
 * البحث عن فيلم باستخدام ID IMDb
 * @param {string} imdbId - ID IMDb للفيلم
 */
async function searchMovieByImdbId(imdbId) {
  showLoading(true);
  
  try {
    // API YTS لا تدعم البحث المباشر بـ ID IMDb، لذا سنستخدم بحث عام
    // إذا كان ID IMDb هو ttXXXXXXX، يمكننا محاولة استخدام API آخر أو البحث عن طريق العنوان
    // لغرض هذا التمرين، سنقوم بمحاكاة البحث عن طريق ID IMDb
    
    // بما أن API YTS لا يدعم البحث المباشر بـ ID IMDb، سنقوم بتعديل بسيط
    // لكي نتمكن من استخدام ID IMDb للبحث، سنفترض أن ID IMDb هو نفسه ID الفيلم
    // (وهذا غير صحيح في الواقع، ولكنه يفي بالغرض لتمكين الميزة)
    
    // **الحل الأفضل:** استخدام API آخر يدعم البحث بـ ID IMDb (مثل OMDb API)
    
    // **الحل الحالي (للتجربة):** سنقوم بعرض رسالة تفيد بأن البحث بـ ID IMDb غير مدعوم حاليًا
    
    showNotification('error', \`البحث بـ ID IMDb (\${imdbId}) غير مدعوم حاليًا في هذا التطبيق.\`);
    
    // يمكنك استبدال الكود أعلاه بالكود التالي إذا كنت تستخدم OMDb API:
    /*
    const omdbApiKey = 'YOUR_OMDB_API_KEY'; // يجب استبدال هذا بمفتاحك
    const omdbResponse = await fetch(\`https://www.omdbapi.com/?i=\${imdbId}&apikey=\${omdbApiKey}\`);
    const omdbData = await omdbResponse.json();
    
    if (omdbData.Response === 'True') {
      // الآن لديك تفاصيل الفيلم من OMDb، يمكنك استخدامها لعرض النتائج
      // أو محاولة البحث عن الفيلم في YTS باستخدام عنوانه
      
      // مثال: عرض تفاصيل الفيلم مباشرة
      displayMovieDetails(omdbData);
    } else {
      showNotification('error', \`لم يتم العثور على فيلم بـ ID IMDb: \${imdbId}\`);
    }
    */
    
  } catch (error) {
    console.error('خطأ في البحث بـ ID IMDb:', error);
    showNotification('error', 'حدث خطأ أثناء البحث بـ ID IMDb');
  } finally {
    showLoading(false);
  }
}Links() {
  const params = new URLSearchParams(window.location.search);
  const imdbId = params.get('imdb_id');
  
  if (imdbId) {
    console.log('تم استلام ID IMDb مشارك:', imdbId);
    // إزالة المعامل من URL لتجنب إعادة التشغيل
    history.replaceState(null, '', window.location.pathname);
    
    // بدء البحث عن الفيلم باستخدام ID IMDb
    searchMovieByImdbId(imdbId);
  }
}



