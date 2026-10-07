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
 * No utiliza almacenamiento local.
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
  const needLabel = form.querySelector('label[for="need"]');
  const hint = document.getElementById('need-hint');
  const step = document.getElementById('request-step');
  const expandButton = card.querySelector('.inline-button');

  if (!family || !need || !needLabel || !hint) return;

  const initialHint = hint.textContent.trim();

  /*
   * Solo se inserta marcado fijo.
   * Los datos introducidos por el visitante se escriben
   * en .value o .textContent, nunca como HTML.
   */
  const review = document.createElement('section');

  review.className = 'local-review';
  review.hidden = true;

  review.innerHTML = `
    <h3 tabindex="-1">Revisa tu requerimiento</h3>

    <p class="small">
      Resumen preparado. Todavía no se ha enviado
      ningún dato a YAKAR.
    </p>

    <label for="summary-local">
      Puedes corregir el resumen antes de compartirlo.
    </label>

    <textarea
      id="summary-local"
      class="summary-local"
      rows="12"
      spellcheck="true"
    ></textarea>

    <div class="actions">
      <button type="button" class="btn" data-copy>
        Copiar resumen
      </button>

      <a class="btn outline" data-email>
        Preparar correo
      </a>

      <a
        class="btn outline"
        data-whatsapp
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir WhatsApp
      </a>

      <button type="button" class="btn text" data-back>
        Corregir formulario
      </button>
    </div>

    <p
      class="small"
      role="status"
      aria-live="polite"
      data-status
    ></p>

    <p class="small">
      Al abrir correo o WhatsApp utilizarás un servicio externo.
      Revisa el mensaje y decide si deseas enviarlo.
    </p>

    <p class="small">
      La solicitud está sujeta a evaluación. Compartirla no
      confirma precio, disponibilidad, plazo ni aceptación.
      Para entidades públicas, este resumen no constituye
      una oferta presentada en una plataforma oficial.
    </p>
  `;

  card.append(review);

  const summary = review.querySelector('textarea');
  const heading = review.querySelector('h3');
  const status = review.querySelector('[data-status]');
  const copyButton = review.querySelector('[data-copy]');
  const emailLink = review.querySelector('[data-email]');
  const whatsappLink = review.querySelector('[data-whatsapp]');
  const backButton = review.querySelector('[data-back]');

  function setStep(number) {
    if (step) step.textContent = `PASO ${number} DE 2`;
  }

  function showForm() {
    form.hidden = false;
    review.hidden = true;
    setStep(1);
  }

  function updateHint() {
    hint.textContent = REQUEST_HINTS[family.value] || initialHint;
  }

  function updateRoute() {
    const selected = form.querySelector(
      'input[name="route"]:checked'
    );

    form.querySelectorAll('.route-choice').forEach(label => {
      const radio = label.querySelector('input');
      label.classList.toggle('selected', Boolean(radio?.checked));
    });

    needLabel.textContent = selected?.value === 'defined'
      ? 'Producto, servicio o alcance requerido *'
      : '¿Qué necesitas resolver? *';
  }

  function updateShareLinks() {
    const value = summary.value.trim();
    const available = value.length > 0;

    copyButton.disabled = !available;

    [emailLink, whatsappLink].forEach(link => {
      link.setAttribute('aria-disabled', String(!available));
    });

    if (!available) {
      emailLink.removeAttribute('href');
      whatsappLink.removeAttribute('href');
      return;
    }

    const subject = encodeURIComponent('Requerimiento para YAKAR');
    const body = encodeURIComponent(value);

    emailLink.href =
      `mailto:${YAKAR.email}?subject=${subject}&body=${body}`;

    whatsappLink.href =
      `https://wa.me/${YAKAR.whatsapp}?text=${body}`;
  }

  function readValue(data, name, fallback = 'Por definir') {
    const value = String(data.get(name) || '').trim();
    return value || fallback;
  }

  function formatDate(value) {
    if (!value) return 'Por definir';

    const parts = value.split('-');

    return parts.length === 3
      ? `${parts[2]}/${parts[1]}/${parts[0]}`
      : value;
  }

  function validateRequiredText() {
    ['need', 'company', 'contact', 'email'].forEach(name => {
      const field = form.elements.namedItem(name);

      if (!field) return;

      field.setCustomValidity(
        field.value.trim()
          ? ''
          : 'Completa este campo con información válida.'
      );
    });

    return form.reportValidity();
  }

  expandButton?.addEventListener('click', () => {
    const full = card.classList.toggle('show-full-form');

    expandButton.textContent = full
      ? 'Ver panel compacto'
      : 'Ver formulario completo';
  });

  family.addEventListener('change', updateHint);

  form.querySelectorAll('input[name="route"]').forEach(radio => {
    radio.addEventListener('change', updateRoute);
  });

  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.setCustomValidity('');
    });
  });

  document.querySelectorAll('[data-request-family]').forEach(link => {
    link.addEventListener('click', () => {
      const value = link.dataset.requestFamily;

      const exists = [...family.options].some(
        option => option.value === value
      );

      if (!exists) return;

      showForm();
      family.value = value;
      updateHint();
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    if (!validateRequiredText()) return;

    const data = new FormData(form);

    const fields = [
      [
        'Punto de partida',
        data.get('route') === 'defined'
          ? 'Tengo una especificación o alcance definido'
          : 'Necesito ayuda para definirlo'
      ],
      ['Tipo de requerimiento', readValue(data, 'family')],
      ['Tipo de organización', readValue(data, 'clientType')],
      ['Empresa u organización', readValue(data, 'company')],
      ['Contacto', readValue(data, 'contact')],
      ['Correo', readValue(data, 'email')],
      ['Teléfono', readValue(data, 'phone', 'No indicado')],
      ['Cantidad o alcance aproximado', readValue(data, 'quantity')],
      [
        'Fecha deseada',
        formatDate(readValue(data, 'neededBy', ''))
      ],
      ['Ubicación o entrega', readValue(data, 'location')]
    ];

    const lines = [
      'YAKAR — RESUMEN DE REQUERIMIENTO',
      '',
      ...fields.map(([label, value]) => `${label}: ${value}`),
      '',
      'NECESIDAD Y CONTEXTO',
      readValue(data, 'need'),
      '',
      'Solicitud sujeta a evaluación y propuesta comercial.',
      'La fecha deseada no constituye un plazo confirmado.',
      'Este resumen no acredita envío, registro ni aceptación.'
    ];

    summary.value = lines.join('\n');

    updateShareLinks();

    form.hidden = true;
    review.hidden = false;
    status.textContent = '';

    setStep(2);
    heading.focus({ preventScroll: true });
    scrollToElement(review);
  });

  summary.addEventListener('input', () => {
    updateShareLinks();
    status.textContent = '';
  });

  [emailLink, whatsappLink].forEach(link => {
    link.addEventListener('click', event => {
      if (link.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        status.textContent = 'Completa el resumen antes de compartirlo.';
      }
    });
  });

  backButton.addEventListener('click', () => {
    showForm();
    need.focus();
  });

  copyButton.addEventListener('click', async () => {
    if (!summary.value.trim()) return;

    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        throw new Error('Copia manual requerida');
      }

      await navigator.clipboard.writeText(summary.value);
      status.textContent = 'Resumen copiado.';
    } catch {
      summary.focus();
      summary.select();

      status.textContent =
        'El texto está seleccionado. Usa Ctrl+C / Cmd+C o la opción Copiar de tu dispositivo.';
    }
  });

  updateHint();
  updateRoute();

  /*
   * Mostrar el formulario únicamente después de conectar
   * su procesamiento local.
   */
  showForm();
}

/* Inicio */

document.addEventListener('DOMContentLoaded', () => {
  initializeMenu();
  initializeRoadmap();
  initializeRequest();
});
