// sort.js

document.addEventListener('DOMContentLoaded', () => {
    const sortOptionsDiv = document.getElementById('sortOptions');
    const sortButton = document.getElementById('sortButton');
    const seasonSelect = document.getElementById('season');
    const episodeSelect = document.getElementById('episode');
    const qualitySelect = document.getElementById('quality');
    const encodingSelect = document.getElementById('encoding');
    const teamSelect = document.getElementById('team');
    const toggleSortOptionsButton = document.getElementById('toggleSortOptions');

    let currentTorrentsData = [];
  let currentResultsDiv = null;
    let currentFormatFileSize = null;

    // دالة لتحليل عنوان التورنت
    function parseTorrentTitle(title) {
        title = title.replace(/EZTV/gi, '').trim();
        const regex = /^(.*?)\s*S(\d{1,2})E(\d{1,2})(?:\s*(.*?))?\s*(2160p|1080p|720p|480p)?\s*(x264|x265)?\s*(?:-(\w+))?$/i;
        const match = title.match(regex);
        if (match) {
            return {
                showName: match[1].trim(),
                season: parseInt(match[2], 10),
                episode: parseInt(match[3], 10),
                episodeTitle: match[4] ? match[4].trim() : '',
                quality: match[5] ? match[5].trim() : '',
                encoding: match[6] ? match[6].trim() : '',
                team: match[7] ? match[7].trim() : ''
            };
        }
        return null;
    }

    // دالة لاستخراج المعلومات من العنوان باستخدام Regex
    function extractInfo(title) {
        const seasonEpisodeRegex = /S(\d{2})E(\d{2})/i; // S01E01
        const qualityRegex = /(2160p|1080p|720p|480p)/i; // 1080p, 720p, 480p
        const encodingRegex = /(x265|x264|H264|H 264)/i; // x265, x264
        const teamRegex = /-([A-Za-z0-9]+)(?= EZTV)/i; // الفريق قبل EZTV

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

    // دالة لإنشاء خيارات ديناميكية لقوائم الفرز
    function populateDynamicOptions(results, type, selectElement) {
        const values = results
            .map(torrent => {
                const parsed = parseTorrentTitle(torrent.title);
                return parsed ? parsed[type] : null;
            })
            .filter(value => value && value !== '');
        const uniqueValues = [...new Set(values)];
        selectElement.innerHTML = '<option value="بدون">بدون</option>';
        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
        });
    }

    // دالة لتهيئة خيارات الفرز وإضافة مستمع حدث لزر الفرز
    function initializeSortOptions(torrents, resultsDiv, formatFileSize) {
        currentTorrentsData = torrents;
        currentResultsDiv = resultsDiv;
        currentFormatFileSize = formatFileSize;

        if (qualitySelect && encodingSelect && teamSelect) {
            populateDynamicOptions(currentTorrentsData, 'quality', qualitySelect);
            populateDynamicOptions(currentTorrentsData, 'encoding', encodingSelect);
            populateDynamicOptions(currentTorrentsData, 'team', teamSelect);
        } else {
            console.error('أحد عناصر الفرز غير موجود (qualitySelect, encodingSelect, teamSelect)');
        }

        if (sortButton) {
            sortButton.addEventListener('click', () => {
                const season = seasonSelect.value;
                const episode = episodeSelect.value;
                const quality = qualitySelect.value;
                const encoding = encodingSelect.value;
                const team = teamSelect.value;

                const sortedResults = sortResults(currentTorrentsData, season, episode, quality, encoding, team);
                displaySortedResults(sortedResults, currentResultsDiv, currentFormatFileSize);
            });
        } else {
            console.error('زر الفرز غير موجود');
        }
    }

    // دالة لفرز النتائج بناءً على المعايير
    function sortResults(results, season, episode, quality, encoding, team) {
        return results.filter(torrent => {
            const parsed = parseTorrentTitle(torrent.title);
            if (!parsed) return false;

            const seasonMatch = season === 'بدون' || (season && parsed.season === parseInt(season));
            const episodeMatch = episode === 'بدون' || (episode && parsed.episode === parseInt(episode));
            const qualityMatch = quality === 'بدون' || (quality && parsed.quality?.toLowerCase() === quality.toLowerCase());
            const encodingMatch = encoding === 'بدون' || (encoding && parsed.encoding?.toLowerCase() === encoding.toLowerCase());
            const teamMatch = team === 'بدون' || (team && parsed.team?.toLowerCase() === team.toLowerCase());
            return seasonMatch && episodeMatch && qualityMatch && encodingMatch && teamMatch;
        });
    }

    // دالة لعرض النتائج المفرزة
    function displaySortedResults(results, resultsDiv, formatFileSize) {
        resultsDiv.innerHTML = '';
        if (results.length > 0) {
            results.forEach(torrent => {
                const torrentElement = createTorrentElement(torrent, formatFileSize);
                if (torrentElement) {
                    resultsDiv.appendChild(torrentElement);
                }
            });
        } else {
            resultsDiv.innerHTML = '<p>لا توجد نتائج تطابق المعايير.</p>';
        }
    }

    // دالة لإنشاء عنصر تورنت
    function createTorrentElement(torrent, formatFileSize) {
        const parsed = parseTorrentTitle(torrent.title);
        if (!parsed) return null;

        const torrentDiv = document.createElement('div');
        let episodeTitleHtml = parsed.episodeTitle ? `<p style="font-size: 0.9em;">${parsed.episodeTitle}</p>` : '';
        let infoLine = `${parsed.quality || 'غير محدد'} | ${parsed.encoding || 'غير محدد'} | ${parsed.team || 'غير محدد'}`;

        torrentDiv.innerHTML = `
            <h3>${parsed.showName} <span style="font-size: 0.8em;">S${parsed.season.toString().padStart(2, '0')}E${parsed.episode.toString().padStart(2, '0')}</span></h3>
            ${episodeTitleHtml}
            <p class="info-line" style="direction: rtl;">${infoLine}</p>
            <p style="direction: rtl;">الحجم: ${formatFileSize(torrent.size_bytes)}</p>
            <div>
                <a href="${torrent.magnet_url}" class="download-button">
                    <img src="images/magnet.png" alt="مغناطيس" class="download-icon">
                    <span>تحميل</span>
                </a>
            </div>
        `;

        return torrentDiv;
    }
    // التحقق من زر تبديل خيارات الفرز وإضافة مستمع الحدث
    if (toggleSortOptionsButton) {
        toggleSortOptionsButton.addEventListener('click', () => {
            sortOptionsDiv.classList.toggle('show');
        });
    } else {
        console.error('زر تبديل خيارات الفرز غير موجود');
    }

    // تصدير الدوال لاستخدامها في script.js
    window.initializeSortOptions = initializeSortOptions;
    window.sortResults = sortResults;
    window.displaySortedResults = displaySortedResults;
    window.parseTorrentTitle = parseTorrentTitle;
});