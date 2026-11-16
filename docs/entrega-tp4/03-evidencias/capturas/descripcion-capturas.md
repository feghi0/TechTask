# TechTask — Evidencias visuales del TP 4

Generación T · «Diseñando el backend de mi aplicación»  
Fecha: 16/11/2026. Ejecución local en Windows con Node 22.21.0, SQLite integrado, Express, Vite y Edge automatizado mediante Playwright. No se generaron imágenes con IA.

## Procedencia y verificación previa

Antes de capturar se ejecutaron TypeScript y las pruebas: sin errores de tipos y 28 pruebas aprobadas. Después se iniciaron frontend y backend con un archivo SQLite independiente de la base de uso normal. Se comprobó disponibilidad HTTP y la creación real de dos tareas ficticias mediante POST 201 antes de abrir el dashboard.

Interfaz: http://127.0.0.1:5180. Backend: http://127.0.0.1:3001/api/tasks. El proxy de Vite conecta ambos. Las capturas de interfaz tienen resolución 1600×1050; los visores usan 1600×1200 y captura completa para no cortar el JSON. Se revisaron visualmente los PNG.

## Descripción por captura

| Archivo | Funcionalidad observada | Prueba realizada | Resultado real | Concepto de Generación T |
|---|---|---|---|---|
| 01-dashboard.png | Dashboard, estadísticas y tarjetas | Crear dos tareas de demostración por API y abrir TechTask | Total 2; una en desarrollo y una entregada; ambas recuperadas por GET | Separación frontend/backend; indicadores derivados de datos persistidos |
| 02-formulario.png | Campos de creación | Abrir Nueva tarea; completar «TP de Redes», descripción, materia, prioridad alta, fecha y favorita | Formulario completo visible antes del envío | Contrato de datos y preparación de una petición |
| 03-tarea-creada.png | Confirmación y tarjeta nueva | Enviar el formulario y esperar la respuesta POST 201 antes de capturar | «TP de Redes» visible, confirmación del servidor y total 3 | Flujo vertical Controller → Service → Repository → SQLite |
| 04-validacion.png | Rechazo de datos incorrectos | Enviar título «ab» y materia «Redes» desde el formulario | HTTP 400; mensaje «Debe tener entre 3 y 60 caracteres.»; el listado conserva tres tareas | Validación autoritativa en servidor y manejo controlado de errores |
| 05-api-post.png | Creación HTTP | fetch real POST /api/tasks con «TP de Redes - API» | HTTP 201 Created; JSON con UUID, fecha y valores iniciales | REST, códigos HTTP, campos generados por servidor |
| 06-api-get.png | Lectura HTTP | fetch real GET /api/tasks después de las creaciones | HTTP 200 OK y array de tareas almacenadas | Repository y recuperación desde SQLite |
| 07-persistencia.png | Recuperación tras recarga | Recargar completamente la página y esperar GET; comparar UUID con el POST original | «TP de Redes» sigue visible con el mismo ID | Persistencia del dominio fuera del navegador |
| 08-estructura.png | Separación de carpetas y capas | Leer directorios reales frontend y backend mediante readdirSync | Se distinguen components, hooks, servicios HTTP, controllers, services y repositories | Responsabilidad única y arquitectura por capas |
| 09-tests.png | **No obtenida** | Se ejecutó npm test en terminal de herramientas; se intentó abrir una terminal visual | 28 tests aprobados, salida conservada en 09-tests-salida-real.txt; sin PNG | Verificación con evidencia y reconocimiento de límites del entorno |

## Detalles para interpretar correctamente las evidencias

Las imágenes 01–04 y 07 son capturas directas de la interfaz funcional, sin cambios en sus textos ni composiciones. En 04 se desactivó exclusivamente la validación HTML nativa mediante `form.noValidate = true` en la sesión de prueba. Esto permitió enviar el título corto al servidor y verificar su validación independiente; no se modificó código de la aplicación ni se falsificó la respuesta. El único error de consola registrado fue el 400 esperado de esta prueba. El aviso verde que aún aparece pertenece a la creación anterior; el error rojo corresponde al intento inválido actual.

