# Publicar Perspectiva YAKAR

## Estructura vigente
- Inicio: resúmenes, checklist local voluntario y calendario. Conservar su funcionamiento.
- Archivo público: `perspectiva/index.html`, canonical terminado en `/perspectiva/`.
- Ediciones: `perspectiva/AAAA-MM-DD.html`, con fecha editorial, contenido completo, fuentes y URL propia. No reemplazar el contenido histórico de otra fecha.
- Primera edición publicada con esta estructura: 2026-11-01. Conserva el contexto de esa fecha, sin presentarlo como alerta actual.
- Compartir: `js/perspectiva-share.js`, CSS compartido y enlaces directos. Compartir exclusivamente el enlace público de la edición; nunca `location.href`, datos del requerimiento o parámetros de consulta.

## Cada nueva edición
1. Leer el head remoto y preservar cambios ajenos. Verificar fuentes primarias y fecha; diferenciar contexto del criterio YAKAR.
2. Crear la nueva página fechada siguiendo la edición actual. Revisar title, descripción, H1, canonical propio, Open Graph y Article/BreadcrumbList JSON-LD. Usar fechas reales; no actualizar la fecha de artículos antiguos para aparentar novedades.
3. Conservar las ediciones anteriores. Enlazar la nueva desde el archivo y actualizar resúmenes, fecha y checklist del inicio. Asignar a los artículos los identificadores `suministros`, `servicios` y `proyectos` y enlazar cada tarjeta del inicio directamente a su artículo. Vincular cada artículo con la guía práctica correspondiente. Mantener las referencias desde las guías hacia las ediciones históricas cuando sigan siendo pertinentes.
4. Actualizar todos los destinos de compartir, incluidos `data-perspective-share` y los enlaces WhatsApp/LinkedIn. Comprobar los destinos codificados: solo la URL pública sin datos de personas.
5. Añadir la nueva ruta exacta a TITLES en `js/analytics-consent.js`. Esta lista protege la privacidad; no sustituir por rutas arbitrarias ni títulos extraídos de campos del visitante. Conservar el bloqueo previo al consentimiento.
6. Incorporar la URL canonical de la nueva edición al sitemap sin eliminar ediciones previas. Actualizar las versiones de recursos solo cuando cambien.
7. Verificar estructura, enlaces, accesibilidad, consentimiento y acciones de compartir. Publicar con lease sobre el head fresco; comprobar GitHub Pages antes de anunciar éxito.
8. Si falla el acceso, la evidencia o la publicación, conservar la edición vigente y comunicar el bloqueo real.

## Medición y límites
Analytics permite páginas vistas de las rutas expresamente autorizadas. No se añaden conversiones de ventas, recepciones de mensajes ni indicadores de compartir sin una instrumentación verificada. Abrir un destino de compartir no demuestra que el visitante haya publicado o enviado el enlace.

El archivo se consulta sin JavaScript. Copiar enlace necesita JavaScript y permiso del navegador; si falla el portapapeles, se ofrece un campo para copiar manualmente. WhatsApp y LinkedIn usan enlaces activados por el visitante y no publican automáticamente.

SEO: canonical e inclusión en sitemap son señales de descubrimiento y preferencia; no garantizan indexación ni posición. Mantener pendiente la confirmación de lectura del sitemap y la evaluación de velocidad móvil con mediciones reales.
