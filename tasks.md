# Tareas del Proyecto Final

Cada fila registra unidad revisable. Actualizar solo con evidencia real. Dependencias indican orden lógico aunque haya trabajo paralelo de preparación. El commit histórico TP4 conserva trabajo previo con fecha actual.

| ID | Título / descripción | Responsable | RN / HU | Depende | Terminado cuando / tests | Estado |
|---|---|---|---|---|---|---|
| T01 | Auditar código, remoto y defectos | Analista/Arquitecto/Revisor | Todas | — | Diagnóstico y verificaciones sin cambios | Terminada: auditoría en chat y docs |
| T02 | Registrar base TP4 en GitHub | Root | RN11 | T01 | Commit real y remoto coincide | Terminada: push inicial verificado |
| T03 | Especificar alcance, reglas, agentes y plan | Analista/Root | Todas / HU01–12 | Aprobación | Archivos coherentes con aprobación | Terminada: evidencia en docs/evidencias |
| T04 | Regresiones y motor PostgreSQL con migraciones | Backend/Tester | RN01/09/11 | T03 | Unicode/claves extra probadas; schema aplicado y reabierto | Terminada: evidencia en docs/evidencias |
| T05 | Cuentas privadas y sesiones | Backend/Frontend/Tester | RN09/11 / HU01/11 | T04 | Registro/login/logout, cookies y aislamiento probados | Terminada: evidencia en docs/evidencias |
| T06 | Proyectos propios y progreso vacío | Backend/Frontend | RN07/09/11 / HU02 | T05 | Crear/editar/borrar vacío; datos ajenos 404 | Terminada: pruebas y evidencia registradas |
| T07 | CRUD de tareas y versiones | Backend/Frontend/Tester | RN01/02/03/09/12 / HU03/04/12 | T06 | Edición, favorita y baja permitida; obsoleta 409 | Terminada: pruebas y evidencia registradas |
| T08 | Dependencias y grafo transaccional | Backend/Tester | RN05/06/12 / HU05 | T07 | Sin self/cross/duplicate/cycles, incluida carrera | Terminada: pruebas y evidencia registradas |
| T09 | Estados y entrega protegida con historial | Backend/Frontend/Tester | RN03/05/10/12 / HU06/07/08 | T08 | Rechazo no altera historial; entrega válida atómica | Terminada: pruebas y evidencia registradas |
| T10 | Progreso, urgencia y conflictos | Backend/Frontend/Tester | RN04/07/08 / HU07/09 | T09 | 0/3/4/7/8, ventanas y porcentajes verificados | Terminada: pruebas y evidencia registradas |
| T11 | UI completa y e2e responsive | Frontend/Tester | Todas / HU01–12 | T05–10 | Flujo real, errores, filtros, teclado y móvil | Terminada: pruebas y evidencia registradas |
| T12 | Importación segura y demo privada | Root/Backend | RN09/11 | T07 | SQLite intacto; importar destino autenticado; seed ficticio | Terminada: pruebas y evidencia registradas |
| T13 | Revisión seguridad y CI PostgreSQL | Revisor/Tester/Root | RN09/12 | T04–11 | Tests CI, sin secretos, revisión corregida | Terminada: pruebas y evidencia registradas |
| T14 | Hosting y base externa | Root | RN09/11 | T13 | URLs reales, migraciones, flujo público privado probado | Terminada: Render live y e2e público |
| T15 | Informe, evidencias y matriz final | Root/Analista | Todas | T11–14 | Documentos y estados respaldados, remoto actualizado | Terminada: pruebas y evidencia registradas |
| T16 | Ajustar mínimo de contraseña a4 por pedido del usuario | Root | HU01/RN09 | T05 | Registro/login4, rechazo3,60 tests y verificación pública | Terminada: evidencia password4 |
| T17 | Relevar y completar manuales/documentación | Root | Documentación | T16 | Inventario,11 manuales, índice y enlaces/rutas comprobados | Terminada: docs/README.md y relevamiento-actual.md |

No se marca completada la implementación general hasta que T14 esté verificada. Una tarea con código pero sin pruebas sigue en curso.

## Verificación final

Etapa inicial:59 pruebas locales y57 en base Neon aislada; CI 43985660035 exitoso (PostgreSQL 16+Chromium); e2e público 1/1 y seguridad HTTPS. T14 desplegó commit 1285e23 en Render y se repitió el recorrido tras live. Detalle por casos: docs/informe-pruebas.md. La documentación/formato posteriores no cambian reglas; sincronización GitHub se verifica antes de entregar.

Estado posterior:60 pruebas por actualización de contraseña, CI43987809403 y43988065141 exitosos. El relevamiento documental no cambió comportamiento de la aplicación.
