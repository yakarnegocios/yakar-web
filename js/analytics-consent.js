/* YAKAR: basic opt-in analytics. Never read or transmit form values or share URLs. */
(() => {
  'use strict';
  const ID = 'G-QJM564HFVY';
  const KEY = 'yakar-analytics-choice-v1';
  const DURATION = 180 * 24 * 60 * 60 * 1000;
  const TITLES = Object.freeze({
    '/yakar-web/': 'YAKAR · Abastecimiento estratégico',
    '/yakar-web/index.html': 'YAKAR · Abastecimiento estratégico',
    '/yakar-web/metodo.html': 'Nuestro método | YAKAR',
    '/yakar-web/integridad.html': 'Integridad comercial | YAKAR',
    '/yakar-web/senalizacion-visibilidad.html': 'Señalización y visibilidad | YAKAR',
    '/yakar-web/seguridad-industrial.html': 'Seguridad industrial y EPP | YAKAR',
    '/yakar-web/textil-industrial.html': 'Textil industrial | YAKAR',
    '/yakar-web/ferreteria-industrial.html': 'Suministros industriales | YAKAR',
    '/yakar-web/equipamiento-industrial.html': 'Equipamiento industrial | YAKAR',
    '/yakar-web/perspectiva/': 'Perspectiva YAKAR',
    '/yakar-web/perspectiva/index.html': 'Perspectiva YAKAR',
    '/yakar-web/perspectiva/2026-11-01.html': 'Perspectiva YAKAR · 1 de noviembre de 2026',
    '/yakar-web/perspectiva/2026-11-08.html': 'Perspectiva YAKAR · 8 de noviembre de 2026',
    '/yakar-web/privacidad.html': 'Privacidad | YAKAR'
  });
  if (location.hostname !== 'yakarnegocios.github.io' || !Object.hasOwn(TITLES, location.pathname)) return;
  const path = location.pathname === '/yakar-web/index.html' ? '/yakar-web/' : location.pathname === '/yakar-web/perspectiva/index.html' ? '/yakar-web/perspectiva/' : location.pathname;
  const safeUrl = location.origin + path;
  let choice = null;
  let initialized = false;
  let banner, status;
  window['ga-disable-' + ID] = true;

  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      if (value && ['accepted', 'rejected'].includes(value.choice) && Number.isFinite(value.at)
          && value.at <= Date.now() && Date.now() - value.at < DURATION) return value.choice;
    } catch { /* No storage means ask again; the site remains fully usable. */ }
    return null;
  }
  function safeReferrer() {
    try {
      const ref = new URL(document.referrer);
      if (ref.origin === location.origin && Object.hasOwn(TITLES, ref.pathname)) return ref.origin + ref.pathname;
      const origins = {
        'www.google.com':'https://www.google.com/', 'www.google.com.pe':'https://www.google.com.pe/',
        'www.bing.com':'https://www.bing.com/', 'www.linkedin.com':'https://www.linkedin.com/',
        'linkedin.com':'https://www.linkedin.com/', 'www.instagram.com':'https://www.instagram.com/',
        'instagram.com':'https://www.instagram.com/', 'l.instagram.com':'https://www.instagram.com/'
      };
      return origins[ref.hostname] || '';
    } catch { return ''; }
  }
  function gtag() { window.dataLayer.push(arguments); }
  function activate() {
    if (choice !== 'accepted') return;
    window['ga-disable-' + ID] = false;
    if (initialized) return;
    initialized = true;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', false);
    gtag('set', {page_location:safeUrl, page_referrer:safeReferrer(), page_title:TITLES[location.pathname]});
    gtag('consent', 'update', {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    gtag('js', new Date());
    gtag('config', ID, {
      send_page_view:false, allow_google_signals:false, allow_ad_personalization_signals:false,
      cookie_domain:'none', cookie_path:'/yakar-web/', cookie_expires:15552000, cookie_update:false,
      cookie_flags:'SameSite=Lax;Secure', page_location:safeUrl, page_referrer:safeReferrer(),
      page_title:TITLES[location.pathname]
    });
    gtag('event', 'page_view', {send_to:ID, page_location:safeUrl, page_referrer:safeReferrer(), page_title:TITLES[location.pathname]});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    script.referrerPolicy = 'no-referrer';
    script.dataset.yakarAnalytics = 'true';
    script.onerror = () => { if (status) status.textContent = 'La medición no pudo cargarse. Puedes seguir usando la web normalmente.'; };
    document.head.append(script);
  }
  // Fixed vocabulary only. Ignore any caller-supplied text, reference or URL.
  window.yakarMeasure = action => {
    if (choice !== 'accepted' || !initialized || window['ga-disable-' + ID]) return;
    const events = {
      summary_prepared:['yakar_summary_prepared', null],
      whatsapp_opened:['yakar_channel_opened', 'whatsapp'],
      email_opened:['yakar_channel_opened', 'email'],
      summary_copied:['yakar_summary_copied', null],
      brochure_mobile_selected:['yakar_brochure_selected', null, 'mobile'],
      brochure_a4_selected:['yakar_brochure_selected', null, 'a4']
    };
    if (!Object.hasOwn(events, action)) return;
    const [name, channel, format] = events[action];
    const parameters = {send_to:ID, page_location:safeUrl, page_referrer:safeReferrer(), page_title:TITLES[location.pathname]};
    if (channel) parameters.channel = channel;
    if (format) parameters.brochure_format = format;
    gtag('event', name, parameters);
  };
  function clearAnalyticsCookies() {
    for (const item of document.cookie.split(';')) {
      const name = item.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const cookiePath of ['/yakar-web/', '/']) {
        document.cookie = name + '=; Max-Age=0; Path=' + cookiePath + '; SameSite=Lax; Secure';
      }
    }
  }
  function saveChoice(next) {
    choice = next;
    try { localStorage.setItem(KEY, JSON.stringify({choice:next, at:Date.now()})); } catch { /* Choice remains valid for this page. */ }
    if (next === 'accepted') activate();
    else {
      // Google Analytics' opt-out flag stops collection on this document, including after consent withdrawal.
      window['ga-disable-' + ID] = true;
      clearAnalyticsCookies();
    }
    banner.hidden = true;
    document.querySelector('.yakar-measurement-settings')?.focus({preventScroll:true});
    status.textContent = next === 'accepted' ? 'Medición aceptada. Puedes cambiar tu elección en Preferencias de medición.' : 'Medición rechazada. Puedes usar toda la web y cambiar tu elección en Preferencias de medición.';
  }
  function render() {
    const style = document.createElement('style');
    style.textContent = '.yakar-measurement{position:fixed;right:16px;bottom:16px;z-index:1000;box-sizing:border-box;width:calc(100% - 32px);max-width:580px;max-height:calc(100vh - 32px);overflow:auto;margin:0;padding:18px 22px;box-shadow:0 8px 30px #1b3a6b26;border:1px solid #c5d2e5;border-radius:6px;background:#f4f7fb;color:#20354f;font:15px/1.6 system-ui}.yakar-measurement h2{margin:0 0 8px;font-size:18px;color:#1b3a6b}.yakar-measurement p{margin:0 0 12px;max-width:78ch}.yakar-measurement a{color:#1b3a6b;text-decoration:underline}.yakar-measurement-actions{display:flex;gap:12px;flex-wrap:wrap}.yakar-measurement button,.yakar-measurement-settings{font:inherit;cursor:pointer;padding:10px 16px;min-height:44px;border:1px solid #1b3a6b;border-radius:4px;background:white;color:#1b3a6b}.yakar-measurement button:focus-visible,.yakar-measurement-settings:focus-visible{outline:3px solid #3674bc;outline-offset:3px}.yakar-measurement-tools{max-width:1200px;margin:12px auto;padding:12px 20px;font:13px/1.5 system-ui;color:#536174}.yakar-measurement-tools p{margin:6px 0}.yakar-measurement[hidden]{display:none}@media(max-width:650px){.yakar-measurement{right:12px;bottom:12px;width:calc(100% - 24px);max-height:55dvh;margin:0;padding:16px}}';
    document.head.append(style);
    banner = document.createElement('section');
    banner.className = 'yakar-measurement';
    banner.setAttribute('aria-labelledby', 'measurement-title');
    banner.innerHTML = '<h2 id="measurement-title" tabindex="-1">Tu privacidad, tu decisión</h2><p>Con tu permiso, usamos Google Analytics y cookies para entender cómo se utiliza esta web y mejorarla.</p><p>Tu requerimiento y tus datos de contacto no se envían a Analytics. Puedes navegar sin aceptar. <a href="/yakar-web/privacidad.html#medicion-web">Ver política de privacidad</a>.</p><div class="yakar-measurement-actions"><button type="button" data-accept>Aceptar</button><button type="button" data-reject>Continuar sin aceptar</button></div>';
    banner.hidden = !!choice;
    document.body.append(banner);
    const tools = document.createElement('div');
    tools.className = 'yakar-measurement-tools';
    const settings = document.createElement('button');
    settings.type = 'button'; settings.className = 'yakar-measurement-settings'; settings.textContent = 'Preferencias de medición';
    status = document.createElement('p');status.setAttribute('role', 'status');status.setAttribute('aria-live', 'polite');
    tools.append(settings, status);document.body.append(tools);
    settings.addEventListener('click', () => { banner.hidden = false; banner.querySelector('h2').focus(); banner.scrollIntoView({block:'center'}); });
    banner.querySelector('[data-accept]').addEventListener('click', () => saveChoice('accepted'));
    banner.querySelector('[data-reject]').addEventListener('click', () => saveChoice('rejected'));
    for (const link of document.querySelectorAll('a[data-brochure-format]')) {
      const format = link.dataset.brochureFormat;
      if (format === 'mobile' || format === 'a4') {
        link.addEventListener('click', () => window.yakarMeasure('brochure_' + format + '_selected'));
      }
    }
    activate();
  }
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    choice = readChoice();
    if (choice === 'accepted') activate();
    else { window['ga-disable-' + ID] = true; clearAnalyticsCookies(); }
    if (banner) banner.hidden = !!choice;
  });
  choice = readChoice();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, {once:true}); else render();
})();


