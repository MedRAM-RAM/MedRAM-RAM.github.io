const cron = require('node-cron');
const axios = require('axios');
const { create } = require('xmlbuilder2');
const fs = require('fs');

// إعدادات المستخدم (يمكن تخزينها في ملف أو قاعدة بيانات)
const userSettings = {
  imdbId: 'tt0944947', // مثال: معرف IMDb لمسلسل Game of Thrones
  };

  async function fetchTorrents(imdbId) {
    const response = await axios.get(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=30&page=1`);
      return response.data.torrents || [];
      }

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

                                                                                          // جدولة المهمة كل 5 دقائق
                                                                                          cron.schedule('*/5 * * * *', async () => {
                                                                                            const torrents = await fetchTorrents(userSettings.imdbId);
                                                                                              generateRSS(torrents);
                                                                                                console.log('تم تحديث خلاصة RSS');
                                                                                                });

                                                                                                // تشغيل المهمة فورًا عند البدء
                                                                                                (async () => {
                                                                                                  const torrents = await fetchTorrents(userSettings.imdbId);
                                                                                                    generateRSS(torrents);
                                                                                                    })();