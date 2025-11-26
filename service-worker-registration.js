if ('serviceWorker' in navigator) {
  // استخدام المسار النسبي مع تحديد النطاق بشكل صريح
  // هذا يضمن أن Service Worker يتحكم في النطاق الكامل للموقع
  navigator.serviceWorker.register('service-worker.js', { scope: './' })
    .then(registration => {
      console.log('Service Worker registered successfully with scope:', registration.scope);
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
}
