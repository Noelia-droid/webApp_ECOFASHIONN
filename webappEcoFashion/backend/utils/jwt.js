const jwt = require('jsonwebtoken');

/**
 * Generar token JWT
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

/**
 * Verificar token JWT
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};