/* Aviso operativo independiente de las preferencias de medición. */
(() => {
  const script = document.currentScript;
  if (!script?.src) return;
  const source = new URL("../mantenimiento.json", script.src);
  const notice = document.createElement("aside");
  notice.hidden = true;
  notice.setAttribute("role", "status");
  notice.style.cssText = "box-sizing:border-box;padding:10px 18px;background:#eef4fb;color:#172b4d;border-bottom:1px solid #b9cee3;font:inherit;line-height:1.45";
  const format = new Intl.DateTimeFormat("es-PE", {timeZone:"America/Lima", dateStyle:"short", timeStyle:"short"});

  async function refresh() {
    try {
      const response = await fetch(source, {cache:"no-store", signal:AbortSignal.timeout(5000)});
      if (!response.ok) throw new Error("Aviso no disponible");
      const value = await response.json();
      const start = Date.parse(value?.inicio);
      const end = Date.parse(value?.fin);
      const now = Date.now();
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || now >= end || typeof value.impacto !== "string" || !value.impacto.trim() || value.impacto.length > 240) {
        notice.hidden = true;
        return;
      }
      const title = now < start ? "Actualización programada de la web" : "Actualización de la web";
      const message = title + " · " + format.format(start) + " a " + format.format(end) + " (Lima). " + value.impacto;
      if (notice.textContent !== message) notice.textContent = message;
      notice.hidden = false;
    } catch {
      notice.hidden = true;
    }
  }

  function mount() {
    document.body.prepend(notice);
    void refresh();
    window.setInterval(refresh, 60000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, {once:true});
  else mount();
})();
