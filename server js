const express = require('express');
const app = express();
app.use(express.json());

app.post('/save-rss', (req, res) => {
      userSettings.imdbId = req.body.imdbId;
        res.send('تم حفظ الإعدادات');
});

app.use(express.static('public')); // لخدمة ملفات الموقع
app.listen(3000, () => console.log('الخادم يعمل على المنفذ 3000'));