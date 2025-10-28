// frontend/assets/js/password-validator.js
// VALIDACIÓN/DROPDOWN DEL CAMPO CONTRASEÑA

const PasswordValidator = {
    rules: {
        length: /.{8,}/,
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /[0-9]/,
        special: /[!@#$%^&*]/,
    },

    init(passwordInputId = 'password', requirementsBoxId = 'password-requirements') {
        this.passwordInput = document.getElementById(passwordInputId);
        this.requirementsBox = document.getElementById(requirementsBoxId);

        if (!this.passwordInput || !this.requirementsBox) {
            console.warn('⚠️ Elementos de validación de contraseña no encontrados');
            return;
        }

        this.setupListeners();
    },

    setupListeners() {
        this.passwordInput.addEventListener('focus', () => {
            this.requirementsBox.style.display = 'block';
        });

        this.passwordInput.addEventListener('blur', () => {
            setTimeout(() => {
                this.requirementsBox.style.display = 'none';
            }, 150);
        });

        this.passwordInput.addEventListener('input', () => {
            this.updateIcons();
        });
    },

    updateIcons() {
        const value = this.passwordInput.value;
        
        Object.entries(this.rules).forEach(([id, regex]) => {
            const item = document.getElementById(id);
            if (!item) return;

            const icon = item.querySelector('[data-lucide]');
            
            if (regex.test(value)) {
                item.classList.add('valid');
                if (icon) {
                    icon.setAttribute('data-lucide', 'check-circle');
                }
            } else {
                item.classList.remove('valid');
                if (icon) {
                    icon.setAttribute('data-lucide', 'x');
                }
            }
        });

        // Recrear íconos de Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    validate() {
        const value = this.passwordInput.value;
        const errors = [];

        if (!this.rules.length.test(value)) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }
        if (!this.rules.uppercase.test(value)) {
            errors.push('Debe contener al menos una mayúscula');
        }
        if (!this.rules.lowercase.test(value)) {
            errors.push('Debe contener al menos una minúscula');
        }
        if (!this.rules.number.test(value)) {
            errors.push('Debe contener al menos un número');
        }
        if (!this.rules.special.test(value)) {
            errors.push('Debe contener al menos un carácter especial (!@#$%^&*)');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    getStrength() {
        const value = this.passwordInput.value;
        let strength = 0;

        Object.values(this.rules).forEach(regex => {
            if (regex.test(value)) strength++;
        });

        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    }
};

// Función de toggle de contraseña
function togglePassword(inputId = 'password') {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
}

// Auto-inicializar si estamos en la página de registro
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('password') && document.getElementById('password-requirements')) {
            PasswordValidator.init();
        }
    });
} else {
    if (document.getElementById('password') && document.getElementById('password-requirements')) {
        PasswordValidator.init();
    }
}