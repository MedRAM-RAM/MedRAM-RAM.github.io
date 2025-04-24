// app.js — YTS API + PWA + Auth guard
import { fetchYTS, displayMovies } from './yts-lib.js';

// تأمين الدخول
const user = JSON.parse(localStorage.getItem('user')||'null');
if (!user) return window.location='login.html';

document.getElementById('userInfo').innerHTML = `<img src="${user.picture}" alt="" class="user-avatar"/><span>${user.name}</span>`;
document.getElementById('signoutBtn').onclick = () => {
  localStorage.removeItem('user');
  google.accounts.id.disableAutoSelect();
  window.location='login.html';
};

// بقية السكربت كما كان في app.js السابق
// … (fetchAndDisplay, installBtn, PWA, Web Share Target logic)
