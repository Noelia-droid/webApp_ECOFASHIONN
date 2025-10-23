const argon2 = require('argon2');

/**
 * Hashear contraseña con Argon2
 */
exports.hashPassword = async (password) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,  // 64 MB
      timeCost: 3,
      parallelism: 1
    });
    return hash;
  } catch (error) {
    throw new Error('Error al hashear contraseña');
  }
};

/**
 * Verificar contraseña
 */
exports.verifyPassword = async (hash, password) => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    throw new Error('Error al verificar contraseña');
  }
};