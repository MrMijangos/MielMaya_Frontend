// .js/login.js
import authService from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('toggleButton');
    const loginForm = document.querySelector('.login-form');

    toggleButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const correo = document.getElementById('correo').value;
        const password = document.getElementById('password').value;

        const btnEntrar = loginForm.querySelector('.btn-entrar');
        const originalText = btnEntrar.textContent;
        btnEntrar.textContent = 'CARGANDO...';
        btnEntrar.disabled = true;

        try {
            const result = await authService.login({
                correo:correo,
                contrasenia:password
        });

           
if (result.success) {
    showNotification('¡Bienvenido!', 'success');
    
    setTimeout(() => {
        const usuario = authService.getCurrentUser();
        const rol = usuario.rol; 
        if (rol === "ADMIN") {
            window.location.href = '/html/admin-products.html';  
        } else {
            window.location.href = '/index.html';  
        }
    }, 1000);
} else {
                showNotification(result.error || 'Credenciales incorrectas', 'error');
                btnEntrar.textContent = originalText;
                btnEntrar.disabled = false;
            }
        } catch (error) {
            showNotification('Error de conexión', 'error');
            btnEntrar.textContent = originalText;
            btnEntrar.disabled = false;
        }
    });
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}