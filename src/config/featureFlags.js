const dotenv = require('dotenv');
dotenv.config();

// Configuración por defecto de Feature Flags
// Permite modificar valores mediante variables de entorno o parámetros dinámicos
const defaultFlags = {
  // Ticket 1: Backend POST /articles/:id/comments (true/false)
  comments_enabled: process.env.FEATURE_COMMENTS_ENABLED === 'true' || false,
  
  // Ticket 2: Mostrar comentarios existentes (Solo Lectura) - Rollout Porcentaje (ej: 10)
  comments_visible_percentage: parseInt(process.env.FEATURE_COMMENTS_VISIBLE_ROLLOUT || '10', 10),
  
  // Ticket 3: Formulario interactivo y Respuestas Anidadas - Rollout Porcentaje (ej: 100)
  comments_interactive_percentage: parseInt(process.env.FEATURE_COMMENTS_INTERACTIVE_ROLLOUT || '100', 10)
};

/**
 * Función simple para determinar si un usuario o IP entra en el porcentaje de rollout.
 * Utiliza un algoritmo determinista (hash de string -> 0..99).
 */
function getDeterministicHash(identifier) {
  if (!identifier) return 0;
  let hash = 0;
  const str = String(identifier);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % 100;
}

class FeatureFlagService {
  constructor(flags = defaultFlags) {
    this.flags = { ...flags };
  }

  // Permite actualizar flags dinámicamente (útil para pruebas y demo de toggles)
  setFlag(flagName, value) {
    this.flags[flagName] = value;
  }

  getFlags() {
    return { ...this.flags };
  }

  /**
   * Evalúa si la creación de comentarios está habilitada (Ticket 1)
   */
  isCommentsEnabled() {
    return Boolean(this.flags.comments_enabled);
  }

  /**
   * Evalúa si la lectura de comentarios está visible para un usuario/IP dado (Ticket 2)
   */
  isCommentsVisible(userIdOrIp = 'anonymous') {
    if (this.flags.comments_visible_percentage >= 100) return true;
    if (this.flags.comments_visible_percentage <= 0) return false;
    const userHash = getDeterministicHash(userIdOrIp);
    return userHash < this.flags.comments_visible_percentage;
  }

  /**
   * Evalúa si el formulario interactivo y respuestas anidadas están habilitados (Ticket 3)
   */
  isCommentsInteractive(userIdOrIp = 'anonymous') {
    if (!this.isCommentsEnabled()) return false;
    if (this.flags.comments_interactive_percentage >= 100) return true;
    if (this.flags.comments_interactive_percentage <= 0) return false;
    const userHash = getDeterministicHash(userIdOrIp);
    return userHash < this.flags.comments_interactive_percentage;
  }

  /**
   * Retorna el estado completo de flags evaluados para una sesión/usuario
   */
  evaluateForUser(userIdOrIp = 'anonymous') {
    return {
      comments_enabled: this.isCommentsEnabled(),
      comments_visible: this.isCommentsVisible(userIdOrIp),
      comments_interactive: this.isCommentsInteractive(userIdOrIp),
      raw_flags: this.flags
    };
  }
}

const instance = new FeatureFlagService();

module.exports = {
  featureFlagService: instance,
  FeatureFlagService
};
