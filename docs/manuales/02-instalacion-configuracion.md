# Manual de instalación y configuración

## Requisitos

Git, Node.js 22.21.0 o una versión compatible con las dependencias y npm. La versión de referencia comprobada es Node 22.21.0. Edge instalado para las pruebas de navegador de Windows; Chromium descargado por Playwright en CI/Linux. No hace falta instalar SQLite, PostgreSQL ni Docker para el inicio local estándar: PGlite ejecuta PostgreSQL embebido y guarda en disco.

Verificar:

```sh
git --version
node --version
npm --version
```

## Instalación desde cero

Ejecutar desde una carpeta propia, sin reemplazar otra copia con cambios:

```sh
git clone https://github.com/feghi0/TechTask.git
cd TechTask
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173. La API escucha en http://127.0.0.1:3001. Registrar una cuenta desde la aplicación. `npm ci` instala exactamente el lockfile y necesita acceso al registro de npm; no genera una base de demostración ni una cuenta de administrador.

`npm run dev` inicia dos procesos mediante concurrently: `tsx watch` para Express y Vite para React. Ctrl+C detiene ambos. El directorio `data/postgres` se crea al iniciar y conserva la información. No abrir dos motores PGlite sobre ese mismo directorio ni borrarlo para resolver un error.

## Variables de entorno

`.env.example` es una plantilla de referencia sin credenciales. **El código no carga `.env` automáticamente**: copiarla a `.env` no configura por sí solo el proceso. Exportar variables en la terminal, usar las capacidades de Node bajo responsabilidad del operador o configurarlas en el proveedor.

| Variable | Predeterminado | Efecto |
|---|---|---|
| `DATABASE_URL` | Ausente en local | Si está definida, usa PostgreSQL externo y no PGlite. Obligatoria en producción. Secreto. |
| `PGLITE_DATA_DIR` | `data/postgres` | Ruta persistente local; `memory://` se utiliza en pruebas aisladas. |
| `NODE_ENV` | No fijada | `production` exige base externa, sirve React compilado, usa cookie Secure y confía en un proxy. `test` cambia límites de solicitudes. |
| `HOST` | `127.0.0.1` local; `0.0.0.0` producción | Interfaz donde escucha Express. |
| `PORT` | `3001` | Entero 1–65535. No cambia automáticamente el proxy Vite. |
| `ALLOWED_ORIGINS` | Lista de desarrollo local; vacío en producción | Orígenes adicionales exactos separados por comas. El mismo origen se admite. |
| `FRONTEND_ORIGIN` | Ausente | Alias usado solo si no se define ALLOWED_ORIGINS. |
| `TEST_DATABASE_URL` | Ausente | Base destinada a tests de integración; no configura el servidor normal. |
| `CI` | Ausente | Playwright selecciona Chromium en vez de Edge. |
| `TT_PUBLIC_URL` | Ausente | E2E usa una URL existente y no inicia servidores locales. |
| `TT_EVIDENCE_DIR` | `docs/evidencias` | Destino de capturas del e2e. |
| `TT_EMAIL`, `TT_PASSWORD` | Ausentes | Cuenta existente para demo/importación; secretos de sesión de la terminal, no archivos versionados. |
| `TT_BASE_URL` | `http://127.0.0.1:3001` | Destino del script de demostración, no del e2e. |

Las variables de PowerShell se heredan solo por procesos iniciados desde esa terminal. Ejemplo sin secretos:

```powershell
$env:PGLITE_DATA_DIR = 'data/mi-entorno-local'
npm run dev
```

Bash:

```sh
PGLITE_DATA_DIR=data/mi-entorno-local npm run dev
```

Para PostgreSQL remoto, configurar la conexión mediante un mecanismo privado. No pegarla en capturas, chats, historial compartido o variables `VITE_*`. El [manual de seguridad](09-seguridad-privacidad.md) define el manejo.

## Comprobar la instalación

1. Consultar `GET /api/health`: debe responder 200 y `{"data":{"status":"ok"}}`.
2. Crear una cuenta y un proyecto ficticios.
3. Crear una tarea; recargar y comprobar que reaparece.
4. Detener e iniciar otra vez el mismo directorio PGlite: el dato debe seguir presente.
5. Ejecutar `npm run typecheck` y `npm test`.

En PowerShell:

```powershell
Invoke-RestMethod 'http://127.0.0.1:3001/api/health'
```

## Compilar y ejecutar el build

```sh
npm run build
npm start
```

`build` ejecuta TypeScript, Vite y esbuild. Genera `dist/frontend` y `dist/server/server.js`. Sin NODE_ENV=production, `npm start` inicia la API compilada; en otra terminal `npm run preview` sirve el frontend compilado en el puerto que anuncia Vite, normalmente 4173, con proxy a 3001.

Para producción se requiere PostgreSQL externo y NODE_ENV=production. React y API se sirven entonces bajo el mismo origen; no se usa Vite como servidor productivo. Las cookies Secure requieren HTTPS para uso real.

El proxy de `vite.config.ts` apunta a 3001. Si se cambia PORT en desarrollo, también hay que ajustar ese destino o conservar el puerto estándar. No documentar un cambio de puerto como suficiente para reconfigurar toda la aplicación.

## Actualización de una copia existente

Guardar o commitear cambios locales; revisar `git status`. Obtener cambios sin force ni reset destructivo, instalar con `npm ci` si cambió el lockfile, respaldar datos, ejecutar comprobaciones y reiniciar. Las migraciones se aplican al arrancar. No borrar `data/`, SQLite ni credenciales locales para actualizar fuentes.

## Desinstalación

Detener procesos y conservar respaldo de la base antes de retirar fuentes. Eliminar la carpeta de código no elimina automáticamente una base Neon ni un servicio Render. La baja de recursos alojados es una operación independiente que puede destruir datos y requiere autorización del titular.
