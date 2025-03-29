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

    // التحقق من زر البحث وإضافة مستمع الحدث
    if (searchButton && titleInput && resultsDiv && statsDiv && paginationDiv && sortOptionsDiv) {
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
                sortOptionsDiv.style.display = 'block';
                statsDiv.innerHTML = '';
                paginationDiv.innerHTML = '';
            }
        });
    } else {
        console.error('أحد العناصر الأساسية غير موجود (searchButton, titleInput, resultsDiv, statsDiv, paginationDiv, sortOptionsDiv)');
    }

    // دالة لجلب التورنتات بناءً على معرف IMDb ورقم الصفحة
    function fetchTorrents(imdbId, page) {
        const limit = resultsPerPage;
        fetch(`https://eztvx.to/api/get-torrents?imdb_id=${imdbId}&limit=${limit}&page=${page}`)
            .then(res => res.json())
            .then(data => {
                resultsDiv.innerHTML = '';
                if (data.torrents && data.torrents.length > 0) {
                    const torrentsData = data.torrents;
                    const totalResults = data.torrents_count || torrentsData.length;
                    statsDiv.innerHTML = `<p>عدد النتائج الإجمالي: ${totalResults}</p>`;

                    const totalPages = Math.ceil(totalResults / resultsPerPage);

                    torrentsData.forEach(torrent => {
                        const torrentElement = createTorrentElement(torrent, formatFileSize);
                        if (torrentElement) {
                            resultsDiv.appendChild(torrentElement);
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

    // التحقق من زر تبديل الوضع المظلم وإضافة مستمع الحدث
    if (toggleDarkModeButton) {
        toggleDarkModeButton.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
        });
    } else {
        console.error('زر تبديل الوضع المظلم غير موجود');
    }

    // دالة لإنشاء عنصر تورنت
    function createTorrentElement(torrent, formatFileSize) {
        const parsed = window.parseTorrentTitle(torrent.title);
        if (!parsed) return null;

        const torrentDiv = document.createElement('div');
        let episodeTitleHtml = parsed.episodeTitle ? `<p style="font-size: 0.9em;">${parsed.episodeTitle}</p>` : '';
        let infoLine = `${parsed.quality || 'غير محدد'} | ${parsed.encoding || 'غير محدد'} | ${parsed.team || 'غير محدد'}`;

        torrentDiv.innerHTML = `
            <h3>${parsed.showName} <span style="font-size: 0.8em;">S${parsed.season.toString().padStart(2, '0')}E${parsed.episode.toString().padStart(2, '0')}</span></h3>
            ${episodeTitleHtml}
            <p class="info-line" style="direction: rtl;">${infoLine}</p>
            <p style="direction: rtl;">الحجم: ${formatFileSize(torrent.size_bytes)}</p>
            <div>
                <a href="${torrent.magnet_url}" class="download-button">
                    <img src="images/magnet.png" alt="مغناطيس" class="download-icon">
                    <span>تحميل</span>
                </a>
            </div>
        `;

        return torrentDiv;
    }
    document.getElementById('saveRssSettings').addEventListener('click', () => {
          const input = document.getElementById('rssTitle').value.trim();
            if (input.startsWith('tt')) {
                // افترض أنه معرف IMDb
                    fetch('/save-rss', {
                          method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ imdbId: input.replace('tt', '') })
                                          });
                                            } else {
                                                // ابحث عن معرف IMDb باستخدام OMDb
                                                    fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(input)}&apikey=${omdbApiKey}`)
                                                          .then(response => response.json())
                                                                .then(data => {
                                                                        if (data.Response === 'True' && data.Type === 'series') {
                                                                                  fetch('/save-rss', {
                                                                                              method: 'POST',
                                                                                                          headers: { 'Content-Type': 'application/json' },
                                                                                                                      body: JSON.stringify({ imdbId: data.imdbID.replace('tt', '') })
                                                                                                                                });
                                                                                                                                        }
                                                                                                                                              });
                                                                                                                                                }
    })
});