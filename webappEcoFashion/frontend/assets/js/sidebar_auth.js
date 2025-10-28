(function () {
  // Simulación de datos del usuario (puedes reemplazar esto con datos reales del backend)
  const userEmail = 'holiwispandivis@gmail.com';

  // Elementos del DOM
  const emailElement = document.getElementById('user-email');
  const avatarElement = document.querySelector('.user-avatar');

  if (emailElement && avatarElement && userEmail) {
    emailElement.textContent = userEmail;

    // Extraer la primera letra del correo (antes del @)
    const initial = userEmail.charAt(0).toUpperCase();
    avatarElement.textContent = initial;
  } else {
    console.warn('No se pudo actualizar el correo o avatar del usuario');
  }
})();
