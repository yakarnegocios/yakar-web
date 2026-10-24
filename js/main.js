/*
 * YAKAR V3 — interacciones de la web pública.
 *
 * Este archivo:
 * - Controla el menú y los hitos del método.
 * - Prepara un resumen editable del requerimiento.
 * - Permite copiarlo o abrir correo y WhatsApp.
 *
 * No registra solicitudes en una base de datos.
 * No envía mensajes automáticamente.
 * No genera un código oficial de expediente.
 * Solo la revisión personal de Perspectiva usa almacenamiento local opcional.
 */

'use strict';

const YAKAR = Object.freeze({
  email: 'negocios.yakar@gmail.com',
  whatsapp: '51973669004'
});

const MILESTONES = [
  {
    title: 'Entendemos',
    description:
      'Precisamos el uso, el alcance y la fecha deseada. Puedes empezar con una idea o con una especificación.',
    result: 'Una necesidad definida contigo.'
  },
  {
    title: 'Proponemos',
    description:
      'Evaluamos las características, la viabilidad y las condiciones. La propuesta identifica alcance, entregables, precio y plazo.',
    result: 'Una propuesta que puedes evaluar.'
  },
  {
    title: 'Acordamos',
    description:
      'Confirmamos por escrito el alcance, las condiciones y los responsables. Cuando corresponde, revisamos diseño, muestra o documentación técnica.',
    result: 'Un compromiso claro antes de ejecutar.'
  },
  {
    title: 'Coordinamos',
    description:
      'Damos seguimiento a las acciones y los hitos acordados. Si surge un cambio, revisamos contigo sus efectos antes de continuar.',
    result: 'Avances y cambios con seguimiento.'
  },
  {
    title: 'Respondemos',
    description:
      'Revisamos la entrega o los resultados contra lo acordado, registramos la conformidad y coordinamos las observaciones pendientes.',
    result: 'Resultados revisados y observaciones con seguimiento.'
  }
];

const REQUEST_HINTS = {
  'Productos y suministros':
    'Indica el producto, uso y cantidad. Para uniformes: prendas, materiales, tallas y personalización. Para tecnología: programas, configuración o compatibilidad necesaria.',

  Servicios:
    'Describe el equipo o proceso, su situación actual y el resultado que buscas. Para motores: modelo, serie y horas de funcionamiento, si los conoces.',

  Proyectos:
    'Indica el objetivo, la ubicación y el alcance conocido. Menciona si cuentas con planos, expediente técnico, presupuesto o una fecha de referencia.',

  'Necesito orientación':
    'Describe qué necesitas resolver y las condiciones que conoces. Podemos ayudarte a identificar la información que falta.'
};

function prefersReducedMotion() {
  return window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
}

function scrollToElement(element) {
  element.scrollIntoView({
    block: 'nearest',
    behavior: prefersReducedMotion() ? 'auto' : 'smooth'
  });
}

/* Menú */

function initializeMenu() {
  const button = document.querySelector('.menu-button');
  const navigation = document.getElementById('main-nav');

  if (!button || !navigation) return;

  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute(
      'aria-label',
      open ? 'Cerrar menú' : 'Abrir menú'
    );

    navigation.classList.toggle('is-open', open);
  }

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    setOpen(!open);
  });

  navigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      button.getAttribute('aria-expanded') === 'true'
    ) {
      setOpen(false);
      button.focus();
    }
  });

  window.matchMedia('(min-width: 901px)').addEventListener(
    'change',
    event => {
      if (event.matches) setOpen(false);
    }
  );
}

/* Método: cursor, teclado y toque */

