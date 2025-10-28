const { connectDB } = require('../config/database');

exports.obtenerTallas = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT id_talla, nombre_talla, orden
      FROM Tallas
      ORDER BY orden ASC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error al obtener tallas:', error);
    res.status(500).json({
      error: 'Error al obtener tallas',
      detalles: error.message
    });
  }
};

module.exports = {
  obtenerTallas
}