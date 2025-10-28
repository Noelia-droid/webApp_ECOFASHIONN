// backend/middleware/auth.js

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login.html');
}

// Middleware para verificar rol de usuario
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: 'Acceso denegado' });
}

// Middleware para verificar rol de artista
function isArtist(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'artist') {
        return next();
    }
    res.status(403).json({ error: 'Acceso denegado' });
}

module.exports = { isAuthenticated, isAdmin, isArtist };