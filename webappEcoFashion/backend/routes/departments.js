const express = require('express');
const router = express.Router();
const db = require('../config/database');

// API Obtener departamentos únicos
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request().query(`
      SELECT DISTINCT provincia AS departamento
      FROM [dbo].[Usuarios]
      WHERE provincia IS NOT NULL
      ORDER BY provincia
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ error: 'Error al obtener departamentos', detalles: error.message });
  }
});

module.exports = router;
