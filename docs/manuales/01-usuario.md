# Manual de usuario

## Acceso y cuenta privada

Abrir [TechTask](https://techtask-generacion-t.onrender.com). No requiere instalar programas. Para crear una cuenta, elegir **Crear cuenta**, ingresar un correo con formato válido y una contraseña de **4 a 128 caracteres**, y pulsar **Registrarme**. El registro inicia la sesión. Para volver después, ingresar correo/contraseña y elegir **Ingresar**.

El correo se normaliza quitando espacios exteriores y convirtiéndolo a minúsculas; no se envía un correo de confirmación. No es necesario ni conveniente usar información personal real para una demostración. Cada cuenta ve sus propios proyectos; no existen invitaciones ni proyectos compartidos entre cuentas.

Usar **Cerrar sesión** al terminar, especialmente en una computadora compartida. La sesión tiene una duración máxima de siete días y puede terminar antes si se revoca o se borra la cookie. Si se pierde la contraseña, esta versión no ofrece recuperación por correo, cambio de contraseña ni una pantalla de administración de cuentas. No prometer recuperar acceso desde la interfaz.

## Proyectos

1. En **Mis proyectos**, elegir **Nuevo proyecto**.
2. Completar un nombre de 3 a 80 caracteres y una descripción opcional de hasta 4000.
3. Pulsar **Crear proyecto** y luego **Abrir proyecto**.
4. Para editarlo, utilizar el botón con lápiz; la descripción puede quedar vacía.
5. Para eliminarlo, debe estar vacío de tareas activas. La aplicación pide confirmación; si tiene tareas, la operación no está permitida.

La eliminación es lógica: retira el registro de la vista activa; no hay papelera ni botón de restauración. Un proyecto grupal puede ser organizado por una persona desde su cuenta, pero esto no da acceso al resto del grupo.

## Crear y editar tareas

Dentro de un proyecto, elegir **Nueva tarea**. Completar:

| Campo | Requisito |
|---|---|
| Título | Obligatorio, de 3 a 60 caracteres después de quitar espacios de los extremos. |
| Materia | Obligatoria, de 1 a 100 caracteres; texto libre, sin catálogo oficial. |
| Descripción | Opcional, hasta 10000 caracteres. |
| Prioridad | Baja, media o alta; por defecto media. |
| Fecha de entrega | Opcional; una fecha calendario real. |
| Favorita | Opcional; puede cambiarse después con la estrella. |

Pulsar **Guardar tarea** y esperar la confirmación. Una tarea nueva siempre comienza **Pendiente**. El identificador y la fecha de creación los genera el servidor. El texto del título no necesita ser único: se permiten dos tareas con el mismo nombre.

Para editar, elegir el lápiz de la tarjeta. Para cambiar estado, dependencias o consultar historial, elegir **Gestionar**. Si la red falla, no asumir que guardar funcionó: revisar el mensaje y recargar antes de repetir una operación que pudiera crear un duplicado.

## Estados y entrega

| Estado actual | Cambios permitidos |
|---|---|
| Pendiente | En desarrollo o Bloqueada. |
| En desarrollo | Pendiente, Bloqueada o Entregada. |
| Bloqueada | Pendiente o En desarrollo. |
| Entregada | En desarrollo, si no perjudica una entrega dependiente. |

No se entrega directamente desde Pendiente o Bloqueada. **Bloqueada** es un estado elegido por el usuario: tener dependencias pendientes no cambia automáticamente el estado a Bloqueada, aunque sí impide entregar.

En **Gestionar**, seleccionar **Nuevo estado** y **Cambiar estado**. Cada cambio exitoso aparece en **Historial de estados**, con estado anterior, nuevo y fecha. El historial no registra todas las ediciones de texto ni cada cambio de favorita.

## Dependencias: ejemplo completo

1. Crear **Diseñar topología** y **TP de Redes** en el mismo proyecto.
2. Abrir **Gestionar** en TP de Redes.
3. En **Tarea requerida**, elegir Diseñar topología y agregar la dependencia.
4. Pasar TP de Redes a En desarrollo e intentar entregarla: será rechazada mientras el diseño no esté entregado.
5. Pasar Diseñar topología a En desarrollo y luego Entregada.
6. Volver a TP de Redes y entregarla. El servidor comprueba los requisitos nuevamente.

Todas las dependencias son obligatorias. No se permiten relaciones entre proyectos, duplicados, una tarea que dependa de sí misma ni ciclos indirectos. Si A requiere B y B requiere C, C no puede requerir A.

Para quitar un requisito, usar **Quitar**. Quitar una dependencia válida no cambia el estado de la tarea, incluso si está entregada. Agregar nuevos requisitos a una entregada exige reabrirla. No se puede reabrir una tarea si otra ya entregada depende de ella; hay que revisar primero la entrega dependiente.

## Eliminar una tarea

Usar **Gestionar → Eliminar tarea → Confirmar eliminación**. Solo se permite si no está Entregada y ninguna tarea activa depende de ella. No se borran automáticamente las otras tareas. Si la operación se rechaza, el mensaje explica el motivo. No hay recuperación desde la interfaz.

## Buscar, filtrar y marcar favoritas

El buscador consulta título y descripción sin distinguir mayúsculas/minúsculas; no es una búsqueda semántica ni garantiza ignorar tildes. Los filtros de materia y estado y **Solo favoritas** se combinan. La estrella guarda la preferencia en el servidor.

Los filtros afectan la lista visible; los indicadores y el progreso representan el conjunto de tareas activas del proyecto. Ver una lista filtrada vacía no significa que se hayan eliminado las demás tareas.

## Progreso, prioridad y fechas

El progreso es tareas entregadas dividido por tareas activas, redondeado a un porcentaje entero; un proyecto vacío muestra 0 %. No se guarda un porcentaje manual. La prioridad declarada no cambia por la fecha.

| Situación de una tarea no entregada | Indicador |
|---|---|
| Fecha anterior a hoy | Vencida. |
| Hoy o dentro de los próximos 3 días | Urgencia inmediata. |
| Entre 4 y 7 días | Próxima a vencer. |
| Más de 7 días o sin fecha | Sin alerta por vencimiento. |

Se utiliza el calendario de Buenos Aires. Las entregadas no se muestran urgentes. Se admiten fechas pasadas para registrar trabajo atrasado. Si al menos tres tareas no entregadas del proyecto coinciden dentro de una ventana de tres días calendario, aparece una advertencia de acumulación; no bloquea el guardado ni asigna horarios automáticamente.

## Mensajes y problemas habituales

| Mensaje/situación | Acción |
|---|---|
| Datos inválidos | Corregir el campo indicado y guardar otra vez. |
| Dependencias pendientes | Completar requisitos o revisar la relación; no repetir sin cambios. |
| El registro cambió / conflicto de versión | Revisar los datos recargados; repetir la edición sobre la versión actual. |
| Sesión terminada | Volver a ingresar. |
| Demasiadas solicitudes | Esperar el plazo indicado. |
| Sin coincidencias | Limpiar filtros y búsqueda. |
| No se pudo conectar | Revisar red, esperar el arranque del hosting y usar Reintentar. |

El plan gratuito puede tardar en despertar. No hay notificaciones por correo, alertas de escritorio, adjuntos ni exportación desde la interfaz. El [manual de soporte](08-soporte-mantenimiento.md) explica el diagnóstico técnico.
