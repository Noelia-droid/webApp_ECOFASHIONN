// frontend/assets/js/register.js

// =======================================
// VALIDACIONES DE CONTRASEÑA
// =======================================
const passwordInput = document.getElementById('password');
const requirementsBox = document.getElementById('password-requirements');

const rules = {
  length: /.{8,}/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*]/,
};

const updateIcons = () => {
  const value = passwordInput.value;
  Object.entries(rules).forEach(([id, regex]) => {
    const item = document.getElementById(id);
    const icon = item.querySelector('[data-lucide]');
    if (regex.test(value)) {
      item.classList.add('valid');
      icon.setAttribute('data-lucide', 'check-circle');
    } else {
      item.classList.remove('valid');
      icon.setAttribute('data-lucide', 'x');
    }
  });
  lucide.createIcons();
};

passwordInput.addEventListener('input', updateIcons);

// =======================================
// ENVÍO DEL FORMULARIO DE REGISTRO
// =======================================
document.querySelector('.form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('fullname').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!nombre || !email || !password) {
    alert('❌ Todos los campos son requeridos');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creando cuenta...';

  try {
    const response = await window.axiosInstance.post('/register', {
      nombre,
      email,
      password
    });


    const data = response.data;

    if (data.success) {
      alert('✅ ' + data.message);
      console.log('👤 Usuario creado:', data.user);

      // 🔔 Emitir evento al servidor vía Socket.IO
      socket.emit('usuario:registrado', {
        nombre: data.user.nombre,
        email: data.user.email
      });

      window.location.href = '/pages/dashboard_USER(CARRITO).html';
    } else {
      alert('❌ ' + (data.message || 'Error al crear la cuenta'));
    }
  } catch (error) {
    console.error('Error en registro:', error);
    if (error.response) {
      alert('❌ ' + (error.response.data.message || 'Error del servidor'));
    } else if (error.request) {
      alert('❌ No se pudo conectar con el servidor');
    } else {
      alert('❌ Error inesperado: ' + error.message);
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// =======================================
// SOCKET.IO (notificaciones)
// =======================================

// ✅ Conexión automática al mismo host (localhost:3001)
const socket = io();

// ✅ Escuchar notificaciones del servidor
socket.on('notificacion:nueva', (data) => {
  console.log('🔔 Notificación recibida:', data.mensaje);
});
