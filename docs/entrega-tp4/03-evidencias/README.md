# Evidencias y reproducción

Ejecución real: 16/11/2026, Windows, Node 22.21.0, npm 11.11.1, SQLite 3.50.4.

| Verificación | Resultado | Archivo |
|---|---|---|
| TypeScript estricto | Correcto | typecheck.txt |
| Reglas y API | 28 tests aprobados | tests.txt |
| Build frontend y backend | Correcto | build.txt |
| Navegador Edge con Playwright | 1 flujo aprobado | e2e.txt |
| Creación HTTP desde React | 201 real, request y response | creacion-http.json |
| Recuperación después de recarga | GET 200 y misma tarea | lectura-http.json |
| Consola de navegador | Sin errores registrados | consola-navegador.json |
| Separación | Sin SQL/repositorio/localStorage en frontend | separacion.txt |

## Reproducir

Desde la raíz: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`. Para navegador: cerrar otros servidores en 3001/5173 y ejecutar `npm run test:e2e`. Requiere Microsoft Edge instalado. No se descargó un navegador adicional. El plugin Browser no está disponible; por eso se utilizó Playwright con Edge.

El flujo e2e inicia servidores, usa `data/e2e.sqlite`, crea una tarea identificada con timestamp y conserva la base fuera de Git. Las repeticiones agregan tareas de prueba; la ejecución normal usa otra base, `data/techtask.sqlite`. Las capturas se sobrescriben con la última ejecución. No eliminar una base con datos que se quieran conservar.

El e2e comprueba título de página, contenido no vacío, creación desde formulario y 201, confirmación, recarga y recuperación por GET, búsqueda sin resultados, búsqueda positiva, filtro de favoritas y ausencia de desbordamiento horizontal móvil. Recoge errores de consola y errores JavaScript. Viewports: 1480×1000 y 390×844. No se verificaron otros navegadores ni lectores de pantalla.

## Diagnósticos reales y correcciones

- Vitest inicialmente heredó la raíz frontend de Vite y no encontró tests. Se agregó configuración independiente.
- Dos tests encontraron diez placeholders para nueve columnas en INSERT. `tests-primer-fallo.txt` conserva el fallo. Se corrigió la consulta con columnas explícitas y nueve parámetros; luego pasaron los 28 tests.
- esbuild falló por acceso restringido a directorios; `build-primer-fallo.txt` conserva esa salida. La ejecución con permiso ampliado pasó.
- El primer e2e completó el flujo, pero falló por un recurso 404 en consola. Se agregó favicon y referencia explícita; la repetición terminó sin errores. Véase `e2e-primer-fallo.txt`.

## Revisión visual

`concepto-generado.png` es una referencia de diseño, no evidencia de datos. `desktop-formulario.png`, `desktop-recarga.png` y `mobile.png` son capturas reales. Se inspeccionaron con view_image el concepto y las capturas finales.

Se compararon barra lateral y marca, jerarquía del título, tres estadísticas, buscador/filtros, anatomía de tarjetas, y formulario. Se conserva la dirección visual de la referencia. No es una reproducción exacta: se muestran datos reales, materia como texto libre, fecha opcional, etiquetas del contrato y una variante móvil apilada. El concepto no fue aprobado visualmente por el usuario; no se afirma fidelidad a un diseño aceptado que no existe.

## Límites de la entrega

CRUD restante diseñado, sin implementar. La API SQLite emite advertencia experimental. No hay cobertura porcentual calculada, autenticación ni prueba de carga. Portada y reflexión personal requieren revisión del estudiante; no se inventaron opiniones suyas.
