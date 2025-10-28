// backend/utils/passwordUtils.js

const argon2 = require('argon2');

/**
 * ARGON2 - Hashing de contraseñas
 * 
 * ¿Por qué Argon2?
 * - Ganador del Password Hashing Competition 2015
 * - Más seguro que bcrypt
 * - Salt automático integrado
 * - Resistente a ataques GPU/ASIC
 */

// ===================================================================
// HASHEAR CONTRASEÑA (al registrarse o cambiar contraseña)
// ===================================================================

async function hashPassword(plainPassword) {
    try {
        // Argon2 genera automáticamente un salt único
        const hashedPassword = await argon2.hash(plainPassword, {
            type: argon2.argon2id,        // Variante más segura (híbrida)
            memoryCost: 65536,            // 64 MB de memoria (más seguro)
            timeCost: 3,                  // Iteraciones (3 es balance seguridad/velocidad)
            parallelism: 4                // Hilos paralelos
        });

        console.log('✅ Contraseña hasheada correctamente');
        return hashedPassword;
    } catch (error) {
        console.error('❌ Error al hashear contraseña:', error);
        throw new Error('Error al procesar la contraseña');
    }
}

// ===================================================================
// VERIFICAR CONTRASEÑA (al hacer login)
// ===================================================================

async function verifyPassword(plainPassword, hashedPassword) {
    try {
        // Argon2 compara automáticamente con el salt guardado
        const isValid = await argon2.verify(hashedPassword, plainPassword);
        
        if (isValid) {
            console.log('✅ Contraseña correcta');
            
            // Opcional: Rehashear si los parámetros cambiaron
            if (argon2.needsRehash(hashedPassword)) {
                console.log('⚠️ Hash antiguo detectado, considerar rehashear');
            }
        } else {
            console.log('❌ Contraseña incorrecta');
        }
        
        return isValid;
    } catch (error) {
        console.error('❌ Error al verificar contraseña:', error);
        return false;
    }
}

// ===================================================================
// VALIDAR FORTALEZA DE CONTRASEÑA
// ===================================================================

function validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push('Debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Debe tener al menos una mayúscula');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Debe tener al menos una minúscula');
    }

    if (!/\d/.test(password)) {
        errors.push('Debe tener al menos un número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Debe tener al menos un carácter especial');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// ===================================================================
// EJEMPLO DE USO
// ===================================================================

/*
// REGISTRO:
const hashedPassword = await hashPassword('MiPassword123!');
// Resultado: $argon2id$v=19$m=65536,t=3,p=4$...

// LOGIN:
const isValid = await verifyPassword('MiPassword123!', hashedPassword);
// Resultado: true o false
*/

module.exports = {
    hashPassword,
    verifyPassword,
    validatePasswordStrength
};