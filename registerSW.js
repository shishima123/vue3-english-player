if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/vue3-english-player/sw.js', { scope: '/vue3-english-player/' })})}