const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.YAKAR_PLAYWRIGHT_PATH || 'playwright');

const root = path.resolve(__dirname, '..');
const origin = 'https://guia.yakar.test';
const families = {
  'senalizacion-visibilidad': 'Señalización y visibilidad',
  'textil-industrial': 'Uniformes y textil industrial',
  'ferreteria-industrial': 'Suministros industriales',
  'equipamiento-industrial': 'Equipamiento industrial',
  'seguridad-industrial': 'Seguridad industrial y EPP',
  'izaje-sujecion': 'Izaje y sujeción',
};
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript',
  '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp',
};

async function run() {
  const executablePath = process.env.YAKAR_CHROMIUM_EXECUTABLE;
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const width of [320, 390, 1280]) {
      const mobile = width < 768;
      const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: mobile, hasTouch: mobile, locale: 'es-PE' });
      page.on('dialog', dialog => dialog.accept());
      try {
        await page.route('**/*', route => {
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          const file = path.resolve(root, url.pathname.slice(1) || 'index.html');
          if (!file.startsWith(root + path.sep) || !types[path.extname(file)] || !fs.existsSync(file)) return route.abort();
          return route.fulfill({ path: file, contentType: types[path.extname(file)] });
        });
        for (const [slug, family] of Object.entries(families)) {
          await page.goto(origin + '/' + slug + '.html');
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, slug + ' desborda a ' + width);
          await page.getByRole('link', { name: 'Ver qué incluye una cotización de YAKAR', exact: true }).click();
          assert.equal(new URL(page.url()).hash, '#proponemos');
          assert.equal(await page.locator('#proponemos').isVisible(), true);
          await page.goBack();
          const consultation = page.locator('main a[href="./?linea=' + slug + '#request-start"]').first();
          await consultation.click();
          assert.equal(new URL(page.url()).searchParams.get('linea'), slug);
          await page.waitForFunction(expected => document.querySelector('#family')?.value === expected, family, { timeout: 5000 });
          assert.equal(await page.locator('#request-guide').isVisible(), true);
          const help = page.locator('label[for="route-help"]');
          assert.match(await help.innerText(), /^Necesito ayuda para definir el producto/);
          await help.click();
          assert.equal(await page.locator('#family').inputValue(), family);
          await page.locator('#need').fill('Ensayo: solicitud de producto para una operación ficticia');
          await page.locator('label[for="route-defined"]').click();
          assert.equal(await page.locator('#family').inputValue(), family);
          assert.match(await page.locator('#need').inputValue(), /operación ficticia/);
        }
      } finally {
        await page.close();
      }
    }
    console.log('PASS: 18 recorridos de guía, cotización y cambio de ruta con línea precargada.');
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
