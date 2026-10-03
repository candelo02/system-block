const express = require('express');
const cors = require('cors');
const path = require('path');

const articleRoutes = require('./routes/articleRoutes');
const commentRoutes = require('./routes/commentRoutes');
const flagRoutes = require('./routes/flagRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Archivos estáticos de frontend UI
app.use(express.static(path.join(__dirname, '../public')));

// Health Check Endpoint (Requerido para Render y Kubernetes)
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', articleRoutes);
app.use('/api', commentRoutes);
app.use('/api', flagRoutes);

// Handling 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
