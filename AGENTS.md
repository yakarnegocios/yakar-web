# Publicación de la web de YAKAR

Aplica a la web pública, incluida Perspectiva.

## Ventana de producción

- Los cambios ordinarios, incluidas publicaciones, integraciones, configuración, migraciones y reversiones, se ejecutan todos los días de 01:00 inclusive a 04:00 exclusive en `America/Lima`. Preparar y probar en ramas de trabajo durante el día.
- Inmediatamente antes de cualquier cambio que despliegue a producción, ejecutar `bash scripts/verificar-ventana-publicacion.sh`. Confirmar que queda tiempo para aplicar, verificar y, si corresponde, revertir antes de las 04:00. De lo contrario, reprogramar.
- Registrar responsable, cambio o versión, alcance, impacto, hora y forma de revertir. Verificar el flujo afectado y la versión desplegada antes de cerrar. Cuando se pueda afectar trabajo en curso, anticipar cómo conservarlo.
- Para una emergencia fuera de horario, obtener autorización expresa de Gerencia y registrar motivo, responsable y resultado. La automatización ordinaria aplica la ventana diaria.

## Aviso de actualización

Publicar y comprobar el aviso en el canal afectado antes del cambio funcional. Si los trabajos afectan ambos canales, avisar en los dos. El aviso indica el periodo previsto en hora de Lima, el trabajo en curso y su impacto práctico. Dar aviso previo si habrá interrupción o cambios que el usuario deba preparar. Si el calendario cambia, actualizar el aviso correspondiente.

El aviso toma su estado del archivo `mantenimiento.json`. Mantener `null` cuando no haya una intervención. Para un trabajo programado usar este formato, sustituyendo las fechas de ejemplo por las del cambio real.

```json
{
  "inicio": "2026-11-18T01:15:00-05:00",
  "fin": "2026-11-18T02:00:00-05:00",
  "impacto": "La consulta puede tardar unos minutos en cargar."
}
```

El aviso se muestra como programado antes del inicio y como actualización en la ventana indicada. Reprogramar o limpiar la configuración si se cancela. Tras comprobar que el canal funciona, retirar el aviso dejando `null`. La interfaz deja de mostrar una ventana vencida. Si persiste un problema, activar la gestión de incidentes y comunicar el estado real por el canal disponible.

Cuando el repositorio despliega al cambiar su rama de producción, preparar el aviso con antelación o aplicar primero una publicación que solo active el aviso, dentro de la ventana permitida. Verificar que el aviso sea visible antes de ejecutar el cambio funcional.

Perspectiva YAKAR conserva su publicación habitual el domingo a las 02:00, hora de Lima.
