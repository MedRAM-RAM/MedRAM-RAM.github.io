const axios = require('axios');
const { create } = require('xmlbuilder2');
const fs = require('fs');
const config = require('./config.json');

const omdbApiKey = '9b8d2c00'; // استبدل بمفتاح API خاص بك من OMDb

// جلب معرف IMDb بناءً على اسم المسلسل
async function getImdbId(title) {
  try {
    const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`);
    if (response.data.Response === 'True' && response.data.Type === 'series') {
      return response.data.imdbID.replace('tt', '');
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب معرف IMDb:', error.message);
    return null;
  }
}

// جلب التورنتات من EZTV
async function fetchTorrents(imdbId) {
  try {
    const response = await axios.get(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=30&page=1`);
    return response.data.torrents || [];
  } catch (error) {
    console.error('خطأ في جلب التورنتات:', error.message);
    return [];
  }
}

// إنشاء ملف RSS
function generateRSS(torrents) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('rss', { version: '2.0' })
      .ele('channel')
        .ele('title').txt('تورنتات EZTV للمسلسل').up()
        .ele('link').txt('https://medram-ram.github.io').up()
        .ele('description').txt('خلاصة RSS لتورنتات المسلسل المحدد').up()
        .ele('lastBuildDate').txt(new Date().toUTCString()).up();

  torrents.forEach(torrent => {
    root.ele('item')
      .ele('title').txt(torrent.title).up()
      .ele('link').txt(torrent.magnet_url).up()
      .ele('description').txt(`الحجم: ${(torrent.size_bytes / 1048576).toFixed(2)} MB`).up()
      .ele('pubDate').txt(new Date(torrent.date_released_unix * 1000).toUTCString()).up()
    .up();
  });

  const xml = root.end({ prettyPrint: true });
  fs.writeFileSync('rss.xml', xml);
}

// الدالة الرئيسية
async function main() {
  let imdbId = config.imdbId;
  if (!imdbId && config.title) {
    imdbId = await getImdbId(config.title);
  }
  if (imdbId) {
    const torrents = await fetchTorrents(imdbId);
    if (torrents.length > 0) {
      generateRSS(torrents);
      console.log('تم إنشاء ملف rss.xml بنجاح');
    } else {
      console.log('لم يتم العثور على تورنتات');
    }
  } else {
    console.error('لم يتم العثور على معرف IMDb صالح');
  }
}

main();