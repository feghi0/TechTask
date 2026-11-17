# Informe de planificación y pruebas

## Estrategia y entorno

SPEC aprobada → criterios HU/RN → pruebas independientes → rojo → implementación → verde → revisión. No se usa porcentaje de cobertura ni una métrica de «precisión del agente» inventada: estos casos evalúan comportamiento del sistema sobre entradas conocidas, no capacidad general de la IA.

Local: Windows, Node 22.21.0, PostgreSQL embebido PGlite y SQLite solo para importación de legado. Batería local: 59 casos en 4 archivos. Remoto: 57 casos de HTTP/calendario sobre Neon PostgreSQL 16, exclusivamente en techtask_test; importación y arranque de directorio son 2 casos locales adicionales. CI ejecuta la batería con servicio PostgreSQL 16 más Chromium. Navegador local y público: Edge, escritorio 1600×1050 y móvil 390×844.

## Casos y trazabilidad

Todos los resultados siguientes tienen respaldo en tests-verde.txt, tests-postgresql-remoto.txt, ci-verde.json/ci-verde.txt y registros e2e. Los tests ejecutables definen entradas exactas y aserciones; esta tabla agrupa casos relacionados sin sumar grupos como si fueran tests adicionales.

| ID | Requisito | Entrada / esperado previamente | Obtenido | Estado / evidencia |
|---|---|---|---|---|
| P01 | HU01/RN09 cuenta | Sin sesión→401; registro válido→201; me solo ID/email | Coincide | Aprobado, tests/tasks.test.ts |
| P02 | HU01 sesión | Email normalizado, cookie HttpOnly/Lax, password incorrecta 401; logout revoca cookie original | Coincide | Aprobado, tests y seguridad-https.json |
| P03 | HU11 propiedad | Dos cuentas, IDs ajenos→404, listados separados | Coincide | Aprobado, HTTP y e2e |
| P04 | RN01 Unicode | Longitudes 2/61 rechazadas;3/60 válidas; dos emojis 400, no 500 | Coincide | Aprobado, regresión HTTP |
| P05 | RN02/09 entrada | Materia vacía/tipos, fecha inexistente, enums, ID/createdAt y __proto__→400 | Coincide | Aprobado, HTTP |
| P06 | RN09 PostgreSQL text | NUL en título, materia, descripción, proyecto/email→400 antes SQL | Coincide | Aprobado, revisión→regresión |
| P07 | RN01 límites técnicos | Descripción 10000 emojis aceptada; JSON 150000 caracteres→413 | Coincide | Aprobado, HTTP 128KB |
| P08 | HU02/04 proyectos | Alta/edición versión; borrar proyecto con tareas 409 | Coincide | Aprobado |
| P09 | RN03 estado | Crear pendiente; transición inválida 409; valores extra 400 | Coincide | Aprobado |
| P10 | RN05/06 grafo | Self, duplicado, cross-project y ciclo indirecto rechazados sin cambios | Coincide | Aprobado, HTTP |
| P11 | HU06 entrega | Pendiente requerida no entregada→409, sin nuevo historial | Coincide | Aprobado, captura 03 |
| P12 | HU07/08 integridad | Entregar requisito habilita entrega; reabrir requisito con dependiente entregado 409 | Coincide | Aprobado |
| P13 | RN05 baja | Entregada/referenciada 409; no entregada sin dependientes baja lógica | Coincide | Aprobado |
| P14 | RN05 retiro | Quitar dependencia válida de entregada conserva estado y aumenta versión | Coincide | Aprobado |
| P15 | RN07/08 cálculos | Vacío 0%; entregadas/total;3 entregas en ventana inclusiva 3 días advierten | Coincide | Aprobado, calendario/HTTP |
| P16 | RN04 calendario | Bordes 0/3/4/7/8, vencida, sin fecha, entregada, medianoche AR, bisiesto/año | Coincide | Aprobado,12 tests calendario |
| P17 | RN12 carrera edición | Dos PATCH misma versión: una actualización, otra 409 | Coincide | Aprobado local y remoto |
| P18 | RN06/12 carrera grafo | Dos enlaces que formarían ciclo: no quedan ambos | Coincide | Aprobado local y remoto |
| P19 | RN03/12 carrera entrega | Entregar dependiente vs reabrir requisito: estado final consistente | Coincide | Aprobado local y remoto |
| P20 | RN09 errores | JSON malformado 400, tipo 415, fallo de base 500 sin stack/SQL, health 500 con base cerrada | Coincide | Aprobado |
| P21 | RN11 persistencia | Cerrar/reabrir base conserva tarea; recarga UI vuelve a GET | Coincide | Aprobado, captura 06 |
| P22 | RN11 importación | SQLite sintético, preservar IDs/fechas/estados, hash fuente idéntico; repetición revierte proyecto extra | Coincide | Aprobado, importacion-tests.txt |
| P23 | RN11 CI limpio | Directorio padre inexistente se crea, PostgreSQL local persiste y reabre | Coincide | Aprobado, tests/database.test.ts |
| P24 | HU01–11 recorrido | Registro→proyecto→tareas→dependencia→rechazo→resolución→historial/progreso→recarga→segunda cuenta | Coincide | Aprobado local y público, e2e.txt/e2e-publico.txt |
| P25 | RN09 HTTPS | Cookie Secure/HttpOnly/Lax, Origin ajeno 403 y cookie revocada 401 | Coincide | Aprobado, publicacion/seguridad-https.json |

## Fallos preservados y diagnóstico

tests-red.txt registra 36 fallos iniciales porque las rutas privadas no existían. tests-primer-verde.txt conserva el primer 50/50. La ampliación llegó a 58, luego 59 con el arranque limpio. No son porcentajes de cobertura.

tests-fallo-esperado-health.txt documenta expectativa errónea 200 al cerrar base; el health hace consulta real y debe 500 controlado. Se corrigió la prueba, no el servicio. La primera batería Neon se ejecutó con esa expectativa previa y falló solo allí; la repetición 57/57 pasó.

Los fallos de selectores y el reinicio por watch están en e2e-fallo-*.txt. El primer recorrido público seleccionó un estado antes de finalizar la actualización de UI; se verificó que había solicitado pending en lugar de delivered. Se añadieron esperas de botón habilitado/estado visible y coincidencia del body esperado. El rechazo de entrega del servidor no se debilitó.

El primer CI falló por directorio padre ausente en Linux, no por un servicio remoto. Se agregó mkdir recursivo y regresión. El siguiente CI pasó PostgreSQL y Chromium: https://github.com/feghi0/TechTask/actions/runs/43985660035.

## Límites

No se ejecutó prueba de carga ni auditoría externa. No se cuantificó cobertura. Edge/Chromium no equivalen a Safari/Firefox. No hay garantía de accesibilidad total por usar etiquetas y diálogo nativo. El plan gratuito puede suspender cómputo y las verificaciones acreditan la ejecución registrada, no disponibilidad futura ininterrumpida.
