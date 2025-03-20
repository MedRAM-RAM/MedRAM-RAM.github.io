// تعريف نمط Regex لتحليل العناوين
const regex = /^(.+?)\s+S(\d+)E(\d+)?\s+(.*?)(480p|720p|1080p)\s+(.*?)(xvid|x264|x265|H\.?264)?(?:-|\s)([A-Za-z0-9]+)?(?:\s*\[eztv\])?$/;

// دالة للحصول على IMDb ID من OMDb API باستخدام العنوان
async function getImdbIdFromTitle(title) {
  const apiKey = '9b8d2c00'; // استبدل بمفتاحك الخاص من OMDb
  const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
  const data = await response.json();
  return data.imdbID || null;
}

// دالة البحث باستخدام العنوان (تحويله إلى IMDb ID ثم جلب التورنتات)
async function searchTorrents() {
  const title = document.getElementById('title').value;
  const quality = document.getElementById('quality').value;
  const codec = document.getElementById('codec').value;
  const group = document.getElementById('group').value;

  if (!title) {
    alert('يرجى إدخال عنوان');
    return;
  }

  const imdbId = await getImdbIdFromTitle(title);
  if (!imdbId) {
    alert('لم يتم العثور على IMDb ID لهذا العنوان');
    return;
  }

  const url = `https://cors-anywhere.herokuapp.com/https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=100`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.torrents) {
        const filteredTorrents = data.torrents.filter(torrent => {
          const matches = torrent.title.match(regex);
          if (!matches) return false;

          const torrentQuality = matches[5];
          const torrentCodec = matches[7] || '';
          const torrentGroup = matches[8] || '';

          const qualityMatch = quality !== 'none' ? torrentQuality === quality : true;
          const codecMatch = codec !== 'none' ? torrentCodec.toLowerCase() === codec.toLowerCase() : true;
          const groupMatch = group !== 'none' ? torrentGroup.toLowerCase() === group.toLowerCase() : true;

          return qualityMatch && codecMatch && groupMatch;
        });
        displayTorrents(filteredTorrents);
        generateRSS(filteredTorrents);
      } else {
        alert('لم يتم العثور على تورنتات لهذا العنوان');
      }
    })
    .catch(error => console.error('خطأ:', error));
}

// دالة البحث المباشر باستخدام IMDb ID
function searchByImdb() {
  const imdbId = document.getElementById('imdb').value;
  if (!imdbId) {
    alert('يرجى إدخال IMDb ID');
    return;
  }

  const url = `https://cors-anywhere.herokuapp.com/https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=100`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.torrents) {
        displayTorrents(data.torrents);
        generateRSS(data.torrents);
      } else {
        alert('لم يتم العثور على تورنتات لهذا الـ ID');
      }
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
