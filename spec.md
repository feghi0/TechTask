# SPEC — TechTask Proyecto Final

Estado: alcance aprobado en chat el 16/11/2026. Fuente funcional, no afirmación de implementación. Consultar tasks.md y matriz para estado real.

## Objetivo, usuarios y exclusiones

Gestión privada de proyectos técnicos y entregas de estudiantes. Un único rol: propietario autenticado de su espacio. Cada cuenta solo puede acceder a sus datos. Excluye colaboración entre cuentas, IA en producto, chat, adjuntos, recuperación/verificación de correo y notificaciones externas.

## Entidades

User: UUID, email único normalizado, hash de contraseña y creación. Session: token hash único, usuario y expiración. Project: UUID, propietario, nombre 3–80 puntos Unicode, descripción hasta 4000, creación y versión. Task: UUID, projectId, título 3–60 puntos Unicode, descripción hasta 10000, materia obligatoria hasta 100, status, priority, isFavorite, dueDate calendario opcional, createdAt, version y baja lógica. TaskDependency: tarea dependiente y requisito, par único. TaskHistory: ID, tarea, estado anterior/nuevo y fecha. Nunca devolver hashes ni tokens en JSON.

## Reglas numeradas

| ID | Descripción / datos / justificación | Validación y responsable | Válido, inválido y límites | Verificación |
|---|---|---|---|---|
| RN01 | Título trim 3–60 puntos Unicode. Evita tareas vacías y límites divergentes. | Service; CHECK de base consistente. | 3/60 válidos; 2/61 inválidos; emojis se cuentan por puntos de código. | Unitarias y POST/PATCH. |
| RN02 | Materia texto trim 1–100, no catálogo. | Service y NOT NULL/CHECK. | Redes válido; vacío, null o tipo no texto inválidos. | Tipos, blancos, límites. |
| RN03 | pending/in_progress/blocked/delivered. Crear pending; matriz inferior. | Service transaccional. | No entregar desde pending o blocked; no reabrir si perjudica entregadas dependientes. | Matriz y reapertura. |
| RN04 | Fecha en calendario AR: anterior vencida, 0..3 inmediata, 4..7 próxima, >7 o sin fecha ninguna; delivered nunca urgente. | Service con fecha actual inyectable/calculada en zona acordada. | Hoy incluido inmediato; 3/4/7/8; cruce de mes y bisiesto. | Unitarias con fechas fijas. |
| RN05 | Todas las dependencias obligatorias y del mismo proyecto; entrega solo si están delivered. | Service y FKs. | Varias entregadas válido; una pendiente, baja o ajena inválido. | HTTP y recorrido e2e. |
| RN06 | Prohibir ciclos, duplicados y autorreferencia. | Service dentro de transacción bloqueando proyecto; UNIQUE/CHECK. | A→B→C válido; C→A inválido. | Ciclos de 1,2,3 nodos y concurrencia. |
| RN07 | Progreso derivado de entregadas/activas; sin tareas 0%. | Consulta/Service; sin columna porcentaje. | 1/3 da porcentaje calculado; bajas excluidas. | Vacío, parcial, completo. |
| RN08 | Advertir >=3 no entregadas con fecha dentro de ventana inclusiva de 3 días (diferencia máxima 2). No bloquea. | Service; incluye tareas activas del proyecto consultado. | Fechas 16/17/18 conflicto; 16/17/19 no forman esa ventana. | Límites y exclusión entregadas. |
| RN09 | Toda entrada validada; dueño obligatorio en cada consulta; claves extra rechazadas. | Middleware/Service/Repository. | 401 anónimo; 404 recurso ajeno; 400 tipos, claves extra o UUID inválido. | Dos cuentas y claves especiales. |
| RN10 | Cambios de estado guardan from/to/fecha en la misma transacción. | Service/Repository. | Cambio exitoso genera fila; rechazo no genera fila. | Atomicidad e historial. |
| RN11 | Base PostgreSQL persistente y migraciones; preservar SQLite previo. | Database/Repository; operación de importación explícita. | Recarga/reapertura conserva; no recrear datos en memoria de UI. | Reabrir base, e2e, importación. |
| RN12 | Versión obligatoria en mutaciones; serializar operaciones críticas por proyecto. | Service/Repository transaccional. | Una versión vigente escribe; segunda edición obsoleta 409. | Solicitudes simultáneas y rollback. |

RN08 se limita al proyecto consultado para hacer comprensible la advertencia en su detalle; el dashboard no promete alertas globales entre cuentas ni recomendaciones de carga. Es una precisión técnica del alcance autónomo registrado.

Transiciones: pending→in_progress/blocked; in_progress→pending/blocked/delivered; blocked→pending/in_progress; delivered→in_progress si ningún dependiente activo está delivered. Solicitar el mismo estado se rechaza como transición inválida. Agregar dependencias a una tarea delivered no está permitido. Quitar dependencia válida no cambia automáticamente el estado. Eliminar tarea: solo no entregada y sin dependientes activos; baja lógica. Eliminar proyecto: solo sin tareas activas.

## Autenticación y seguridad

