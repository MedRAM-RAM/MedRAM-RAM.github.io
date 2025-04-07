async function searchTorrents() {
    const query = document.getElementById('searchInput').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'جاري البحث...';

    try {
        const response = await fetch(`https://torrent-api-py.vercel.app/api/search/${query}?limit=50`);
        const data = await response.json();
        
        resultsDiv.innerHTML = '';
        data.data.forEach(item => {
            const torrentHtml = `
                <div class="torrent-item">
                    <h3>${item.name}</h3>
                    <p>📁 الحجم: ${item.size}</p>
                    <p>📆 تاريخ التحميل: ${item.date}</p>
                    <p>🔗 البذور: ${item.seeders} - ⬇️ اللاتش: ${item.leechers}</p>
                    <a href="${item.magnet}" target="_blank" class="download-btn">تحميل المغناطيس</a>
                </div>
            `;
            resultsDiv.innerHTML += torrentHtml;
        });
    } catch (error) {
        resultsDiv.innerHTML = '⚠️ خطأ في جلب النتائج';
    }
}