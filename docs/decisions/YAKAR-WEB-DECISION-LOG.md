
# YAKAR — Registro de Decisiones del Proyecto Web

**Proyecto:** Yakar Negocios E.I.R.L.  
**Repositorio:** `yakarnegocios/yakar-web`  
**Rama:** `main`  
**Versión del registro:** 1.0  
**Fecha de inicio:** 1 de octubre de 2026

---

## 1. Propósito

Registrar las decisiones relevantes del desarrollo web de YAKAR, sus fundamentos, estado y condiciones de revisión.

Este registro complementa:

- `docs/architecture/YAKAR-WEB-ARCHITECTURE-V1.md`
- `docs/content/YAKAR-HOME-CONTENT-V1.md`

La arquitectura define cómo debe organizarse el sistema. El contenido maestro define qué debe comunicar la página. Este registro explica por qué tomamos las decisiones y bajo qué condiciones podemos cambiarlas.

## 2. Estados de decisión

- **APROBADA:** decisión aceptada como referencia vigente.
- **PENDIENTE:** requiere información, validación o una decisión posterior.
- **EN PRUEBA:** implementación que debe evaluarse antes de adoptarse definitivamente.
- **SUSTITUIDA:** reemplazada por una decisión posterior documentada.
- **BLOQUEADA:** no debe implementarse hasta resolver una dependencia o un riesgo.

Una idea propuesta no se considera aprobada por el solo hecho de aparecer en este documento.

## 3. Decisiones estratégicas

### DEC-001 — Marca principal

**Estado:** APROBADA.

**Decisión:** utilizar YAKAR como marca principal de Yakar Negocios E.I.R.L.

**Fundamento:** mantener una identidad comercial coherente con la estrategia actual.

**Regla:** VIREXA es un antecedente histórico y no debe volver a ser el eje del proyecto sin una nueva decisión fundamentada.

### DEC-002 — Mercado inicial

**Estado:** APROBADA.

**Decisión:** priorizar el mercado B2B privado en Perú.

**Fundamento:** concentrar el desarrollo comercial y digital en necesidades empresariales de abastecimiento.

**Regla:** la contratación pública puede considerarse cuando corresponda, pero no será el centro inicial de la web.

### DEC-003 — Posicionamiento

**Estado:** APROBADA.

**Posicionamiento:** Abastecimiento estratégico para operaciones que necesitan cumplir.

**Promesa:** CUMPLIR ES PARTE DEL PRODUCTO.

**Territorio:** CERTEZA EN EL ABASTECIMIENTO.

**Principio interno:** NUESTRA PALABRA ES ORO.

**Regla:** toda comunicación debe mantener coherencia con estas expresiones.

### DEC-004 — Modelo de negocio

**Estado:** APROBADA.

**Decisión:** adoptar un enfoque de abastecimiento bajo pedido, evaluando cada requerimiento antes de comprometer su ejecución.

**Fundamento:** evitar depender de inventario propio y centrar el valor en comprender, especificar, evaluar, coordinar y controlar el suministro.

**Regla:** no comunicar disponibilidad, capacidad logística, plazo o resultado sin validación suficiente.

### DEC-005 — Territorio comercial inicial

**Estado:** APROBADA.

**Categorías:**

1. Seguridad industrial.
2. Textil industrial.
3. Ferretería y suministros.
4. Equipamiento.

**Regla:** cada requerimiento debe evaluarse individualmente. La presencia de una categoría en la web no demuestra capacidad para suministrar cualquier producto de esa categoría.

### DEC-006 — Método institucional

**Estado:** APROBADA.

**Secuencia:**

ENTENDER → ESPECIFICAR → VALIDAR → ABASTECER → CONTROLAR → ENTREGAR → RESPONDER.

**Fundamento:** establecer un método consistente para estructurar la comunicación y la gestión de los requerimientos.

**Regla:** evitar secuencias institucionales contradictorias.

