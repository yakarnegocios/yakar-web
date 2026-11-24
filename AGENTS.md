# Publicación de la web de YAKAR

## Ventana de producción

- Aplica a cualquier cambio de la web pública, incluidas ediciones de Perspectiva, correcciones, integraciones y reversiones ordinarias.
- Usa la zona horaria `America/Lima`. La ventana abre todos los días a las 00:59 y cierra a las 04:30. 
- Prepara, revisa y prueba cambios en una rama de trabajo. Inmediatamente antes de fusionar, actualizar la rama de publicación o activar cualquier despliegue público, ejecuta `bash scripts/verificar-ventana-publicacion.sh` y comprueba que queda tiempo para verificar el sitio antes del cierre. Si la comprobación falla o el tiempo es insuficiente, reprograma la publicación para la próxima ventana.
- Perspectiva YAKAR tiene su publicación semanal programada el domingo a las 02:00, hora de Lima, bajo esta misma política.
- Fuerza mayor: una intervención excepcional requiere autorización expresa de Gerencia para el incidente. Registra motivo, autorización, quién ejecutó, hora local y resultado de la verificación. La automatización ordinaria no aplica excepciones.
- Después de cada publicación, verifica la URL pública y el resultado del despliegue.
- Antes de iniciar una intervención, mostrar y comprobar en el canal afectado un cintillo visible: «[Web o Sistema] YAKAR en mantenimiento hasta las [HH:MM], hora de Lima. Podría verse afectado: [operación concreta]». Indicar la hora estimada real de término. Si cambia, actualizar el aviso. Mantenerlo visible hasta comprobar el servicio y el flujo afectado; después retirarlo.
