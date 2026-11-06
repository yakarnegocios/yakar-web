# Medición comercial de la web YAKAR

Implementación: 6 de noviembre de 2026. Esta guía describe el estado real y cómo registrar evidencia; no declara activa una integración con Analytics ni con el sistema privado.

## Qué se puede comprobar hoy

- Search Console está conectado y permite consultar búsquedas, impresiones, clics e indexación. Sus datos no equivalen a visitantes de todos los canales y tienen retraso.
- La web prepara el resumen en el navegador. No hay un servidor que cuente los resúmenes preparados o las aperturas de canales.
- Cada resumen válido incorpora una referencia aleatoria `YW-` cuando el navegador dispone de generación segura. La misma referencia se conserva al corregir el formulario en la página abierta. Al recargar se puede generar otra. No es una constancia ni el ID del expediente YOC.
- La procedencia es una respuesta opcional del solicitante. La guía solo se incorpora si la persona mantiene la casilla seleccionada. Son evidencias declaradas, no atribución automática de campañas.
- El correo lleva la referencia en el asunto y el resumen la contiene en su cuerpo. WhatsApp lleva el texto revisado. Abrir cualquiera de ellos no confirma envío o recepción.

## Registro cuando llegue un mensaje

El responsable comercial verifica el mensaje en el buzón o WhatsApp de YAKAR. Conserva su fecha, canal y evidencia en el expediente autorizado. Registra la referencia web y la procedencia declarada en las observaciones del requerimiento existente. Si la misma consulta llegó por dos canales, la vincula al mismo expediente después de revisar contenido y contacto; no crea una segunda oportunidad solo por recibir una copia.

La ausencia de referencia u origen nunca impide atender. Una referencia puede haberse editado o copiado: sirve para relacionar consultas, no para autenticar al cliente. No se deben recopilar mensajes o datos personales en repositorios de código.

## Hitos y evidencia

| Hito | Evidencia válida | Situación de medición |
| --- | --- | --- |
| Visita a una página | Medición de visitas de una herramienta instalada y comprobada | Pendiente conectar/configurar Analytics y verificar su etiqueta |
| Resumen preparado | Acción local de preparación | No se cuenta centralmente |
| Canal abierto | Acción sobre el enlace | No acredita mensaje enviado; no se cuenta centralmente |
| Mensaje recibido | Mensaje verificable en un canal de YAKAR | Registro del responsable comercial |
| Necesidad registrada | ID y registro persistente en el sistema | Evidencia del expediente, no del navegador |
| Necesidad evaluada | Responsable, evaluación y fecha | Evidencia del expediente |
| Oportunidad viable | Decisión documentada y motivo | Evidencia del expediente |
| Cotización emitida | Versión, destinatario, fecha y documento | Evidencia del expediente |
| Compra confirmada | Aceptación y condiciones acordadas | Evidencia del expediente; un clic no es una venta |

## Indicadores y sus límites

Comparar mensajes recibidos únicos por origen declarado y por guía con las oportunidades viables, cotizaciones y compras del mismo conjunto de expedientes. Indicar siempre periodo, denominador, datos faltantes y responsable. Para conversión web-visita es necesaria la medición de visitas y una regla documentada de vinculación; hoy no se calcula esa tasa. No dividir clics de Search Console entre consultas de todos los canales como si compartieran el mismo universo.

## Próximo acceso necesario

La conexión actual a GSC Wizard no tiene permiso de Google Analytics. Se debe conectar la cuenta de Analytics, comprobar si ya existe una propiedad para la web y su flujo, y obtener el identificador real antes de instalar una etiqueta. Si no existe propiedad, su creación y las condiciones de cuenta se completan con el titular. Después se verifica consentimiento aplicable, exclusión de datos personales, eventos y tráfico de prueba. Nunca se inventa un identificador ni se declara activa una medición sin verificar recepción de eventos.

## Verificación realizada

Prueba funcional con datos ficticios: validación de campos, origen opcional, exclusión de valores no admitidos, casilla de guía, referencia estable al corregir, texto compartido completo, edición manual del resumen y funcionamiento cuando no hay generación segura disponible. La función no añade cookies ni almacenamiento persistente de procedencia.
