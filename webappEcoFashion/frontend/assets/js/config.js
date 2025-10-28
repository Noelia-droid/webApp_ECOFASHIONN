// frontend/js/config.js

// ===================================================================
// CONFIGURACIÓN DE API
// ===================================================================

const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

const API_URL = isLocalhost 
    ? 'http://localhost:3001'
    : window.location.origin;

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

window.API_URL = API_URL;
window.fetchAPI = fetchAPI;
