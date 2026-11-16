# Auditoría inicial — 16/11/2026

Repositorio oficial: https://github.com/feghi0/TechTask. GitHub API confirmó vacío y permisos push/admin de feghi0. Carpeta local tenía .git sin commits ni remoto y todo el TP4 sin seguimiento. No se encontró código remoto previo para comparar.

## A — Funcional y comprobado

React/Vite/TypeScript estricto, Express y SQLite reales. GET/POST /api/tasks; Controller/Service/Repository identificables; UUID/createdAt servidor; consultas parametrizadas; errores controlados. En auditoría se ejecutó typecheck y Vitest: 28 tests aprobados. Pruebas incluyen HTTP y cerrar/reabrir base SQLite. Evidencias TP4 de navegador ya existían; no se presentaron como una ejecución nueva durante la auditoría.

## B — Implementado sin validación exhaustiva

Filtros, favoritos al crear, responsive y estados de interfaz: hay evidencia previa, no prueba completa de accesibilidad, navegadores y fallos de almacenamiento. No había prueba productiva ni concurrencia.

## C — Parcial/defectuoso

1. Título de dos emojis tiene JS length4 y SQLite length2: Service acepta, CHECK falla. Reproducido contra Service/Repository en SQLite memoria durante auditoría.
2. Recolector fields={} no registra '__proto__' como campo enumerable: clave desconocida aceptada. Reproducido.
3. E2E getByLabel('Marcar como favorita') sin exact colisiona con iconos 'Sin marcar como favorita'. Script de capturas independiente ya tenía selector exacto.
4. Mensaje de éxito previo permanece al fallar una solicitud posterior.
5. Urgencia solo frontend <=3 días no corresponde a regla nueva de 7/3.
6. server.ts fija loopback3001, sin PORT/HOST ni CORS explícito. Solo ejecución local.

## D — Inexistente

Projects, actualización/baja/estados, dependencias/ciclos, historial, concurrencia crítica, migraciones, cuentas privadas, CI, publicación y documentación final. Modelo único Task, tabla tasks sin FK. No hay porcentaje de proyecto ni catálogo de materias.

## Reutilización

Conservar diseño, separación HTTP/hooks/componentes y capas backend. Cambiar contratos y repositorio para PostgreSQL y ownership. Archivos históricos y bases SQLite no se borran. Los defectos se abordan con regresiones, sin reescribir por comodidad.

## Agentes reales y aprobación

Analista, Arquitecto y Revisor participaron como subagentes de solo lectura. Tester/root ejecutó verificaciones. El usuario aprobó totalmente el análisis y eligió cuentas privadas; después comenzaron Backend, Frontend y Tester reales, con archivos asignados y coordinación por mensajes. No se inventan aprobaciones previas ni reflexiones del estudiante.
