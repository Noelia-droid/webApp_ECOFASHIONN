const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        p.id_producto,
        p.nombre_producto,
        p.precio,
        p.descuento,
        p.talla,
        p.imagen_url,
        c.nombre_categoria AS categoria,
        d.provincia AS departamento,
        v.nombre_vendedor
      FROM Producto p
      LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN Departamento d ON p.id_departamento = d.id_departamento
      LEFT JOIN Vendedor v ON p.id_vendedor = v.id_vendedor
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

module.exports = router;
