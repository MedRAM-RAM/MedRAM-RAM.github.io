function searchTorrents() {
  const regex = /^(.+?)\s+S(\d+)E(\d+)?\s+(.*?)(480p|720p|1080p)\s+(.*?)(xvid|x264|x265|H\.?264)?(?:-|\s)([A-Za-z0-9]+)?(?:\s*\[eztv\])?$/;
  const url = `https://cors-anywhere.herokuapp.com/https://eztvx.to/api/get-torrents?limit=10&page=1`;
  const title = "Shifting Gears S01E10 720p HDTV x264-SYNCOPY [eztv]";
  const matches = title.match(regex);
  if (matches) {
      const showName = matches[1]; // "Shifting Gears"
      const season = matches[2];  // "01"
      const episode = matches[3]; // "10"
      const quality = matches[5]; // "720p"
      const codec = matches[7];   // "x264"
      const group = matches[8];   // "SYNCOPY"
  }
function searchTorrents() {
    const imdbId = document.getElementById("imdb").value;
    const query = document.getElementById("searchQuery").value;

    if (imdbId) {
        // جلب البيانات باستخدام IMDb ID من API (مثل EZTV)
        fetch(`https://eztv.to/api/get-torrents?imdb_id=${imdbId}`)
            .then(response => response.json())
            .then(data => displayResults(data.torrents));
    } else if (query) {
        // استخدام البحث العادي مع Regex
        const filteredResults = torrents.filter(torrent => {
            const matches = torrent.title.match(regex);
            return matches && matches[1].toLowerCase().includes(query.toLowerCase());
        });
        displayResults(filteredResults);
    }
}
  alert("تم الضغط على زر البحث");
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const filteredTorrents = data.torrents.filter(torrent => 
        torrent.title.toLowerCase().includes(title.toLowerCase()) && 
        torrent.quality === quality
      );
      displayTorrents(filteredTorrents);
      generateRSS(filteredTorrents);
    })
    .catch(error => console.error('خطأ:', error));
}
function displayTorrents(torrents) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  torrents.forEach(torrent => {
    const torrentElement = document.createElement('div');
    torrentElement.innerHTML = `<a href="${torrent.magnet_url}">${torrent.title}</a>`;
    resultsDiv.appendChild(torrentElement);
  });
}
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
