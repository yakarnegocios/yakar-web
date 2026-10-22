# Optimización posterior al laboratorio — 22 de octubre de 2026

Base pública: `0bb41b4a2f3dae8e622dc5ae82dfc76cb3de6c3b`.

Se corrigen los hallazgos reproducidos en el primer contacto:

- Teléfono opcional, pero cuando se incluye exige entre 7 y 15 dígitos, formato de teléfono y contenido distinto de un único dígito repetido. Acepta separadores y prefijo internacional. Es validación de formato, no verificación de existencia o titularidad.
- Aviso nativo del navegador antes de abandonar una consulta modificada. Cancelar conserva los campos. El navegador puede limitar estos avisos, especialmente al cerrar una aplicación móvil; no se promete recuperación después de un cierre forzado.
- «Copiar lo escrito» permite conservar un borrador incompleto. Si falla el permiso del portapapeles, se ofrece texto seleccionable. La copia confirmada libera el aviso; cualquier edición posterior vuelve a activarlo. No se almacena el borrador en localStorage ni sessionStorage.
- Resúmenes extensos muestran la alternativa de copiar y pegar. El umbral de 1 800 caracteres codificados es una decisión conservadora de orientación, no un límite garantizado por los proveedores de correo o WhatsApp. No se recorta el contenido.
- Una fecha deseada anterior al día de Lima muestra una aclaración y permite explicar una referencia histórica.

Pruebas: 25 comprobaciones previas, cinco anchos y axe de los estados examinados sin infracciones detectadas; nueve nuevas comprobaciones de contactos, salida real cancelada, copia manual, nueva edición, fecha y resumen extenso. Se comprobaron 105 referencias internas sin errores. El JavaScript se versiona por hash de contenido.

La revisión no cambia el contenido editorial, el Libro de Reclamaciones ni su backend. La recepción real y la constancia del Libro siguen pendientes de un ensayo autorizado con su servicio. La publicación se considera comprobada solo después de Pages correcto y comparación de los archivos servidos.
