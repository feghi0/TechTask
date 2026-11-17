# Referencia de la API REST

Base local: `http://127.0.0.1:3001/api`. Base publicada: `https://techtask-generacion-t.onrender.com/api`. Contratos de código: `shared/contracts.ts`; reglas: SPEC. Los JSON de este manual son **ejemplos ilustrativos**, no logs de peticiones ejecutadas. Evidencia real en `docs/evidencias/`.

## Convenciones

- Cuerpos JSON y `Content-Type: application/json` en POST/PATCH/DELETE, excepto logout, que admite cuerpo vacío.
- Sesión por cookie `techtask_session`. No hay bearer token, API key ni propietario enviado por el cliente.
- Listados y objetos usan `{"data": ...}`; 204 no tiene JSON que parsear.
- Identificadores UUID; timestamps ISO UTC; fechas calendario YYYY-MM-DD o null.
- Sin filtros/paginación remotos implementados; la UI filtra la lista recibida. No asumir que parámetros `?search=` alteran la consulta.
- `version` es obligatoria en modificaciones y bajas; obtenerla de la última respuesta. Se rechaza una versión anterior con 409.
- Las lecturas y escrituras de dominio se restringen al dueño. Un recurso ajeno se presenta como 404, sin revelar su existencia.

## Sesión y salud

| Método/ruta | Body | Éxito | Errores principales |
|---|---|---|---|
| GET `/health` | — | 200 `{data:{status:"ok"}}` | 500 si no puede consultar la base. |
| POST `/auth/register` | email,password | 201 User y cookie; inicia sesión | 400 formato/longitud; 409 email duplicado; 429. |
| POST `/auth/login` | email,password | 200 User y cookie nueva | 400 estructura; 401 credenciales incorrectas; 429. |
| GET `/auth/me` | — | 200 User | 401 sin sesión válida. |
| POST `/auth/logout` | `{}` opcional | 204 y cookie retirada | Errores controlados de infraestructura. |

`User` contiene solo `id` y `email`. Email normalizado, hasta 254 caracteres antes de trim; contraseña entre **4 y 128 unidades de longitud de string JS**. No se devuelve hash, salt ni token en JSON. Logout invalida en servidor la sesión representada por la cookie, no todas las sesiones de la cuenta.

Ejemplo de registro ficticio:

```json
{"email":"estudiante@example.test","password":"Ejemplo-2026"}
```

## Proyectos

| Método/ruta | Body | Respuesta |
|---|---|---|
| GET `/projects` | — | 200 `Project[]` activos propios. |
| POST `/projects` | name, description? | 201 `Project`; Location del recurso. |
| GET `/projects/:id` | — | 200 `ProjectDetail`. |
| PATCH `/projects/:id` | version, name? y/o description? | 200 Project con versión incrementada. |
| DELETE `/projects/:id` | version | 204 si no hay tareas activas; baja lógica. |
| GET `/projects/:id/progress` | — | 200 Progress. |
| GET `/projects/:id/tasks` | — | 200 Task[] activas del proyecto. |
| POST `/projects/:id/tasks` | TaskInput | 201 Task pendiente y Location. |

Nombre: 3–80 puntos Unicode después de trim. Descripción: opcional, 0–4000. PATCH sin cambios devuelve 400; eliminar un proyecto con tareas activas devuelve 409 `PROJECT_NOT_EMPTY`. Un título/nombre no es una clave única.

`Project`:

```json
{
  "id":"11111111-1111-4111-8111-111111111111",
  "name":"Proyecto de Redes",
  "description":"Topología y documentación",
  "version":1,
  "createdAt":"2026-11-16T15:00:00.000Z"
}
```

`ProjectDetail` contiene `project`, `tasks`, `progress:{total,delivered,percentage}` y `conflicts:[{startDate,endDate,taskIds}]`. El porcentaje se redondea a entero; con cero tareas es 0. Cada conflicto contiene al menos tres tareas no entregadas en la ventana inclusiva de tres días del proyecto.

## Tareas

| Método/ruta | Body | Respuesta |
|---|---|---|
| GET `/tasks` | — | 200 Task[] propias, de todos los proyectos activos. |
| GET `/tasks/:id` | — | 200 Task propia activa. |
| PATCH `/tasks/:id` | version y campos TaskInput que cambian | 200 Task actualizada. |
| DELETE `/tasks/:id` | version | 204; baja lógica permitida. |
| PATCH `/tasks/:id/status` | version,status | 200 Task actualizada. |
| POST `/tasks/:id/dependencies` | version,dependencyId | 200 Task dependiente con versión incrementada. |
| DELETE `/tasks/:id/dependencies/:dependencyId` | version | 200 Task dependiente actualizada. |
| GET `/tasks/:id/history` | — | 200 History[] de cambios de estado. |

No existe alta mediante POST `/tasks` en el contrato privado actual: se crea dentro de un proyecto. No existe endpoint específico `/favorite`; se utiliza PATCH con `isFavorite`.

`TaskInput` para crear:

```json
{
  "title":"TP de Redes",
  "description":"Documentar la topología",
  "subject":"Redes",
  "priority":"high",
  "isFavorite":true,
  "dueDate":"2026-11-20"
}
```

Solo `title` y `subject` son obligatorios. Valores iniciales: description `""`, priority `medium`, isFavorite `false`, dueDate `null`, status `pending`. Para quitar una fecha por PATCH, enviar `dueDate:null`; omitir el campo conserva el valor previo.

