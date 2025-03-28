const fs = require('fs');
const path = require('path');
const axios = require('axios');

const config = require('../config.json');
const RSS_DIR = path.join(__dirname, '../public/rss');

async function generateRSS() {
    for (const series of config.series) {
        const imdbId = series.imdb_id.replace('tt', '');
        const url = `https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=100`;
        
        try {
            const response = await axios.get(url);
            const torrents = response.data.torrents || [];
            
            const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>${series.title} Torrents</title>
        <link>https://eztvx.to</link>
        <description>آخر تورنتات ${series.title}</description>
        <ttl>60</ttl>
        ${torrents.map(torrent => `
        <item>
            <title>${torrent.title}</title>
            <link>${torrent.magnet_url}</link>
            <pubDate>${new Date(torrent.date_released_unix * 1000).toUTCString()}</pubDate>
        </item>
        `).join('')}
    </channel>
</rss>`;

            fs.writeFileSync(
                path.join(RSS_DIR, `${series.imdb_id}.xml`),
                rssContent
            );
        } catch (error) {
            console.error(`Error for ${series.title}:`, error);
        }
    }
}

generateRSS();