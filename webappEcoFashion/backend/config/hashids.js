// backend/config/hashids.js
const Hashids = require('hashids/cjs');

// 🔒 Usar un salt único y secreto
const hashids = new Hashids(
    process.env.HASHID_SALT || 'mi-salt-super-secreto-cambialo-en-produccion',
    10, // Longitud mínima del hash
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
);

/**
 * 🔒 Codificar ID numérico a string hasheado
 * @param {number} id - ID numérico de la base de datos
 * @returns {string} - ID hasheado (ej: "aBc123XyZ0")
 */
const encodeUserId = (id) => {
    if (!id || typeof id !== 'number') {
        throw new Error('ID debe ser un número válido');
    }
    return hashids.encode(id);
};

/**
 * 🔓 Decodificar string hasheado a ID numérico
 * @param {string} hash - ID hasheado
 * @returns {number|null} - ID numérico original o null si es inválido
 */
const decodeUserId = (hash) => {
    if (!hash || typeof hash !== 'string') {
        return null;
    }
    const decoded = hashids.decode(hash);
    return decoded[0] || null;
};

module.exports = {
    encodeUserId,
    decodeUserId,
    hashids
};