window.socket = window.socket || io();
document.addEventListener('DOMContentLoaded', () => {
    // Toggle mostrar/ocultar contraseña
    document.getElementById('togglePassword')?.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        }
    });

    // Manejar el envío del formulario
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;

        if (!email || !password) {
            showError('Por favor completa todos los campos');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('Por favor ingresa un email válido');
            return;
        }

        const submitBtn = e.target.querySelector('.btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';

        try {
            const response = await window.axiosInstance.post('/login', { email, password });
            const data = response.data;

            if (data.success) {
                showSuccess('¡Bienvenido!');

                window.socket.emit('usuario:login', {
                    nombre: data.user.nombre,
                    email: data.user.email
                });

                setTimeout(() => {
                    window.location.href = '/pages/dashboard_USER(CARRITO).html';
                }, 800);
            } else {
                showError(data.message || 'Credenciales incorrectas');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error de conexión. Por favor intenta de nuevo.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    function showError(message) {
        removeAlerts();
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.innerHTML = `<svg ...></svg><span>${message}</span>`;
        document.querySelector('.card')?.insertBefore(alert, document.querySelector('.form'));
        setTimeout(() => alert.remove(), 5000);
    }

    function showSuccess(message) {
        removeAlerts();
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.innerHTML = `<svg ...></svg><span>${message}</span>`;
        document.querySelector('.card')?.insertBefore(alert, document.querySelector('.form'));
    }

    function removeAlerts() {
        document.querySelector('.alert')?.remove();
    }
});
