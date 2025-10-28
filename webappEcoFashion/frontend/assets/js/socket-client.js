// frontend/assets/js/socket-client.js
// Cliente de Socket.IO para notificaciones en tiempo real

class SocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.userId = null;
        this.listeners = new Map();
    }

    // Conectar al servidor Socket.IO
    connect(userId) {
        if (this.connected) {
            console.log('⚠️ Socket ya está conectado');
            return;
        }

        this.userId = userId;
        this.socket = io('http://localhost:3001', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.setupDefaultListeners();
        console.log('🔌 Conectando a Socket.IO...');
    }

    // Listeners por defecto
    setupDefaultListeners() {
        this.socket.on('connect', () => {
            this.connected = true;
            console.log('✅ Conectado a Socket.IO:', this.socket.id);
            
            // Identificar usuario
            if (this.userId) {
                this.socket.emit('user:identify', this.userId);
            }
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('🔌 Desconectado de Socket.IO');
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Error de conexión:', error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Reconectado después de', attemptNumber, 'intentos');
        });

        // Listeners de eventos personalizados
        this.socket.on('stats:update', (data) => {
            this.trigger('stats:update', data);
            console.log('📊 Estadísticas actualizadas:', data);
        });

        this.socket.on('inventory:changed', (data) => {
            this.trigger('inventory:changed', data);
            console.log('📦 Inventario actualizado:', data);
        });

        this.socket.on('order:notification', (data) => {
            this.trigger('order:notification', data);
            this.showNotification('Nuevo pedido', data.message);
        });

        this.socket.on('message:broadcast', (data) => {
            this.trigger('message:broadcast', data);
        });

        this.socket.on('user:online', (data) => {
            this.trigger('user:online', data);
            console.log('👤 Usuario conectado:', data.nombre);
        });

        this.socket.on('user:offline', (data) => {
            this.trigger('user:offline', data);
            console.log('👋 Usuario desconectado:', data.userId);
        });
    }

    // Registrar un listener personalizado
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // Disparar evento a listeners registrados
    trigger(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }

    // Emitir evento al servidor
    emit(event, data) {
        if (!this.connected) {
            console.warn('⚠️ Socket no está conectado');
            return;
        }
        this.socket.emit(event, data);
    }

    // Mostrar notificación en navegador
    showNotification(title, message) {
        if (!('Notification' in window)) {
            console.log('📢', title, ':', message);
            return;
        }

        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/assets/images/ECOFASHIONN.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, {
                        body: message,
                        icon: '/assets/images/ECOFASHIONN.png'
                    });
                }
            });
        }
    }

    // Desconectar
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.connected = false;
            console.log('👋 Desconectado manualmente');
        }
    }

    // Verificar si está conectado
    isConnected() {
        return this.connected;
    }
}

// Instancia global
const socketClient = new SocketClient();