const fs = require('fs');
const axios = require('axios');

async function fetchWatchlist() {
    const response = await axios.get('https://api.trakt.tv/users/me/watchlist/shows', {
        headers: {
            'Authorization': `Bearer ${process.env.TRAKT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': process.env.TRAKT_CLIENT_ID
        }
    });
    return response.data.map(item => ({
        imdbId: item.show.ids.imdb.replace('tt', ''),
        title: item.show.title
    }));
}

async function fetchTorrentsForWatchlist() {
    const watchlist = await fetchWatchlist();
    const torrents = [];
    for (const item of watchlist) {
        const res = await axios.get(`https://eztvx.to/api/get-torrents?imdb_id=${item.imdbId}&limit=10&page=1`);
        if (res.data.torrents) {
            torrents.push(...res.data.torrents.map(torrent => ({
                ...torrent,
                showTitle: item.title
            })));
        }
    }
    return torrents;
}

function parseTorrentTitle(title) {
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

function formatFileSize(bytes) {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    else if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    else if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else return bytes + ' Bytes';
}

async function generateRSS() {
    const torrents = await fetchTorrentsForWatchlist();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Watchlist Torrents</title>
        <link>https://yourusername.github.io/your-repo/</link>
        <description>تورنتات من قائمة المراقبة في Trakt.tv</description>
        <language>ar</language>`;

    torrents.forEach(torrent => {
        const parsed = parseTorrentTitle(torrent.title);
        if (parsed) {
            xml += `
        <item>
            <title>${parsed.showName} S${parsed.season.toString().padStart(2, '0')}E${parsed.episode.toString().padStart(2, '0')}${parsed.episodeTitle ? ' - ' + parsed.episodeTitle : ''}</title>
            <link>${torrent.magnet_url}</link>
            <description>جودة: ${parsed.quality || 'غير محدد'} | حجم: ${formatFileSize(torrent.size_bytes)}</description>
            <pubDate>${new Date(torrent.date_released_unix * 1000).toUTCString()}</pubDate>
            <guid>${torrent.magnet_url}</guid>
        </item>`;
        }
    });

    xml += `
    </channel>
</rss>`;
    fs.writeFileSync('rss.xml', xml);
}

generateRSS().catch(console.error);