05 y 06 son capturas de un **visor local de evidencias** que muestra sin alterar los datos obtenidos mediante fetch desde Edge. No son capturas de DevTools ni de Postman ni una pantalla de producto. Incluyen método, URL del proxy, destino de la API, código de estado y JSON. Los registros originales están en api-post.json y api-get.json.

08 muestra un visor del listado real del sistema de archivos, también identificado como tal. No simula un IDE ni una terminal. El listado original está en estructura-real.txt.

Los estados in_progress y delivered de las dos primeras tareas se enviaron al crearlas: no demuestran edición ni transición de estado. Solo creación y lectura están implementadas en el backend. La favorita se definió al crear. No se presentan eliminación ni actualización como funcionales.

Durante la preparación se realizó además un POST real mediante PowerShell (registrado en api-post-terminal.json), lo que explica la segunda tarea «TP de Redes - API» presente en el GET final. No se eliminó ni ocultó ese registro. Las capturas de dashboard y persistencia se tomaron antes de esas dos creaciones adicionales por API.

## Pasos exactos de persistencia

1. Crear por formulario «TP de Redes» con materia Redes, prioridad alta, favorita y fecha 2026-11-18.
2. Esperar POST /api/tasks con HTTP 201 y registrar el ID `08e0b3fa-104f-4e57-af03-f17a07a7bf25`.
3. Comprobar confirmación y tarjeta; guardar 03-tarea-creada.png.
4. Ejecutar la prueba negativa con título «ab»; verificar HTTP 400 y guardar 04-validacion.png.
5. Ejecutar `page.reload()` (recarga completa, sin recrear la tarea).
6. Esperar el GET de la nueva carga. Comprobar que la respuesta incluye exactamente el mismo UUID y título.
7. Esperar que la tarjeta vuelva a estar visible y guardar 07-persistencia.png.

Los valores observados están en transacciones.json y ejecucion.json. Esta prueba acredita una recarga del navegador; no afirma que se haya reiniciado el servidor en esta sesión.

## Captura de terminal pendiente: cómo obtenerla manualmente

El control de Windows respondió literalmente «product policy blocks this app» al intentar abrir PowerShell. Por eso no existe 09-tests.png y no se reemplazó por una imagen artificial de texto.

1. Abrir manualmente una terminal en la raíz del proyecto.
2. Ejecutar `npm test` y esperar el resultado final.
3. Ajustar tamaño/fuente para que se lean comando, suite y resultado; no incluir datos ajenos al proyecto.
4. Usar Recortes de Windows para guardar la ventana como `09-tests.png` en esta carpeta.
5. Volver a comprimir la carpeta si se desea incorporar esa captura al ZIP.

La salida actual, real, está en 09-tests-salida-real.txt: **1 archivo de pruebas y 28 tests aprobados**. La advertencia experimental de SQLite es conocida y no es un fallo de test.

## Reproducción automatizada

Cerrar primero instancias de TechTask que ocupen los puertos 3001 o 5180. Desde la raíz ejecutar `node scripts/capturar-evidencias.mjs`. Inicia servidores con una base nueva, captura 01–04 y 07 y deja ambos servidores activos para continuar. En otra terminal ejecutar `node scripts/capturar-http-estructura.mjs` para 05, 06 y 08. Ejecutar `npm test` para comprobar las pruebas actuales. Los scripts requieren Edge instalado y las dependencias del proyecto.

Las bases de demostración se guardan como `data/capturas-<timestamp>.sqlite` y no sustituyen `data/techtask.sqlite`. La reproducción sobrescribe los PNG y registros de esta carpeta: conservar el ZIP si se necesita preservar esta ejecución. El plugin Browser no estaba disponible; Playwright se usó como navegador automatizado.
