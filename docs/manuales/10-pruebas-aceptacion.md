# Manual de pruebas y aceptación

## Qué demuestra cada comprobación

| Comprobación | Comando | Alcance |
|---|---|---|
| Tipos | `npm run typecheck` | TypeScript estricto; no ejecuta flujos. |
| Formato | `npm run format:check` | Prettier; no acredita funcionalidad. |
| Tests | `npm test` | `tests/*.test.ts`: actualmente 60 casos. |
| Build | `npm run build` | Types, Vite y bundle backend. |
| Navegador | `npm run test:e2e` | Recorrido real UI→API→base con aserciones y capturas. |

Los comandos se ejecutan desde la raíz. Instalar dependencias con npm ci antes. No interpretar un tipo correcto como login probado ni un build como persistencia comprobada.

## Batería local y motor de servidor

`tests/tasks.test.ts`:46 casos de HTTP/reglas/sesión; `calendar.test.ts`:12; `import.test.ts`:1; `database.test.ts`:1. Total60 tras el cambio a mínimo 4. Los tests crean datos ficticios; no apuntar a producción.

Sin TEST_DATABASE_URL, integración usa PostgreSQL embebido. Con esa variable, los casos de HTTP utilizan el servidor indicado; los casos que necesitan directorio local/importación siguen usando sus entornos propios. En CI hay un servicio PostgreSQL 16 aislado. PGlite no simula SQL, pero tampoco prueba por sí solo TCP/TLS o conexiones concurrentes de un servidor remoto.

`backend/tests/bootstrap.spec.ts` y backend/vitest.config.ts conservan una prueba adicional del arranque privado. No está incluida en los 60 del comando raíz. `tests/legacy/*.txt` son antecedentes TP4, no tests actuales descubiertos por Vitest.

## E2E local

Cerrar instancias propias que ocupen 3001/5173. Playwright inicia API y Vite, espera health y usa un directorio `data/e2e-final-<marca>` nuevo. Windows utiliza Edge; CI utiliza Chromium. En un Linux preparado para CI, instalar Chromium con `npx playwright install --with-deps chromium` y usar `CI=true`.

No se reutiliza el directorio PGlite de uso normal. Los directorios de pruebas persisten fuera de Git; su limpieza debe hacerse identificando datos descartables y sin confundirlos con data/postgres.

El recorrido cubre registro, proyecto, validación400, dos tareas, búsqueda/filtros, favorita, dependencia, rechazo 409, resolución, historial/progreso, recarga, GET autenticado, ancho390px, logout y segunda cuenta vacía. Espera respuesta y estado visible antes de otra operación para no introducir carreras del propio test.

## E2E público: operación con escrituras

Solo contra servicio propio autorizado. Ejemplo PowerShell:

```powershell
$env:TT_PUBLIC_URL = 'https://techtask-generacion-t.onrender.com'
$env:TT_EVIDENCE_DIR = 'docs/evidencias/mi-ejecucion-publica'
npm run test:e2e
Remove-Item Env:TT_PUBLIC_URL, Env:TT_EVIDENCE_DIR
```

Elimina solo las variables al terminar, no datos. El test registra cuentas ficticias, crea tareas y cierra sesión; no borra automáticamente esas cuentas. Un destino público con health 200 no autoriza a ejecutar toda una batería de mutaciones ajena.

`scripts/check-public.mjs` verifica HTTPS/cookies/origen/revocación; `check-password-minimum.mjs` verifica mínimo HTML4, registro 201/login 200 y rechazo de3. Ambos crean cuentas ficticias. No generan contraseñas compartidas para docentes.

## Casos manuales de aceptación

| Caso | Acción | Esperado |
|---|---|---|
| Cuenta | Registrar4 caracteres, salir e ingresar | Éxito;3 se rechaza. |
| Privacidad | Dos cuentas y un proyecto | La segunda no lo lista ni accede por ID. |
| Alta | Título de2 y luego3 caracteres | Rechazo primero; tarea pendiente después. |
| Grafo | A requiere B, intentar B requiere A | El segundo enlace se rechaza. |
| Entrega | A en desarrollo con B pendiente |409, sin entrega ni historial de éxito. |
| Resolución | Entregar B y luego A | Estados y progreso coherentes. |
| Reapertura | Reabrir B si A entregada depende de B | Rechazo; revisar A primero. |
| Baja | Eliminar tarea referenciada/entregada | Rechazo; tarea libre no entregada puede darse de baja. |
| Conflicto | Dos ediciones desde la misma versión | Una modificación y otra409, sin sobrescritura silenciosa. |
| Fechas | Hoy,3,4,7,8 días y una vencida | Niveles acordados, entregadas excluidas. |
| Persistencia | Recargar después de guardar | Datos recuperados del servidor. |
| Móvil |390px y teclado | Sin desbordamiento; controles utilizables, revisar foco/diálogo. |

La tabla es un protocolo; no afirma que una nueva ejecución manual se haya realizado solo por leerlo. Registrar fecha, entorno, entrada, esperado, obtenido y evidencia por caso.

## Logs, capturas y evaluación

Guardar comando, salida real, commit y entorno sin secretos. No reemplazar un fallo por un log fabricado. Los resultados históricos tienen su propio contexto:28 tests TP4,50/58/59 durante evolución,57 en la batería Neon registrada y60 actuales. No sumarlos para inventar un total de cobertura.

GitHub Actions publica artefactos de navegador. Una captura prueba el estado visible de ese instante; el HTTP y las aserciones corroboran la operación. Un cuadro HTML con JSON debe identificarse como visor y no como DevTools. No hay un porcentaje de cobertura o de “precisión del agente” calculado.

La evidencia actual y sus fallos diagnosticados se resumen en [informe-pruebas.md](../informe-pruebas.md). Una nueva regla necesita nuevos tests, no solo más capturas del dashboard.
