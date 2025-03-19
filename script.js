function searchTorrents() {
  const title = document.getElementById('title').value;
  const quality = document.getElementById('quality').value;
  const url = `https://cors-anywhere.herokuapp.com/https://eztvx.to/api/get-torrents?limit=10&page=1`;
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