`Task` agrega `id`, `projectId`, `status`, `createdAt`, `version`, `dependencyIds` y `urgency`. Urgencia: `none`, `overdue`, `immediate` o `soon`. La respuesta no expone `deleted_at` ni propietario.

PATCH de ejemplo:

```json
{"version":1,"title":"TP de Redes revisado","isFavorite":false,"dueDate":null}
```

Los campos desconocidos se rechazan, incluyendo `id`, `createdAt`, `ownerId` y `status` en TaskInput. Título 3–60, materia 1–100, descripción 0–10000 puntos Unicode; no se admite NUL. Prioridad: `low|medium|high`. Fecha: real, año no cero, exactamente YYYY-MM-DD; fechas pasadas admitidas.

## Estados, dependencias e historial

PATCH de estado:

```json
{"version":2,"status":"in_progress"}
```

La matriz de transiciones del [manual de usuario](01-usuario.md) se aplica en servidor. Solicitar el mismo estado también es inválido. Entregar requiere `in_progress` y todos los requisitos entregados. El rechazo no produce historial ni incremento de versión.

Agregar dependencia:

```json
{"version":3,"dependencyId":"22222222-2222-4222-8222-222222222222"}
```

La tarea del path requiere la del body, no al revés. Deben ser propias, activas, del mismo proyecto y no producir ciclos. Repetir el mismo vínculo devuelve 409, no una creación adicional. Agregar a una entregada se rechaza; quitar una dependencia válida se admite incluso de entregada y no modifica su estado.

`History` contiene `id`, `taskId`, `fromStatus`, `toStatus` y `createdAt`. No hay ruta para editar el historial. No usarlo como auditoría de cambios de descripción o como registro de identidad de múltiples colaboradores.

## Errores

```json
{"error":{"code":"DEPENDENCY_PENDING","message":"No se puede entregar: hay dependencias pendientes."}}
```

El campo opcional `fields` existe en el middleware, pero los validadores actuales suelen devolver `code/message`; un cliente no debe depender de que siempre aparezca.

| HTTP | Códigos usuales | Tratamiento |
|---|---|---|
| 400 | VALIDATION_ERROR, INVALID_REQUEST | Corregir body, tipos, UUID, claves o JSON. |
| 401 | UNAUTHENTICATED, INVALID_CREDENTIALS | Iniciar sesión o corregir credenciales. |
| 403 | ORIGIN_NOT_ALLOWED | Revisar origen del cliente; no sustituir por wildcard. |
| 404 | NOT_FOUND | Recurso inexistente, ajeno, dado de baja o ruta no disponible. |
| 409 | VERSION_CONFLICT | Volver a leer y revisar antes de reintentar. |
| 409 | PROJECT_NOT_EMPTY, TASK_DELIVERED, TASK_REFERENCED | Respetar restricciones de baja. |
| 409 | INVALID_TRANSITION, DEPENDENCY_PENDING, DELIVERED_DEPENDENT | Resolver condiciones del estado. |
| 409 | DEPENDENCY_CYCLE, CROSS_PROJECT_DEPENDENCY, DUPLICATE_DEPENDENCY | Corregir el grafo. |
| 409 | DUPLICATE_RECORD | Unicidad de base, por ejemplo email duplicado. |
| 413/415 | PAYLOAD_TOO_LARGE / UNSUPPORTED_MEDIA_TYPE | Body hasta 128 KB y formato JSON. |
| 429 | RATE_LIMITED | Esperar y reducir frecuencia. |
| 500 | INTERNAL_ERROR | Error controlado; revisar operación/infraestructura. |

Sin sesión, el middleware puede responder 401 antes de resolver una ruta privada inexistente. No se garantiza el orden de validación de todos los errores. No reenviar automáticamente una mutación después de un timeout: no hay claves de idempotencia implementadas.

## Ejemplo interactivo reproducible en PowerShell

Ejecutar preferentemente contra el entorno local. Se autentica una cuenta ya creada, sin escribir la contraseña literal en el historial. Estos comandos no fueron ejecutados por el manual sobre tu cuenta.

```powershell
$base = 'http://127.0.0.1:3001/api'
$correo = Read-Host 'Correo de tu cuenta local'
$clave = Read-Host 'Contraseña' -AsSecureString
$credenciales = @{
  email = $correo
  password = [System.Net.NetworkCredential]::new('', $clave).Password
} | ConvertTo-Json
$sesion = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-RestMethod "$base/auth/login" -Method Post -ContentType 'application/json' -Body $credenciales -WebSession $sesion
Remove-Variable credenciales, clave
$proyecto = Invoke-RestMethod "$base/projects" -Method Post -ContentType 'application/json' -Body '{"name":"Proyecto local de prueba"}' -WebSession $sesion
$tarea = Invoke-RestMethod "$base/projects/$($proyecto.data.id)/tasks" -Method Post -ContentType 'application/json' -Body '{"title":"TP de Redes","subject":"Redes"}' -WebSession $sesion
Invoke-RestMethod "$base/tasks/$($tarea.data.id)" -WebSession $sesion
Invoke-RestMethod "$base/auth/logout" -Method Post -ContentType 'application/json' -Body '{}' -WebSession $sesion
```

El ejemplo crea datos ficticios y no los elimina automáticamente. No imprimir el contenido de `$sesion` ni compartir sus cookies. En navegador se utiliza `credentials:'include'`; con frontend y API en dominios distintos, una allowlist CORS por sí sola no resuelve restricciones SameSite de la cookie.
