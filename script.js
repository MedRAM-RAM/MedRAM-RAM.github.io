// دالة للحصول على IMDb ID باستخدام OMDb API
async function getImdbIdFromTitle(title) {
  const apiKey = '9b8d2c00'; // مفتاح OMDb API الخاص بك
  const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
  const data = await response.json();
  console.log('OMDb Response:', data); // سجل للتحقق من الاستجابة
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
  console.log('IMDb ID:', imdbId); // سجل للتحقق من IMDb ID

  const url = `https://cors-anywhere.herokuapp.com/https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=100`;
  fetch(url, {
    headers: {
      'x-requested-with': 'XMLHttpRequest' // الرأس المطلوب لتجنب مشاكل CORS
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('EZTV Response:', data); // سجل للتحقق من استجابة EZTV
    if (data.torrents) {
      displayTorrents(data.torrents); // عرض التورنتات
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
  fetch(url, {
    headers: {
      'x-requested-with': 'XMLHttpRequest' // الرأس المطلوب لتجنب مشاكل CORS
    }
  })
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
