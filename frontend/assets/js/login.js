// ============================================
// FUNCIÓN SIMPLE DE HASH (Para simulación)
// ============================================
function simpleHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }
  return hash.toString(36); // Base 36 para string más corto
}

// ============================================
// INICIALIZAR DATOS DE PRUEBA
// ============================================
function initializeData() {
  const users = JSON.parse(localStorage.getItem('users'));
  
  if (!users || users.length === 0) {
    const defaultUsers = [
      {
        id: 1,
        email: "usuario@ecofashion.com",
        password: simpleHash("123456"),
        name: "Usuario Demo",
        role: "user"
      },
      {
        id: 2,
        email: "admin@ecofashion.com",
        password: simpleHash("admin123"),
        name: "Administrador",
        role: "admin"
      }
    ];
    
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    console.log('✅ Usuarios creados - Prueba con: usuario@ecofashion.com / 123456');
  }
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

// Registrar usuario
function registerUser(email, password, name) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'El email ya está registrado' };
  }
  
  const newUser = {
    id: users.length + 1,
    email: email,
    password: simpleHash(password),
    name: name,
    role: "user"
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  return { success: true, message: 'Usuario registrado exitosamente' };
}

// Login
function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const hashedPassword = simpleHash(password);
  
  const user = users.find(u => u.email === email && u.password === hashedPassword);
  
  if (user) {
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    localStorage.setItem('currentUser', JSON.stringify(session));
    return { success: true, message: 'Login exitoso', user: session };
  }
  
  return { success: false, message: 'Email o contraseña incorrectos' };
}

// Logout
function logoutUser() {
  localStorage.removeItem('currentUser');
  return { success: true, message: 'Sesión cerrada' };
}

// Usuario actual
function getCurrentUser() {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser ? JSON.parse(currentUser) : null;
}

// ============================================
// MANEJO DE FORMULARIOS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initializeData();
  
  // Toggle password
  const toggleIcon = document.querySelector(".toggle-icon");
  const passwordInput = document.getElementById("password");

  if (toggleIcon && passwordInput) {
    toggleIcon.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
    });
  }
  
  // Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      
      const result = loginUser(email, password);
      
      if (result.success) {
        alert('✅ ' + result.message);
        window.location.href = '/index.html';
      } else {
        alert('❌ ' + result.message);
      }
    });
  }
  
  // Register Form
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      
      const result = registerUser(email, password, name);
      
      if (result.success) {
        alert('✅ ' + result.message);
        window.location.href = '/login.html';
      } else {
        alert('❌ ' + result.message);
      }
    });
  }
  
  // Logout Button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logoutUser();
      window.location.href = '/login.html';
    });
  }
  
  // Mostrar usuario en navbar
  const user = getCurrentUser();
  const userNameDisplay = document.getElementById("userName");
  if (user && userNameDisplay) {
    userNameDisplay.textContent = user.name;
  }
});

// Funciones globales
window.authSystem = {
  login: loginUser,
  logout: logoutUser,
  register: registerUser,
  getCurrentUser: getCurrentUser
};