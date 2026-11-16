# TechTask — Diseñando el backend de mi aplicación

**TP 4 · Generación T · Streambe**  
Escuela Técnica N.º 35 · Sexto año de Computación  
Estudiante: **[completar nombre y apellido]**  
Fecha: 16 de noviembre de 2026

## Introducción y antecedentes

TechTask organiza proyectos técnicos, trabajos prácticos y entregas escolares. Permite describir tareas, identificar su materia, prioridad y vencimiento. El TP 1 especificó la aplicación; el TP 2 trató el refactoring de validateAndProcessTask; el TP 3 modeló Multiverse, un proyecto independiente. Estos antecedentes provienen del texto del usuario: no se inspeccionaron PDFs ni un repositorio anterior.

Esta implementación se reconstruye desde cero. La especificación original contemplaba localStorage; ahora los datos se almacenan en una base controlada por el servidor. Esto independiza la persistencia del navegador y permite aplicar restricciones en un punto central. No agrega autenticación ni sincronización multiusuario.

## Funcionalidades y entidades

La entidad inicial es Task. Materia es texto libre obligatorio; no existe aún catálogo que justifique otra tabla. Los indicadores se derivan de las tareas, sin duplicar datos en una entidad Dashboard.

| Funcionalidad | Comportamiento y alcance |
|---|---|
| Crear | Formulario conectado con POST; confirmación solo tras recibir éxito del servidor. |
| Listar | GET recupera datos de SQLite al cargar la interfaz. |
| Buscar | Coincidencia parcial sin distinguir mayúsculas en título o descripción. |
| Filtrar | Materia, estado y favoritas sobre los datos recibidos; filtros combinables. |
| Estadísticas | Total, en desarrollo y entregadas sobre el conjunto completo. |
| Vencimiento | Identifica vencidas y próximas dentro de tres días calendario. |
| Favoritas | Se define al crear y se visualiza/filtra; cambio posterior pendiente. |
| Editar/eliminar/estado | Diseñados; pendientes de implementación. |

## Datos y reglas

| Campo | Tipo y restricciones |
|---|---|
| id | UUID, clave primaria, generado por servidor e inmutable. |
| title | Texto obligatorio, trim, 3–60 caracteres según longitud de string JS. |
| description | Texto opcional. |
| subject | Texto obligatorio no vacío tras trim. |
| status | pending, in_progress, blocked o delivered; inicial pending. |
| priority | low, medium o high; inicial medium. |
| isFavorite | Booleano; inicial false; SQLite lo representa con 0/1. |
| dueDate | Fecha calendario ISO YYYY-MM-DD opcional, validación de existencia real. |
| createdAt | Fecha/hora UTC ISO generada por servidor. |

No se agrega updatedAt porque las actualizaciones están fuera del incremento. Se admiten vencimientos pasados. Una tarea no entregada está próxima a vencer entre hoy y los tres días siguientes inclusive; antes de hoy está vencida. El calendario de la interfaz es el local del usuario.

El servidor rechaza objetos inválidos, tipos incorrectos y claves desconocidas, incluyendo id y createdAt. SQL usa parámetros. SQLite también restringe título, materia, enumeraciones y booleano. El cuerpo JSON está limitado a 32 KB como límite técnico explícito.

Las transiciones futuras permitirán cualquiera de los cuatro estados: la especificación no requiere un flujo más restrictivo. Registros inexistentes devolverán 404 cuando se implementen rutas individuales. Hoy esas rutas no están disponibles y devuelven 404 de ruta.

## Separación y arquitectura

React presenta datos; useTasks administra carga y estado; tasksApi ejecuta fetch. El controlador traduce HTTP, el servicio valida y genera ID/fecha, y el repositorio ejecuta SQL. El middleware convierte errores en JSON controlado. shared/task.ts comparte contratos estáticos, sin importar código de SQLite en el navegador.

El diagrama está en `02-arquitectura.mmd`. Esta división permite probar reglas y HTTP, sin ORM ni abstracciones que excedan el alcance académico. SQLite síncrono simplifica el proyecto local; no es una propuesta para altas cargas concurrentes.

## API diseñada

Éxitos: `{ "data": Task }` o `{ "data": Task[] }`. Errores: `{ "error": { "code": "...", "message": "...", "fields": {} } }`; fields se incluye cuando corresponde.

| Método y ruta | Parámetros/body | Éxito | Errores | Estado |
|---|---|---|---|---|
| GET /api/tasks | Sin body ni filtros remotos | 200, data: array | 500 controlado | Implementado |
| POST /api/tasks | title, subject; opcionales description, status, priority, isFavorite, dueDate | 201, data: tarea y Location | 400 validación/JSON, 413 tamaño, 415 formato, 500 | Implementado |
| GET /api/tasks/:id | UUID en ruta | 200, data: tarea | 400 UUID, 404 registro, 500 | Diseñado |
| PATCH /api/tasks/:id | UUID y objeto parcial no vacío de campos editables | 200, data: tarea | 400 campos/UUID, 404 registro, 500 | Diseñado |
| PATCH /api/tasks/:id/status | UUID y `{ "status": "in_progress" }` | 200, data: tarea | 400 estado/UUID, 404 registro, 500 | Diseñado |
| DELETE /api/tasks/:id | UUID, sin body | 204 sin contenido | 400 UUID, 404 registro, 500 | Diseñado |

La cabecera Location anticipa la ruta individual diseñada; esa ruta todavía no es consultable. No hay paginación: se justifica para el volumen escolar local. La API escucha solo en loopback y Vite usa proxy, sin necesidad de CORS abierto.

## Comparación y decisión

localStorage era sencillo y sin servidor, pero depende del navegador y no cumple el objetivo actual. SQLite permite persistencia y validación central. Dentro de SQLite se compararon el módulo integrado de Node y better-sqlite3. El usuario eligió A (integrado); Node 22.21.0 confirmó compatibilidad con advertencia experimental. La alternativa B incorporaría una dependencia nativa adicional. Véase `04-registro-ia.md` para no confundir propuesta de IA con reflexión del estudiante.

## Flujo implementado

1. El estudiante completa título y materia, y opcionalmente otros datos.
2. React realiza validaciones de formulario y envía JSON por fetch.
3. Express y el controlador reciben POST /api/tasks.
4. El servicio valida todos los campos, aplica valores iniciales y genera UUID/createdAt.
5. El repositorio inserta mediante SQL parametrizado en SQLite.
6. El controlador devuelve 201 y la tarea almacenada.
7. El hook incorpora la respuesta al listado; la interfaz confirma el guardado.
8. Al recargar, GET vuelve a consultar SQLite. No se usa localStorage para tareas.

## Pruebas y evidencias

Consultar `03-evidencias/` para resultados reales, comandos y alcance de las comprobaciones. Las pruebas cubren reglas, endpoints, errores y persistencia tras cerrar y reabrir una base temporal. La prueba de navegador debe acreditar de forma independiente la creación y recarga de la interfaz. La compilación no reemplaza esa comprobación.

## Conclusiones técnicas y personales

La separación de capas permite localizar la validación y el SQL y verificar el flujo sin depender de un navegador. La ampliación del CRUD debe mantener ese límite y comenzar por pruebas de sus reglas.

**Pendiente del estudiante:** completar datos de portada, cuestionamiento personal de la propuesta, justificación propia de la elección y reflexión final. Este informe no atribuye al estudiante opiniones ni acciones que no haya confirmado. La entrega académica requiere esa revisión humana.
