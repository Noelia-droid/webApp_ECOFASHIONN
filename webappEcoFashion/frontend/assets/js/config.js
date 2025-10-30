//config.js sirve para centralizar la configuración globald e proyecto, especialmente para entornos 
//locales vs para producción.
//1. DENIFE LA API_URL dinámicamente: Esto permite que tu frontend sepa a qué backend conectarse, dependiendo de si estás en desarrollo (localhost) o en producción (dominio real). Así no se tiene que cambiar manualmente URLs en cada archivo.
//2. CENTRALIZA FUNCIONES DE RED (fetchAPI): Esta función permite hacer peticiones fetch con configuración estándar sin repetir códifo en ese módulo
//3. DEFINE FUNCIONES DE AUTENTICACIÓN: Esto da un toque global Auth para poder usar en cualquier parte del frontend para poder manejar el registro, login y logout de forma consistente
// ===================================================================
// CONFIGURACIÓN DE API
// ===================================================================

const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

// ===================================================================
// UTILIDADES DE FETCH
// ===================================================================

async function fetchAPI(endpoint, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Error ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Error en API:', error);
        throw error;
    }
}

// ===================================================================
// OBJETO DE AUTENTICACIÓN
// ===================================================================

window.Auth = {
    // Registro tradicional
    async register(nombre, email, password) {
        return await fetchAPI('/api/register', {
            method: 'POST',
            body: JSON.stringify({ nombre, email, password })
        });
    },

    // Login tradicional (email/password)
    async login(email, password) {
        return await fetchAPI('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    // Cerrar sesión
    async logout() {
        try {
            await fetchAPI('/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
};

// ===================================================================
// EXPORTAR GLOBALES
// ===================================================================

// frontend/js/config.js
window.API_URL = window.API_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : window.location.origin);
