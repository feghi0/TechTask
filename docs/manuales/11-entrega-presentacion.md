# Manual de entrega y presentación académica

Autor: Agustín Manteiga. Escuela Técnica N.º 35 «Ing. Eduardo Latzina», sexto año de Computación, Prácticas Profesionalizantes. Generación T — Streambe, Proyecto Final de Módulos 4 y 5, 2026. La fecha de cierre del 31/12/2026 procede de la consigna aportada, no de una consulta independiente a un calendario institucional.

## Paquete documental

| Documento | Función en la entrega |
|---|---|
| idea.md | Problema, usuarios y alcance. |
| decisiones.md | Alternativas, consecuencias y aprobaciones reales. |
| glosario.md | Vocabulario del dominio. |
| preguntas-abiertas.md | Decisiones pendientes/resueltas y responsable. |
| spec.md | Fuente funcional: RN/HU/criterios y contratos. |
| AGENTS.md y docs/agentes | Reglas y perfiles de trabajo. |
| plan.md y tasks.md | Diseño técnico, orden, dependencias y estado. |
| README.md y docs/README.md | Inicio del proyecto e índice documental. |
| docs/relevamiento-actual.md | Qué existe hoy y qué no. |
| docs/informe-final.md | Informe académico con proceso y resultados. |
| docs/informe-pruebas.md | Estrategia, trazabilidad y pruebas reales. |
| docs/matriz-cumplimiento.md | Contraste contra consigna, con evidencia. |
| docs/publicacion.md | URLs, despliegues y limitaciones operativas. |
| docs/manuales/ | Manuales de uso, instalación, desarrollo, API, datos y operación. |
| docs/evidencias/ | Logs y capturas reales, locales y públicas. |
| docs/entrega-tp4/ | Antecedentes históricos; no contrato final. |

Repositorio: https://github.com/feghi0/TechTask. Aplicación: https://techtask-generacion-t.onrender.com. El frontend y la API usan el mismo origen; no inventar una URL separada para cumplir una tabla.

## Presentación breve

Usar [guia-demostracion.md](../guia-demostracion.md). Mostrar proyecto, dos tareas, dependencia y rechazo de entrega antes de completar el requisito. Luego completar, explicar historial/progreso y recargar. Cerrar sesión y mostrar otra cuenta sin acceso al proyecto.

Explicar cuatro decisiones: cuentas privadas por elección humana; PostgreSQL externo para no depender del disco efímero del hosting; Service para reglas; versiones/transacciones para no decidir sobre datos obsoletos. La IA propuso y ejecutó tareas, pero las decisiones humanas y resultados verificados se registraron por separado.

## Evidencia que conviene mostrar

- Captura de entrega rechazada y después progreso 100%, no solo portada.
- Respuesta HTTP real y pruebas del grafo/aislamiento.
- GitHub Actions exitoso, indicando commit y entorno.
- Cambio de contraseña: mínimo actual4 y prueba de registro/login/rechazo 3.
- Historial Git coherente: el primer commit guarda TP4 preexistente con fecha real, no simula su desarrollo anterior.

No usar una imagen generada de diseño como evidencia funcional. No atribuir al estudiante un test, opinión o aprobación que no haya realizado. La reflexión personal debe expresarla el propio estudiante.

## Preparar un PDF

Los documentos se entregan en Markdown. Para exportar: elegir un visor/conversor disponible, incluir portada/fecha, renderizar diagramas Mermaid cuando se necesiten, comprobar tablas y saltos de página, y revisar que las capturas sean legibles. No afirmar que existe un PDF revisado si solo se dispone de Markdown. No incluir contraseñas, cookies, datos privados ni respaldos en el informe.

## Verificación antes de entregar

Abrir URLs reales, comprobar health e inicio de sesión, revisar README/manuales, evidencias y matriz, confirmar GitHub sincronizado y probar el recorrido breve. La base privada no forma parte del ZIP; el docente crea su cuenta o utiliza una demostración autorizada con datos ficticios.

## Límites que deben declararse

Sin colaboración entre cuentas, recuperación/verificación de correo, carga de adjuntos, purga de cuentas, pruebas de carga o auditoría externa. Las cuotas y suspensión de proveedores pueden afectar el tiempo de arranque. Son límites documentados, no funciones simuladas pendientes de “activar”.