function initializeRoadmap() {
  const buttons = [
    ...document.querySelectorAll('.roadmap-track button')
  ];

  const panel = document.getElementById('milestone-detail');
  const progress = document.querySelector('.route-lit');

  if (!panel || buttons.length !== MILESTONES.length) return;

  const title = panel.querySelector('span');
  const description = panel.querySelector('p');
  const result = panel.querySelector('strong');

  if (!title || !description || !result) return;

  const compact = window.matchMedia('(max-width: 760px)');
  const home = document.createComment(
    'Ubicación del detalle en escritorio'
  );

  panel.before(home);
  panel.setAttribute('role', 'region');

  let selected = 0;

  buttons.forEach((button, index) => {
    if (!button.id) {
      button.id = `milestone-button-${index + 1}`;
    }
  });

  function placePanel() {
    if (compact.matches) {
      buttons[selected].after(panel);
    } else {
      home.after(panel);
    }
  }

  function activate(index) {
    selected = index;
    const milestone = MILESTONES[index];

    buttons.forEach((button, position) => {
      const active = position === index;

      button.classList.toggle('active', active);
      button.setAttribute('aria-expanded', String(active));

      button.closest('li').classList.toggle(
        'is-reached',
        position < index
      );
    });

    title.textContent = `Hito 0${index + 1} / ${milestone.title}`;
    description.textContent = milestone.description;
    result.textContent = milestone.result;

    panel.setAttribute('aria-labelledby', buttons[index].id);
    placePanel();

    progress?.setAttribute(
      'stroke-dasharray',
      `${index * 250} 1000`
    );
  }

  buttons.forEach((button, index) => {
    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && !compact.matches) {
        activate(index);
      }
    });

    button.addEventListener('focus', () => activate(index));
    button.addEventListener('click', () => activate(index));

    button.addEventListener('keydown', event => {
      let next;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = (index + 1) % buttons.length;
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          next = (index - 1 + buttons.length) % buttons.length;
          break;

        case 'Home':
          next = 0;
          break;

        case 'End':
          next = buttons.length - 1;
          break;

        default:
          return;
      }

      event.preventDefault();
      buttons[next].focus();
    });
  });

  compact.addEventListener('change', placePanel);
  activate(0);
}

/* Requerimiento: preparación local del resumen */