Registro con email normalizado y contraseña de 4–128 caracteres; derivación scrypt y salt aleatorio. Sesión opaca con cookie HttpOnly/SameSite=Lax, Secure en producción, duración finita. Logout invalida sesión. Mutaciones JSON; rechazar origen externo no permitido. CORS exacto si frontend separado y credenciales; no usar wildcard. Rate limits proporcionales. No almacenar tokens en localStorage ni usar credenciales reales en seed. Sin recuperación: explicar límite en README.

## Historias y aceptación Dado / Cuando / Entonces

| HU | Historia / criterio | Reglas |
|---|---|---|
| HU01 | Dado un visitante sin sesión, cuando registra credenciales válidas e inicia sesión, entonces accede solo a su espacio; sin sesión la API privada responde 401. | RN09/11 |
| HU02 | Dada una cuenta, cuando crea un proyecto válido, entonces aparece solo en su listado y persiste al recargar. | RN09/11 |
| HU03 | Dado un proyecto propio, cuando crea una tarea válida, entonces recibe 201 con ID/fecha del servidor y estado pending. | RN01/02/03/09/11 |
| HU04 | Dada una tarea propia y versión vigente, cuando edita o marca favorita, entonces se actualiza y aumenta versión; versión vieja devuelve 409. | RN01/02/09/12 |
| HU05 | Dadas tareas del mismo proyecto, cuando agrega un requisito, entonces aparece como dependencia; si produce ciclo o duplicado se rechaza sin cambios. | RN05/06/12 |
| HU06 | Dada una tarea en desarrollo con requisitos pendientes, cuando intenta entregar, entonces recibe motivo de rechazo y no cambia estado ni historial. | RN03/05/10 |
| HU07 | Dados todos sus requisitos entregados, cuando entrega desde desarrollo, entonces estado, progreso e historial se actualizan juntos. | RN03/05/07/10/12 |
| HU08 | Dada una tarea con dependientes entregados, cuando intenta reabrirla o borrarla, entonces la operación se rechaza manteniendo integridad. | RN03/05/12 |
| HU09 | Dadas fechas de entrega, cuando consulta el proyecto, entonces ve urgencia por calendario y advertencias de acumulación con criterios explícitos. | RN04/08 |
| HU10 | Dadas varias tareas, cuando busca o filtra por materia/estado/favorita, entonces ve coincidencias sin alterar los datos persistidos. | RN09/11 |
| HU11 | Dadas dos cuentas, cuando una usa el ID de la otra, entonces no recibe sus tareas, proyectos ni historial. | RN09 |
| HU12 | Dada una tarea no entregada y sin dependientes, cuando la elimina con versión actual, entonces deja de estar activa; proyecto con tareas no se elimina. | RN05/07/11/12 |

## Contratos HTTP

Éxitos `{data:T}` salvo DELETE/logout 204. Errores `{error:{code,message,fields?}}`, sin SQL ni stack al cliente. 400 validación/UUID; 401 sesión; 403 origen; 404 inexistente/ajeno; 409 conflicto de regla o versión; 413 tamaño; 415 formato; 429 límite; 500 controlado.

| Método/ruta | Entrada | Salida |
|---|---|---|
| POST /api/auth/register | email,password | 201 User + cookie |
| POST /api/auth/login | email,password | 200 User + cookie |
| GET /api/auth/me | cookie | 200 User |
| POST /api/auth/logout | cookie | 204 |
| GET /api/projects | cookie | Project[] |
| POST /api/projects | name,description? | 201 Project |
| GET /api/projects/:id | UUID | ProjectDetail: project,tasks,progress,conflicts |
| PATCH /api/projects/:id | version,name?,description? | Project |
| DELETE /api/projects/:id | version | 204 si vacío |
| GET /api/projects/:id/tasks | UUID | Task[] |
| POST /api/projects/:id/tasks | TaskInput | 201 Task |
| GET /api/tasks | cookie | Task[] propias |
| GET /api/tasks/:id | UUID | Task |
| PATCH /api/tasks/:id | version y campos editables | Task con nueva versión |
| DELETE /api/tasks/:id | version | 204 |
| PATCH /api/tasks/:id/status | version,status | Task |
| POST /api/tasks/:id/dependencies | version,dependencyId | Task |
| DELETE /api/tasks/:id/dependencies/:dependencyId | version | Task |
| GET /api/tasks/:id/history | UUID | History[] |
| GET /api/projects/:id/progress | UUID | Progress |

Los contratos TypeScript están en shared/contracts.ts. El POST global del TP4 deja de aceptar creaciones anónimas: el nuevo alta requiere proyecto propio. Los documentos TP4 describen un contrato histórico, no el actual.

## Requisitos no funcionales

Interfaz en español, adaptable y accesible por teclado, etiquetas visibles, errores accionables, carga y vacíos reales. Sin dependencias superfluas ni secretos. Tests reproducibles y commits por tarea. No declarar publicación hasta verificar app pública. No medir rendimiento o cobertura con números inventados. PGlite permite ejecutar SQL PostgreSQL local, pero concurrencia con Pool y configuración TLS requieren verificación sobre PostgreSQL remoto.
