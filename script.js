// script.js

const omdbApiKey = '9b8d2c00'; // استبدل بمفتاح API الخاص بك من OMDb

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');
    const statsDiv = document.getElementById('stats'); // لعرض عدد النتائج الإجمالي
    const paginationDiv = document.getElementById('pagination'); // لعرض أزرار الصفحات
    const sortOptionsDiv = document.getElementById('sortOptions');
    const sortButton = document.getElementById('sortButton');
    const seasonSelect = document.getElementById('season');
    const episodeSelect = document.getElementById('episode');
    const qualitySelect = document.getElementById('quality');
    const encodingSelect = document.getElementById('encoding');
    const teamSelect = document.getElementById('team');

    let torrentsData = []; // لتخزين النتائج الأصلية
    let currentImdbId = null; // لتخزين معرف IMDb الحالي
    const resultsPerPage = 30; // عدد النتائج لكل صفحة
    // دالة لتحويل الحجم من البايت إلى الوحدة المناسبة
    // دالة لتحويل الحجم من البايت إلى الوحدة المناسبة
    function formatFileSize(bytes) {
        if (bytes >= 1073741824) {
            return (bytes / 1073741824).toFixed(2) + ' GB';
        } else if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
        } else if (bytes >= 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return bytes + ' Bytes';
        }
    }
    // إنشاء خيارات الموسم والحلقة من 1 إلى 30
    function populateSeasonEpisodeOptions(selectElement) {
        selectElement.innerHTML = '<option value="بدون">بدون</option>';
        for (let i = 1; i <= 30; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            selectElement.appendChild(option);
        }
    }

    // تهيئة خيارات الموسم والحلقة عند تحميل الصفحة
    populateSeasonEpisodeOptions(seasonSelect);
    populateSeasonEpisodeOptions(episodeSelect);

    // حدث البحث
    searchButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        if (title) {
            fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.Response === 'True' && data.Type === 'series') {
                        currentImdbId = data.imdbID.replace('tt', ''); // إزالة "tt" من معرف IMDb
                        fetchTorrents(currentImdbId, 1); // جلب الصفحة الأولى
                    } else {
                        resultsDiv.innerHTML = '<p>العنوان غير صحيح أو ليس مسلسل.</p>';
                        sortOptionsDiv.style.display = 'none';
                        statsDiv.innerHTML = '';
                        paginationDiv.innerHTML = '';
                    }
                })
                .catch(error => {
                    console.error('خطأ في طلب OMDb:', error);
                    resultsDiv.innerHTML = '<p>حدث خطأ أثناء البحث في OMDb. يرجى المحاولة لاحقًا.</p>';
                    sortOptionsDiv.style.display = 'none';
                    statsDiv.innerHTML = '';
                    paginationDiv.innerHTML = '';
                });
        } else {
            resultsDiv.innerHTML = '<p>يرجى إدخال عنوان المسلسل.</p>';
            sortOptionsDiv.style.display = 'none';
            statsDiv.innerHTML = '';
            paginationDiv.innerHTML = '';
        }
    });

    // دالة لجلب التورنتات بناءً على معرف IMDb ورقم الصفحة
    function fetchTorrents(imdbId, page) {
        const limit = resultsPerPage;
        fetch(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=${limit}&page=${page}`)
            .then(res => res.json())
            .then(data => {
                resultsDiv.innerHTML = ''; // مسح النتائج السابقة
                console.log(data); // طباعة الاستجابة للتحقق من هيكلها

                if (data.torrents && data.torrents.length > 0) {
                    torrentsData = data.torrents; // تخزين النتائج الأصلية
                    const totalResults = data.torrents_count || torrentsData.length; // العدد الإجمالي للنتائج
                    statsDiv.innerHTML = `<p>عدد النتائج الإجمالي: ${totalResults}</p>`; // عرض الإحصائية

                    // حساب عدد الصفحات
                    const totalPages = Math.ceil(totalResults / resultsPerPage);

                    // عرض النتائج
                    torrentsData.forEach(torrent => {
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
                        button.addEventListener('click', () => fetchTorrents(imdbId, i));
                        paginationDiv.appendChild(button);
                    }

                    // إظهار خيارات الفرز
                    sortOptionsDiv.style.display = 'block';
                    populateDynamicOptions(torrentsData, 'quality', qualitySelect);
                    populateDynamicOptions(torrentsData, 'encoding', encodingSelect);
                    populateDynamicOptions(torrentsData, 'team', teamSelect);
                } else {
                    resultsDiv.innerHTML = '<p>لا توجد تورنتات لهذا المسلسل.</p>';
                    sortOptionsDiv.style.display = 'none';
                    statsDiv.innerHTML = '';
                    paginationDiv.innerHTML = '';
                }
            })
            .catch(error => {
                console.error('خطأ في طلب EZTV:', error);
                resultsDiv.innerHTML = '<p>حدث خطأ أثناء البحث في EZTV. يرجى المحاولة لاحقًا.</p>';
                sortOptionsDiv.style.display = 'none';
                statsDiv.innerHTML = '';
                paginationDiv.innerHTML = '';
            });
    }

    // دالة لإنشاء خيارات ديناميكية للجودة، الترميز، والفريق
    function populateDynamicOptions(results, type, selectElement) {
        const options = createDynamicOptions(results, type);
        selectElement.innerHTML = '<option value="بدون">بدون</option>';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    // حدث الفرز
    sortButton.addEventListener('click', () => {
        const season = seasonSelect.value;
        const episode = episodeSelect.value;
        const quality = qualitySelect.value;
        const encoding = encodingSelect.value;
        const team = teamSelect.value;

        const sortedResults = sortResults(torrentsData, season, episode, quality, encoding, team);
        displaySortedResults(sortedResults, resultsDiv);
    });
});
// دالة لجلب التورنتات بناءً على معرف IMDb ورقم الصفحة
function fetchTorrents(imdbId, page) {
    const limit = resultsPerPage;
    fetch(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=${limit}&page=${page}`)
        .then(res => res.json())
        .then(torrentsData => {
            resultsDiv.innerHTML = ''; // مسح النتائج السابقة
            console.log(torrentsData); // طباعة الاستجابة للتحقق من هيكلها

            if (torrentsData.torrents && torrentsData.torrents.length > 0) {
                // تحديد العدد الإجمالي للنتائج مع قيمة احتياطية
                const totalResults = torrentsData.torrents_count || torrentsData.torrents.length;
                statsDiv.innerHTML = `<p>عدد النتائج الإجمالي: ${totalResults}</p>`;

                // حساب عدد الصفحات مع ضمان وجود صفحة واحدة على الأقل
                const totalPages = torrentsData.torrents_count
                    ? Math.ceil(totalResults / resultsPerPage)
                    : 1;

                // عرض النتائج
                torrentsData.torrents.forEach(torrent => {
                    const torrentDiv = document.createElement('div');
                    torrentDiv.innerHTML = `
                        <h3>${torrent.title}</h3>
                        <p>الحجم: ${formatFileSize(torrent.size_bytes)}</p>
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
                        fetchTorrents(imdbId, i); // استخدام imdbId بدلاً من currentImdbId
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
