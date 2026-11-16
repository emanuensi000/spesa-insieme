if ('serviceWorker' in navigator) {
  let reloading = false;
  const controlled = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (controlled && !reloading) { reloading = true; location.reload(); }
  });
  navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).then(registration => {
    const activate = () => registration.waiting?.postMessage({type: 'SKIP_WAITING'});
    activate();
    registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', activate));
    const check = () => { if (!document.hidden) registration.update().catch(() => {}); };
    check();
    document.addEventListener('visibilitychange', check);
    window.addEventListener('pageshow', check);
    window.addEventListener('online', check);
  }).catch(() => {});
}
