# Decisiones funcionales y técnicas

## Registro de aprobación

Fuente: chat, 16/11/2026. El usuario dijo: «apruebo totalmente y prefiero las cuentas privadas, a partir de ahora quiero que seas totalmente autonomo haciendo este proyecto». Aprueba el análisis anterior, sus reglas y alcance. No se atribuyen reflexiones personales adicionales. Los detalles de implementación proporcionales se resuelven por la autonomía concedida.

| ID | Pregunta / alternativas | Decisión y fundamento | Consecuencias |
|---|---|---|---|
| D01 | ¿Reescribir o evolucionar TP4? | Evolucionar. Base real conservada en primer commit. | Mantener componentes y capas, reemplazando contratos cuando lo exige el alcance. |
| D02 | ¿Demo compartida o cuentas privadas? | Cuentas privadas, elección explícita del usuario. | Autenticación, sesiones y aislamiento en cada operación. |
| D03 | ¿SQLite con volumen o PostgreSQL externo? | PostgreSQL, recomendado en análisis aprobado para hosting efímero. | Migraciones y exportación/importación; no descartar SQLite previo. |
| D04 | ¿Catálogo de materias o texto validado? | Texto obligatorio validado; alcance aprobado, sin catálogo institucional. | No afirmar validación contra un padrón. |
| D05 | ¿Urgencia TP4 de 3 días o niveles 7/3? | Niveles 7/3 aprobados; fecha local de negocio en Argentina. | Documentar cambio; antecedentes TP4 permanecen históricos. |
| D06 | ¿Transiciones libres o matriz? | Matriz aprobada en spec.md, entrega condicionada por dependencias. | Crear siempre pendiente; impedir reaperturas inconsistentes. |
| D07 | ¿Dependencia única o grafo? | Varias obligatorias dentro del mismo proyecto; sin ciclos ni duplicados. | Recorrido y validación transaccional del grafo. |
| D08 | ¿Porcentaje almacenado o calculado? | Calculado sobre tareas activas, vacío 0%. | Evitar desincronización y división por cero. |
| D09 | ¿Conflicto bloquea o advierte? | Advertir al menos tres entregas no realizadas en ventana de tres días. | No bloquear el registro de una planificación difícil. |
| D10 | ¿Baja física o conservación? | Baja lógica de tareas; impedir baja de entregadas o con dependientes activos. Proyecto solo eliminable vacío. | Preservar trazabilidad, excluir bajas de progreso/lecturas normales. |
| D11 | ¿Concurrencia optimista o transacciones? | Ambas: version para edición y bloqueo de proyecto para operaciones críticas. | 409 por versión obsoleta, validación e historial atómicos. |
| D12 | ¿Autenticación externa compleja o sesión simple? | Sesiones propias con cookie HttpOnly y derivación scrypt, sin JWT en localStorage. | Sin recuperación de contraseña en este alcance; no usar como sistema institucional. |
| D13 | ¿Cómo probar sin servidor PostgreSQL instalado? | PGlite, motor PostgreSQL embebido, no una simulación SQL. | Pruebas locales reproducibles; validación adicional remota sigue siendo necesaria. |
| D14 | ¿Frontend separado o mismo origen? | Soportar ambos; preferir Express sirviendo build React para primera publicación. | Menos configuración; CORS con allowlist exacta para origen separado. |
| D15 | ¿Proveedores? | Render para app, Neon para PostgreSQL; elección técnica implementada, conexión y publicación verificadas. Netlify opcional para frontend separado. | No publicar enlaces inexistentes ni contratar servicios pagos sin permiso. |

La sesión TP4 registró antes la elección de SQLite integrado mediante «a». Esa decisión se conserva como antecedente y se reemplaza para el Proyecto Final con la aprobación posterior de PostgreSQL. No se altera retrospectivamente el informe TP4.

## Ajustes técnicos autónomos registrados

D16: body 128KB permite 10000 puntos Unicode astrales dentro del contrato, con prueba de límite 413. D17: rechazar U+0000 antes de PostgreSQL evita500 por entrada inválida. D18: crear directorio local recursivamente permite checkout limpio en Linux. D19: retirar una dependencia válida se admite incluso de entregada y conserva su estado; solo agregar nuevos requisitos exige reabrir. Son precisiones del contrato ya documentado, verificadas por tests y revisión.

## D20 — Mínimo de contraseña

El 16/11/2026 el usuario pidió explícitamente un mínimo de 4 caracteres. Se reemplaza el mínimo de 12 por 4 tanto en registro/backend como en la interfaz; el máximo sigue siendo128. Las contraseñas existentes siguen funcionando. Pruebas: se rechazan3 y se acepta registro/login con4.
