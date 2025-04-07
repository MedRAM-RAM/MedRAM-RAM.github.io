async function searchTorrents() {
    const query = document.getElementById('query').value;
    const limit = document.getElementById('limit').value;
    const resultsDiv = document.getElementById('results');
    
    if(!query) return alert('الرجاء إدخال مصطلح البحث');
    
    try {
        const response = await fetch(`https://torrent-api-4qib.onrender.com/api?query=${query}&limit=${limit}`);
        const data = await response.json();
        
        resultsDiv.innerHTML = data.map(torrent => `
            <div class="torrent-item">
                <h3>${torrent.name}</h3>
                <p>الحجم: ${torrent.size}</p>
                <p>البذور: ${torrent.seeds}</p>
                <a class="magnet-link" href="${torrent.magnet}">تحميل المغناطيس</a>
            </div>
        `).join('');
    } catch (error) {
        resultsDiv.innerHTML = '<p>حدث خطأ أثناء جلب النتائج</p>';
    }
}