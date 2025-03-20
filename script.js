document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const imdbIdInput = document.getElementById('imdbId');
    const resultsDiv = document.getElementById('results');

    searchButton.addEventListener('click', () => {
        const imdbId = imdbIdInput.value.trim();
        if (imdbId) {
            fetch(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}`)
                .then(response => response.json())
                .then(data => {
                    resultsDiv.innerHTML = ''; // مسح النتائج السابقة
                    if (data.torrents && data.torrents.length > 0) {
                        data.torrents.forEach(torrent => {
                            const torrentDiv = document.createElement('div');
                            torrentDiv.innerHTML = `
                                <h3>${torrent.title}</h3>
                                <p>الحجم: ${torrent.size_bytes} بايت</p>
                                <a href="${torrent.magnet_url}">رابط المغناطيس</a>
                            `;
                            resultsDiv.appendChild(torrentDiv);
                        });
                    } else {
                        resultsDiv.innerHTML = '<p>لا توجد نتائج لهذا المعرف.</p>';
                    }
                })
                .catch(error => {
                    console.error('خطأ:', error);
                    resultsDiv.innerHTML = '<p>حدث خطأ أثناء البحث. يرجى المحاولة لاحقًا.</p>';
                });
        } else {
            resultsDiv.innerHTML = '<p>يرجى إدخال معرف IMDb صالح.</p>';
        }
    });
});
