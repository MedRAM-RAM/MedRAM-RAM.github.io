const omdbApiKey = '9b8d2c00'; // استبدل بمفتاح API الخاص بك من OMDb

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');
    const paginationDiv = document.createElement('div'); // لعرض أزرار الصفحات
    document.body.appendChild(paginationDiv);

    let currentImdbId = null; // لتخزين معرف IMDb الحالي

    searchButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        if (title) {
            fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.Response === 'True' && data.Type === 'series') {
                        currentImdbId = data.imdbID.replace('tt', ''); // إزالة "tt" للحصول على الرقم
                        paginationDiv.innerHTML = ''; // مسح الأزرار السابقة
                        // إنشاء أزرار الصفحات من 1 إلى 10
                        for (let i = 1; i <= 10; i++) {
                            const button = document.createElement('button');
                            button.textContent = `الصفحة ${i}`;
                            button.addEventListener('click', () => {
                                fetchTorrents(currentImdbId, i);
                            });
                            paginationDiv.appendChild(button);
                        }
                        // جلب الصفحة الأولى افتراضياً
                        fetchTorrents(currentImdbId, 1);
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

    // دالة لجلب التورنتات بناءً على معرف IMDb ورقم الصفحة
    function fetchTorrents(imdbId, page) {
        const limit = 100;
        fetch(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=${limit}&page=${page}`)
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
                    resultsDiv.innerHTML = '<p>لا توجد تورنتات في هذه الصفحة.</p>';
                }
            })
            .catch(error => {
                console.error('خطأ في طلب EZTV:', error);
                resultsDiv.innerHTML = '<p>حدث خطأ أثناء البحث في EZTV. يرجى المحاولة لاحقًا.</p>';
            });
    }
});
