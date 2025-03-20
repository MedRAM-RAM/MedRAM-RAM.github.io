// sort.js

// دالة لاستخراج المعلومات من العنوان باستخدام Regex
function extractInfo(title) {
    const seasonEpisodeRegex = /S(\d{2})E(\d{2})/i; // S01E01
    const qualityRegex = /(1080p|720p|480p)/i; // 1080p, 720p, 480p
    const encodingRegex = /(x265|x264)/i; // x265, x264
    const teamRegex = /-(?!EZTV)([A-Za-z0-9]+)(?= EZTV)/i; // الفريق قبل EZTV

    const seasonEpisodeMatch = title.match(seasonEpisodeRegex);
    const qualityMatch = title.match(qualityRegex);
    const encodingMatch = title.match(encodingRegex);
    const teamMatch = title.match(teamRegex);

    return {
        season: seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[1]) : null,
        episode: seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[2]) : null,
        quality: qualityMatch ? qualityMatch[0].toLowerCase() : null,
        encoding: encodingMatch ? encodingMatch[0].toLowerCase() : null,
        team: teamMatch ? teamMatch[1].toLowerCase() : null
    };
}

// دالة لإنشاء خيارات ديناميكية للجودة، الترميز، والفريق
function createDynamicOptions(results, type) {
    const uniqueValues = new Set();
    results.forEach(torrent => {
        const info = extractInfo(torrent.title);
        if (info[type]) {
            uniqueValues.add(info[type]);
        }
    });
    return Array.from(uniqueValues);
}

// دالة لفرز النتائج بناءً على المعايير
function sortResults(results, season, episode, quality, encoding, team) {
    return results.filter(torrent => {
        const info = extractInfo(torrent.title);
        const seasonMatch = season === 'بدون' || (season && info.season === parseInt(season));
        const episodeMatch = episode === 'بدون' || (episode && info.episode === parseInt(episode));
        const qualityMatch = quality === 'بدون' || (quality && info.quality === quality.toLowerCase());
        const encodingMatch = encoding === 'بدون' || (encoding && info.encoding === encoding.toLowerCase());
        const teamMatch = team === 'بدون' || (team && info.team === team.toLowerCase());
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
