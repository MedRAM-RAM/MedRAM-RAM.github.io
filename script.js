// script.js

const omdbApiKey = '9b8d2c00'; // استبدل بمفتاح API الخاص بك من OMDb

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');
    const sortButton = document.getElementById('sortButton');
    const seasonSelect = document.getElementById('season');
    const episodeSelect = document.getElementById('episode');
    const qualitySelect = document.getElementById('quality');
    const encodingSelect = document.getElementById('encoding');
    const teamSelect = document.getElementById('team');

    let torrentsData = []; // لتخزين النتائج الأصلية

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
                        const imdbId = data.imdbID.replace('tt', '');
                        fetch(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}`)
                            .then(res => res.json())
                            .then(data => {
                                torrentsData = data.torrents || [];
                                displaySortedResults(torrentsData, resultsDiv); // عرض النتائج الأصلية
                                // إنشاء خيارات ديناميكية للجودة، الترميز، والفريق
                                populateDynamicOptions(torrentsData, 'quality', qualitySelect);
                                populateDynamicOptions(torrentsData, 'encoding', encodingSelect);
                                populateDynamicOptions(torrentsData, 'team', teamSelect);
                            })
                            .catch(error => {
                                console.error('خطأ في طلب EZTV:', error);
                                resultsDiv.innerHTML = '<p>حدث خطأ أثناء البحث في EZTV.</p>';
                            });
                    } else {
                        resultsDiv.innerHTML = '<p>العنوان غير صحيح أو ليس مسلسل.</p>';
                    }
                })
                .catch(error => {
                    console.error('خطأ في طلب OMDb:', error);
                    resultsDiv.innerHTML = '<p>حدث خطأ أثناء البحث في OMDb.</p>';
                });
        } else {
            resultsDiv.innerHTML = '<p>يرجى إدخال عنوان المسلسل.</p>';
        }
    });

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
