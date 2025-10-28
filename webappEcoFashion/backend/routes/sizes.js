const express = require('express');
const router = express.Router();
const db = require('../config/database');

//API Obtener todas las tallas
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request().query(`
      SELECT id_talla, nombre_talla, orden
      FROM [dbo].[Tallas]
      ORDER BY orden
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener tallas:', error);
    res.status(500).json({ error: 'Error al obtener tallas', detalles: error.message });
  }
});

module.exports = router;