La publicación de esta secuencia no significa que todos sus componentes estén automatizados o que su eficacia esté demostrada en todas las operaciones.

### DEC-007 — Evidencia comercial

**Estado:** APROBADA.

**Decisión:** diferenciar claramente lo declarado, documentado, verificado e histórico.

**Regla:** una cotización no equivale a una venta ejecutada. Un antecedente histórico no demuestra actividad actual. La experiencia de otras empresas no se atribuye a YAKAR.

### DEC-008 — Diseño centrado en comprensión

**Estado:** APROBADA.

**Principio:** MENOS LECTURA. MÁS COMPRENSIÓN.

**Decisión:** optimizar la página para facilitar la comprensión por unidad de atención, sin eliminar información necesaria para decidir.

**Regla:** no confundir minimalismo visual con claridad estratégica.

### DEC-009 — Experiencia simple y operación rigurosa

**Estado:** APROBADA.

**Decisión:** mantener una experiencia sencilla para el cliente y procesos internos suficientemente rigurosos para controlar los compromisos.

**Regla:** no simplificar tanto la interfaz que oculte condiciones importantes ni trasladar innecesariamente la complejidad operativa al cliente.

## 4. Decisiones de arquitectura y desarrollo

### DEC-010 — GitHub Pages como alojamiento inicial

**Estado:** APROBADA.

**Decisión:** mantener GitHub Pages como alojamiento estático inicial.

**Fundamento:** permite publicar la web institucional sin introducir prematuramente una infraestructura compleja.

**Límite:** GitHub Pages no constituye por sí solo un backend seguro para almacenar requerimientos, tramitar reclamaciones o administrar expedientes privados.

### DEC-011 — Desarrollo progresivo

**Estado:** APROBADA.

**Decisión:** evolucionar desde una recepción digital controlada hacia funcionalidades más avanzadas solo cuando exista una necesidad validada.

**Secuencia de referencia:**

- V1: web institucional y recepción controlada.
- V2: Cuenta Empresarial YAKAR.
- V3: portal colaborativo.
- V4: sistema integrado.

**Regla:** no construir una versión posterior antes de validar la anterior.

### DEC-012 — Protección de la versión publicada

**Estado:** APROBADA.

**Decisión:** evitar reemplazar la página publicada hasta que los cambios estén preparados y se hayan definido sus pruebas de aceptación.

**Regla:** identificar los archivos afectados, conservar el historial y mantener una vía de recuperación.

**Procedimiento:** implementar cambios controlados, probarlos y publicar cuando cumplan los criterios de aceptación.

### DEC-013 — Formularios funcionales

**Estado:** APROBADA.

**Decisión:** no presentar un formulario como funcional si no se ha probado el envío y la recepción real de los datos.

**Regla:** una confirmación visual no equivale a un registro persistente.

Antes de habilitar el formulario deben definirse y verificarse el proveedor, el almacenamiento, el acceso, la seguridad, la privacidad y la confirmación.

### DEC-014 — Libro de Reclamaciones

**Estado:** BLOQUEADA PARA PUBLICACIÓN FUNCIONAL HASTA VALIDACIÓN.

**Decisión:** diseñar su acceso y flujo de atención como parte del sistema web, verificando primero las obligaciones legales vigentes y su aplicabilidad.

**Regla:** no sustituir un mecanismo efectivo de recepción por una página decorativa, un enlace aislado o un formulario que no registre las reclamaciones.

**Dependencias:** revisión normativa, definición del procedimiento de atención, responsable designado y solución técnica probada.

El estado bloqueado se refiere a publicar una funcionalidad presentada como operativa, no a impedir el análisis, diseño o preparación documental.

### DEC-015 — Privacidad y seguridad

**Estado:** APROBADA COMO PRINCIPIO; IMPLEMENTACIÓN PENDIENTE DE VALIDACIÓN.

**Decisión:** aplicar minimización de datos, control de acceso, información transparente y medidas de seguridad adecuadas.

