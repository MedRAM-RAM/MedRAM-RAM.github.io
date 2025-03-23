const apiKey = 'e70657df8691d788bdfdbb7c95028459db5b919b0091f94795786475ef481703'; // استبدل هذا بمفتاح API الخاص بك
const baseUrl = 'https://api.trakt.tv';

async function searchMedia() {
    const query = document.getElementById('searchInput').value;
    if (!query) {
        alert('يرجى إدخال اسم للبحث');
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/search/movie,show?query=${query}`, {
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                'trakt-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('فشل في جلب البيانات');
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('خطأ:', error);
        document.getElementById('results').innerHTML = '<p>حدث خطأ أثناء البحث.</p>';
    }
}

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (data.length === 0) {
        resultsContainer.innerHTML = '<p>لم يتم العثور على نتائج.</p>';
        return;
    }

    data.forEach(item => {
        const type = item.type;
        const media = item[type];
        const title = media.title;
        const year = media.year || 'غير معروف';
        const overview = media.overview || 'لا يوجد وصف';

        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.innerHTML = `
            <h3>${title}</h3>
            <p>السنة: ${year}</p>
            <p>${overview.substring(0, 50)}...</p>
        `;
        resultsContainer.appendChild(resultItem);
    });
}