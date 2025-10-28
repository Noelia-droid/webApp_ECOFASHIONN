const { connectDB } = require('../config/database');

exports.obtenerCategorias = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT id_categoria, nombre_categoria, descripcion, comision_producto, comision_envio
      FROM Categorias
      ORDER BY nombre_categoria ASC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({
      error: 'Error al obtener categorías',
      detalles: error.message
    });
  }
};

module.exports = {
  obtenerCategorias
}