**Regla:** no almacenar datos personales o comerciales sensibles en el código fuente ni en archivos públicos del repositorio.

**Dependencias:** definición del flujo de datos, proveedor, conservación, accesos y obligaciones aplicables.

### DEC-016 — Accesibilidad

**Estado:** APROBADA COMO PRINCIPIO; VALIDACIÓN PENDIENTE.

**Decisión:** incorporar accesibilidad desde el diseño y verificarla antes de publicar.

**Criterios:** contraste, navegación por teclado, foco visible, etiquetas, estructura semántica, textos comprensibles y adaptación a distintos dispositivos.

## 5. Decisiones pendientes

### DEC-017 — Proveedor para formularios

**Estado:** PENDIENTE.

**Pregunta:** ¿qué solución permitirá recibir y gestionar requerimientos con un nivel adecuado de seguridad, privacidad, coste y facilidad operativa?

**Criterios de evaluación:**

- Coste total.
- Seguridad y privacidad.
- Capacidad de exportar registros.
- Control de acceso.
- Confirmación de recepción.
- Continuidad y disponibilidad.
- Facilidad de administración.
- Posibilidad de migración futura.

No seleccionar un proveedor únicamente por facilidad de integración.

### DEC-018 — Canal de contacto

**Estado:** PENDIENTE.

**Pregunta:** ¿qué correo, teléfono u otro canal será efectivamente administrado por YAKAR?

**Regla:** no publicar datos de contacto hasta verificar su titularidad, funcionamiento y responsable de atención.

### DEC-019 — Evidencia publicable

**Estado:** PENDIENTE.

**Pregunta:** ¿qué antecedentes documentales pueden publicarse de forma útil, precisa y autorizada?

**Regla:** revisar documentos, confidencialidad, datos personales y autorización antes de publicar nombres, logotipos o detalles de clientes.

### DEC-020 — Estado operativo y capacidades actuales

**Estado:** PENDIENTE DE VERIFICACIÓN CONTINUA.

**Decisión:** comprobar la capacidad real para cada requerimiento antes de asumir compromisos comerciales.

**Regla:** no convertir el objeto social, una cotización antigua o una capacidad declarada en evidencia automática de capacidad vigente.

## 6. Método para aprobar nuevas decisiones

Toda decisión relevante debe incluir:

1. Identificador único.
2. Problema o necesidad.
3. Evidencia disponible.
4. Opciones consideradas.
5. Decisión adoptada.
6. Fundamento.
7. Riesgos y dependencias.
8. Responsable.
9. Estado.
10. Fecha y condiciones de revisión.

Cuando una decisión anterior cambie, registrar el motivo, la evidencia nueva y el identificador de la decisión sustituida.

No borrar decisiones históricas para ocultar cambios.

## 7. Control de cambios del repositorio

Antes de modificar código:

1. Identificar el objetivo del cambio.
2. Determinar los archivos afectados.
3. Verificar dependencias y enlaces.
4. Definir cómo se probará.
5. Realizar un cambio controlado.
6. Revisar el resultado.
7. Registrar el commit con un mensaje descriptivo.
8. Confirmar que la publicación funciona.

Evitar modificaciones simultáneas que dificulten identificar la causa de un error.

## 8. Criterio para priorizar trabajo

Priorizar tareas según:

- Impacto en la comprensión del cliente.
- Reducción de riesgos.
- Importancia para la operación.
- Obligaciones legales.
- Dependencias técnicas.
- Coste y tiempo.
- Facilidad de verificación.
- Reversibilidad.

No priorizar una funcionalidad solo porque resulte visualmente atractiva o técnicamente novedosa.

## 9. Registro de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 1.0 | 2026-10-01 | Creación del registro inicial de decisiones del proyecto web. |

---

**Principio de gobierno:** ninguna decisión estratégica se cambia silenciosamente; ninguna capacidad se promete sin fundamento; ninguna funcionalidad se declara operativa sin verificación.
