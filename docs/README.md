# Centro de documentación — TechTask

Relevamiento: **16 de noviembre de 2026**. Base funcional: `1b0c2a2`; revisión documental de partida: `e56d4cb`. Esta carpeta documenta lo que existe y distingue procedimientos propuestos de operaciones verificadas.

Aplicación: [TechTask](https://techtask-generacion-t.onrender.com). Repositorio: [feghi0/TechTask](https://github.com/feghi0/TechTask). Contraseña vigente: **4 a 128 caracteres**. Batería actual: **60 pruebas**; los resultados de 28, 50, 57, 58 y 59 de otros documentos son ejecuciones de etapas diferentes, no cifras intercambiables.

## Elegir un recorrido

| Destinatario | Documento | Para qué sirve |
|---|---|---|
| Estudiante que utiliza la app | [Manual de usuario](manuales/01-usuario.md) | Cuentas, proyectos, tareas, dependencias, alertas y errores. |
| Persona que instala localmente | [Instalación y configuración](manuales/02-instalacion-configuracion.md) | Requisitos, comandos, variables, arranque y comprobación. |
| Desarrollador | [Manual técnico](manuales/03-desarrollo-arquitectura.md) | Capas, módulos, recorrido de petición y proceso de cambios. |
| Integrador de API | [Referencia HTTP](manuales/04-api-rest.md) | Todas las rutas, cuerpos, respuestas y ejemplos reproducibles. |
| Responsable de datos | [Base y diccionario](manuales/05-base-datos.md) | Tablas, relaciones, restricciones y consistencia. |
| Responsable del servicio | [Operación y despliegue](manuales/06-operacion-despliegue.md) | Publicar, comprobar, observar y mantener. |
| Responsable de respaldos | [Copias, restauración e importación](manuales/07-respaldo-restauracion.md) | PGlite, PostgreSQL y legado SQLite sin perder el origen. |
| Soporte/mantenimiento | [Incidentes y mantenimiento](manuales/08-soporte-mantenimiento.md) | Diagnóstico por síntoma, acciones y escalamiento. |
| Revisor de privacidad | [Seguridad y privacidad](manuales/09-seguridad-privacidad.md) | Datos, controles reales y límites del alcance. |
| Tester o docente | [Pruebas y aceptación](manuales/10-pruebas-aceptacion.md) | Qué ejecutar, qué se espera y cómo interpretar evidencia. |
| Docente / presentación | [Entrega académica](manuales/11-entrega-presentacion.md) | Documentos obligatorios, demostración y evaluación. |
| Quien retoma el proyecto | [Relevamiento actual](relevamiento-actual.md) | Inventario, estado, verificaciones y deuda técnica. |

## Fuentes de verdad y antecedentes

Las decisiones humanas aprobadas se registran en [decisiones.md](../decisiones.md). El comportamiento se define en [spec.md](../spec.md), el plan en [plan.md](../plan.md), las tareas en [tasks.md](../tasks.md) y las reglas de colaboración en [AGENTS.md](../AGENTS.md). Si un manual contradice esos documentos o el código, registrar la diferencia antes de modificar comportamiento.

- [Informe académico](informe-final.md), [informe de pruebas](informe-pruebas.md) y [matriz de cumplimiento](matriz-cumplimiento.md).
- [Publicación y comprobaciones](publicacion.md), [guía de demostración](guia-demostracion.md) y [registro de IA](registro-agentes-ia.md).
- [Descripción de capturas](evidencias/descripcion-capturas.md) y [evidencia del mínimo de contraseña](evidencias/password4/resultado-publico.json).
- `entrega-tp4/` conserva documentos y evidencias históricos de SQLite. No utilizar sus endpoints anónimos o umbrales de urgencia como contrato vigente.
- Los perfiles de [agentes](agentes/) son instrucciones reales para delegación en Codex, no una configuración de otra plataforma.

## Control documental

Los manuales son Markdown versionado, exportable a PDF. No hay un PDF generado ni una exportación automática de documentación. Las capturas existentes son reales y sus descripciones indican entorno y alcance. No se editaron logs para reemplazar resultados antiguos por nuevos.

Al cambiar una regla: actualizar decisión/SPEC, tests, código, manual afectado y evidencia; hacer commit. Al cambiar solo documentación: revisar exactitud, enlaces y ejemplos sin alterar producción. Un estado verde anterior no acredita una operación nueva que no fue ejecutada.

`npm run docs:check` comprueba enlaces locales y presencia de las rutas explícitas de Express en la referencia HTTP; no comprueba URLs externas ni anclas. El job PostgreSQL de CI también ejecuta este control.
