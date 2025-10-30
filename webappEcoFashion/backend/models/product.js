// backend/models/product.js
const { getPool, sql } = require('../config/database');

class Product {
    static async getMarketplaceProducts() {
        const pool = getPool();
        const result = await pool.request().query(`
    SELECT 
      p.id_producto, p.nombre_producto, p.descripcion, p.precio, p.imagen_url,
      p.estado_producto, p.valoracion_promedio, p.total_resenas, p.fecha_publicacion,
      c.nombre_categoria AS categoria,
      t.nombre_talla AS talla,
      u.nombre_completo AS nombre_vendedor, u.provincia AS departamento, u.distrito,
      p.tarifa_envio_vendedor, p.peso_aproximado_kg, p.dimensiones, p.notas_envio
    FROM [dbo].[Productos] p
    INNER JOIN [dbo].[Categorias] c ON p.id_categoria = c.id_categoria
    INNER JOIN [dbo].[Usuarios] u ON p.id_vendedor = u.id_usuario
    LEFT JOIN [dbo].[Tallas] t ON p.id_talla = t.id_talla
    WHERE p.estado_producto = 'Disponible' AND u.activo = 1
    ORDER BY p.fecha_publicacion DESC
  `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
        SELECT 
    p.id_producto, p.nombre_producto, p.descripcion, p.precio, p.imagen_url,
    p.estado_producto, p.valoracion_promedio, p.total_resenas, p.fecha_publicacion,
    c.nombre_categoria AS categoria,
    t.nombre_talla AS talla,
    u.nombre_completo AS nombre_vendedor, u.provincia AS departamento, u.distrito,
    p.tarifa_envio_vendedor, p.peso_aproximado_kg, p.dimensiones, p.notas_envio
  FROM [dbo].[Productos] p
  INNER JOIN [dbo].[Categorias] c ON p.id_categoria = c.id_categoria
  INNER JOIN [dbo].[Usuarios] u ON p.id_vendedor = u.id_usuario
  LEFT JOIN [dbo].[Tallas] t ON p.id_talla = t.id_talla
  WHERE p.estado_producto = 'Disponible' AND u.activo = 1
  ORDER BY p.fecha_publicacion DESC
      `);
        return result.recordset[0] || null;
    }

    static async getById(id) {
        const pool = getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
      SELECT 
        p.id_producto, p.nombre_producto, p.descripcion, p.precio, p.imagen_url,
        p.estado_producto, p.valoracion_promedio, p.total_resenas, p.fecha_publicacion,
        c.nombre_categoria AS categoria,
        t.nombre_talla AS talla,
        u.nombre_completo AS nombre_vendedor, u.provincia AS departamento, u.distrito,
        p.tarifa_envio_vendedor, p.peso_aproximado_kg, p.dimensiones, p.notas_envio
      FROM [dbo].[Productos] p
      INNER JOIN [dbo].[Categorias] c ON p.id_categoria = c.id_categoria
      INNER JOIN [dbo].[Usuarios] u ON p.id_vendedor = u.id_usuario
      LEFT JOIN [dbo].[Tallas] t ON p.id_talla = t.id_talla
      WHERE p.id_producto = @id AND p.estado_producto = 'Disponible' AND u.activo = 1
    `);

        return result.recordset[0] || null;
    }
}


module.exports = Product;
