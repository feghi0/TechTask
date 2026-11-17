# Guía de presentación — TechTask

## Explicación breve

TechTask resuelve la organización de proyectos técnicos con tareas que dependen de otras. No es solo un ABM: el servidor impide entregar sin cumplir requisitos, rechaza ciclos, controla modificaciones concurrentes y registra cambios de estado. Cada estudiante trabaja en su espacio privado.

React presenta e interactúa; Express recibe; Controller traduce HTTP; Service aplica reglas; Repository usa SQL; PostgreSQL persiste. Los agentes tuvieron roles y permisos separados. El estudiante aprobó alcance y cuentas privadas; la IA propuso implementación y los tests la verificaron.

## Demostración de cinco minutos

1. Abrir la URL de docs/publicacion.md. Mostrar pantalla de acceso y crear una cuenta con correo ficticio y contraseña exclusiva de demostración (no mostrarla en capturas).
2. Crear «Proyecto técnico de Redes». Explicar que progreso vacío es 0%, calculado.
3. Crear «Diseñar topología» y «TP de Redes» con materia Redes. Mostrar validación de título corto y error del servidor.
4. En TP de Redes, agregar Diseñar topología como dependencia. Pasar TP a desarrollo e intentar entregar: explicar409 y motivo visible.
5. Pasar Diseñar topología a desarrollo y entregarla. Entregar TP: mostrar historial y 100% de progreso.
6. Recargar. Mostrar que los datos vuelven del servidor y la sesión sigue siendo válida.
7. Cerrar sesión y entrar con otra cuenta ficticia: el proyecto no aparece. No compartir contraseñas.

## Preguntas para justificar decisiones

- ¿Por qué no guardar solo en localStorage? No ofrece persistencia/control de servidor ni aislamiento robusto.
- ¿Por qué validar dos veces? El navegador ayuda al usuario; el servidor decide incluso si se omite la UI.
- ¿Por qué no almacenar progreso? Puede derivarse; duplicarlo permite inconsistencias.
- ¿Cómo se evitan carreras? Versión rechaza cambios obsoletos y transacción/bloqueo serializa decisiones del grafo.
- ¿Cómo se verificó? Logs 59 pruebas locales, pruebas de PostgreSQL/CI según estado real, e2e y capturas. No equivaler un build a una prueba completa.
- ¿Qué eligió el estudiante? Alcance analizado y cuentas privadas, explícitamente registrado. No atribuirle decisiones no confirmadas.

## Si el hosting tarda en despertar

El plan gratuito puede suspenderse por inactividad. Esperar el arranque, recargar y comprobar health. Tener disponible el inicio local documentado y las evidencias reales. No afirmar disponibilidad permanente ni alterar resultados para la presentación.
