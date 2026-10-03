const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { featureFlagService } = require('../src/config/featureFlags');
const db = require('../src/db/database');

test('API Integration Tests - Comments System & Feature Flags', async (t) => {
  t.beforeEach(() => {
    // Resetear base de datos y flags antes de cada subtest
    db.reset();
    featureFlagService.setFlag('comments_enabled', true);
    featureFlagService.setFlag('comments_visible_percentage', 100);
    featureFlagService.setFlag('comments_interactive_percentage', 100);
  });

  await t.test('GET /healthz - Debe retornar 200 OK para monitoreo y Render', async () => {
    const res = await request(app).get('/healthz');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'OK');
  });

  await t.test('Ticket 1: POST /api/articles/1/comments debe retornar 403 cuando comments_enabled = false', async () => {
    featureFlagService.setFlag('comments_enabled', false);

    const res = await request(app)
      .post('/api/articles/1/comments')
      .set('X-User-Id', 'user_test')
      .send({ author: 'Tester', content: 'Comentario bloqueado' });

    assert.equal(res.status, 403);
    assert.match(res.body.error, /comments_enabled/);
  });

  await t.test('Ticket 1 & 3: POST /api/articles/1/comments debe crear comentario exitosamente con flags ON', async () => {
    const res = await request(app)
      .post('/api/articles/1/comments')
      .set('X-User-Id', 'user_test')
      .send({ author: 'Pedro Paramó', content: 'Comentario de prueba CI/CD' });

    assert.equal(res.status, 201);
    assert.equal(res.body.comment.author, 'Pedro Paramó');
    assert.equal(res.body.comment.content, 'Comentario de prueba CI/CD');
    assert.equal(res.body.comment.parent_id, null);
  });

  await t.test('Ticket 2: GET /api/articles/1/comments retorna lista de comentarios en estructura de árbol', async () => {
    const res = await request(app)
      .get('/api/articles/1/comments')
      .set('X-User-Id', 'user_test');

    assert.equal(res.status, 200);
    assert.equal(res.body.article_id, 1);
    assert.ok(Array.isArray(res.body.comments));
    assert.ok(res.body.comments.length > 0);
    // Verificar propiedad replies en comentarios raíz
    assert.ok(Array.isArray(res.body.comments[0].replies));
  });

  await t.test('Ticket 3: POST con parent_id crea respuesta anidada correctamente', async () => {
    const res = await request(app)
      .post('/api/articles/1/comments')
      .set('X-User-Id', 'user_test')
      .send({ author: 'Respondedor', content: 'Respuesta al primer comentario', parent_id: 1 });

    assert.equal(res.status, 201);
    assert.equal(res.body.comment.parent_id, 1);
  });

  await t.test('POST con parent_id inexistente debe retornar 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/articles/1/comments')
      .set('X-User-Id', 'user_test')
      .send({ author: 'BadUser', content: 'Respuesta huérfana', parent_id: 99999 });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /padre #99999 no existe/);
  });
});
