const db = require('../db/database');

class CommentModel {
  static getByArticleId(articleId) {
    const numericArticleId = parseInt(articleId, 10);
    const comments = db.data.comments.filter(c => c.article_id === numericArticleId);
    return this.buildTree(comments);
  }

  static getRawByArticleId(articleId) {
    const numericArticleId = parseInt(articleId, 10);
    return db.data.comments.filter(c => c.article_id === numericArticleId);
  }

  static create({ article_id, parent_id = null, author, content }) {
    if (!author || !author.trim()) {
      throw new Error('El campo autor es obligatorio.');
    }
    if (!content || !content.trim()) {
      throw new Error('El comentario no puede estar vacío.');
    }

    const numericArticleId = parseInt(article_id, 10);
    const numericParentId = parent_id ? parseInt(parent_id, 10) : null;

    // Verificar si el comentario padre existe en el mismo artículo si se proveyó parent_id
    if (numericParentId !== null) {
      const parentComment = db.data.comments.find(
        c => c.id === numericParentId && c.article_id === numericArticleId
      );
      if (!parentComment) {
        throw new Error(`El comentario padre #${parent_id} no existe para el artículo #${article_id}`);
      }
    }

    const newComment = {
      id: db.data.nextCommentId++,
      article_id: numericArticleId,
      parent_id: numericParentId,
      author: author.trim(),
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    db.data.comments.push(newComment);
    db.save();

    return newComment;
  }

  /**
   * Construye una estructura en árbol (respuestas anidadas) a partir de una lista plana
   */
  static buildTree(commentsList) {
    const map = {};
    const roots = [];

    commentsList.forEach(comment => {
      map[comment.id] = { ...comment, replies: [] };
    });

    commentsList.forEach(comment => {
      if (comment.parent_id !== null && map[comment.parent_id]) {
        map[comment.parent_id].replies.push(map[comment.id]);
      } else {
        roots.push(map[comment.id]);
      }
    });

    return roots;
  }
}

module.exports = CommentModel;
