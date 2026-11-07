# Experiencia móvil: medición y corrección

## Medición inicial
Informe público de PageSpeed Insights: https://pagespeed.web.dev/analysis/https-yakarnegocios-github-io-yakar-web/nkn43zao17?form_factor=mobile

Inicio analizado: https://yakarnegocios.github.io/yakar-web/

Lighthouse 13.6.0; Moto G Power emulado, Slow 4G, carga inicial. Prueba de laboratorio, no percentiles de usuarios reales.

| Indicador | Inicial |
|---|---:|
| Rendimiento | 85 |
| Accesibilidad automatizada | 100 |
| Buenas prácticas | 100 |
| SEO técnico básico | 92 |
| FCP | 0.9 s |
| LCP | 0.9 s |
| TBT | 0 ms |
| CLS | 0.299 |

El informe atribuye el desplazamiento a main#contenido y muestra enlaces de contacto sin href en el resumen aún oculto. La inserción tardía del consentimiento encima del main es la causa a comprobar con una nueva medición después del cambio.

## Cambios
- Aviso de consentimiento fijo en la parte inferior, con ancho y alto limitados y desplazamiento interno. No participa en la altura del documento ni empuja el contenido al aparecer. Conserva igual acceso a aceptar o continuar sin aceptar y no bloquea la navegación.
- Opciones de contacto con destinos reales de YAKAR desde su creación. Permanecen deshabilitadas y fuera del tabulado hasta disponer de un resumen. Vaciar el resumen vuelve a deshabilitarlas y elimina el texto de la consulta de sus destinos.
- Se conserva el cuerpo exacto del resumen al habilitar correo o WhatsApp y el bloqueo de Analytics previo al consentimiento.
- Versiones de scripts actualizadas en las páginas públicas para recibir los cambios.

## Comprobación
Pruebas locales satisfactorias: validación del formulario, referencia estable, contenido compartido y editado, consentimiento, retirada y eventos del embudo sin datos de contacto ni falsas conversiones. Repetir PageSpeed sobre la publicación terminada para confirmar CLS y enlaces. No declarar los valores posteriores hasta medirlos.

## Pendientes separados
El informe también señala peso de imágenes y caché; no se han alterado los activos de marca ni se promete una reducción medida. GitHub Pages administra los encabezados de caché: cualquier cambio de alojamiento requiere evaluación propia.

Search Console: sitemap pendiente sin fecha de lectura confirmada. La guía de seguridad industrial sigue desconocida para Google en la inspección del 6 de noviembre de 2026. No confundir accesibilidad técnica de una URL con indexación.
