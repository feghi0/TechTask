# TechTask

Gestión privada de proyectos técnicos y entregas escolares. Proyecto Final de Generación T — Streambe, Módulos 4 y 5, 2026.

**Autor:** Agustín Manteiga · sexto año de Computación · Escuela Técnica N.º 35 «Ing. Eduardo Latzina» · Prácticas Profesionalizantes. Trabajo individual desarrollado mediante metodología AI-First, con decisiones aprobadas y pruebas reales.

Repositorio: https://github.com/feghi0/TechTask  
Aplicación pública: **https://techtask-generacion-t.onrender.com**. Ver `docs/publicacion.md` para configuración y comprobaciones.

## Problema y funcionalidades

TechTask ayuda a organizar entregas que dependen de actividades previas. Una cuenta tiene sus propios proyectos y tareas; no puede leer ni modificar los de otra.

- Registro, inicio y cierre de sesión privados.
- Proyectos y tareas: creación, edición, baja permitida, materia, prioridad, fecha y favoritas.
- Búsqueda/filtros, estadísticas, progreso calculado y alertas de fechas.
- Dependencias obligatorias del mismo proyecto, sin ciclos ni duplicados.
- Entrega protegida, transiciones explícitas e historial de estados.
- Conflictos de versión y operaciones críticas transaccionales.

No hay colaboración entre cuentas, chat, adjuntos, recuperación de contraseña ni verificación de correo. No ingreses datos sensibles ni reutilices contraseñas de otros servicios. No se promete IA dentro del producto: AI-First describe el proceso de ingeniería.

## Reglas destacadas

La tarea se crea pendiente. Para entregar debe estar en desarrollo y tener sus dependencias entregadas. No se puede reabrir un requisito si deja inconsistente una tarea entregada. Quitar una dependencia válida no altera el estado; agregar requisitos a una entregada requiere reabrirla. No se elimina una tarea entregada o con dependientes activos; la baja es lógica. Proyecto solo se elimina si no tiene tareas activas.

Título: 3–60 puntos Unicode luego de trim. Materia: texto obligatorio, no catálogo institucional. Urgencia en calendario argentino: vencida si la fecha pasó; inmediata hasta 3 días inclusive; próxima de 4 a 7; entregadas excluidas. Tres tareas no entregadas dentro de tres días calendario generan advertencia en el proyecto. Progreso se calcula, no se duplica en base. La SPEC define límites y casos completos.

## Stack y arquitectura

React 19, TypeScript estricto, Vite, Tailwind y Lucide. Node 22/Express con Controller → Service → Repository y PostgreSQL parametrizado. Sesiones opacas, contraseñas con scrypt/salt y cookie HttpOnly. PGlite ejecuta PostgreSQL embebido para inicio local y tests sin servidor instalado; producción usa pg y DATABASE_URL externa.

```text
frontend/src/   componentes, hooks y cliente HTTP
backend/src/    API, controladores, servicios, repositorio y migraciones
shared/        contratos TypeScript
tests/         integración, calendario, importación y e2e
docs/agentes/  perfiles y límites de los seis roles
docs/evidencias/ resultados actuales
docs/entrega-tp4/ antecedentes y evidencia histórica
```

## Inicio local

Requisitos: Node 22.21.0 o compatible y npm. No requiere instalar PostgreSQL ni Docker para el modo local.

