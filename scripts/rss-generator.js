const fs = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");

const config = require("../config.json");
const RSS_DIR = path.join(__dirname, "../public/rss");

// دالة لتوليد هاش للمحتوى
function getHash(content) {
  return crypto.createHash("md5").update(content).digest("hex");
}

async function generateRSS() {
  let needsUpdate = false;

  for (const series of config.series) {
    const imdbId = series.imdb_id.replace("tt", "");
    const url = `https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=100`;

    try {
      const response = await axios.get(url);
      const torrents = response.data.torrents || [];

      // إنشاء محتوى RSS
      const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${series.title} Torrents</title>
    <link>https://eztvx.to</link>
    <description>آخر تورنتات ${series.title}</description>
    <ttl>3</ttl> <!-- تحديث كل 3 دقائق -->
    ${torrents
      .map(
        (torrent) => `
    <item>
      <title>${torrent.title}</title>
      <link>${torrent.magnet_url}</link>
      <pubDate>${new Date(torrent.date_released_unix * 1000).toUTCString()}</pubDate>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

      // التحقق من التغييرات
      const filePath = path.join(RSS_DIR, `${series.imdb_id}.xml`);
      const oldContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
      const newHash = getHash(rssContent);
      const oldHash = getHash(oldContent);

      if (newHash !== oldHash) {
        fs.writeFileSync(filePath, rssContent);
        needsUpdate = true;
      }
    } catch (error) {
      console.error(`Error updating ${series.title}:`, error.message);
    }
  }

  return needsUpdate;
}

generateRSS().then((needsUpdate) => {
  process.exit(needsUpdate ? 0 : 1);
});