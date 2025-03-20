// تعريف نمط Regex لتحليل العناوين
const regex = /^(.+?)\s+S(\d+)E(\d+)?\s+(.*?)(480p|720p|1080p)\s+(.*?)(xvid|x264|x265|H\.?264)?(?:-|\s)([A-Za-z0-9]+)?(?:\s*\[eztv\])?$/;

// دالة البحث العادي
function searchTorrents() {
  const title = document.getElementById('title').value.toLowerCase();
  const quality = document.getElementById('quality').value;
  const codec = document.getElementById('codec').value;
  const group = document.getElementById('group').value;
  const url = `https://cors-anywhere.herokuapp.com/https://eztvx.to/api/get-torrents?limit=100&page=1`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const filteredTorrents = data.torrents.filter(torrent => {
        const matches = torrent.title.match(regex);
        if (!matches) return false;

        const showName = matches[1].toLowerCase();
        const torrentQuality = matches[5];
        const torrentCodec = matches[7] || '';
        const torrentGroup = matches[8] || '';

        const titleMatch = title ? showName.includes(title) : true;
        const qualityMatch = quality !== 'none' ? torrentQuality === quality : true;
        const codecMatch = codec !== 'none' ? torrentCodec.toLowerCase() === codec.toLowerCase() : true;
        const groupMatch = group !== 'none' ? torrentGroup.toLowerCase() === group.toLowerCase() : true;

        return titleMatch && qualityMatch && codecMatch && groupMatch;
      });
      displayTorrents(filteredTorrents);
      generateRSS(filteredTorrents);
    })
    .catch(error => console.error('خطأ:', error));
}

// دالة البحث باستخدام IMDb ID (منفصلة تمامًا)
function searchByImdb() {
  const imdbId = document.getElementById('imdb').value;
  if (!imdbId) {
    alert('يرجى إدخال IMDb ID');
    return;
  }
  const url = `https://eztvx.to/api/get-torrents?imdb_id=${imdbId}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      displayTorrents(data.torrents);
      generateRSS(data.torrents);
    })
    .catch(error => console.error('خطأ:', error));
}

// دالة عرض النتائج
function displayTorrents(torrents) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  torrents.forEach(torrent => {
    const torrentElement = document.createElement('div');
    torrentElement.innerHTML = `<a href="${torrent.magnet_url}">${torrent.title}</a>`;
    resultsDiv.appendChild(torrentElement);
  });
}

// دالة إنشاء ملف RSS
function generateRSS(torrents) {
  let rss = '<?xml version="1.0" encoding="UTF-8"?>';
  rss += '<rss version="2.0"><channel><title>تغذية مخصصة</title>';
  torrents.forEach(torrent => {
    rss += `<item><title>${torrent.title}</title><link>${torrent.magnet_url}</link></item>`;
  });
  rss += '</channel></rss>';
  const blob = new Blob([rss], { type: 'application/rss+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'feed.xml';
  a.click();
}
