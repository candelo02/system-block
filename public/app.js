document.addEventListener('DOMContentLoaded', () => {
  const currentArticleId = 1;
  let currentUserId = 'user_123';

  // Elementos DOM del Panel de Feature Flags
  const toggleEnabled = document.getElementById('toggle-enabled');
  const badgeEnabled = document.getElementById('badge-enabled');
  const rangeVisible = document.getElementById('range-visible');
  const labelVisiblePct = document.getElementById('label-visible-pct');
  const rangeInteractive = document.getElementById('range-interactive');
  const labelInteractivePct = document.getElementById('label-interactive-pct');
  const userIdInput = document.getElementById('user-id-input');
  const btnApplyUser = document.getElementById('btn-apply-user');

  // Elementos DOM de Artículo y Comentarios
  const articleTitle = document.getElementById('article-title');
  const articleMeta = document.getElementById('article-meta');
  const articleContent = document.getElementById('article-content');
  const commentsDisabledBanner = document.getElementById('comments-disabled-banner');
  const commentsList = document.getElementById('comments-list');
  const formDisabledBanner = document.getElementById('form-disabled-banner');
  const commentForm = document.getElementById('comment-form');
  const replyParentIdInput = document.getElementById('reply-parent-id');
  const replyIndicator = document.getElementById('reply-indicator');
  const btnCancelReply = document.getElementById('btn-cancel-reply');

  // Cargar Artículo
  fetchArticle(currentArticleId);

  // Cargar Estado de Feature Flags
  loadFeatureFlags();

  // Event Listeners para el Panel de Flags
  toggleEnabled.addEventListener('change', async () => {
    await updateFlagOnServer('comments_enabled', toggleEnabled.checked);
    refreshView();
  });

  rangeVisible.addEventListener('change', async () => {
    labelVisiblePct.textContent = `${rangeVisible.value}%`;
    await updateFlagOnServer('comments_visible_percentage', parseInt(rangeVisible.value, 10));
    refreshView();
  });

  rangeInteractive.addEventListener('change', async () => {
    labelInteractivePct.textContent = `${rangeInteractive.value}%`;
    await updateFlagOnServer('comments_interactive_percentage', parseInt(rangeInteractive.value, 10));
    refreshView();
  });

  btnApplyUser.addEventListener('click', () => {
    currentUserId = userIdInput.value.trim() || 'anonymous';
    refreshView();
  });

  // Cancelar Respuesta
  btnCancelReply.addEventListener('click', () => {
    replyParentIdInput.value = '';
    replyIndicator.classList.add('hidden');
  });

  // Enviar Formulario de Comentarios
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = document.getElementById('comment-author').value.trim();
    const content = document.getElementById('comment-body').value.trim();
    const parent_id = replyParentIdInput.value ? parseInt(replyParentIdInput.value, 10) : null;

    if (!author || !content) return;

    try {
      const res = await fetch(`/api/articles/${currentArticleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({ author, content, parent_id })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      // Resetear Formulario
      document.getElementById('comment-body').value = '';
      replyParentIdInput.value = '';
      replyIndicator.classList.add('hidden');
      fetchComments(currentArticleId);
    } catch (err) {
      alert('Error de conexión al publicar comentario.');
    }
  });

  async function fetchArticle(id) {
    try {
      const res = await fetch(`/api/articles/${id}`);
      const article = await res.json();
      articleTitle.textContent = article.title;
      articleMeta.textContent = `Por ${article.author} • ${article.date}`;
      articleContent.textContent = article.content;
    } catch (err) {
      articleTitle.textContent = 'Error cargando artículo';
    }
  }

  async function loadFeatureFlags() {
    try {
      const res = await fetch('/api/feature-flags', {
        headers: { 'X-User-Id': currentUserId }
      });
      const data = await res.json();
      const raw = data.raw_flags;

      toggleEnabled.checked = raw.comments_enabled;
      updateBadge(badgeEnabled, raw.comments_enabled);

      rangeVisible.value = raw.comments_visible_percentage;
      labelVisiblePct.textContent = `${raw.comments_visible_percentage}%`;

      rangeInteractive.value = raw.comments_interactive_percentage;
      labelInteractivePct.textContent = `${raw.comments_interactive_percentage}%`;

      refreshView();
    } catch (err) {
      console.error('Error cargando flags:', err);
    }
  }

  async function updateFlagOnServer(flag, value) {
    try {
      await fetch('/api/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag, value })
      });
    } catch (err) {
      console.error('Error actualizando flag en servidor:', err);
    }
  }

  function updateBadge(badgeElement, isOn) {
    badgeElement.textContent = isOn ? 'ON' : 'OFF';
    if (isOn) {
      badgeElement.classList.add('on');
    } else {
      badgeElement.classList.remove('on');
    }
  }

  async function refreshView() {
    updateBadge(badgeEnabled, toggleEnabled.checked);
    await fetchComments(currentArticleId);
  }

  async function fetchComments(articleId) {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        headers: { 'X-User-Id': currentUserId }
      });
      const data = await res.json();

      if (res.status === 403 || !data.comments) {
        // Ticket 2 OFF: Ocultar lista y mostrar banner informativo
        commentsList.innerHTML = '';
        commentsDisabledBanner.classList.remove('hidden');
        formDisabledBanner.classList.add('hidden');
        commentForm.classList.add('hidden');
        return;
      }

      // Ticket 2 ON: Ocultar banner y renderizar comentarios
      commentsDisabledBanner.classList.add('hidden');
      renderCommentsTree(data.comments, commentsList, data.meta.interactive_enabled);

      // Evaluar Ticket 3 (Formulario interactivo)
      if (data.meta.interactive_enabled) {
        formDisabledBanner.classList.add('hidden');
        commentForm.classList.remove('hidden');
      } else {
        formDisabledBanner.classList.remove('hidden');
        commentForm.classList.add('hidden');
      }
    } catch (err) {
      console.error('Error obteniendo comentarios:', err);
    }
  }

  function renderCommentsTree(comments, container, canReply) {
    container.innerHTML = '';
    if (!comments || comments.length === 0) {
      container.innerHTML = '<p class="description">Aún no hay comentarios en este artículo. ¡Sé el primero en opinar!</p>';
      return;
    }

    comments.forEach(comment => {
      container.appendChild(createCommentNode(comment, canReply));
    });
  }

  function createCommentNode(comment, canReply) {
    const card = document.createElement('div');
    card.className = 'comment-card';

    const formattedDate = new Date(comment.created_at).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    card.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${escapeHtml(comment.author)}</span>
        <span class="comment-date">${formattedDate}</span>
      </div>
      <div class="comment-body">${escapeHtml(comment.content)}</div>
    `;

    if (canReply) {
      const replyBtn = document.createElement('button');
      replyBtn.className = 'btn-reply';
      replyBtn.textContent = '↳ Responder';
      replyBtn.addEventListener('click', () => {
        replyParentIdInput.value = comment.id;
        replyIndicator.querySelector('span').textContent = `Respondiendo a ${comment.author}...`;
        replyIndicator.classList.remove('hidden');
        commentForm.scrollIntoView({ behavior: 'smooth' });
      });
      card.appendChild(replyBtn);
    }

    if (comment.replies && comment.replies.length > 0) {
      const repliesContainer = document.createElement('div');
      repliesContainer.className = 'comment-replies';
      comment.replies.forEach(reply => {
        repliesContainer.appendChild(createCommentNode(reply, canReply));
      });
      card.appendChild(repliesContainer);
    }

    return card;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});
