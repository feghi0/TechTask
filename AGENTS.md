# TechTask — reglamento de desarrollo

## Objetivo y autoridad

Proyecto Final individual de Agustín Manteiga, Generación T / Streambe 2026. Construir un gestor de proyectos y entregas con cuentas privadas, reglas verificables, persistencia y publicación real.

Jerarquía: decisiones humanas aprobadas → spec.md → plan.md → tasks.md → pruebas de aceptación → código. Una instrucción nueva del usuario prevalece. Si los documentos se contradicen, señalar y resolver antes del cambio afectado; no inventar aprobaciones.

El 16/11/2026 el usuario aprobó totalmente el análisis presentado en el chat y eligió cuentas privadas, autorizando ejecución autónoma. Se permite implementar y probar ese alcance sin pedir aprobación por cada tarea. Accesos externos o costos no autorizados requieren intervención. No detener trabajo independiente por una conexión pendiente.

## Fuentes y estructura

Consultar idea.md, decisiones.md, glosario.md, preguntas-abiertas.md, spec.md, plan.md y tasks.md. backend contiene HTTP/Controller/Service/Repository/database; frontend componentes, hooks y HTTP; shared contratos; tests verificaciones; docs evidencia y antecedentes.

## Convenciones y arquitectura

TypeScript estricto; sin any innecesario. Formato legible con Prettier. No SQL en React ni reglas críticas exclusivas del cliente. PostgreSQL con consultas parametrizadas y migraciones; PGlite ejecuta el motor PostgreSQL en desarrollo/pruebas locales, sin ser una prueba del servicio remoto. Producción requiere DATABASE_URL. Mantener SQLite TP4 fuera de Git y sin sobrescribirlo.

El Service aplica reglas y alcance de propietario. Las operaciones compuestas, control de versiones e historial son atómicos. No devolver recursos de otra cuenta. Cookies HttpOnly, contraseñas derivadas con scrypt y salt aleatorio, sesiones almacenadas con token hash. No registrar contraseñas, cookies o URLs con credenciales.

## Agentes

Perfiles operativos en docs/agentes. Analista: requisitos, no código. Arquitecto: contratos, no ampliar alcance. Backend: backend. Frontend: frontend. Tester: tests, no alterar requisitos para obtener verde. Revisor: solo lectura. Root coordina contratos, integración, Git, documentación y publicación. Asignaciones de archivos evitan ediciones simultáneas; todo agente informa cambios y comprobaciones reales.

Los perfiles Markdown son instrucciones para agentes de Codex. No son archivos de configuración de Cursor ni una afirmación de que seis agentes ejecutaron simultáneamente. La plataforma permite tres subagentes simultáneos más root; los roles se activan por etapas.

## Ciclo y commits

Especificar → test rojo cuando corresponde → implementar → verde → revisar → refactor → commit. Guardar resultados reales y razones de fallos. No generar tests que solo repitan la implementación. No tratar compilación como prueba de navegador ni PGlite como prueba de Neon. Toda tarea funcional debe tener verificaciones y documentación al día.

Commits por unidad revisable, mensajes claros, sin backdating, force push ni reescritura. La base TP4 tiene un commit actual que preserva trabajo previo, no simula su historial. Nunca agregar node_modules, bases, .env ni credenciales. No borrar antecedentes ni archivos ajenos para simplificar un cambio.

## Finalización

No declarar terminado sin tests, recorridos reales, documentación, remoto actualizado y aplicación pública probada. Registrar límites con los estados de matriz exigidos: Cumplido y verificado / Implementado, no verificado / Pendiente / Bloqueado. Un despliegue pendiente de acceso no convierte en incompleto lo ya probado, pero impide marcar terminado el proyecto global.
