const omdbApiKey = '9b8d2c00'; // استبدل بمفتاح API الخاص بك من OMDb

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');
    const statsDiv = document.getElementById('stats'); // لعرض الإحصائية
    const paginationDiv = document.getElementById('pagination'); // لعرض أزرار الصفحات

    let currentImdbId = null; // لتخزين معرف IMDb الحالي
    const resultsPerPage = 30; // عدد النتائج لكل صفحة

    searchButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        if (title) {
            fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.Response === 'True' && data.Type === 'series') {
                        currentImdbId = data.imdbID.replace('tt', ''); // إزالة "tt" للحصول على الرقم
                        fetchTorrents(currentImdbId, 1); // جلب الصفحة الأولى
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
        const limit = resultsPerPage;
        fetch(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=${limit}&page=${page}`)
            .then(res => res.json())
            .then(torrentsData => {
                resultsDiv.innerHTML = ''; // مسح النتائج السابقة
                if (torrentsData.torrents && torrentsData.torrents.length > 0) {
                    // عرض الإحصائية
                    const totalResults = torrentsData.torrents_count; // عدد النتائج الإجمالي
                    statsDiv.innerHTML = `<p>عدد النتائج الإجمالي: ${totalResults}</p>`;

                    // حساب عدد الصفحات
                    const totalPages = Math.ceil(totalResults / resultsPerPage);

                    // عرض النتائج
                    torrentsData.torrents.forEach(torrent => {
                        const torrentDiv = document.createElement('div');
                        torrentDiv.innerHTML = `
                            <h3>${torrent.title}</h3>
                            <p>الحجم: ${torrent.size_bytes} بايت</p>
                            <a href="${torrent.magnet_url}">رابط المغناطيس</a>
                        `;
                        resultsDiv.appendChild(torrentDiv);
                    });

                    // إنشاء أزرار الصفحات
                    paginationDiv.innerHTML = ''; // مسح الأزرار السابقة
                    for (let i = 1; i <= totalPages; i++) {
                        const button = document.createElement('button');
                        button.textContent = `الصفحة ${i}`;
                        button.addEventListener('click', () => {
                            fetchTorrents(currentImdbId, i);
                        });
                        paginationDiv.appendChild(button);
                    }
                } else {
                    resultsDiv.innerHTML = '<p>لا توجد تورنتات لهذا المسلسل.</p>';
                }
            })
            .catch(error => {
                console.error('خطأ في طلب EZTV:', error);
                resultsDiv.innerHTML = '<p>حدث خطأ أثناء البحث في EZTV. يرجى المحاولة لاحقًا.</p>';
            });
    }
});
