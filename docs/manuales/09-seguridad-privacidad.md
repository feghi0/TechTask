# Manual de seguridad y privacidad

Describe controles y límites técnicos del proyecto académico; no es una certificación de cumplimiento legal ni un informe de pentest. Fuente: backend, frontend, pruebas y publicación.

## Datos tratados

Cuenta: email e identificador; derivación de contraseña. Sesión: hash de token, usuario y expiración. Dominio: proyectos, tareas, materias, fechas, prioridades, favoritas, dependencias e historial de estados. Proveedores pueden mantener logs y metadatos operativos según sus servicios. No se debe afirmar que la aplicación no trata ningún dato personal por usar cuentas privadas.

El navegador recibe datos de la cuenta autenticada y una cookie opaca. No recibe hashes, salt ni la conexión PostgreSQL. No se implementó analítica propia, chat, adjuntos o integración con un padrón escolar.

## Control de acceso real

- Cada proyecto tiene owner_id; las consultas y mutaciones verifican propietario.
- Una cuenta no accede a IDs de otra mediante la API; el servidor responde404.
- Solo existe un rol funcional de usuario. El operador del hosting/base tiene capacidades administrativas de infraestructura que no son una pantalla o rol de TechTask.
- El registro es público: cuenta privada significa aislamiento de datos, no acceso solo por invitación.
- No hay colaboración entre cuentas ni una contraseña global de docente.

## Credenciales y sesiones

Contraseña vigente: mínimo 4 y máximo128 según instrucción humana D20. El mínimo permitido no impide elegir una contraseña más larga. Se deriva con scrypt y salt aleatorio; no se guarda texto claro. El login compara derivaciones de manera segura y devuelve un mensaje genérico cuando falla.

El token de sesión es aleatorio; en base se almacena su SHA-256. La cookie es HttpOnly y SameSite=Lax; en producción también Secure. Dura hasta siete días y logout revoca la sesión correspondiente. No hay JWT ni token persistido en localStorage. Cerrar la pestaña no equivale a cerrar sesión y logout no es “cerrar todas las sesiones”.

La aplicación no verifica que quien registra un email sea dueño de ese buzón. No hay recuperación/cambio de contraseña o eliminación de cuenta desde la UI. No escribir procedimientos que prometan esas capacidades.

## Peticiones y datos

Validación de tipos, claves permitidas, longitudes, UUID, fecha y contexto; rechazo de NUL antes de PostgreSQL. SQL parametrizado, transacciones y restricciones de base. Errores internos sin stack o SQL para el cliente. API no-store y cabeceras Helmet. Cuerpos JSON hasta128KB.

Origen exacto y SameSite reducen solicitudes cruzadas; no hay un token CSRF dedicado. Los métodos de escritura requieren JSON salvo logout. CORS no es autorización: clientes fuera del navegador pueden enviar peticiones, pero siguen necesitando sesión válida y cumplir ownership/reglas.

Límites por IP en memoria:120/minuto API y 30/15minuto para registro/login; los valores aumentan en entorno test. No son protección distribuida ni una prueba de resistencia a ataques. HTTPS protege transporte al sitio y la conexión de PostgreSQL publicada usa TLS verificado; no se afirma cifrado de extremo a extremo de los contenidos.

## Secretos del operador

DATABASE_URL solo en entorno privado del backend/proveedor. TT_PASSWORD solo para scripts autorizados en una terminal privada. `.env*` está ignorado salvo `.env.example`; eso no protege un secreto agregado manualmente con force ni uno copiado a otro archivo.

Antes de commit/exportar: revisar diff y archivos incluidos; no agregar bases, dumps, cookies, capturas con claves o archivos de credenciales. Una cadena de conexión de ejemplo no debe contener datos reales. La credencial descartable de PostgreSQL del workflow es un fixture de CI, no la de Neon.

Si se expone un secreto real, retirarlo de un commit posterior no lo revoca: coordinar rotación y revisión de accesos. No escribirlo otra vez en un ticket para explicar el incidente.

## Respaldo, retención y bajas

Las bajas son lógicas, sin papelera. No existe purga automática ni plazo de retención implementado para proyectos/tareas/historial. Sesiones vencidas se limpian al crear nuevas sesiones. Los respaldos pueden contener datos privados y hashes; limitar acceso y aplicar una política operativa acordada.

La solicitud de borrado integral de una cuenta no se resuelve pulsando “Eliminar proyecto”. Requiere una funcionalidad futura o procedimiento administrativo autorizado, con evaluación de copias y relaciones. No ejecutar borrados masivos desde instrucciones genéricas de soporte.

## Verificación y límites conocidos

Tests de dos cuentas, cookie revocada, origen externo, Unicode/NUL, campos protegidos y conflictos. Verificación HTTPS registrada en seguridad-https.json; cambio de mínimo registrado en password4. Son controles probados del alcance, no una garantía frente a toda vulnerabilidad.

Fuera del alcance: MFA, verificación de email, recuperación de contraseña, gestión de dispositivos, prueba de carga, auditoría externa, escáner exhaustivo de dependencias y cifrado de campo propio. Para una ampliación institucional, evaluar estas necesidades antes de incorporar información sensible.
