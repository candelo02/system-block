# 📋 Definition of Done (DoD) Final

Este documento formaliza los criterios de aceptación acordados para dar por finalizada cualquier Historia de Usuario o Ticket dentro del proyecto **Sistema de Comentarios de Blog**.

---

## 🛠️ 1. DoD Técnico (Engineering & Quality)
- [x] **Código Revisado**: Código revisado en Pair/Mob Programming o mediante PR con aprobación de al menos 1 peer.
- [x] **CI Verde**: Pipeline de GitHub Actions súper confiable pasando al 100%:
  - Tests unitarios e integración ejecutados sin fallos (`npm test`).
  - Análisis estático / Linter comprobado (`npm run lint`).
- [x] **Feature Toggle Configurado**: Si la funcionalidad está incompleta o en rollout progresivo, debe estar protegida detrás de un Feature Flag (ej. `comments_enabled`, `comments_visible_percentage`, `comments_interactive_percentage`).
- [x] **Sin Regresiones**: Comprobado que los cambios no rompen ninguna funcionalidad existente en producción/main.
- [x] **Docker Image Build**: Verificado que la imagen Docker del contenedor se construye limpiamente.

---

## 🎯 2. DoD de Negocio (Product & Acceptance Criteria)
- [x] **Criterios de Aceptación Cumplidos**: Todos los escenarios descritos en la historia de usuario (Tickets 1, 2 y 3) han sido validados.
- [x] **Validación en Entorno Destino**: La funcionalidad se puede probar y verificar en el entorno de Staging o Producción.
- [x] **Alineación con PO**: El Product Owner conoce el estado exacto del Feature Toggle y tiene la capacidad de activar/desactivar o ajustar el porcentaje de rollout.

---

## 🚀 3. DoD de Despliegue (Ops & Monitoring)
- [x] **Auto-deploy a Render**: Código integrado en `main` desplegado automáticamente a Render mediante el pipeline.
- [x] **Health Check Pasando**: El endpoint de salud `/healthz` responde con estado `200 OK`.
- [x] **Monitoreo & Logs**: Verificación básica de logs de ejecución en Render sin errores en arranque.
- [x] **Toggle en Estado Acordado**: Feature Flag configurado en el porcentaje o estado pactado con el equipo (0%, 10% o 100%).
