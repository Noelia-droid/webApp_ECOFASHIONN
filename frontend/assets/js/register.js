//VALIDACIÓN/DROPDOWN DEL CAMPO CONTRASEÑA
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

passwordInput.addEventListener('focus', () => {
  requirementsBox.style.display = 'block';
});

passwordInput.addEventListener('blur', () => {
  setTimeout(() => {
    requirementsBox.style.display = 'none';
  }, 150); // pequeño delay para evitar parpadeo
});

passwordInput.addEventListener('input', updateIcons);

function togglePassword() {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
}
