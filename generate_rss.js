const axios = require('axios');
const { create } = require('xmlbuilder2');
const fs = require('fs');

async function generateRSS() {
  const url = 'https://eztvx.to/api/get-torrents?limit=100&page=1';
  try {
    const response = await axios.get(url);
    const torrents = response.data.torrents;

    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('rss', { version: '2.0' })
      .ele('channel')
      .ele('title').txt('Latest EZTV Torrents').up()
      .ele('description').txt('RSS Feed لأحدث التورنتات من EZTV').up();

    torrents.forEach(torrent => {
      root.ele('item')
        .ele('title').txt(torrent.title).up()
        .ele('link').txt(torrent.magnet_url).up()
        .ele('description').txt(`الحجم: ${torrent.size_bytes} بايت`).up()
        .ele('pubDate').txt(new Date(torrent.date_released_unix * 1000).toUTCString()).up()
        .up();
    });

    const xml = root.end({ prettyPrint: true });
    fs.writeFileSync('feed.xml', xml);
    console.log('تم توليد feed.xml بنجاح');
  } catch (error) {
    console.error('خطأ في توليد RSS:', error);
  }
}

generateRSS();
