/* Share only the edition's public URL. Never read query, fragment or form fields. */
(() => {
  'use strict';
  for (const panel of document.querySelectorAll('[data-perspective-share]')) {
    const path = panel.getAttribute('data-perspective-share');
    if (!/^\/yakar-web\/perspectiva\/\d{4}-\d{2}-\d{2}\.html$/.test(path || '')) continue;
    const url = 'https://yakarnegocios.github.io' + path;
    const status = panel.querySelector('[role="status"]');
    const fallback = panel.querySelector('[data-share-fallback]');
    const copy = panel.querySelector('[data-copy-edition]');
    copy?.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
        await navigator.clipboard.writeText(url);
        fallback.hidden = true;
        status.textContent = 'Enlace copiado. Puedes compartirlo donde prefieras.';
      } catch {
        fallback.hidden = false;
        const field = fallback.querySelector('input');
        field.value = url;
        field.focus();
        field.select();
        status.textContent = 'Selecciona y copia este enlace para compartir la edición.';
      }
    });
  }
})();