function initializeRequest() {
  const form = document.getElementById('request-form');
  const card = document.querySelector('.request-card');
  if (!form || !card) return;

  const family = form.elements.namedItem('family');
  const need = form.elements.namedItem('need');
  const hint = document.getElementById('need-hint');
  const step = document.getElementById('request-step');
  const intro = document.getElementById('request-form-intro');
  if (!family || !need || !hint) return;
  const initialHint = hint.textContent.trim();
  let lastForm = '';

  // Fixed markup only. Visitor data is always written as text/value.
  const errors = document.createElement('div');
  errors.className = 'request-errors';
  errors.hidden = true;
  errors.tabIndex = -1;
  errors.setAttribute('role', 'region');
  errors.setAttribute('aria-labelledby', 'request-errors-title');
  errors.innerHTML = '<h4 id="request-errors-title">Revisa estos datos para continuar</h4><ul></ul>';
  form.prepend(errors);

  const review = document.createElement('section');
  review.className = 'local-review';
  review.hidden = true;
  review.innerHTML = `
    <h3 tabindex="-1">Revisa y comparte tu resumen</h3>
    <p class="notice"><strong>Resumen preparado; aún no enviado.</strong><br>Elige WhatsApp o correo y pulsa Enviar en esa aplicación.</p>
    <label for="summary-local">Puedes corregir el texto antes de compartirlo.</label>
    <textarea id="summary-local" class="summary-local" rows="10" spellcheck="true" aria-describedby="summary-hint"></textarea>
    <p class="field-hint" id="summary-hint">Si vuelves y cambias el formulario, se preparará un nuevo resumen. Copia aquí cualquier detalle que quieras conservar.</p>
    <p class="notice" data-long-summary hidden>Tu resumen es extenso. Para conservarlo completo, usa «Copiar resumen» y pégalo en tu correo o WhatsApp; comprueba el texto antes de enviarlo.</p>
    <div class="actions">
      <a class="btn" data-whatsapp target="_blank" rel="noopener noreferrer">Abrir WhatsApp para enviar</a>
      <a class="btn outline" data-email>Abrir correo para enviar</a>
      <button type="button" class="btn outline" data-copy>Copiar resumen</button>
      <button type="button" class="btn text" data-back>Corregir formulario</button>
    </div>
    <p class="small" role="status" aria-live="polite" data-status></p>
    <div class="request-next">
      <h4>¿Qué sigue?</h4>
      <ol><li>Envía el resumen desde tu correo o WhatsApp. Allí puedes adjuntar fotos o fichas, si las tienes.</li><li>Al recibir tu consulta, revisaremos contigo los datos que falten y las condiciones para evaluar una propuesta.</li></ol>
      <p class="small">Abrir una aplicación o copiar el texto no confirma recepción. Conserva una copia antes de cerrar esta página.</p>
    </div>
    <details class="request-conditions"><summary>Antes de acordar una atención</summary><p class="small">Compartir el resumen no confirma precio, disponibilidad, plazo ni aceptación. Cada requerimiento está sujeto a evaluación. Para entidades públicas, este resumen no constituye una oferta presentada en una plataforma oficial.</p></details>
  `;
  card.append(review);

  const summary = review.querySelector('textarea');
  const heading = review.querySelector('h3');
  const status = review.querySelector('[data-status]');
  const copyButton = review.querySelector('[data-copy]');
  const emailLink = review.querySelector('[data-email]');
  const whatsappLink = review.querySelector('[data-whatsapp]');
  const backButton = review.querySelector('[data-back]');
  const longSummary = review.querySelector('[data-long-summary]');
  const draftTools = document.createElement('div');
  draftTools.innerHTML = '<button type="button" class="btn outline" data-copy-draft>Copiar lo escrito</button><p class="field-hint" role="status" data-draft-status>Lo escrito se mantiene mientras esta página siga abierta. Copia tu consulta antes de cerrarla.</p><textarea aria-label="Copia de lo escrito, aún no enviado" rows="6" readonly hidden data-draft-copy></textarea>';
  form.append(draftTools);
  const draftStatus = draftTools.querySelector('[data-draft-status]');
  const draftCopy = draftTools.querySelector('[data-draft-copy]');
  const signature = () => JSON.stringify([...new FormData(form).entries()]) + summary.value;
  let copiedSignature = signature();
  window.addEventListener('beforeunload', event => {
    const hasDraft = summary.value.trim() || [...new FormData(form).entries()].some(([name,value]) => name !== 'family' && String(value).trim());
    if (!hasDraft) return;
    if (signature() === copiedSignature) return;
    event.preventDefault();
    event.returnValue = '';
  });
  form.addEventListener('input', () => { draftCopy.hidden = true; });
  const dateField = form.elements.namedItem('neededBy');
  const dateHint = document.getElementById('date-hint');
  const normalDateHint = dateHint?.textContent;
  dateField?.addEventListener('change', () => {
    const today = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Lima', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());
    if (dateHint) dateHint.textContent = dateField.value && dateField.value < today
      ? 'La fecha indicada ya pasó. Revísala o explica en tu necesidad si es una referencia histórica. No constituye un plazo confirmado.'
      : normalDateHint;
  });
  draftTools.querySelector('[data-copy-draft]').addEventListener('click', async () => {
    const text = 'YAKAR — BORRADOR AÚN NO ENVIADO\n\n' + [...new FormData(form).entries()].filter(([,value]) => String(value).trim()).map(([name,value]) => {
      const field = form.elements.namedItem(name);
      return (field?.labels?.[0]?.textContent.trim() || name) + ': ' + String(value).trim();
    }).join('\n') + '\n\nEsta copia no acredita envío ni recepción.';
    try {
      await navigator.clipboard.writeText(text);
      copiedSignature = signature();
      draftStatus.textContent = 'Copia preparada. Pégala en un lugar que controles para conservarla; todavía no se ha enviado.';
    } catch {
      draftCopy.value = text;
      draftCopy.hidden = false;
      draftCopy.focus();
      draftCopy.select();
      draftStatus.textContent = 'Seleccionamos el texto. Usa la opción Copiar de tu dispositivo y consérvalo antes de cerrar.';
    }
  });

  function showForm() {
    form.hidden = false;
    review.hidden = true;
    if (intro) intro.hidden = false;
    if (step) step.textContent = 'PASO 1 DE 2';
  }

  function updateHint() {
    hint.textContent = REQUEST_HINTS[family.value] || initialHint;
  }

  function updateShareLinks() {
    const value = summary.value.trim();
    const available = value.length > 0;
    copyButton.disabled = !available;
    [emailLink, whatsappLink].forEach(link => {
      link.setAttribute('aria-disabled', String(!available));
      if (!available) link.removeAttribute('href');
    });
    if (!available) { longSummary.hidden = true; return; }
    const subject = encodeURIComponent('Requerimiento para YAKAR');
    const body = encodeURIComponent(value);
    longSummary.hidden = body.length <= 1800;
    emailLink.href = `mailto:${YAKAR.email}?subject=${subject}&body=${body}`;
    whatsappLink.href = `https://wa.me/${YAKAR.whatsapp}?text=${body}`;
  }

  function clearErrors() {
    errors.hidden = true;
    errors.querySelector('ul').replaceChildren();
    form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
    form.querySelectorAll('[data-field-error]').forEach(message => {
      const field = document.getElementById(message.dataset.fieldError);
      const ids = (field?.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== message.id);
      if (field) {
        if (ids.length) field.setAttribute('aria-describedby', ids.join(' '));
        else field.removeAttribute('aria-describedby');
      }
      message.remove();
    });
  }

  function validate() {
    clearErrors();
    const issues = [];
    function issue(name, text) { issues.push({field: form.elements.namedItem(name), text}); }
    if (!family.value) issue('family', 'Elige el tipo de requerimiento. Si tienes dudas, selecciona Necesito orientación.');
    if (!need.value.trim()) issue('need', 'Cuéntanos qué necesitas o qué resultado buscas.');
    if (!form.elements.namedItem('contact').value.trim()) issue('contact', 'Indica tu nombre para dirigirnos a ti.');
    const email = form.elements.namedItem('email');
    const phone = form.elements.namedItem('phone');
    email.value = email.value.trim();
    phone.value = phone.value.trim();
    if (!email.value && !phone.value) issue('email', 'Escribe un correo o un teléfono. Con uno de los dos basta.');
    if (email.value && !email.validity.valid) issue('email', 'Revisa el correo. Ejemplo: nombre@empresa.pe.');
    const digits = phone.value.replace(/\D/g, '');
    if (phone.value && (!/^\+?[0-9() .-]+$/.test(phone.value) || digits.length < 7 || digits.length > 15 || /^(\d)\1+$/.test(digits))) issue('phone', 'Revisa el teléfono: incluye entre 7 y 15 dígitos y, si corresponde, el código de país.');
    if (!issues.length) return true;
    for (const {field, text} of issues) {
      field.setAttribute('aria-invalid', 'true');
      const message = document.createElement('small');
      message.id = `${field.id}-error`;
      message.dataset.fieldError = field.id;
      message.className = 'field-error';
      message.textContent = text;
      field.after(message);
      field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), message.id].filter(Boolean).join(' '));
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + field.id;
      link.textContent = text;
      link.addEventListener('click', event => { event.preventDefault(); field.focus(); });
      li.append(link);
      errors.querySelector('ul').append(li);
    }
    errors.hidden = false;
    errors.focus({preventScroll: true});
    scrollToElement(errors);
    return false;
  }

  family.addEventListener('change', updateHint);
  document.querySelectorAll('a[href="#request-start"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      showForm();
      const value = link.dataset.requestFamily;
      if ([...family.options].some(option => option.value === value)) family.value = value;
      updateHint();
      family.focus({preventScroll: true});
      card.scrollIntoView({block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth'});
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validate()) return;
    const data = new FormData(form);
    const signature = JSON.stringify([...data.entries()]);
    if (signature !== lastForm || !summary.value.trim()) {
      const value = name => String(data.get(name) || '').trim();
      const date = value('neededBy').split('-');
      const fields = [
        ['Tipo de requerimiento', value('family')],
        ['Contacto', value('contact')],
        ['Correo', value('email')],
        ['Teléfono', value('phone')],
        ['Empresa u organización', value('company')],
        ['Cantidad o alcance aproximado', value('quantity')],
        ['Fecha deseada', value('neededBy') ? `${date[2]}/${date[1]}/${date[0]}` : ''],
        ['Ubicación o entrega', value('location')]
      ];
      summary.value = [
        'YAKAR — RESUMEN DE REQUERIMIENTO', '',
        ...fields.filter(([, text]) => text).map(([label, text]) => `${label}: ${text}`),
        '', 'NECESIDAD Y CONTEXTO', value('need'), '',
        'Solicitud sujeta a evaluación y propuesta comercial.',
        'La fecha deseada no constituye un plazo confirmado.',
        'Este resumen no acredita envío, registro ni aceptación.'
      ].join('\n');
      lastForm = signature;
    }
    updateShareLinks();
    form.hidden = true;
    if (intro) intro.hidden = true;
    review.hidden = false;
    status.textContent = '';
    if (step) step.textContent = 'PASO 2 DE 2';
    heading.focus({preventScroll: true});
    card.scrollIntoView({block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth'});
  });

  summary.addEventListener('input', () => { updateShareLinks(); status.textContent = ''; });
  [emailLink, whatsappLink].forEach(link => {
    link.addEventListener('click', event => {
      if (link.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        status.textContent = 'Completa el resumen antes de compartirlo.';
        return;
      }
      status.textContent = link === emailLink
        ? 'Revisa el correo y pulsa Enviar en tu aplicación. Si no se abre o falta texto, copia el resumen y escríbenos a ' + YAKAR.email + '.'
        : 'Revisa el mensaje y pulsa Enviar en WhatsApp. Si no se abre o falta texto, copia el resumen y escríbenos al +51 973 669 004.';
    });
  });
  backButton.addEventListener('click', () => { showForm(); need.focus(); });
  copyButton.addEventListener('click', async () => {
    if (!summary.value.trim()) return;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Copia manual requerida');
      await navigator.clipboard.writeText(summary.value);
      copiedSignature = signature();
      status.textContent = 'Resumen copiado. Pégalo en tu correo o WhatsApp y envíalo desde allí.';
    } catch {
      summary.focus();
      summary.select();
      status.textContent = 'El texto está seleccionado. Usa Ctrl+C / Cmd+C o la opción Copiar de tu dispositivo.';
    }
  });

  form.noValidate = true;
  updateHint();
  showForm();
}