```sh
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173. Crear una cuenta con correo de ejemplo y contraseña propia de 12–128 caracteres. API http://127.0.0.1:3001; health `/api/health`. El directorio `data/postgres` conserva datos entre inicios; no lo borres si querés conservarlos. Ctrl+C detiene ambos servidores. Nunca abrir dos procesos PGlite sobre el mismo directorio.

El archivo `.env.example` documenta configuración. Variables deben exportarse en la terminal o configurarse en el proveedor; el servidor no carga automáticamente `.env`.

| Variable | Uso |
|---|---|
| DATABASE_URL | Conexión PostgreSQL; obligatoria en producción. Secreto, solo backend. |
| PGLITE_DATA_DIR | Directorio local, por defecto data/postgres. Ignorado si existe DATABASE_URL. |
| PORT / HOST | Puerto y host;3001/127.0.0.1 local, puerto del proveedor y 0.0.0.0 productivo. |
| NODE_ENV | production activa cookies Secure, proxy y frontend compilado. |
| ALLOWED_ORIGINS | Orígenes adicionales exactos separados por coma. Vacío en producción: mismo origen. |
| TEST_DATABASE_URL | Base exclusivamente de pruebas para batería contra servidor PostgreSQL. |

No configurar DATABASE_URL en variables VITE_* ni publicarla en frontend. La cookie usa HttpOnly/SameSite=Lax; separar frontend y API en dominios distintos puede requerir revisar el diseño de sesión, por eso se recomienda mismo origen.

## Migraciones e importación de SQLite

La migración de `backend/src/database/migrations.ts` se aplica al iniciar, con control de versión y bloqueo transaccional. No se ejecuta DROP ni se transforma automáticamente la base TP4.

Para importar el TP4: cerrar escritores del SQLite antiguo, crear la cuenta destino, definir TT_EMAIL y TT_PASSWORD como variables locales y ejecutar:

```sh
npm run import:sqlite -- data/techtask.sqlite
```

El importador abre SQLite en solo lectura, exporta respaldo JSON a `data/backups`, autentica la cuenta destino y crea «Legado TP4» transaccionalmente. Conserva UUIDs, fechas y estados anteriores; no inventa historial. Colisión o entrada incompatible revierte el proyecto completo, sin modificar origen. El directorio PostgreSQL local debe estar cerrado si otro proceso lo utiliza. Con DATABASE_URL puede importar al servidor correspondiente: verificar siempre destino antes.

La elección anterior de SQLite integrado está documentada históricamente. El Proyecto Final aprobado evoluciona a PostgreSQL; no afirma que siempre se utilizó este motor.

## Datos de demostración privados

Crear una cuenta desde la interfaz, exportar TT_EMAIL y TT_PASSWORD de esa cuenta y ejecutar `npm run demo` con la API iniciada. TT_BASE_URL permite otro destino. El script usa la API, crea datos ficticios y cierra su sesión; no publica contraseñas de demostración compartidas. Cada ejecución agrega un proyecto independiente.

## Pruebas

```sh
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Vitest/Supertest verifica reglas e integración con PostgreSQL embebido, sesiones privadas, grafo, concurrencia, persistencia e importación. `TEST_DATABASE_URL` permite ejecutar las pruebas de HTTP contra una base de servidor aislada. Nunca apuntar tests a datos productivos. El ejecutor `scripts/test-postgres-remote.mjs` restringe explícitamente el nombre techtask_test y recibe la conexión por stdin oculto.

Playwright usa Edge instalado en Windows y Chromium en CI. En Linux CI: `npx playwright install --with-deps chromium`. Los e2e crean directorios de base independientes y cuentas ficticias, y conservan capturas reales. Cerrar servidores que ocupen 3001/5173 antes. Los tests TP4 originales están preservados como texto en tests/legacy y en el commit de base; no se ejecutan contra contratos privados incompatibles.

La configuración CI ejecuta integración con servicio PostgreSQL 16 y navegador. Consultar ejecuciones reales y logs; que exista el workflow no implica que haya pasado.

## Compilar y desplegar

`npm run build` genera dist/frontend y dist/server/server.js. `npm start` inicia el backend compilado. Con NODE_ENV=production sirve también React bajo el mismo origen y requiere DATABASE_URL. En desarrollo usa Vite con proxy.

`render.yaml` describe una instancia gratuita Node y healthcheck; DATABASE_URL se configura como secreto. Neon aloja PostgreSQL persistente. TLS, cuotas y suspensión por inactividad dependen del proveedor. No se garantiza disponibilidad permanente ni escalabilidad institucional. Los orígenes se restringen explícitamente; CORS no sustituye el control de propietario.

## Documentación y evidencia

Empezar por idea.md, decisiones.md y spec.md. AGENTS.md define responsabilidades y jerarquía. plan.md y tasks.md registran implementación. docs/informe-final.md, docs/matriz-cumplimiento.md y docs/guia-demostracion.md acompañan la entrega. Los resultados vigentes están en docs/evidencias; las capturas generadas como concepto del TP4 están rotuladas y no son evidencia funcional.

## Dependencias justificadas

React/ReactDOM UI; Vite/plugin React desarrollo; Tailwind estilos; Lucide iconos; Express HTTP; pg conexión PostgreSQL; PGlite motor local; cookie-parser cookies; Helmet cabeceras; express-rate-limit abuso básico. TypeScript/tipos contratos; tsx ejecución TS; esbuild empaquetado; concurrently dos procesos; Vitest/Supertest pruebas; Playwright navegador; Prettier legibilidad. No ORM ni JWT innecesarios.
