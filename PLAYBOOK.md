# 📖 Playbook de Trabajo: Trunk-Based Development & Feature Toggles

Este playbook describe el flujo continuo de desarrollo e integración usado por el equipo para el **Sistema de Comentarios de Blog**.

---

## 🔄 Flujo de Trabajo (Trunk-Based Development)

1. **Ramas de Vida Corta (Short-Lived Feature Branches)**:
   - Toda rama de desarrollo debe tener una vida máxima de **1 día**.
   - No se permiten ramas de larga duración (evitando el "Merge Hell").

2. **Integración Frecuente a `main`**:
   - Todo el código se integra continuamente a `main`.
   - Si una funcionalidad está incompleta, **NO** se retrasa la fusión: se envuelve la característica dentro de un **Feature Toggle**.

3. **Pruebas y Red de Seguridad (CI)**:
   - El pipeline en GitHub Actions valida cada PR antes de permitir el merge a `main`.
   - Regla de equipo: *"Si el CI está en rojo, se detienen nuevas funcionalidades hasta restaurar el estado verde."*

---

## 🚩 Estrategia de División de Historias (Ejemplo 2)

Para implementar el sistema de comentarios sin romper producción ni bloquear integraciones:

- **Ticket 1 (Backend Core)**:
  - Crear modelo `Comment` y endpoint `POST /articles/{id}/comments`.
  - Proteger detrás de `comments_enabled = false`.
  - *Resultado*: Código desplegado a producción, funcionalmente inactivo.

- **Ticket 2 (Lectura Solo Lectura - Rollout 10%)**:
  - Endpoint `GET /articles/{id}/comments` y renderizado de lista existente.
  - Habilitar `comments_visible_percentage` al **10%**.
  - *Resultado*: Validación temprana con un grupo pequeño de usuarios reales.

- **Ticket 3 (Comentarios Interactivos y Respuestas Anidadas - Rollout 100%)**:
  - Formulario cliente + creación de respuestas (`parent_id`).
  - Habilitar `comments_interactive_percentage` al **100%**.
  - *Resultado*: Despliegue completo y eliminación planificada del Feature Flag (limpieza de deuda técnica).
