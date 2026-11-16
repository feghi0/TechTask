# Registro del uso de IA

## Fuentes y prompts reales

1. El usuario proporcionó el texto «PROYECTO TECHTASK — GENERACIÓN T», que solicita reconstrucción, análisis previo, aprobación, implementación incremental y evidencia. No se encontraron PDFs ni código original en la carpeta.
2. La IA presentó arquitectura Controller/Service/Repository, reglas, endpoints y dos alternativas de acceso a SQLite.
3. El usuario respondió literalmente **«a»**. Esto confirma la selección de SQLite integrado. La IA comunicó que interpretaba esa respuesta también como aprobación del plan. No equivale a una reflexión personal del estudiante ni a un cuestionamiento suyo que no haya expresado.
4. Se solicitó a Image Gen un concepto de dashboard TechTask en español, con barra lateral azul oscuro, estadísticas, búsqueda, filtros, tarjetas y formulario lateral. Es una referencia visual generada; sus tareas de ejemplo no son datos reales.
5. La IA implementó creación y lectura y preparó verificaciones automatizadas. Los resultados se registran en la carpeta de evidencias; la existencia de código no acredita por sí misma una prueba.

## Decisión real y límites

- Propuesta A: SQLite integrado en Node, menos dependencias y SQL explícito.
- Propuesta B: better-sqlite3, dependencia nativa adicional.
- Decisión del usuario: A.
- Verificación: Node 22.21.0 pudo abrir SQLite 3.50.4. Emite advertencia experimental.
- Justificación técnica de la IA: apropiado para un servidor local académico de baja concurrencia, conservando el repositorio como límite de acceso a datos.
- **Pendiente del estudiante:** explicar qué aspecto cuestiona y por qué considera adecuada la decisión. No se inventó una intervención crítica ni una conclusión personal.

## Alcance

Edición, eliminación, cambios de estado y cambio de favorito posterior a la creación permanecen diseñados, sin implementación. La marca de favorita se puede definir al crear. No se autorizó automáticamente ampliar el CRUD antes de validar creación y lectura.
