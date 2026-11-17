# Capturas del Proyecto Final

Capturas reales de Edge automatizado con Playwright. Directorio actual: entorno local; subcarpeta `publicacion/`: el mismo recorrido ejecutado contra https://techtask-generacion-t.onrender.com. Datos ficticios, sin contraseñas visibles. No hay imágenes generadas como evidencia del Proyecto Final.

| Imagen | Prueba / funcionalidad | Resultado | Concepto |
|---|---|---|---|
| 01-proyectos.png | Crear proyecto desde cuenta privada y listar | Proyecto recuperado por API | HU02, ownership/persistencia |
| 02-formulario-tarea.png | Completar formulario de tarea | Campos reales antes del POST | Contrato y validaciones |
| 03-entrega-bloqueada.png | Entregar con requisito pendiente |409 y motivo, sin cambio de estado | RN03/05/10 |
| 04-historial.png | Entregar después de completar requisito | Historial de cambios reales | Atomicidad/trazabilidad |
| 05-progreso.png | Dos de dos tareas entregadas |100% calculado | RN07, datos derivados |
| 06-persistencia.png | Recarga completa y nuevo GET | Mismas tareas y estado | RN11 |
| 07-mobile.png | Viewport390×844 | Sin desbordamiento horizontal | Responsive |
| 08-validacion.png | Título corto enviado desde formulario |400 del servidor y error real | RN01/09 |
| 09-api.png | GET nativo del navegador autenticado | JSON real; status/URL en api-lectura.json | API/persistencia |
| 10-creacion-proyecto.png | Formulario previo a crear proyecto | Nombre y descripción disponibles | HU02 |
| 11-ci-github.png | Página pública real de GitHub Actions | Jobs PostgreSQL y navegador exitosos | Pruebas reproducibles en CI |
| publicacion/12-acceso-publico.png | Acceso HTTPS sin sesión | Login y registro sin datos privados visibles | Publicación y privacidad |

La captura 09 es la vista JSON nativa de Edge; en la captura pública se activó su casilla de sangría real para leerla. El archivo api-lectura.json conserva método, URL, estado y respuesta legibles sin simular DevTools. No se construyó una terminal artificial para mostrar tests: los resultados auténticos están en logs y en la captura 11 de GitHub Actions.

## Persistencia: pasos exactos

1. Registrar una cuenta ficticia; crear Proyecto técnico de Redes.
2. Crear Diseñar topología y Entregar TP de Redes mediante POST201.
3. Agregar dependencia; pasar entrega a desarrollo; intento de entregar409.
4. Completar requisito y luego entrega, mediante PATCH200; comprobar historial y 100%.
5. Ejecutar page.reload, esperar que el proyecto y las tareas reaparezcan desde el servidor; guardar06.
6. Abrir /api/tasks con la misma sesión; comprobar200 y contenido; guardar JSON 09 y registro de respuesta.
7. Cerrar sesión, registrar segunda cuenta, esperar su GET de proyectos200 y comprobar array vacío.

## Procedencia y límites

Los logs navegador.json registran respuestas y errores JavaScript sin cookies.401 inicial sin sesión,400 de título y 409 de regla son respuestas negativas esperadas; no se ocultan como fallos desconocidos. Las pantallas finales fueron inspeccionadas. Los datos creados durante estas pruebas son ficticios, no la cuenta del estudiante.

El test genera capturas antes de algunas actualizaciones visuales; el resultado de cada operación se comprueba por HTTP y aserciones de estado, no por deducir éxito de una imagen aislada. No se presentan funciones futuras como actuales.
