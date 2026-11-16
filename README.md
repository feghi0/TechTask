# TechTask

Reconstrucción desde cero para Generación T. React + TypeScript estricto + Vite + Tailwind + Lucide; Express con Controller/Service/Repository y SQLite integrado en Node.

## Requisitos e inicio

Node **22.21.0 o superior compatible con node:sqlite** (probado con 22.21.0) y npm. La API SQLite de esta versión emite una advertencia experimental conocida.

```sh
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173. API http://127.0.0.1:3001/api/tasks. Ejecutar desde la raíz. La base se crea en `data/techtask.sqlite`; puede cambiarse mediante DATABASE_PATH. No borrar ese archivo si se quieren conservar las tareas. Detener con Ctrl+C.

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

La compilación genera frontend en dist/frontend y backend con mapas de código en dist/server. `npm start` inicia solo la API compilada; `npm run preview` sirve el frontend compilado con proxy a esa API. El proyecto es para uso local académico, sin autenticación ni despliegue público.

## Alcance

Implementados: POST y GET /api/tasks, validación del servidor, persistencia, dashboard, búsqueda y filtros, favorita al crear y vencimientos. Diseñados y pendientes: editar, eliminar, cambiar estado y favorita después de crear. No hay tareas de ejemplo cargadas automáticamente.

La documentación académica está en docs/entrega-tp4. Los logs son resultados de ejecución, no pruebas de todas las condiciones posibles. Revisar allí limitaciones y pendientes humanos.

## Dependencias

React/ReactDOM: interfaz; Vite/plugin React: desarrollo y build; Tailwind: estilos; Lucide: iconos; Express: HTTP. TypeScript/tipos: contratos; tsx: ejecución TS; esbuild: empaquetado del servidor; concurrently: dos servidores; Vitest/Supertest: reglas y HTTP; Playwright: prueba real de navegador. No se usa ORM ni biblioteca externa de SQLite.
