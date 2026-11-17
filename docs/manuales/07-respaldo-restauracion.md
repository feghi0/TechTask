# Manual de respaldo, restauración e importación

Los procedimientos de recuperación externa son **propuestos para operación**: no se restauró producción como parte del relevamiento. Sí hay pruebas reales de reapertura local e importación de SQLite. No confundir estas pruebas con un ensayo de recuperación del servicio alojado.

## Qué preservar

| Elemento | Respaldo apropiado |
|---|---|
| Fuentes/configuración no sensible | Git y ZIP de fuentes, sin .env ni datos. |
| PGlite local | Copia completa del directorio con el motor cerrado. |
| PostgreSQL externo | Dump consistente o mecanismo del proveedor disponible y aprobado. |
| SQLite TP4 | Origen intacto; exportación del importador y copia controlada si corresponde. |
| Secretos | Gestor privado del titular; nunca Git, ZIP académico o captura. |

El ZIP del proyecto **no incluye la base** y no basta para recuperar tareas. Un respaldo de datos contiene información privada, correos y hashes: guardarlo fuera del repositorio público, con acceso restringido. No adjuntar un dump a un issue.

## Respaldo local PGlite

1. Confirmar PGLITE_DATA_DIR efectivo y que DATABASE_URL no esté seleccionando una base remota.
2. Detener completamente todos los procesos que utilizan ese directorio; esperar cierre.
3. Copiar el directorio entero, no archivos sueltos mientras el motor escribe.
4. Registrar fecha, revisión de código y ubicación privada.

Ejemplo PowerShell desde la raíz, solo con el motor detenido y usando la ruta local estándar:

```powershell
$marca = Get-Date -Format 'yyyyMMdd-HHmmss'
New-Item -ItemType Directory -Force 'data/backups' | Out-Null
Copy-Item -LiteralPath 'data/postgres' -Destination "data/backups/postgres-$marca" -Recurse
```

No almacenar el respaldo dentro del propio directorio copiado. El proyecto ignora data/ en Git; aun así, revisar el destino antes de copiar o compartir archivos.

## Ensayo de recuperación local sin sobrescribir el origen

Copiar el respaldo a **otro** directorio vacío, asignarlo a PGLITE_DATA_DIR e iniciar una sola instancia. Verificar health, cuenta de prueba, cantidad de proyectos/tareas, estados, dependencias e historial. No restaurar encima de un motor abierto ni borrar el original antes de verificar.

El objetivo es demostrar recuperación, no que el servidor recreó datos de ejemplo. Registrar entradas, resultado esperado y obtenido. No hay botón de restauración en la UI.

## Respaldo PostgreSQL de servidor

Un operador con acceso autorizado puede utilizar herramientas oficiales PostgreSQL compatibles. No se distribuyen con este proyecto y no se comprobó su instalación en el equipo. Usar conexión directa del proveedor cuando una operación de respaldo/migración la requiera; no asumir que una URL de pool admite todas las operaciones de sesión.

Ejemplo ilustrativo con nombres que deben reemplazarse y contraseña solicitada por la herramienta, no escrita en la línea:

```powershell
$env:PGSSLMODE = 'verify-full'
pg_dump --host HOST_DEL_PROVEEDOR --username USUARIO --dbname BASE_ORIGEN --password --format=custom --file respaldo.dump
```

Comprobar código de salida, tamaño y legibilidad del archivo; luego hacer ensayo en destino aislado. Copiar un archivo grande no prueba que sea restaurable. No se ha definido una promesa de frecuencia, retención, RPO ni RTO: el responsable debe acordarlos antes de operar con datos relevantes.

## Restauración externa controlada

1. Autorizar operación, destino, ventana y responsable.
2. Crear o seleccionar una base de recuperación **vacía y separada**; no apuntar por defecto a producción.
3. Confirmar compatibilidad de versión/esquema y permisos del rol.
4. Restaurar con la herramienta adecuada; por ejemplo `pg_restore --no-owner --no-privileges --host HOST --username USUARIO --dbname BASE_RECUPERACION --password respaldo.dump`.
5. Configurar una instancia aislada de la app con esa base y validar integridad, propietario, historial y recorridos.
6. Evaluar revocaciones de sesión: restaurar un respaldo puede volver a introducir sesiones que habían sido revocadas. Planificar invalidación autorizada antes de exponer el destino.
7. Solo después decidir el cambio de tráfico; conservar origen y respaldo según política acordada.

No agregar `--clean`, DROP o borrados masivos como atajo sin un procedimiento explícito. Una base recuperada no debe quedar expuesta sin sus controles de aplicación. La prueba de recuperación se registra por separado de CI.

## Importar SQLite del TP 4

El script `scripts/import-sqlite.ts` lee una tabla tasks con el esquema TP4. El origen se abre en solo lectura, se genera una exportación JSON en data/backups y se autentica una cuenta destino existente. Se crea «Legado TP 4» y se insertan tareas en una transacción conservando UUIDs, createdAt y estados; los textos se normalizan/validan mediante las reglas vigentes. No crea historial ficticio de estados anteriores.

Preparación:

1. Detener escritores del SQLite antiguo; verificar ruta y respaldo.
2. Crear la cuenta destino por la interfaz.
3. Cerrar la instancia PGlite si el importador utilizará su mismo directorio. Para remoto, confirmar DATABASE_URL sin mostrarla.
4. Definir TT_EMAIL y TT_PASSWORD en la terminal privada; no guardarlas en Git ni imprimirlas.
5. Ejecutar `npm run import:sqlite -- ruta/al/archivo.sqlite`.
6. Comprobar cantidad/IDs, abrir el proyecto legado y revisar contenido. Quitar variables sensibles de la terminal al terminar.

El respaldo exportado se crea antes de autenticar; protegerlo aunque la autenticación falle. Un error de validación o una colisión de UUID revierte el proyecto importado completo. La operación no es un sincronizador incremental: repetirla puede fallar por IDs existentes. No borrar IDs ajenos para forzarla.

La prueba automatizada verifica origen con SHA-256 sin cambios, contenido/IDs/fechas y rollback de duplicado. Consultar tests/import.test.ts e importacion-tests.txt. SQLite puede emitir una advertencia experimental en Node; no es por sí sola un fallo de importación.
