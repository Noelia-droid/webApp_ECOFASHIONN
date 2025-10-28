const express = require('express');
const router = express.Router();
const db = require('../config/database');

// API Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool(); 
    const result = await pool.request().query(`
      SELECT id_categoria, nombre_categoria, descripcion, comision_producto, comision_envio
      FROM [dbo].[Categorias]
      ORDER BY nombre_categoria
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías', detalles: error.message });
  }
});

module.exports = router;
