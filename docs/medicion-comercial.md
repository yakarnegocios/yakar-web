# Medición comercial de la web YAKAR

Configuración del 6 de noviembre de 2026: GA4 `G-QJM564HFVY`, flujo «YAKAR Web pública», ID de flujo 16289911388. El titular creó el flujo, seleccionó Perú y desactivó la medición mejorada. La recepción de eventos en la propiedad requiere confirmación en Analytics; publicar el código o ver un script cargado no lo acredita.

## Separación de evidencia

| Hito | Evidencia y medición |
| --- | --- |
| Aparición y clic de búsqueda | Search Console, con su periodo y retraso de datos |
| Visita de página | `page_view`, solo con aceptación de medición |
| Resumen preparado | `yakar_summary_prepared`, solo al generar un resumen válido nuevo y con aceptación; no acredita envío |
| Canal abierto | `yakar_channel_opened`, parámetro fijo `channel`: email o whatsapp; acredita clic, no apertura efectiva, envío ni recepción |
| Resumen copiado | `yakar_summary_copied`, después de copiar correctamente; no acredita envío |
| Mensaje recibido | Mensaje verificable en el buzón o WhatsApp de YAKAR; lo registra el responsable comercial |
| Necesidad registrada | ID persistente y evidencia en el sistema YAKAR |
| Necesidad evaluada / oportunidad viable | Decisión, responsable, fecha y motivo en el expediente |
| Cotización emitida | Documento y versión, fecha y destinatario |
| Compra confirmada | Aceptación verificable y condiciones acordadas |

No se emiten `generate_lead` ni `purchase` desde el formulario local. Estas acciones no prueban recepción ni venta.

## Consentimiento y datos

La etiqueta no se carga ni se encolan eventos antes de aceptar o después de rechazar. La elección se guarda localmente durante 180 días como máximo y se puede cambiar en «Preferencias de medición». Si falla el almacenamiento, la decisión solo se aplica a esa página. La retirada desactiva la recogida posterior, borra las cookies `_ga` accesibles creadas en la ruta del sitio y se propaga a otras pestañas mediante el evento de almacenamiento. No elimina los datos ya procesados por Google.

Cookies configuradas con dominio del host, ruta `/yakar-web/`, duración máxima de 180 días sin renovación automática y atributos Secure/SameSite=Lax. Se desactivan Google Signals y personalización publicitaria. No se instala la integración en reclamaciones ni en el sistema privado.

Los eventos tienen un vocabulario cerrado. Se usan títulos y rutas de página conocidos; no se envían parámetros o fragmentos de URL, campos de formularios, texto del resumen, referencia YW, nombre, correo, teléfono ni URL de enlaces de WhatsApp/correo. El referente solo se comunica como origen de una fuente reconocida o como ruta interna conocida, sin búsqueda ni parámetros. No se transmiten campañas UTM arbitrarias. Google recibe datos técnicos de conexión y navegación después de aceptar: no debe describirse esta medición como anónima.

## Referencia y origen de consultas recibidas

El resumen válido incluye una referencia aleatoria `YW-` si hay generación segura disponible. Se conserva al corregir en la página abierta; puede cambiar al recargar. No es constancia ni ID de expediente YOC. La procedencia es una respuesta voluntaria del solicitante; no es atribución automática. La guía se comparte solo si se mantiene la casilla seleccionada.

Al recibir un mensaje real, el responsable conserva canal, fecha y evidencia en el expediente autorizado y registra referencia y origen declarado en sus observaciones. Compara contacto y contenido para vincular copias del mismo pedido al mismo expediente. La ausencia de referencia u origen nunca impide atender. No se deben copiar mensajes o datos personales a repositorios de código.

## Lectura de resultados

Los eventos GA4 cubren solo visitas que aceptaron y que no fueron bloqueadas por el navegador o la red. No equivalen al total de visitantes ni al total de mensajes recibidos. Comparar periodos, cohortes y denominadores compatibles; informar datos faltantes. No dividir clics de búsqueda entre consultas de todos los canales. Todavía no hay vinculación automática entre eventos y expedientes, y no se calcula una tasa de venta atribuida a cada visitante.

## Comprobaciones y accesos pendientes

Pruebas locales: bloqueo antes de consentimiento y al rechazar, carga única, caducidad de elección, retirada, cookies, sincronización entre pestañas, almacenamiento restringido, URLs con datos ficticios, exclusión de reclamaciones e integración con el formulario. También validación, referencia estable, origen opcional y conservación de texto editado.

Verificación final: visita consentida de prueba y comprobación de eventos en Analytics «Tiempo real» o DebugView. No dar por recibidos eventos solo por su cola local. La conexión de GSC Wizard todavía requiere autorización de Google Analytics y vinculación a la propiedad real para consultar informes desde el asistente. El titular debe revisar en Analytics la retención de eventos, accesos y ajustes de uso compartido según las decisiones de YAKAR.
