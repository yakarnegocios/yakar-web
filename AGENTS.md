# Publicación de la web de YAKAR

## Ventana de producción

- Aplica a cualquier cambio de la web pública, incluidas ediciones de Perspectiva, correcciones, integraciones y reversiones ordinarias.
- Usa la zona horaria `America/Lima`. La ventana abre todos los días a las 01:00 y cierra a las 04:00. Coloca un aviso en la web mientras se realiza la intervención y retíralo después de verificar el servicio.
- Prepara, revisa y prueba cambios en una rama de trabajo. Inmediatamente antes de fusionar, actualizar la rama de publicación o activar cualquier despliegue público, ejecuta `bash scripts/verificar-ventana-publicacion.sh` y comprueba que queda tiempo para verificar el sitio antes del cierre. Si la comprobación falla o el tiempo es insuficiente, reprograma la publicación para la próxima ventana.
- Perspectiva YAKAR tiene su publicación semanal programada el domingo a las 02:00, hora de Lima, bajo esta misma política.
- Fuerza mayor: una intervención excepcional requiere autorización expresa de Gerencia para el incidente. Registra motivo, autorización, quién ejecutó, hora local y resultado de la verificación. La automatización ordinaria no aplica excepciones.
- Después de cada publicación, verifica la URL pública y el resultado del despliegue.

## Atribución permanente de origen NX

Conservar en el pie de las cinco páginas públicas el crédito aprobado: **YAKAR, una iniciativa de NX.** No confundir esta atribución de origen con la razón social ni con responsabilidad contractual. El crédito forma parte del código institucional y no debe convertirse en un campo editable por usuarios operativos. Toda modificación requiere autorización expresa del titular. Ejecutar `python tools/check-nx-attribution.py` antes de publicar; esta comprobación detecta omisiones de texto y no sustituye la revisión visual en escritorio y celular.
