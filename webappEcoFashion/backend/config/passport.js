// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

// Determinar callback URL según entorno
const isProduction = process.env.NODE_ENV === 'production';
const callbackURL = isProduction
    ? `${process.env.BACKEND_URL}/auth/google/callback`
    : 'http://localhost:3001/auth/google/callback';

console.log('🔧 OAuth Callback URL:', callbackURL);
console.log('🔧 Entorno:', process.env.NODE_ENV || 'development');

// ===================================================================
// 🔐 Estrategia de Google OAuth 2.0
// ===================================================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    proxy: true // Importante para producción detrás de un proxy/load balancer
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('📥 Autenticando usuario de Google:', profile.displayName, profile.emails[0].value);
        
        // 1. Buscar usuario por Google ID
        let user = await User.findByGoogleId(profile.id);

        if (user) {
            console.log('👤 Usuario existente encontrado:', user.email);
            return done(null, user);
        }

        // 2. Si no existe, buscar por email (para vincular cuentas)
        user = await User.findByEmail(profile.emails[0].value);

        if (user) {
            // Vincular cuenta existente con Google
            if (!user.google_id) {
                await User.linkGoogleAccount(user.id, profile.id, profile.photos[0]?.value);
                console.log('🔗 Cuenta vinculada con Google:', user.email);
            }
            return done(null, user);
        }

        // 3. Crear nuevo usuario desde Google
        user = await User.createFromGoogle({
            googleId: profile.id,
            nombre: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0]?.value
        });

        console.log('✅ Nuevo usuario creado desde Google:', user.email);
        return done(null, user);

    } catch (error) {
        console.error('❌ Error en autenticación de Google:', error);
        return done(error, null);
    }
}));

// ===================================================================
// 🍪 Serialización de sesión
// ===================================================================
passport.serializeUser((user, done) => {
    console.log('💾 Serializando usuario:', user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            console.log('⚠️ Usuario no encontrado en deserialización:', id);
            return done(null, false);
        }
        console.log('📂 Usuario deserializado:', user.email);
        done(null, user);
    } catch (error) {
        console.error('❌ Error deserializando usuario:', error);
        done(error, null);
    }
});

module.exports = { passport };