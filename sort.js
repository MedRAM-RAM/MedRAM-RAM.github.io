// sort.js

// دالة لفرز النتائج بناءً على المعايير المحددة
function sortResults(results, season, episode, quality, encoding, team) {
    return results.filter(torrent => {
        const title = torrent.title.toLowerCase();
        // مطابقة رقم الموسم (SXX)
        const seasonMatch = season ? title.includes(`s${season.toString().padStart(2, '0')}`) : true;
        // مطابقة رقم الحلقة (EXX)
        const episodeMatch = episode ? title.includes(`e${episode.toString().padStart(2, '0')}`) : true;
        // مطابقة الجودة (مثل 1080p, 720p, 480p)
        const qualityMatch = quality ? title.includes(quality.toLowerCase()) : true;
        // مطابقة الترميز (مثل x265, x264)
        const encodingMatch = encoding ? title.includes(encoding.toLowerCase()) : true;
        // مطابقة الفريق (مثل EZTV, MeGusta, MiNX)
        const teamMatch = team ? title.includes(team.toLowerCase()) : true;

        // إرجاع النتيجة إذا تطابقت جميع المعايير
        return seasonMatch && episodeMatch && qualityMatch && encodingMatch && teamMatch;
    });
}

// دالة لعرض النتائج المفرزة
function displaySortedResults(results, resultsDiv) {
    resultsDiv.innerHTML = '';
    if (results.length > 0) {
        results.forEach(torrent => {
            const torrentDiv = document.createElement('div');
            torrentDiv.innerHTML = `
                <h3>${torrent.title}</h3>
                <p>الحجم: ${torrent.size_bytes} بايت</p>
                <a href="${torrent.magnet_url}">رابط المغناطيس</a>
            `;
            resultsDiv.appendChild(torrentDiv);
        });
    } else {
        resultsDiv.innerHTML = '<p>لا توجد نتائج تطابق المعايير.</p>';
    }
}
