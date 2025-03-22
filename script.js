// script.js

const omdbApiKey = '9b8d2c00'; // استبدل بمفتاح API الخاص بك من OMDb
const resultsPerPage = 30;

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');
    const statsDiv = document.getElementById('stats');
    const paginationDiv = document.getElementById('pagination');
    const sortOptionsDiv = document.getElementById('sortOptions');
    const toggleSortOptionsButton = document.getElementById('toggleSortOptions');
    const toggleDarkModeButton = document.getElementById('toggleDarkMode');
    const body = document.body;

    let currentImdbId = null;
    
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
            .then(res => res.json())
            .then(data => {
                resultsDiv.innerHTML = '';
                console.log(data);

                if (data.torrents && data.torrents.length > 0) {
                    const torrentsData = data.torrents;
                    const totalResults = data.torrents_count || torrentsData.length;
                    statsDiv.innerHTML = `<p>عدد النتائج الإجمالي: ${totalResults}</p>`;

                    const totalPages = Math.ceil(totalResults / resultsPerPage);

torrentsData.forEach(torrent => {
                        const parsed = window.parseTorrentTitle(torrent.title);
                        if (parsed) {
                            const torrentDiv = document.createElement('div');
                            let episodeTitleHtml = parsed.episodeTitle ? `<p style="font-size: 0.9em;">${parsed.episodeTitle}</p>` : '';
                            let qualityEncodingTeam = `<b>${parsed.quality}</b> | ${parsed.encoding?.replace(/-$/, '')} ${parsed.team ? '| ' + parsed.team : ''}`;

                            torrentDiv.innerHTML = `
                                <h3>${parsed.showName} <span style="font-size: 0.8em;">S${parsed.season.toString().padStart(2, '0')}E${parsed.episode.toString().padStart(2, '0')}</span></h3>
                                ${episodeTitleHtml}
                                <p style="direction: rtl;">الحجم: ${formatFileSize(torrent.size_bytes)}</p>
                                <a href="${torrent.magnet_url}">
                                <img src="images/magnet.png" alt="الرابط المغناطيسي" class="magnet-icon">
                                    تحميل
                                </a>
                                <span>${qualityEncodingTeam}</span>
                            `;
                            resultsDiv.appendChild(torrentDiv);
                        }
                    });

                    paginationDiv.innerHTML = '';
                    for (let i = 1; i <= totalPages; i++) {
                        const button = document.createElement('button');
                        button.textContent = `الصفحة ${i}`;
                        button.addEventListener('click', () => fetchTorrents(imdbId, i));
                        paginationDiv.appendChild(button);
                    }

                    sortOptionsDiv.style.display = 'block';
                    window.initializeSortOptions(torrentsData, resultsDiv, formatFileSize);
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

    // إضافة مستمع حدث لزر تبديل الوضع المظلم
    toggleDarkModeButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
    });

    // إضافة مستمع حدث لزر تبديل خيارات الفرز على الشاشات الصغيرة (إذا كان موجودًا)
    if (toggleSortOptionsButton) {
        toggleSortOptionsButton.addEventListener('click', () => {
            sortOptionsDiv.classList.toggle('show');
        });
    }
});
