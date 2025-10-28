const { connectDB, sql } = require('../config/database');

// ========================================
// OBTENER TODOS LOS PRODUCTOS PARA MARKETPLACE
// ========================================
const obtenerProductosMarketplace = async (req, res) => {
  try {
    const pool = await connectDB();

    const query = `
      SELECT 
        p.id_producto,
        p.nombre_producto,
        p.descripcion,
        p.precio,
        p.imagen_url,
        p.estado_producto,
        p.valoracion_promedio,
        p.total_resenas,
        p.fecha_publicacion,
        c.nombre_categoria AS categoria,
        t.nombre_talla AS talla,
        u.nombre_completo AS nombre_vendedor,
        u.provincia AS departamento,
        u.distrito,
        p.tarifa_envio_vendedor,
        p.peso_aproximado_kg,
        p.dimensiones,
        p.notas_envio
      FROM [dbo].[Productos] p
      INNER JOIN [dbo].[Categorias] c ON p.id_categoria = c.id_categoria
      INNER JOIN [dbo].[Usuarios] u ON p.id_vendedor = u.id_usuario
      LEFT JOIN [dbo].[Tallas] t ON p.id_talla = t.id_talla
      WHERE p.estado_producto = 'Disponible' AND u.activo = 1
      ORDER BY p.fecha_publicacion DESC
    `;

    const result = await pool.request().query(query);

    const productos = result.recordset.map(producto => ({
      id_producto: producto.id_producto,
      nombre_producto: producto.nombre_producto,
      descripcion: producto.descripcion,
      precio: parseFloat(producto.precio),
      imagen_url: producto.imagen_url,
      estado_producto: producto.estado_producto,
      valoracion_promedio: producto.valoracion_promedio ? parseFloat(producto.valoracion_promedio) : 0,
      total_resenas: producto.total_resenas,
      categoria: producto.categoria,
      talla: producto.talla || 'N/A',
      nombre_vendedor: producto.nombre_vendedor,
      departamento: producto.departamento,
      distrito: producto.distrito,
      tarifa_envio_vendedor: parseFloat(producto.tarifa_envio_vendedor),
      peso_aproximado_kg: producto.peso_aproximado_kg ? parseFloat(producto.peso_aproximado_kg) : null,
      dimensiones: producto.dimensiones,
      notas_envio: producto.notas_envio,
      fecha_publicacion: producto.fecha_publicacion
    }));

    res.json(productos);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({
      error: 'Error al obtener productos',
      detalles: error.message
    });
  }
};

// ========================================
// BUSCAR PRODUCTOS CON FILTROS
// ========================================
const buscarProductos = async (req, res) => {
  try {
    const {
      busqueda,
      categoria,
      talla,
      precio_min,
      precio_max,
      departamento
    } = req.query;

    let query = `
      SELECT 
        p.id_producto,
        p.nombre_producto,
        p.descripcion,
        p.precio,
        p.imagen_url,
        p.estado_producto,
        p.valoracion_promedio,
        p.total_resenas,
        c.nombre_categoria AS categoria,
        t.nombre_talla AS talla,
        u.nombre_completo AS nombre_vendedor,
        u.provincia AS departamento,
        u.distrito
      FROM [dbo].[Productos] p
      INNER JOIN [dbo].[Categorias] c ON p.id_categoria = c.id_categoria
      INNER JOIN [dbo].[Usuarios] u ON p.id_vendedor = u.id_usuario
      LEFT JOIN [dbo].[Tallas] t ON p.id_talla = t.id_talla
      WHERE p.estado_producto = 'Disponible' AND u.activo = 1
    `;

    const pool = await connectDB();
    const request = pool.request();

    if (busqueda) {
      query += ` AND (p.nombre_producto LIKE @busqueda OR p.descripcion LIKE @busqueda)`;
      request.input('busqueda', sql.NVarChar, `%${busqueda}%`);
    }

    if (categoria) {
      query += ` AND c.nombre_categoria = @categoria`;
      request.input('categoria', sql.NVarChar, categoria);
    }

    if (talla) {
      query += ` AND t.nombre_talla = @talla`;
      request.input('talla', sql.NVarChar, talla);
    }

    if (precio_min) {
      query += ` AND p.precio >= @precio_min`;
      request.input('precio_min', sql.Decimal(10, 2), precio_min);
    }

    if (precio_max) {
      query += ` AND p.precio <= @precio_max`;
      request.input('precio_max', sql.Decimal(10, 2), precio_max);
    }

    if (departamento) {
      query += ` AND u.provincia = @departamento`;
      request.input('departamento', sql.NVarChar, departamento);
    }

    query += ` ORDER BY p.fecha_publicacion DESC`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error al buscar productos:', error);
    res.status(500).json({
      error: 'Error al buscar productos',
      detalles: error.message
    });
  }
};

module.exports = {
  obtenerProductosMarketplace,
  buscarProductos
};
