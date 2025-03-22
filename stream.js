// stream.js

document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results');

    resultsContainer.addEventListener('click', function(event) {
        const target = event.target;
        if (target.classList.contains('stream-magnet')) {
            event.preventDefault();
            const magnetUri = target.getAttribute('href');
            startStreaming(magnetUri);
        }
    });

    function startStreaming(magnetUri) {
        // تحقق مما إذا كان WebTorrent مدعومًا
        if (typeof WebTorrent === 'undefined') {
            alert('متصفحك لا يدعم المشاهدة المباشرة للتورنت. يرجى استخدام متصفح يدعم WebTorrent مثل Brave أو إضافة إضافة WebTorrent.');
            return;
        }

        const client = new WebTorrent();

        client.add(magnetUri, function (torrent) {
            // ابحث عن ملف فيديو أو ملف يمكن عرضه في المتصفح
            const videoFile = torrent.files.find(function (file) {
                return file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.name.endsWith('.ogg') || file.name.endsWith('.mkv'); // يمكنك إضافة المزيد من الامتدادات
            });

            if (videoFile) {
                // قم بإنشاء عنصر فيديو لعرض البث
                const videoPlayer = document.createElement('video');
                videoPlayer.controls = true;
                videoPlayer.style.width = '100%';
                resultsContainer.innerHTML = ''; // قم بإفراغ منطقة النتائج
                resultsContainer.appendChild(videoPlayer);

                // قم ببث الملف إلى عنصر الفيديو
                videoFile.renderTo(videoPlayer);

                // قم بإيقاف عميل WebTorrent عند الانتهاء (اختياري)
                // client.destroy();
            } else {
                alert('لم يتم العثور على ملف فيديو قابل للتشغيل في التورنت.');
                client.destroy();
            }
        });

        client.on('error', function (err) {
            console.error('خطأ في WebTorrent:', err);
            alert('حدث خطأ أثناء محاولة تشغيل التورنت.');
        });
    }
});