/* Inicio */

document.addEventListener('DOMContentLoaded', () => {
  initializeMenu();
  initializeRoadmap();
  initializeRequest();
  initializeReturnReview();
});

/* Preferencia local y voluntaria; nunca se persisten datos del requerimiento. */
function initializeReturnReview() {
  const panel=document.querySelector('.return-review');
  const edition=document.querySelector('.perspective-edition time')?.getAttribute('datetime');
  if(!panel||!edition)return;
  const key='yakar.perspectiva.review.v1';
  const tasks=[...panel.querySelectorAll('[data-review-task]')];
  const remember=panel.querySelector('[data-review-remember]');
  const status=panel.querySelector('[data-review-progress]');
  const storage=panel.querySelector('[data-review-storage]');
  const editionStatus=panel.querySelector('[data-review-edition]');
  let saved=null;
  try {const raw=localStorage.getItem(key);if(raw&&raw.length<500){const v=JSON.parse(raw);if(v&&typeof v.edition==='string'&&/^20\d{2}-\d{2}-\d{2}$/.test(v.edition)&&Array.isArray(v.done)&&v.done.length===3&&v.done.every(x=>typeof x==='boolean'))saved=v;}}catch{/* Sin almacenamiento: la lista sigue disponible en esta página. */}
  if(saved){remember.checked=true;if(saved.edition===edition)tasks.forEach((t,i)=>{t.checked=saved.done[i];});}
  editionStatus.textContent=saved&&saved.edition!==edition?'Hay una edición distinta a tu última revisión. Esta lista comienza sin marcas para que revises el contenido actual.':saved?'Tu revisión guardada está lista para continuar.':'Una revisión breve para aplicar lo que leíste.';
  function render(){const n=tasks.filter(t=>t.checked).length;panel.querySelector('progress').value=n;status.textContent=n+' de 3 puntos marcados. '+(n===3?'Lista revisada. Confirma los detalles pendientes antes de solicitar una propuesta.':'Avanza a tu ritmo; marca únicamente lo que comprobaste.');}
  function persist(){if(!remember.checked)return;try{localStorage.setItem(key,JSON.stringify({edition,done:tasks.map(t=>t.checked)}));storage.textContent='Revisión guardada en este navegador.';}catch{storage.textContent='Este navegador no permitió guardar. Puedes usar la lista mientras esta página siga abierta.';}}
  tasks.forEach(t=>t.addEventListener('change',()=>{render();persist();}));
  remember.addEventListener('change',()=>{if(remember.checked)persist();else{try{localStorage.removeItem(key);storage.textContent='Recordatorio local desactivado. Las marcas actuales solo permanecen en esta página.';}catch{storage.textContent='No pudimos borrar el dato local. Puedes eliminarlo desde los datos de este sitio en tu navegador.';}}});
  panel.querySelector('[data-review-clear]').addEventListener('click',()=>{tasks.forEach(t=>{t.checked=false;});remember.checked=false;render();try{localStorage.removeItem(key);storage.textContent='Revisión borrada de este navegador.';}catch{storage.textContent='La lista se reinició, pero no pudimos borrar el dato local. Revisa los datos de este sitio en tu navegador.';}});
  render();panel.hidden=false;
}
