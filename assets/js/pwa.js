if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrato:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker fallito:', error);
      });
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  const installBtn = document.createElement('button');
  installBtn.textContent = '📱 Installa App';
  installBtn.className = 'install-btn';
  installBtn.onclick = async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') installBtn.remove();
    deferredPrompt = null;
  };
  document.querySelector('.app-header')?.appendChild(installBtn);
});