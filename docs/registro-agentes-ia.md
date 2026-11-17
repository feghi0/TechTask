# Registro de uso de IA y agentes

## Contexto y aprobaciones reales

El usuario proporcionó la consigna completa del Proyecto Final y repositorio feghi0/TechTask. Root inspeccionó el código local y GitHub antes de modificar. El usuario aprobó totalmente el análisis, eligió cuentas privadas y autorizó autonomía. Después reconectó Neon y autorizó expresamente transferir la conexión a Render y desplegar el commit verificado.

No se afirma que el estudiante escribió tests, decidió detalles internos o realizó revisiones que ejecutaron los agentes. Sus decisiones efectivas están registradas, y la conclusión personal queda a su criterio.

## Delegaciones reales

| Rol | Instrucción recibida / alcance | Resultado registrado |
|---|---|---|
| Analista | Solo lectura: comparar RN existentes/propuestas, contradicciones, decisiones pendientes | Detectó cambio de urgencia 3→7/3, materia libre vs catálogo y ausencia de proyectos/dependencias. |
| Arquitecto | Solo lectura: evaluar capas, motor, hosting y concurrencia | Reutilizar arquitectura; PostgreSQL condicionado a hosting efímero; transacciones y versión. |
| Revisor | Solo lectura inicial y final; hallar riesgos con evidencia | Unicode, clave especial, selector; luego límites UI, NUL y contradicción de retiro de dependencia. |
| Backend | Solo backend, contratos compartidos fijos; reglas aprobadas y autenticación privada | Migraciones, repositorios, servicios, Controller y seguridad. Bootstrap rojo→verde. |
| Frontend | Solo frontend, conservar diseño; interfaz privada real sin simular éxito | Pantallas completas, errores 409, accesibilidad básica, responsive y modal centrado. |
| Tester | Solo tests/config y logs; no cambiar producción para satisfacer tests | Casos rojos, integración, fechas, concurrencia, importación y e2e. |
| Root | Coordinación y revisión de límites, GitHub, integración, despliegue/documentación | Contratos/SPEC, importador, CI limpio, pruebas remotas/HTTPS, evidencias y sincronización. |

Tres subagentes podían ejecutar simultáneamente además de root; se rotaron por etapas. Perfiles en docs/agentes son instrucciones para Codex, no configuraciones ficticias de otra plataforma. Un subagente alcanzó su límite de uso al final; root terminó la integración y las verificaciones restantes.

## Prompts de trabajo resumidos fielmente

1. Auditoría sin escritura: revisar archivos, comparar requisitos y citar evidencia, sin atribuir aprobaciones.
2. Backend: implementar PostgreSQL y cuentas privadas según shared/contracts, con ownership, sesiones, reglas transaccionales y servidor configurable; no modificar frontend ni commits.
3. Frontend: preservar diseño; construir formularios y recorridos privados contra API; no SQL ni reglas autoritativas exclusivas del cliente.
4. Tester: derivar casos de SPEC, conservar rojo, probar datos inválidos, aislamiento y carreras; no tocar producción.
5. Revisor: inspeccionar auth, CORS, versiones, transacciones y divergencias contra SPEC; solo lectura.

No son transcripciones inventadas de conversaciones humanas; son resúmenes de asignaciones reales documentadas en el chat de desarrollo.

## Evaluación crítica

Los resultados iniciales no se aceptaron automáticamente. La revisión halló casos que las primeras pruebas no cubrían; se añadieron regresiones. La expectativa incorrecta de health fue corregida en el test, no mediante un cambio artificial del producto. El fallo Linux se reprodujo como directorio ausente y produjo un test adicional. El recorrido público requirió sincronizar el test con la interfaz ya actualizada.

La evidencia de calidad son los comportamientos comprobados y límites registrados. No se presenta el 59/59 como «precisión del agente», cobertura ni seguridad total.
