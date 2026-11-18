// Regression for the public request journey. No external navigation occurs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {JSDOM} = require(process.env.YAKAR_JSDOM_PATH || 'jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');

async function page(t, address = 'https://laboratorio.yakar.test/') {
  const dom = new JSDOM(html, {url: address, runScripts: 'outside-only'});
  const {window} = dom;
  t.after(() => window.close());
  window.matchMedia = () => ({matches: false, addEventListener() {}});
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.eval(script);
  await new Promise(resolve => window.document.addEventListener('DOMContentLoaded', resolve, {once: true}));
  return {window, find: selector => window.document.querySelector(selector)};
}

function fillCore(find) {
  find('#route-help').click();
  find('#need').value = 'Necesito una eslinga para evaluar con Logística.';
  find('#contact').value = 'Persona de laboratorio';
  find('#email').value = 'prueba@example.test';
}

test('la ruta de orientación acepta una consulta sin clasificar y un contacto', async t => {
  const {find} = await page(t);
  fillCore(find);
  assert.equal(find('#family').value, 'Por definir');
  find('.submit-button').click();
  const summary = find('#summary-local').value;
  assert.equal(find('.local-review').hidden, false);
  assert.match(summary, /Tipo de requerimiento: Por definir/);
  assert.match(summary, /Correo: prueba@example.test/);
  assert.doesNotMatch(summary, /Empresa u organización:|Fecha requerida de entrega:|Condición crítica:|Teléfono:/);
  assert.match(find('.local-review .notice').textContent, /aún no enviado/);
});

test('se conserva la categoría de origen y las dos fechas se distinguen', async t => {
  const {find} = await page(t, 'https://laboratorio.yakar.test/?linea=izaje-sujecion');
  fillCore(find);
  assert.equal(find('#family').value, 'Izaje y sujeción');
  find('#purchaseReference').value = 'RFQ-008';
  find('#quoteDeadline').value = '2026-11-24';
  find('#neededBy').value = '2026-12-18';
  find('.submit-button').click();
  const summary = find('#summary-local').value;
  assert.match(summary, /Referencia de compra: RFQ-008/);
  assert.match(summary, /Fecha límite para recibir cotizaciones: 24\/11\/2026/);
  assert.match(summary, /Fecha requerida de entrega: 18\/12\/2026/);
  assert.match(summary, /Guía consultada: Izaje y sujeción/);
  assert.equal(new URL(find('[data-whatsapp]').href).searchParams.get('text'), summary);
  assert.equal(new URL(find('[data-email]').href).searchParams.get('body'), summary);
});

test('el texto largo se copia completo y los enlaces abren sin incluir el borrador', async t => {
  const {find, window} = await page(t);
  fillCore(find);
  const phrase = 'Comparte la revisión técnica con el área usuaria. ';
  find('#need').value = phrase.repeat(70);
  find('.submit-button').click();
  const value = find('#summary-local').value;
  assert.ok(value.includes(phrase.trim()));
  assert.equal(find('[data-long-summary]').hidden, false);
  assert.equal(find('.local-review .actions').firstElementChild, find('[data-copy]'));
  assert.equal(new URL(find('[data-whatsapp]').href).search, '');
  assert.equal(new URL(find('[data-email]').href).searchParams.has('body'), false);
  let copied;
  Object.defineProperty(window, 'isSecureContext', {value: true});
  Object.defineProperty(window.navigator, 'clipboard', {value: {async writeText(text) { copied = text; }}});
  find('[data-copy]').click();
  await new Promise(setImmediate);
  assert.equal(copied, value);
  assert.match(find('[data-status]').textContent, /Pégalo/);
});

test('el resumen vacío retira opciones de envío y el Unicode incompleto no las rompe', async t => {
  const {find, window} = await page(t);
  fillCore(find);
  find('.submit-button').click();
  const summary = find('#summary-local');
  const edit = value => {
    summary.value = value;
    summary.dispatchEvent(new window.Event('input'));
  };
  edit('');
  assert.equal(find('[data-copy]').disabled, true);
  assert.equal(find('[data-whatsapp]').hasAttribute('href'), false);
  assert.equal(find('[data-email]').hasAttribute('href'), false);
  edit('Pieza 🛠️\uD800');
  assert.equal(new URL(find('[data-whatsapp]').href).searchParams.get('text'), 'Pieza 🛠️\uFFFD');
});

test('copiar antes de que cambie el texto no marca la edición posterior como conservada', async t => {
  const {find, window} = await page(t);
  fillCore(find);
  find('.submit-button').click();
  let complete;
  Object.defineProperty(window, 'isSecureContext', {value: true});
  Object.defineProperty(window.navigator, 'clipboard', {value: {writeText: () => new Promise(resolve => {complete = resolve;})}});
  find('[data-copy]').click();
  find('#summary-local').value += '\nNueva edición';
  complete();
  await new Promise(setImmediate);
  assert.match(find('[data-status]').textContent, /Resumen copiado/);
  const exit = new window.Event('beforeunload', {cancelable: true});
  window.dispatchEvent(exit);
  assert.equal(exit.defaultPrevented, true);
});
