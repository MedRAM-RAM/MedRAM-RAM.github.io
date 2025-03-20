const omdbApiKey = '9b8d2c00'; // استبدل بمفتاح API الخاص بك من OMDb

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');

    searchButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        if (title) {
            fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.Response === 'True' && data.Type === 'series') {
                        const imdbId = data.imdbID.replace('tt', ''); // إزالة "tt" للحصول على الرقم
                        fetch(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}`)
                            .then(res => res.json())
                            .then(torrentsData => {
                                resultsDiv.innerHTML = '';
                                if (torrentsData.torrents && torrentsData.torrents.length > 0) {
                                    torrentsData.torrents.forEach(torrent => {
                                        const torrentDiv = document.createElement('div');
                                        torrentDiv.innerHTML = `
                                            <h3>${torrent.title}</h3>
                                            <p>الحجم: ${torrent.size_bytes} بايت</p>
                                            <a href="${torrent.magnet_url}">رابط المغناطيس</a>
                                        `;
                                        resultsDiv.appendChild(torrentDiv);
                                    });
                                } else {
                                    resultsDiv.innerHTML = '<p>لا توجد تورنتات لهذا المسلسل.</p>';
                                }
                            })
                            .catch(error => {
                                console.error('خطأ في طلب EZTV:', error);
                                resultsDiv.innerHTML = '<p>حدث خطأ أثناء البحث في EZTV. يرجى المحاولة لاحقًا.</p>';
                            });
                    } else {
                        resultsDiv.innerHTML = '<p>العنوان غير صحيح أو ليس مسلسل.</p>';
                    }
                })
                .catch(error => {
                    console.error('خطأ في طلب OMDb:', error);
                    resultsDiv.innerHTML = '<p>حدث خطأ أثناء البحث في OMDb. يرجى المحاولة لاحقًا.</p>';
                });
        } else {
            resultsDiv.innerHTML = '<p>يرجى إدخال عنوان المسلسل.</p>';
        }
    });
});
