window.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const moviesContainer = document.getElementById('moviesContainer');
    
    // تهيئة البحث
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const movies = await fetchMovies(e.target.value);
            displayMovies(movies);
        }, 500);
    });

    // تحميل الأفلام الأولية
    loadInitialMovies();
});

async function loadInitialMovies() {
    const movies = await fetchMovies();
    displayMovies(movies);
}

async function fetchMovies(query = '') {
    try {
        const url = `https://yts.mx/api/v2/list_movies.json?query_term=${query}&sort_by=year`;
        const response = await fetch(url);
        const data = await response.json();
        return data.data?.movies || [];
    } catch (error) {
        console.error('حدث خطأ في جلب البيانات:', error);
        return [];
    }
}

function displayMovies(movies) {
    moviesContainer.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <img src="${movie.medium_cover_image}" class="movie-poster" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>📅 السنة: ${movie.year}</p>
                <p>⭐ التقييم: ${movie.rating}/10</p>
                
                <div class="torrents-list">
                    ${movie.torrents.map(torrent => `
                        <a href="${torrent.url}" 
                           class="torrent-btn quality-${torrent.quality}"
                           download>
                            🎬 ${torrent.quality} 
                            <small>(${torrent.size})</small>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}