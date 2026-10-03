const db = require('../db/database');

class ArticleModel {
  static getAll() {
    return db.data.articles;
  }

  static getById(id) {
    const numericId = parseInt(id, 10);
    return db.data.articles.find(a => a.id === numericId) || null;
  }
}

module.exports = ArticleModel;
