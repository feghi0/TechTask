# Publicación verificada

Aplicación: **https://techtask-generacion-t.onrender.com**  
API: **https://techtask-generacion-t.onrender.com/api**  
Health: **https://techtask-generacion-t.onrender.com/api/health**  
Repositorio: **https://github.com/feghi0/TechTask**  
CI verificado: **https://github.com/feghi0/TechTask/actions/runs/43985660035**

## Recursos y configuración

- Render: servicio gratuito techtask-generacion-t, región Virginia, Node 22.21.0, React y Express bajo el mismo origen.
- Neon: proyecto TechTask Generacion T, PostgreSQL 16, base principal techtask; base techtask_test separada para pruebas.
- DATABASE_URL configurada solo como secreto de entorno Render, con validación TLS verify-full. No se guardó en archivos ni se imprimió su valor.
- Cuenta del visitante: registro desde la UI. Datos privados por propietario, no demo compartida ni contraseña docente publicada.
- El archivo render.yaml es una receta reproducible. La creación efectiva se hizo mediante API de Render, no aplicando un Blueprint; no se afirma que cada campo de esa receta haya sido configurado por ese método.

## Despliegue y comprobaciones

Commit funcional verificado: `1285e2354bcc821dc77540218d485783135cd7fb`. Deploy Render `dep-dbtpokg8v5cc73b083j0` alcanzó estado live y se probó después. Commits posteriores de documentación/formato no cambian reglas productivas.

Se ejecutó Playwright contra la URL pública con cuentas ficticias: registro, proyecto, tareas, dependencia, rechazo de entrega409, finalización válida, historial,100% de progreso, recarga, GET, móvil y aislamiento de segunda cuenta. Evidencia en e2e-publico.txt y publicacion/*.png. Se comprobó además health 200, cookie Secure/HttpOnly/SameSite=Lax, origen ajeno 403, logout204 y reutilización de cookie revocada 401 (seguridad-https.json).

La primera prueba pública falló por sincronización del test entre respuesta HTTP y refresco visual; se preservó en e2e-publico-primer-fallo.txt. No se modificó la regla de entrega para hacer pasar la prueba.

El CI inicial falló en el arranque del motor local por carpeta padre ausente. Se añadió creación recursiva y un test de checkout limpio. La ejecución siguiente tuvo ambos jobs exitosos: PostgreSQL 16 y Chromium. La prueba remota de Neon tuvo 57 casos aprobados, separada de la base principal.

## Accesos y decisiones efectivamente registrados

El usuario reconectó Neon tras un fallo de la integración. Autorizó explícitamente transferir DATABASE_URL a Render y crear el servicio gratuito. Luego autorizó desplegar el commit verificado cuando el autodeploy no había actualizado la instancia. Esas autorizaciones se registraron en el chat; no se inventaron aprobaciones.

La revisión automática inicialmente rechazó el destino de las pruebas remotas; se creó la base aislada techtask_test y el ejecutor rechaza cualquier otro nombre. También rechazó el envío del secreto y el redespliegue hasta la autorización puntual. No se usaron rutas alternativas para eludir esos bloqueos.

## Límites operativos

Planes gratuitos con cuotas y posible suspensión por inactividad. La prueba acredita funcionamiento en la ejecución registrada, no disponibilidad ininterrumpida hasta la fecha de entrega. Antes de exponer, abrir health y comprobar el recorrido breve. No contratar planes pagos sin autorización del titular.

El servicio fue creado desde la URL pública del repositorio. Aunque su bandera autoDeploy indique yes, el despliegue no siguió automáticamente el push en esta ejecución: se requirió despliegue autorizado y se verificó su commit. Para actualizaciones, revisar deployments antes de disparar una nueva; no duplicar despliegues ya activos. HTTP health está en la receta Blueprint; el servicio creado por API utiliza su comprobación TCP predeterminada y la verificación externa consulta /api/health.

## Actualización de contraseña

El mínimo solicitado de 4 caracteres está publicado en commit1b0c2a2, deploy dep-dbtpv6sipgvc739qgm70 (live). Verificación real por Edge: formulario minlength4, registro201 y login200 con4 caracteres; con3 el servidor devuelve400. CI: https://github.com/feghi0/TechTask/actions/runs/43987809403. Captura y resultado en docs/evidencias/password4.
