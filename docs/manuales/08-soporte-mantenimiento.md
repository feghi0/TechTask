# Manual de soporte y mantenimiento

## Diagnóstico por capas

No corregir un síntoma borrando datos o relajando seguridad. Primero determinar si el problema está en navegador, API, sesión, regla de negocio, base o proveedor. Conservar el primer fallo reproducible y las acciones realizadas.

| Síntoma | Comprobación | Acción segura |
|---|---|---|
| Web tarda al abrir | Health y estado de hosting | Esperar arranque del plan gratuito; luego revisar disponibilidad. |
| Pantalla vacía | Consola y carga de assets | Revisar build/ruta de estáticos y versión; no reinstalar la base. |
| Login rechazado | Estado HTTP y correo | Verificar cuenta, contraseña mínima4 y formato; no hay recuperación UI. |
|401 después de ingresar | Cookie/origen/HTTPS/expiración | Volver a ingresar; revisar mismo origen y flags; no poner tokens en localStorage. |
|403 | Origin y allowlist | Configurar origen exacto autorizado; no usar `*` con credenciales. |
|409 | Leer error.code y mensaje | Distinguir versión obsoleta de dependencia/ciclo/baja prohibida. |
|400 | Cuerpo y límites del contrato | Corregir datos, UUID o claves extra; no desactivar validación del servidor. |
|413 /415 | Tamaño / Content-Type | Reducir body o usar JSON; no subir límites sin analizar contrato. |
|429 | Frecuencia/IP | Esperar; evitar bucles de reintento; redes compartidas comparten cuota. |
|500 o health 500 | Logs y conectividad de DB | Revisar secreto, TLS, disponibilidad y migración; ocultar valores sensibles. |
| Tareas “desaparecidas” | Cuenta, filtros, proyecto, base efectiva | Limpiar filtros y verificar entorno; no seedear datos encima para ocultarlo. |
| Puerto ocupado | Procesos propios y terminales | Detener la instancia propia; no matar procesos ajenos indiscriminadamente. |
| Error de directorio PGlite | Ruta/permisos/otra instancia | Confirmar directorio y un solo escritor; respaldar antes de intervenir. |
| Build falla | Primer error de types/build | Resolver causa concreta; no declarar éxito porque compila otra versión. |

## Ficha mínima de incidente

Registrar fecha y zona, entorno, URL sin secretos, commit funcional, pasos, resultado esperado/obtenido, HTTP/código, alcance de afectados, evidencia redactada y acción/reversión. Nunca incluir contraseña, cookie, token, dump completo o conexión de base. Preferir IDs ficticios cuando sea posible.

Clasificar: indisponibilidad/seguridad; pérdida o inconsistencia de datos; operación bloqueada; problema de presentación/documentación. Un rechazo de una entrega sin requisitos completados es comportamiento correcto, no una incidencia de disponibilidad.

## Mantenimiento planificado

- Revisar salud, logs y cuotas antes de una exposición o uso relevante.
- Revisar respaldos y ensayar restauración según política acordada; no hay tarea programada propia.
- Revisar dependencias con herramientas de diagnóstico; una recomendación de actualización no autoriza un cambio mayor automático.
- Para actualizar dependencias, crear rama, revisar compatibilidad, modificar lockfile y ejecutar tests/build/e2e pertinentes. No ejecutar actualizaciones forzadas sobre main por reflejo.
- Mantener documentación, decisiones y evidencia junto a cada cambio funcional.
- Limpiar datos de prueba o recursos solo con alcance y autorización claros. La aplicación no tiene limpieza global ni purga automática de bajas.

## Recuperación de cuenta

No existe enlace de “Olvidé mi contraseña”, edición de correo ni administración de usuarios. El soporte puede explicar el límite, pero no leer la contraseña original: se almacena una derivación no reversible. No prometer un reseteo por correo que no está implementado ni cambiar hashes de producción sin un procedimiento autorizado y probado.

## Escalamiento

Usuario → responsable del proyecto con datos redactados. Responsable revisa navegador/API y, si hay fallo de infraestructura, al titular de Render/Neon. Un colaborador de GitHub no obtiene automáticamente acceso a los proveedores ni a datos privados. Mantener control de cambios y registrar quién autorizó una operación sobre producción.

## Cierre

Corregir, reproducir el caso, agregar regresión cuando corresponda, ejecutar comprobaciones y documentar. Publicar solo el commit elegido y verificar la URL real. Cerrar el incidente con evidencia del comportamiento recuperado, sin borrar el log del fallo original.
