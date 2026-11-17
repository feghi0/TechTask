# Relevamiento técnico y funcional actual

Fecha: **16/11/2026**, zona America/Buenos_Aires. Fuentes: código local, Git, configuración, logs reales existentes y consultas de solo lectura a CI y health. Referencia de entrada: `e56d4cb`; código funcional de contraseña: `1b0c2a2`.

## Inventario y funcionamiento

| Elemento | Estado observado | Evidencia/fuente |
|---|---|---|
| Repositorio oficial | Código y documentación publicados; rama main | Git local y GitHub feghi0/TechTask. |
| Frontend | React, Vite, Tailwind, Lucide; cuentas/proyectos/tareas | componentes y servicios actuales. |
| API | Express con 21 rutas explícitas, incluyendo health y auth | backend/src/app.ts. |
| Persistencia local | PostgreSQL embebido PGlite en data/postgres | database/db.ts y server.ts. |
| Persistencia productiva | PostgreSQL externo con pg, alojado en Neon según publicación | server.ts y registro de despliegue. |
| Seguridad | Sesiones hasheadas, propietario, scrypt, origen y límites | app/auth-service/repository. |
| Variables | DATABASE_URL, PGLITE_DATA_DIR, HOST/PORT, entorno y orígenes | server.ts y manual de instalación. |
| Esquema | Siete tablas: app_users, sessions, projects, tasks, task_dependencies, task_history, schema_migrations | migrations.ts. |
| Migraciones | Versión1, transaccional y con advisory lock | migrate(). |
| Automatización | CI con jobs PostgreSQL 16 y Chromium | .github/workflows/ci.yml. |
| Compilación | TypeScript + Vite + esbuild | package.json y logs de build. |
| Sitio público | GET health 200 en este relevamiento | comprobación de solo lectura. |

La cuenta operadora del hosting no es una cuenta administradora dentro de TechTask. La app tiene un único rol funcional: propietario de su espacio. No se inspeccionaron datos privados de usuarios durante este relevamiento.

## Evidencia vigente frente a histórica

- CI de revisión `e56d4cb`: [43988065141](https://github.com/feghi0/TechTask/actions/runs/43988065141), exitoso.
- CI del cambio funcional de contraseña: [43987809403](https://github.com/feghi0/TechTask/actions/runs/43987809403), exitoso.
- `password4-verde.txt`: 60 pruebas locales aprobadas; build separado aprobado.
- `password4/resultado-publico.json`: formulario mínimo 4, registro 201, login 200 y contraseña 3 rechazada400 en web real.
- Las 57 pruebas Neon pertenecen a la ejecución remota registrada, anterior al cambio del mínimo. No se vuelven a atribuir a una ejecución de hoy.
- Los resultados de 59 casos y las capturas TP4 se conservan como antecedentes. No se borraron ni se editaron para que parezcan actuales.

## Estado funcional contrastado

| Grupo | Implementado | Límites |
|---|---|---|
| Cuentas | Registro/login/logout/me, mínimo 4, espacio privado | Sin verificación de correo, recuperación, cambio o eliminación de cuenta desde UI. |
| Proyectos | Crear, leer, editar y baja lógica si vacío | Sin colaboración, archivos ni roles por proyecto. |
| Tareas | CRUD permitido, favoritas, búsqueda y filtros | Sin paginación remota, recurrencia ni adjuntos. |
| Grafo | Mismo proyecto, sin duplicados/ciclos, entrega protegida | Sin dependencias opcionales o entre proyectos. |
| Trazabilidad | Historial de estados y versión | No es auditoría integral de todas las ediciones. |
| Indicadores | Progreso, urgencia7/3 y conflicto de fechas | Sin notificaciones automáticas ni agenda. |
| Despliegue | Render/Neon, HTTPS y cookies verificadas | Cuotas, arranque en frío y operación según proveedores. |

## Desajustes documentales relevados

1. Informes anteriores conservaban “59 pruebas” como cifra final. Se agrega contexto temporal y referencia actual de60, sin alterar salidas antiguas.
2. Publicación mezclaba el primer commit desplegado con el posterior cambio a mínimo 4. Se distinguen cronología y estado funcional vigente.
3. README contenía inicio rápido, pero faltaban manuales operativos, de API, datos, restauración y soporte. Se completan en manuales/.
4. No había inventario claro de código TP4 inactivo ni de scripts históricos incompatibles con la API privada. Se documenta, sin borrarlos.
5. Copia de `.env.example` podía interpretarse como carga automática. Se aclara que el código no lee `.env` por sí solo.

## Deuda técnica y mejoras futuras, no implementadas por esta documentación

- Distinguir/retirar módulos frontend TP4 inactivos con una tarea específica y revisión de referencias.
- Recuperación/cambio de contraseña, verificación de correo y ciclo de vida de cuenta si el alcance crece.
- Versionado adicional de migraciones, procedimiento de rollback de datos y prueba real de restauración externa.
- Límites de consultas/paginación para conjuntos grandes; medición de carga antes de prometer escala.
- Actualizar versiones mayores de GitHub Actions tras revisar advertencias, sin confundirlas con fallos de tests.
- Definir recuperación y retención operativa de respaldos; actualmente no hay un cron de backup implementado.
- Obtener revisión de accesibilidad y seguridad independiente si se usa fuera del ámbito académico.

No se detectó necesidad de cambiar reglas funcionales para completar los manuales. Esta intervención documenta; no realiza limpieza de fuentes, migración de datos ni cambios del hosting.
