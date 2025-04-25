// دالة معالجة الاستجابة من Google Identity Services
function handleCredentialResponse(response) {
  // response.credential هو JWT مشفّر
  console.log('Encoded JWT ID token: ' + response.credential);
  // هنا ترسل response.credential إلى الخادم للتحقق وإنشاء الجلسة
}

// عند تحميل الصفحة
window.onload = function() {
  google.accounts.id.initialize({
    client_id: '566285861664-pogmk4kjt3bk235uu22fe4dao9flttnr.apps.googleusercontent.com',
    callback: handleCredentialResponse,
    ux_mode: 'popup'
  });
  // عرض زر تسجيل الدخول بمظهر داكن
  google.accounts.id.renderButton(
    document.querySelector('.g_id_signin'),
    { theme: 'filled_black', size: 'large' }
  );
  // تفعيل One Tap prompt تلقائيًا
  google.accounts.id.prompt();
};