const argon2 = require('argon2');
const { getPool, sql } = require('../config/database');
const { encodeUserId, decodeUserId } = require('../config/hashids');

//==========================================
// 📝 REGISTRO DE USUARIO
//==========================================
exports.register = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email inválido'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 8 caracteres'
    });
  }

  try {
    console.log('📥 Intentando registrar usuario:', email);

    const pool = await getPool();
    console.log('✅ Conexión a SQL Server establecida');

    const checkUser = await pool.request()
      .input('email', sql.VarChar, email.toLowerCase())
      .query('SELECT id_usuario FROM dbo.Usuarios WHERE correo = @email');

    if (checkUser.recordset.length > 0) {
      console.log('⚠️ Email ya registrado:', email);
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4
    });
    console.log('✅ Contraseña hasheada');

    const result = await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('email', sql.VarChar, email.toLowerCase())
      .input('password', sql.NVarChar, hashedPassword)
      .input('rol', sql.VarChar, 'Cliente')
      .query(`
        INSERT INTO dbo.Usuarios (nombre_completo, correo, password_hash, rol, fecha_registro)
        OUTPUT INSERTED.id_usuario, INSERTED.nombre_completo, INSERTED.correo, INSERTED.rol
        VALUES (@nombre, @email, @password, @rol, GETDATE())
      `);

    if (!result.recordset || result.recordset.length === 0) {
      throw new Error('No se pudo obtener el usuario insertado');
    }

    const newUser = result.recordset[0];

    req.session.user = {
      id: encodeUserId(newUser.id_usuario),
      nombre: newUser.nombre_completo,
      email: newUser.correo,
      rol: newUser.rol
    };

    // 🔔 Emitir evento de registro vía Socket.IO
    const io = req.app.get('io');
    io.emit('usuario:registrado', {
      nombre: newUser.nombre_completo,
      email: newUser.correo
    });

    console.log('✅ Usuario registrado:', email, '| ID:', encodeUserId(newUser.id_usuario));

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente',
      user: {
        id: encodeUserId(newUser.id_usuario),
        nombre: newUser.nombre_completo,
        email: newUser.correo,
        rol: newUser.rol
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al crear la cuenta'
    });
  }
};

//==========================================
// 🔐 LOGIN DE USUARIO
//==========================================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña requeridos'
    });
  }

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('email', sql.VarChar, email.toLowerCase())
      .query('SELECT * FROM dbo.Usuarios WHERE correo = @email');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const validPassword = await argon2.verify(user.password_hash, password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    req.session.user = {
      id: encodeUserId(user.id_usuario),
      nombre: user.nombre_completo,
      email: user.correo,
      rol: user.rol
    };

    // 🔔 Emitir evento de login vía Socket.IO
    const io = req.app.get('io');
    io.emit('usuario:login', {
      nombre: user.nombre_completo,
      email: user.correo
    });

    console.log('✅ Login exitoso:', email, '| ID:', encodeUserId(user.id_usuario));

    res.json({
      success: true,
      user: {
        id: encodeUserId(user.id_usuario),
        nombre: user.nombre_completo,
        email: user.correo,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

//==========================================
// 👤 OBTENER USUARIO ACTUAL
//==========================================
exports.getCurrentUser = (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else if (req.user) {
    res.json({
      user: {
        id: encodeUserId(req.user.id_usuario),
        nombre: req.user.nombre_completo,
        email: req.user.correo,
        rol: req.user.rol
      }
    });
  } else {
    res.status(401).json({ error: 'No autenticado' });
  }
};

//==========================================
// 🚪 LOGOUT
//==========================================
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.json({ success: true });
  });
};

//==========================================
// 📦 OBTENER PEDIDOS POR ESTADO
//==========================================
const pedidosHistorial = [
  {
    id: "ORD-2025-001",
    fecha: "15 de Octubre, 2025",
    total: "S/ 50.00",
    estado: "Entregado",
    productos: [
      "Polo rojo suave",
      "Blusa de seda blanca"
    ]
  },
  {
    id: "ORD-2025-002",
    fecha: "20 de Octubre, 2025",
    total: "S/ 20.00",
    estado: "Enviado",
    productos: [
      "Vestido rojo estampado de Minnie",
    ]
  },
  {
    id: "ORD-2025-003",
    fecha: "25 de Octubre, 2025",
    total: "S/ 65.00",
    estado: "Procesando",
    productos: [
      "Pantalón para niños azul jean",
      "Polo de Minnie +",
      "Gorra de Minnie +"
    ]
  }
];

exports.getOrdersByEstado = (req, res) => {
  const estado = req.query.estado;
  console.log('Estado recibido:', estado);

  if (!estado || estado === 'todos') {
    return res.json(pedidosHistorial);
  }

  const equivalencias = {
    entregados: 'Entregado',
    enviados: 'Enviado',
    procesando: 'Procesando',
    cancelados: 'Cancelado'
  };

  const estadoFiltrar = equivalencias[estado.toLowerCase()] || estado;
  const filtrados = pedidosHistorial.filter(p => p.estado === estadoFiltrar);

  res.json(filtrados);
};
