// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { passport } = require('../config/passport');
const { hashPassword, validatePasswordStrength } = require('../utils/argon2');

//-------------------------------------------
//GOOGLE OAUTH
//-------------------------------------------
// Ruta para iniciar autenticación con Google
router.get('/auth/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

// Ruta de callback de Google
router.get('/auth/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/login.html',
        session: true
    }),
    (req, res) => {
        console.log('✅ Login exitoso con Google:', req.user.email);
        // Autenticación exitosa
        res.redirect('/dashboard_USER.html');
    }
);

// Ruta para logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.redirect('/login.html');
    });
});

// Ruta para verificar sesión
router.get('/check-session', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ 
            authenticated: true, 
            user: req.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});

//-------------------------------------------
// Ruta para registro con correo y contraseña
//-------------------------------------------
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Validar fortaleza de contraseña
    const { isValid, errors } = validatePasswordStrength(password);
    if (!isValid) {
        return res.status(400).json({ errors });
    }

    // Verificar si el usuario ya existe (esto es un ejemplo en memoria)
    const { users } = require('../config/passport');
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hashear contraseña y guardar usuario
    try {
        const hashedPassword = await hashPassword(password);
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            name: null,
            googleId: null,
            picture: null,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        console.log('✅ Usuario registrado con contraseña:', newUser.email);
        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


module.exports = router;