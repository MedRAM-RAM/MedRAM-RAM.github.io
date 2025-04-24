// auth.js — Google Sign-In
function handleCredentialResponse(res) {
  const payload = JSON.parse(atob(res.credential.split('.')[1]));
  // حفظ مؤقت (مثلاً localStorage) ثم الانتقال
  localStorage.setItem('user', JSON.stringify(payload));
  window.location = 'index.html';
}

window.onload = () => {
  google.accounts.id.initialize({
    client_id: '566285861664-pogmk4kjt3bk235uu22fe4dao9flttnr.apps.googleusercontent.com',
    callback: handleCredentialResponse,
    ux_mode: 'popup'
  });
  google.accounts.id.renderButton(
    document.getElementById('googleSignInBtn'),
    { theme:'outline', size:'large' }
  );
  google.accounts.id.prompt();
};
