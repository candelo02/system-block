const test = require('node:test');
const assert = require('node:assert/strict');
const { FeatureFlagService } = require('../src/config/featureFlags');

test('FeatureFlagService - Evaluaciones de Ticket 1, 2 y 3', async (t) => {
  await t.test('Ticket 1: comments_enabled deshabilitado por defecto', () => {
    const ff = new FeatureFlagService({ comments_enabled: false, comments_visible_percentage: 10, comments_interactive_percentage: 100 });
    assert.equal(ff.isCommentsEnabled(), false);
  });

  await t.test('Ticket 1: comments_enabled habilitado explícitamente', () => {
    const ff = new FeatureFlagService({ comments_enabled: true, comments_visible_percentage: 10, comments_interactive_percentage: 100 });
    assert.equal(ff.isCommentsEnabled(), true);
  });

  await t.test('Ticket 2: Rollout de visibilidad al 100% permite ver comentarios a cualquier usuario', () => {
    const ff = new FeatureFlagService({ comments_enabled: true, comments_visible_percentage: 100, comments_interactive_percentage: 100 });
    assert.equal(ff.isCommentsVisible('user_123'), true);
    assert.equal(ff.isCommentsVisible('user_456'), true);
  });

  await t.test('Ticket 2: Rollout de visibilidad al 0% bloquea visibilidad a cualquier usuario', () => {
    const ff = new FeatureFlagService({ comments_enabled: true, comments_visible_percentage: 0, comments_interactive_percentage: 100 });
    assert.equal(ff.isCommentsVisible('user_123'), false);
  });

  await t.test('Ticket 3: Si comments_enabled es false, mode interactivo retorna false', () => {
    const ff = new FeatureFlagService({ comments_enabled: false, comments_visible_percentage: 100, comments_interactive_percentage: 100 });
    assert.equal(ff.isCommentsInteractive('user_123'), false);
  });
});
