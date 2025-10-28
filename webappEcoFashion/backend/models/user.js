// backend/models/User.js
const { getPool, sql } = require('../config/database');
const { hashPassword, verifyPassword } = require('../utils/argon2');

class User {
    // Buscar usuario por email
    static async findByEmail(email) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('email', sql.NVarChar, email)
                .query('SELECT * FROM usuarios WHERE email = @email');
            
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Error en findByEmail:', error);
            throw error;
        }
    }

    // Buscar usuario por ID
    static async findById(id) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM usuarios WHERE id = @id');
            
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }

    // Crear nuevo usuario (registro tradicional)
    static async create({ nombre, email, password, rol = 'USER' }) {
        try {
            const hashedPassword = await hashPassword(password);
            const pool = getPool();
            
            const result = await pool.request()
                .input('nombre', sql.NVarChar, nombre)
                .input('email', sql.NVarChar, email)
                .input('password', sql.NVarChar, hashedPassword)
                .input('rol', sql.NVarChar, rol)
                .query(`
                    INSERT INTO usuarios (nombre, email, password, rol, provider, created_at)
                    OUTPUT INSERTED.*
                    VALUES (@nombre, @email, @password, @rol, 'local', GETDATE())
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }

    // Crear usuario desde Google OAuth
    static async createFromGoogle({ googleId, nombre, email, picture }) {
        try {
            const pool = getPool();
            
            const result = await pool.request()
                .input('googleId', sql.NVarChar, googleId)
                .input('nombre', sql.NVarChar, nombre)
                .input('email', sql.NVarChar, email)
                .input('picture', sql.NVarChar, picture)
                .query(`
                    INSERT INTO usuarios (nombre, email, provider, google_id, picture, created_at)
                    OUTPUT INSERTED.*
                    VALUES (@nombre, @email, 'google', @googleId, @picture, GETDATE())
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error en createFromGoogle:', error);
            throw error;
        }
    }

    // Buscar usuario por Google ID
    static async findByGoogleId(googleId) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('googleId', sql.NVarChar, googleId)
                .query('SELECT * FROM usuarios WHERE google_id = @googleId');
            
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Error en findByGoogleId:', error);
            throw error;
        }
    }

    // Vincular cuenta existente con Google
    static async linkGoogleAccount(userId, googleId, picture) {
        try {
            const pool = getPool();
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('googleId', sql.NVarChar, googleId)
                .input('picture', sql.NVarChar, picture)
                .query(`
                    UPDATE usuarios 
                    SET google_id = @googleId, 
                        picture = @picture,
                        updated_at = GETDATE()
                    WHERE id = @userId
                `);
            return true;
        } catch (error) {
            console.error('Error en linkGoogleAccount:', error);
            throw error;
        }
    }

    // Verificar contraseña
    static async verifyPassword(plainPassword, hashedPassword) {
        return await verifyPassword(plainPassword, hashedPassword);
    }

    // Obtener estadísticas de usuario (para Socket.IO)
    static async getUserStats(userId) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT 
                        COUNT(*) as total_orders,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                        SUM(total) as total_spent
                    FROM pedidos 
                    WHERE user_id = @userId
                `);
            
            return result.recordset[0] || { total_orders: 0, completed_orders: 0, total_spent: 0 };
        } catch (error) {
            console.error('Error en getUserStats:', error);
            throw error;
        }
    }

    // Obtener todos los usuarios activos (para notificaciones)
    static async getActiveUsers() {
        try {
            const pool = getPool();
            const result = await pool.request()
                .query('SELECT id, nombre, email, rol FROM usuarios WHERE active = 1');
            
            return result.recordset;
        } catch (error) {
            console.error('Error en getActiveUsers:', error);
            throw error;
        }
    }
}

module.exports = User;