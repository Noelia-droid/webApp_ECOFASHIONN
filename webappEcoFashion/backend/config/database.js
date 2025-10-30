// backend/config/database.js
const sql = require('mssql');

// Configuración para instancia con nombre
const config = {
    server: process.env.DB_SERVER, // DESKTOP-3O7CEG2\MSSQLSERVER01
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true, 
        trustServerCertificate: true, // IMPORTANTE para instancias locales
        enableArithAbort: true,
        connectTimeout: 30000, // 30 segundos
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

console.log('🔧 Configuración de BD:', {
    server: config.server,
    database: config.database,
    user: config.user,
    port: config.port
});

let pool = null;

const connectDB = async () => {
    try {
        if (!pool) {
            console.log('🔌 Intentando conectar a SQL Server...');
            pool = await sql.connect(config);
            console.log('Conectado a SQL Server:', process.env.DB_DATABASE);
            
            // Test de conexión
            const result = await pool.request().query('SELECT @@VERSION AS version');
            console.log('Versión de SQL Server:', result.recordset[0].version.split('\n')[0]);
        }
        return pool;
    } catch (err) {
        console.error('Error conectando a SQL Server:', err.message);
        console.error('Detalles:', {
            code: err.code,
            server: config.server,
            database: config.database
        });
        throw err;
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Base de datos no inicializada. Llama a connectDB() primero.');
    }
    return pool;
};

// Cerrar conexión
const closeDB = async () => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Conexión a BD cerrada');
        }
    } catch (err) {
        console.error('Error cerrando conexión:', err);
    }
};

module.exports = { connectDB, getPool, closeDB, sql };