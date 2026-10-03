# 💬 Sistema de Comentarios de un Blog (Ejemplo 2 - Taller 5)

Repositorio completo para la solución del **Ejemplo 2: Sistema de Comentarios de un Blog**, desarrollado aplicando **Trunk-Based Development (TBD)**, **Feature Toggles / Feature Flags**, arquitectura de software en Node.js, pruebas automatizadas en CI/CD (GitHub Actions), contenedorización con Docker y auto-despliegue en Render.

---

## 📋 Resumen de Implementación de Historias (Tickets)

Siguiendo la estrategia de división slicing de historias del Taller 5:

| Ticket | Descripción | Feature Flag | Estado Rollout |
| :--- | :--- | :--- | :--- |
| **Ticket 1** | Modelo `Comment` + Endpoint `POST /articles/{id}/comments` (guardar en DB) | `comments_enabled` | `false` por defecto |
| **Ticket 2** | Endpoint `GET /articles/{id}/comments` + Renderizado solo lectura en UI | `comments_visible_percentage` | `10%` rollout inicial |
| **Ticket 3** | Formulario interactivo para comentar y respuestas anidadas multinivel | `comments_interactive_percentage` | `100%` rollout final |

---

## 🏗️ Estructura del Proyecto

```
TALLER 5/
├── .github/workflows/
│   └── ci.yml             # Workflow CI/CD de GitHub Actions
├── public/                # Web UI cliente adaptativa según Feature Flags
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── config/
│   │   └── featureFlags.js # Servicio de Feature Flags y Rollout por Porcentaje
│   ├── db/
│   │   └── database.js    # Base de datos SQLite / In-Memory
│   ├── models/
│   │   ├── commentModel.js # CRUD y construcción de árbol jerárquico de respuestas
│   │   └── articleModel.js
│   ├── routes/
│   │   ├── commentRoutes.js
│   │   ├── articleRoutes.js
│   │   └── flagRoutes.js   # API para consulta y cambio dinámico de flags
│   ├── app.js
│   └── server.js
├── tests/
│   ├── comments.test.js    # Tests de integración API (Supertest)
│   └── featureFlags.test.js # Tests unitarios del evaluador de flags
├── Dockerfile             # Multi-stage Dockerfile para producción
├── render.yaml            # Blueprint de infraestructura como código (Render)
├── DoD.md                 # Definition of Done oficial (Técnico, Negocio, Despliegue)
├── PLAYBOOK.md            # Playbook del flujo Trunk-Based Development
└── package.json
```

---

## ⚡ Ejecución Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar pruebas automatizadas**:
   ```bash
   npm test
   ```

3. **Ejecutar linter / chequeo sintáctico**:
   ```bash
   npm run lint
   ```

4. **Iniciar servidor de desarrollo**:
   ```bash
   npm start
   ```
   Accede a la aplicación en `http://localhost:3000` y al endpoint de health check en `http://localhost:3000/healthz`.

---

## 🐳 Ejecución con Docker

1. **Construir la imagen Docker**:
   ```bash
   docker build -t blog-comments-system .
   ```

2. **Ejecutar el contenedor**:
   ```bash
   docker run -d -p 3000:3000 --name blog-comments blog-comments-system
   ```

---

## 🚀 Despliegue en Render (Continuous Deployment)

El proyecto incluye el archivo `render.yaml`. En Render:
1. Crea un nuevo **Blueprint** conectando este repositorio.
2. Render detectará automáticamente el archivo `render.yaml` y configurará el Web Service con los comandos de build (`npm ci`) y start (`npm start`).
3. El health check quedará configurado en `/healthz`.
4. El pipeline de GitHub Actions (`.github/workflows/ci.yml`) ejecutará el webhook de auto-deploy al fusionar cambios en `main`.

---

## 📜 Definición de Hecho (DoD)

Consulta [DoD.md](DoD.md) para revisar los criterios de aceptación y calidad acordados en el taller.
