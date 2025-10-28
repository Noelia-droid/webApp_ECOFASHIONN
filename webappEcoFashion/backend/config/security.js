// backend/config/security.js

const helmet = require('helmet');

/**
 * HELMET - Configuración de seguridad HTTP headers
 * 
 * ¿Qué hace Helmet?
 * - Previene XSS (Cross-Site Scripting)
 * - Previene Clickjacking
 * - Controla qué recursos puede cargar la página
 * - Oculta información del servidor
 */

// ===================================================================
// CONFIGURACIÓN PARA DESARROLLO
// ===================================================================

const helmetConfigDev = helmet({
    // Content Security Policy - Controla qué recursos puede cargar la página
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'",                          // Permite scripts inline (necesario en desarrollo)
                "https://accounts.google.com",              // Google OAuth
                "https://cdnjs.cloudflare.com",              // CDNs permitidas
                "https://unpkg.com",
                "https://cdn.jsdelivr.net", // AXIOUS permitido
                "https://cdn.socket.io"// socket.io permitido
            ], 
            styleSrc: [
                "'self'", 
                "'unsafe-inline'",                          // Permite estilos inline
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: [
                "'self'", 
                "data:", 
                "https:",                                   // Permite imágenes de cualquier HTTPS
                "https://*.googleusercontent.com"           // Fotos de perfil de Google
            ],
            connectSrc: [
                "'self'",
                "https://accounts.google.com",
                "https://unpkg.com",
                "https://cdn.jsdelivr.net"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            frameSrc: [
                "https://accounts.google.com"               // Para Google OAuth
            ]
        }
    },

    // X-Frame-Options - Previene Clickjacking
    frameguard: {
        action: 'deny'                                      // No permitir que la página se muestre en iframes
    },

    // X-Content-Type-Options - Previene MIME sniffing
    noSniff: true,

    // X-XSS-Protection - Protección contra XSS en navegadores antiguos
    xssFilter: true,

    // Referrer-Policy - Controla información del referrer
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },

    // HSTS - Forzar HTTPS (desactivado en desarrollo)
    hsts: false,

    // Ocultar header X-Powered-By
    hidePoweredBy: true
});

// ===================================================================
// CONFIGURACIÓN PARA PRODUCCIÓN
// ===================================================================

const helmetConfigProd = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://accounts.google.com",
                "https://cdnjs.cloudflare.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",                          // Considera eliminar en producción
                "https://fonts.googleapis.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https://*.googleusercontent.com"
            ],
            connectSrc: [
                "'self'",
                "https://accounts.google.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            frameSrc: [
                "https://accounts.google.com"
            ],
            upgradeInsecureRequests: []                     // Forzar HTTPS en producción
        }
    },
    frameguard: {
        action: 'deny'
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },
    
    // HSTS - Forzar HTTPS (ACTIVADO en producción)
    hsts: {
        maxAge: 31536000,                                   // 1 año
        includeSubDomains: true,
        preload: true
    },
    
    hidePoweredBy: true
});

// ===================================================================
// EXPORTAR SEGÚN ENTORNO
// ===================================================================

const isProduction = process.env.NODE_ENV === 'production';

module.exports = isProduction ? helmetConfigProd : helmetConfigDev;

// ===================================================================
// HEADERS ADICIONALES PERSONALIZADOS (opcional)
// ===================================================================

function additionalSecurityHeaders(req, res, next) {
    // Prevenir que la página sea cargada en iframes de otros dominios
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevenir MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Habilitar filtro XSS del navegador
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Controlar referrer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (antes Feature Policy)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
}

module.exports.additionalSecurityHeaders = additionalSecurityHeaders;