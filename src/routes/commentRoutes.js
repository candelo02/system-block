const express = require('express');
const router = express.Router();
const CommentModel = require('../models/commentModel');
const ArticleModel = require('../models/articleModel');
const { featureFlagService } = require('../config/featureFlags');

// Ticket 2: GET /api/articles/:id/comments (Lectura de comentarios existente, controlado por rollout)
router.get('/articles/:id/comments', (req, res) => {
  const { id } = req.params;
  const userIdentifier = req.headers['x-user-id'] || req.ip || 'anonymous';

  const article = ArticleModel.getById(id);
  if (!article) {
    return res.status(404).json({ error: 'Artículo no encontrado' });
  }

  // Evaluar flag de visibilidad de comentarios (Ticket 2)
  const isVisible = featureFlagService.isCommentsVisible(userIdentifier);
  const isInteractive = featureFlagService.isCommentsInteractive(userIdentifier);

  if (!isVisible) {
    return res.status(403).json({
      error: 'La funcionalidad de comentarios no está activa para este usuario (Feature Toggle OFF / Rollout 10%)',
      comments: [],
      feature_enabled: false
    });
  }

  const comments = CommentModel.getByArticleId(id);
  res.json({
    article_id: parseInt(id, 10),
    comments,
    meta: {
      total: CommentModel.getRawByArticleId(id).length,
      interactive_enabled: isInteractive
    }
  });
});

// Ticket 1: POST /api/articles/:id/comments (Solo guardar, detrás de comments_enabled = false por defecto)
router.post('/articles/:id/comments', (req, res) => {
  const { id } = req.params;
  const { author, content, parent_id } = req.body;
  const userIdentifier = req.headers['x-user-id'] || req.ip || 'anonymous';

  const article = ArticleModel.getById(id);
  if (!article) {
    return res.status(404).json({ error: 'Artículo no encontrado' });
  }

  // Ticket 1: Validar si la inserción de comentarios está habilitada globalmente
  if (!featureFlagService.isCommentsEnabled()) {
    return res.status(403).json({
      error: 'Creación de comentarios deshabilitada por Feature Toggle (comments_enabled = false).'
    });
  }

  // Ticket 3: Validar si el usuario tiene habilitado el modo interactivo (rollout 100%)
  if (!featureFlagService.isCommentsInteractive(userIdentifier)) {
    return res.status(403).json({
      error: 'El formulario de comentarios aún no está disponible para tu grupo de usuarios (Rollout en progreso).'
    });
  }

  try {
    const comment = CommentModel.create({
      article_id: id,
      parent_id,
      author,
      content
    });

    res.status(201).json({
      message: 'Comentario creado exitosamente',
      comment
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
