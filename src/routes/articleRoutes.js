const express = require('express');
const router = express.Router();
const ArticleModel = require('../models/articleModel');

router.get('/articles', (req, res) => {
  const articles = ArticleModel.getAll();
  res.json(articles);
});

router.get('/articles/:id', (req, res) => {
  const article = ArticleModel.getById(req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Artículo no encontrado' });
  }
  res.json(article);
});

module.exports = router;
