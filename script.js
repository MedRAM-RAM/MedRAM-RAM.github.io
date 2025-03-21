// script.js

const omdbApiKey = '9b8d2c00'; // استبدل بمفتاح API الخاص بك من OMDb

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');
    const statsDiv = document.getElementById('stats');
    const paginationDiv = document.getElementById('pagination');
    const sortOptionsDiv = document.getElementById('sortOptions');
    const sortButton = document.getElementById('sortButton');
    const seasonSelect = document.getElementById('season');
    const episodeSelect = document.getElementById('episode');
    const qualitySelect = document.getElementById('quality');
    const encodingSelect = document.getElementById('encoding');
    const teamSelect = document.getElementById('team');

    let torrentsData = [];
    let currentImdbId = null;
    const resultsPerPage = 30;

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

    // دالة لتحليل عنوان التورنت
    function parseTorrentTitle(title) {
        title = title.replace(/EZTV/gi, '').trim();
        const regex = /^(.*?)\s*S(\d{1,2})E(\d{1,2})\s*(.*?)\s*(\d{3,4}p)?\s*(\w+)?\s*(\w+)?$/i;
        const match = title.match(regex);
        if (match) {
            return {
                showName: match[1].trim(),
                season: parseInt(match[2], 10),
                episode: parseInt(match[3], 10),
                episodeTitle: match[4] ? match[4].trim() : '',
                quality: match[5] ? match[5].trim() : '',
                encoding: match[6] ? match[6].trim() : '',
                team: match[7] ? match[7].trim() : ''
            };
        }
        return null;
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

    populateSeasonEpisodeOptions(seasonSelect);
    populateSeasonEpisodeOptions(episodeSelect);

    searchButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        if (title) {
            fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.Response === 'True' && data.Type === 'series') {
                        currentImdbId = data.imdbID.replace('tt', '');
                        fetchTorrents(currentImdbId, 1);
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
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
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
                    <p>الحجم: ${formatFileSize(torrent.size_bytes)}</p>
                    <a href="${torrent.magnet_url}">
                    <img src="images/magnet.png" alt="مغناطيس" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                    تحميل
                    </a>
                    `;
                    resultsDiv.appendChild(torrentDiv);
                });
                // إنشاء أزرار الصفحات
                paginationDiv.innerHTML = ''; // مسح الأزرار السابقة
                for (let i = 1; i <= totalPages; i++) {
                    const button = document.createElement('button');
                    button.textContent = `الصفحة ${i}`;
                    button.addEventListener('click', () => fetchTorrents(imdbId,.appendChild(button);
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
            resultsDiv.innerHTML = `<p>حدث خطأ أثناء البحث في EZTV. يرجى المحاولة لاحقًا. تفاصيل الخطأ: ${error.message}</p>`;
            sortOptionsDiv.style.display = 'none';
            statsDiv.innerHTML = '';
            paginationDiv.innerHTML = '';
        });
}

    // دالة لإنشاء خيارات ديناميكية
    function populateDynamicOptions(results, type, selectElement) {
        const values = results
            .map(torrent => {
                const parsed = parseTorrentTitle(torrent.title);
                return parsed ? parsed[type] : null;
            })
            .filter(value => value && value !== '');
        const uniqueValues = [...new Set(values)];
        selectElement.innerHTML = '<option value="بدون">بدون</option>';
        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
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
