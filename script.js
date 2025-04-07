async function searchTorrents() {
    const query = document.getElementById('searchInput').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<div class="loading">جاري البحث...</div>';

    try {
        // إعداد CORS Proxy
        const proxyUrl = 'https://cors.iamrony777.workers.dev/?';
        const apiUrl = `https://torrent-api-py.vercel.app/api/search/${encodeURIComponent(query)}?limit=50`;
        
        const response = await fetch(proxyUrl + apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) throw new Error('فشل الاتصال بالخادم');
        
        const data = await response.json();
        
        resultsDiv.innerHTML = '';
        
        if(data.data.length === 0) {
            resultsDiv.innerHTML = '<div class="error">لم يتم العثور على نتائج</div>';
            return;
        }

        data.data.forEach(item => {
            const torrentHtml = `
                <div class="torrent-item">
                    <h3>${item.name}</h3>
                    <div class="meta">
                        <span>📁 ${item.size}</span>
                        <span>📆 ${item.date}</span>
                        <span>🌱 ${item.seeders}</span>
                        <span>⬇️ ${item.leechers}</span>
                    </div>
                    <a href="${item.magnet}" target="_blank" class="download-btn">
                        تحميل المغناطيس ⚡
                    </a>
                </div>
            `;
            resultsDiv.innerHTML += torrentHtml;
        });

    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="error">
                ⚠️ خطأ في الاتصال: ${error.message}<br>
                (يرجى المحاولة لاحقاً أو استخدام VPN)
            </div>
        `;
    }
}