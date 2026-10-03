const express = require('express');
const router = express.Router();
const { featureFlagService } = require('../config/featureFlags');

// GET /api/feature-flags (Consulta estado actual de flags)
router.get('/feature-flags', (req, res) => {
  const userIdentifier = req.headers['x-user-id'] || req.ip || 'anonymous';
  const evaluation = featureFlagService.evaluateForUser(userIdentifier);
  res.json(evaluation);
});

// POST /api/feature-flags (Permite cambiar un flag en runtime para demos/pruebas del Taller 5)
router.post('/feature-flags', (req, res) => {
  const { flag, value } = req.body;
  if (!flag) {
    return res.status(400).json({ error: 'Nombre de flag requerido' });
  }

  featureFlagService.setFlag(flag, value);
  res.json({
    message: `Feature flag '${flag}' actualizado a ${value}`,
    flags: featureFlagService.getFlags()
  });
});

module.exports = router;
