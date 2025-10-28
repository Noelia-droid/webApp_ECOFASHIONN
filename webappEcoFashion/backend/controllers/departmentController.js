const { connectDB } = require('../config/database');

exports.obtenerDepartamentos = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT DISTINCT provincia AS departamento
      FROM Usuarios
      WHERE provincia IS NOT NULL AND provincia != ''
      ORDER BY provincia ASC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error al obtener departamentos:', error);
    res.status(500).json({
      error: 'Error al obtener departamentos',
      detalles: error.message
    });
  }
};

module.exports = {
  obtenerDepartamentos
}