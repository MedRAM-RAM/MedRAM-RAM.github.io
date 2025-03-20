// عنوان وسيط CORS (قد تحتاج إلى تفعيله من https://cors-anywhere.herokuapp.com/corsdemo)
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const eztvApi = 'https://eztvx.to/api/get-torrents';
const omdbApi = 'http://www.omdbapi.com/?apikey=9b8d2c00'; // استبدل بمفتاح OMDb API الخاص بك

// دالة مساعدة لإرسال طلبات fetch مع معالجة CORS
async function fetchWithCors(url) {
  try {
    const response = await fetch(`${corsProxy}${url}`, {
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('خطأ في الطلب:', error);
    alert('حدث خطأ أثناء البحث، تحقق من الاتصال');
    return null;
  }
}

// 1. البحث باستخدام IMDb ID
async function searchByImdb() {
  const imdbId = document.getElementById('imdb').value;
  if (!imdbId) {
    alert('يرجى إدخال IMDb ID');
    return;
  }

  const url = `${eztvApi}?imdb_id=${imdbId}&limit=10&page=1`;
  const data = await fetchWithCors(url);
  if (data && data.torrents) {
    displayTorrents(data.torrents);
  } else {
    alert('لم يتم العثور على تورنتات لهذا الـ ID');
  }
}

// 2. البحث باستخدام العنوان (تحويل العنوان إلى IMDb ID أولاً)
async function searchByTitle() {
  const title = document.getElementById('title').value;
  if (!title) {
    alert('يرجى إدخال عنوان');
    return;
  }

  const omdbUrl = `${omdbApi}&t=${encodeURIComponent(title)}`;
  const omdbData = await fetch(omdbUrl).then(res => res.json());
  
  if (omdbData.Response === 'True') {
    const imdbId = omdbData.imdbID.replace('tt', ''); // إزالة "tt" من المعرف
    const url = `${eztvApi}?imdb_id=${imdbId}&limit=10&page=1`;
    const data = await fetchWithCors(url);
    if (data && data.torrents) {
      displayTorrents(data.torrents);
    } else {
      alert('لم يتم العثور على تورنتات لهذا العنوان');
    }
  } else {
    alert('لم يتم العثور على العنوان');
  }
}

// 3. تحويل العنوان إلى IMDb ID ثم البحث
async function searchByTitleToImdb() {
  const title = document.getElementById('title-to-imdb').value;
  if (!title) {
    alert('يرجى إدخال عنوان');
    return;
  }

  const omdbUrl = `${omdbApi}&t=${encodeURIComponent(title)}`;
  const omdbData = await fetch(omdbUrl).then(res => res.json());
  
  if (omdbData.Response === 'True') {
    const imdbId = omdbData.imdbID.replace('tt', '');
    const url = `${eztvApi}?imdb_id=${imdbId}&limit=10&page=1`;
    const data = await fetchWithCors(url);
    if (data && data.torrents) {
      displayTorrents(data.torrents);
    } else {
      alert('لم يتم العثور على تورنتات لهذا العنوان');
    }
  } else {
    alert('لم يتم العثور على العنوان');
  }
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
