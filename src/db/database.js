const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../data/db.json');

// Semilla inicial de artículos del blog
const initialArticles = [
  {
    id: 1,
    title: "Trunk-Based Development & Feature Toggles en Práctica",
    author: "Equipo DevOps",
    date: "2026-10-03",
    content: "En este artículo exploramos cómo la integración continua real se logra integrando código directamente en main usando Feature Toggles para proteger funcionalidades incompletas."
  },
  {
    id: 2,
    title: "Automatización de Pipelines con GitHub Actions y Render",
    author: "Arquitectura Cloud",
    date: "2026-10-02",
    content: "Aprende a desplegar tus servicios automáticamente en Render cada vez que un PR se fusiona en la rama principal tras superar los controles de calidad."
  }
];

// Semilla inicial de comentarios preexistentes (Ticket 2)
const initialComments = [
  {
    id: 1,
    article_id: 1,
    parent_id: null,
    author: "Ana Gómez",
    content: "¡Excelente artículo! La estrategia de Feature Flags nos ha ahorrado muchísimas ramas de larga duración.",
    created_at: "2026-10-03T10:15:00Z"
  },
  {
    id: 2,
    article_id: 1,
    parent_id: 1,
    author: "Carlos Ruiz",
    content: "Totalmente de acuerdo Ana, especialmente para evitar infiernos de merge al final del sprint.",
    created_at: "2026-10-03T10:30:00Z"
  }
];

class Database {
  constructor() {
    this.dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        this.initSeed();
      }
    } else {
      this.initSeed();
    }
  }

  initSeed() {
    this.data = {
      articles: initialArticles,
      comments: initialComments,
      nextCommentId: 3
    };
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error guardando DB:', err);
    }
  }

  reset() {
    this.initSeed();
  }
}

const db = new Database();

module.exports = db;
