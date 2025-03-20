// دالة للحصول على IMDb ID باستخدام OMDb API
async function getImdbIdFromTitle(title) {
  const apiKey = 'your_api_key'; // استبدل بمفتاحك الخاص من OMDb
  const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
  const data = await response.json();
  return data.imdbID || null;
}

// دالة البحث باستخدام العنوان
async function searchTorrents() {
  const title = document.getElementById('title').value;

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
        displayTorrents(data.torrents); // عرض جميع التورنتات دون تصفية
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
