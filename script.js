// الثوابت الأساسية
const API_BASE = 'https://torrents-api.ryukme.repl.co/api/theriturajps/';
const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';
const CACHE = new Map();

// المتغيرات العامة
let currentPage = 1;
let totalPages = 1;
let currentQuery = '';
let allResults = [];

// دالة البحث الرئيسية
async function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    
    if (!currentQuery) {
        showError('الرجاء إدخال كلمة بحث صحيحة');
        return;
    }
    
    showLoading();
    await fetchResults();
}

// جلب النتائج من API
async function fetchResults() {
    try {
        const cacheKey = `${currentQuery}-${currentPage}`;
        
        if (CACHE.has(cacheKey)) {
            processData(CACHE.get(cacheKey));
            return;
        }
        
        const apiUrl = `${API_BASE}${encodeURIComponent(currentQuery)}&page=${currentPage}`;
        const response = await fetch(CORS_PROXY + apiUrl);
        
        if (!response.ok) throw new Error(`خطأ في الاستجابة: ${response.status}`);
        
        const data = await response.json();
        CACHE.set(cacheKey, data);
        processData(data);
        
    } catch (error) {
        showError(`فشل الاتصال: ${error.message}`);
        console.error('تفاصيل الخطأ:', error);
    }
}

// معالجة البيانات المستلمة
function processData(data) {
    if (!data?.results?.length) {
        showError('لم يتم العثور على نتائج');
        return;
    }
    
    allResults = data.results;
    totalPages = Math.ceil(data.totalResults / 20);
    updateStats(data);
    displayResults();
    updatePagination();
}

// عرض النتائج
function displayResults() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    allResults.forEach(item => {
        const card = document.createElement('div');
        card.className = 'torrent-item';
        card.innerHTML = `
            <h3>${sanitizeHTML(item.name)}</h3>
            <div class="meta-grid">
                <div><span>📦 الحجم:</span> ${item.size || 'غير معروف'}</div>
                <div><span>📆 النشر:</span> ${formatDate(item.added)}</div>
                <div><span>🌱 البذور:</span> ${item.seeders || 0}</div>
                <div><span>⬇️ اللاتش:</span> ${item.leechers || 0}</div>
            </div>
            <div class="actions">
                <a href="${item.magnet}" class="magnet-btn" target="_blank">
                    🧲 ماغنيت
                </a>
                <a href="${item.url}" class="torrent-btn" download>
                    ⬇️ تورنت
                </a>
            </div>
        `;
        resultsDiv.appendChild(card);
    });
}

// نظام الترقيم
function updatePagination() {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    pagination.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(-1)">
            ← السابق
        </button>
        <span>الصفحة ${currentPage} من ${totalPages}</span>
        <button ${currentPage >= totalPages ? 'disabled' : ''} onclick="changePage(1)">
            التالي →
        </button>
    `;
    
    document.getElementById('results').appendChild(pagination);
}

// تغيير الصفحة
function changePage(step) {
    currentPage += step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchResults();
}

// التصفية والترتيب
function applyFilters() {
    const sortBy = document.getElementById('sortBy').value;
    
    allResults.sort((a, b) => {
        switch(sortBy) {
            case 'date':
                return new Date(b.added) - new Date(a.added);
            case 'size':
                return parseSize(a.size) - parseSize(b.size);
            default:
                return b.seeders - a.seeders;
        }
    });
    
    displayResults();
}

// ========== الدوال المساعدة ========== //
function showLoading() {
    document.getElementById('results').innerHTML = `
        <div class="loading">
            <div class="loader"></div>
            جاري البحث عن "${currentQuery}"...
        </div>
    `;
}

function showError(message) {
    document.getElementById('results').innerHTML = `
        <div class="error">⚠️ ${message}</div>
    `;
}

function updateStats(data) {
    document.getElementById('stats').innerHTML = `
        <div class="stats">
            وجدنا ${data.totalResults} نتيجة في ${data.responseTime || 'N/A'} ثانية
        </div>
    `;
}

function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseSize(sizeStr) {
    const units = { 'KB': 1, 'MB': 1024, 'GB': 1048576 };
    const [value, unit] = sizeStr?.split(' ') || [];
    return parseFloat(value) * (units[unit] || 1);
}

function formatDate(dateStr) {
    if (!dateStr) return 'غير معروف';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('ar-EG', options);
}

// تفعيل البحث بالزر Enter
document.getElementById('searchInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') handleSearch();
});