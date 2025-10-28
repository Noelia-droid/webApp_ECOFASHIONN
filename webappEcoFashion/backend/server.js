// backend/server.js
require('dotenv').config();

const express = require('express');
const http = require('http'); // ✅ Para Socket.IO
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const { passport } = require('./config/passport');
const helmetConfig = require('./config/security');
const { initializeSocket } = require('./socket'); // ✅ Socket.IO
const authController = require('./controllers/authController');

const { encodeUserId, decodeUserId } = require('./config/hashids'); // ✅ Modularizado

const departmentsRoutes = require('./routes/departments');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const sizesRoutes = require('./routes/sizes');
const ordersRoutes = require('./routes/orders');

const app = express();
const server = http.createServer(app); // ✅ Servidor HTTP compatible con Socket.IO

// ✅ Inicializar Socket.IO y exponerlo a los controladores
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3001', // Ajusta si usas otro puerto o dominio
        methods: ['GET', 'POST']
    }
});
app.set('io', io); // ✅ Disponible como req.app.get('io')

//---------------BD!--------------------
const { connectDB } = require('./config/database');

connectDB();
//------------------------

// ===================================================================
// 🔐 Seguridad
// ===================================================================
app.use(helmetConfig);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de login. Intenta en 15 minutos.'
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Demasiados registros. Intenta más tarde.'
});

// ===================================================================
// ⚙️ Middleware general
// ===================================================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'secreto-por-defecto',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../frontend')));

// ===================================================================
// 📦 Rutas API
// ===================================================================

// Rutas de pedidos
app.use('/api/orders', ordersRoutes);

// Archivos estáticos (imágenes, íconos, etc.)
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// Rutas de categorías 
app.use('/api/categories', categoriesRoutes);

// Rutas de productos 
app.use('/api/products', productsRoutes);

// Rutas de tallas
app.use('/api/sizes', sizesRoutes);

// Rutas de tallas
app.use('/api/departments', departmentsRoutes);

// ===================================================================
// 🧭 Rutas de páginas públicas
// ===================================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
});

app.get('/marketplace', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/marketplace.html'));
});
// ===================================================================
// 🔐 Middleware de protección para rutas privadas
// ===================================================================
const requireAuth = (req, res, next) => {
    if (!req.session.user && !req.user) {
        return res.redirect('/login');
    }
    next();
};

// ✅ Dashboard privado del usuario (carrito, etc.)
app.get('/pages/dashboard_USER(CARRITO).html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard_USER(CARRITO).html'));
});

// ===================================================================
// 🔑 Rutas de Autenticación
// ===================================================================
app.post('/api/login', loginLimiter, authController.login);
app.post('/api/register', registerLimiter, authController.register);
app.get('/auth/user', authController.getCurrentUser);
app.post('/auth/logout', authController.logout);

// ===================================================================
// 🔐 Autenticación con Google OAuth
// ===================================================================
app.get('/auth/google', loginLimiter,
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
    async (req, res) => {
        req.session.user = {
            id: req.user.id,
            nombre: req.user.nombre,
            email: req.user.email,
            rol: req.user.rol
        };

        // ✅ Emitir evento de login por Google
        const io = req.app.get('io');
        io.emit('usuario:login', {
            nombre: req.user.nombre,
            email: req.user.email
        });

        console.log('✅ Usuario autenticado con Google:', req.user.email);
        res.redirect('/pages/dashboard_USER(CARRITO).html');
    }
);

// ===================================================================
// 👤 Ruta de usuario por ID hasheado
// ===================================================================
app.get('/api/user/:hashedId', requireAuth, async (req, res) => {
    try {
        const userId = decodeUserId(req.params.hashedId);
        const User = require('./models/user');
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            id: encodeUserId(user.id),
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            picture: user.picture
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ===================================================================
// 🚀 Iniciar servidor con Socket.IO
// ===================================================================
const PORT = process.env.PORT || 3001;

connectDB().then(() => {
    initializeSocket(server); // ✅ Activar lógica de eventos Socket.IO

    server.listen(PORT, () => {
        console.log(`================================================`);
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        console.log('🔐 Seguridad:');
        console.log('   ✅ Helmet configurado');
        console.log('   ✅ Argon2 para passwords');
        console.log('   ✅ Hashids para URLs');
        console.log('   ✅ Rate limiting activo');
        console.log('🔐 Google OAuth: Configurado');
        console.log('💾 Base de datos: SQL Server conectada');
        console.log('🔌 Socket.IO: Activo');
        console.log('================================\n');
    });
}).catch(err => {
    console.error('❌ No se pudo iniciar el servidor:', err);
    process.exit(1);
});