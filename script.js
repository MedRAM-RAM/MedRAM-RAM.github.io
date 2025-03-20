// دالة للحصول على IMDb ID باستخدام OMDb API
async function getImdbIdFromTitle(title) {
  const apiKey = '9b8d2c00'; // استبدل بمفتاحك الخاص من OMDb
  const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
  const data = await response.json();
  console.log('OMDb Response:', data); // سجل استجابة OMDb
  return data.imdbID || null;
}

// دالة البحث باستخدام العنوان
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
  console.log('IMDb ID:', imdbId); // سجل IMDb ID

  const url = `https://cors-anywhere.herokuapp.com/https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=100`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('EZTV Response:', data); // سجل استجابة EZTV
      if (data.torrents) {
        const filteredTorrents = data.torrents.filter(torrent => {
          const matches = torrent.title.match(/^(.+?)\s+S(\d+)E(\d+)?\s+(.*?)(480p|720p|1080p)\s+(.*?)(xvid|x264|x265|H\.?264)?(?:-|\s)([A-Za-z0-9]+)?(?:\s*\[eztv\])?$/);
          if (!matches) return false;

          const torrentQuality = matches[5];
          const torrentCodec = matches[7] || '';
          const torrentGroup = matches[8] || '';

          const qualityMatch = quality === 'none' || torrentQuality === quality;
          const codecMatch = codec === 'none' || torrentCodec.toLowerCase() === codec.toLowerCase();
          const groupMatch = !group || torrentGroup.toLowerCase() === group.toLowerCase();

          return qualityMatch && codecMatch && groupMatch;
        });
        console.log('Filtered Torrents:', filteredTorrents); // سجل النتائج المصفاة
        displayTorrents(filteredTorrents);
      } else {
        alert('لم يتم العثور على تورنتات');
      }
    })
    .catch(error => console.error('خطأ:', error));
}

// دالة البحث باستخدام IMDb ID
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
      } else {
        alert('لم يتم العثور على تورنتات لهذا الـ ID');
      }
    })
    .catch(error => console.error('خطأ:', error));
}

// دالة لعرض النتائج
function displayTorrents(torrents) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  torrents.forEach(torrent => {
    const torrentElement = document.createElement('div');
    torrentElement.innerHTML = `<a href="${torrent.magnet_url}">${torrent.title}</a>`;
    resultsDiv.appendChild(torrentElement);
  });
}
