/*
 * YAKAR Web V1
 * Selector de ruta y preparación local del resumen.
 * No transmite ni almacena datos: no hay backend conectado.
 */
document.addEventListener("DOMContentLoaded", () => {
  const buttons = [...document.querySelectorAll("[data-request-route]")];
  const panel = document.getElementById("request-form-panel");
  const title = document.getElementById("request-form-title");
  const description = document.getElementById("request-form-description");
  const route = document.getElementById("request-route");
  const form = document.getElementById("request-form");
  const feedback = document.getElementById("form-feedback");
  const summaryPanel = document.getElementById("summary-panel");
  const summary = document.getElementById("request-summary");
  const copyButton = document.getElementById("copy-summary");
  const copyFeedback = document.getElementById("copy-feedback");

  if (!buttons.length || !panel || !form || !route) return;

  const copy = {
    defined: {
      title: "Comparte tu especificación",
      description: "Incluye las características, cantidades y condiciones que ya tengas definidas."
    },
    help: {
      title: "Ayúdanos a entender tu necesidad",
      description: "Describe el resultado que necesitas, el uso previsto y las condiciones conocidas. No hace falta tener todas las especificaciones resueltas."
    }
  };

  buttons.forEach((button) => button.addEventListener("click", () => {
    const selected = button.dataset.requestRoute;
    if (!copy[selected]) return;
    route.value = selected;
    title.textContent = copy[selected].title;
    description.textContent = copy[selected].description;
    panel.hidden = false;
    buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    feedback.hidden = true;
    summaryPanel.hidden = true;
    copyFeedback.textContent = "";
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("company")?.focus({ preventScroll: true });
  }));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const routeLabel = route.value === "defined"
      ? "Tengo una especificación definida"
      : "Necesito ayuda para estructurarla";
    const lines = [
      "YAKAR — NUEVO REQUERIMIENTO", "",
      `Tipo: ${routeLabel}`,
      `Empresa / organización: ${data.get("company")}`,
      `Contacto: ${data.get("contact_name")}`,
      `Correo: ${data.get("email")}`,
      `Teléfono: ${data.get("phone") || "No indicado"}`,
      `Línea: ${data.get("category")}`,
      `Cantidad estimada: ${data.get("quantity") || "No indicada"}`,
      `Plazo: ${data.get("timing") || "No indicado"}`, "",
      "Necesidad y contexto:", data.get("need"), "",
      "Este resumen fue preparado en la web. No significa que el requerimiento haya sido enviado ni aceptado."
    ];
    summary.value = lines.join("\n");
    summaryPanel.hidden = false;
    feedback.textContent = "Resumen preparado. Aún no se ha enviado ningún dato a YAKAR. Copia el texto y compártelo por un canal comercial confirmado.";
    feedback.hidden = false;
    copyFeedback.textContent = "";
    summaryPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  copyButton.addEventListener("click", async () => {
    if (!summary.value) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(summary.value);
      } else {
        summary.focus();
        summary.select();
        if (!document.execCommand("copy")) throw new Error("Copia manual requerida");
      }
      copyFeedback.textContent = "Resumen copiado.";
    } catch {
      summary.focus();
      summary.select();
      copyFeedback.textContent = "El texto está seleccionado. Usa Ctrl+C para copiarlo.";
    }
  });
});
