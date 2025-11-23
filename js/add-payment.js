import paymentService from '../common/api/payment-service.js';
import authService from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Script add-payment.js cargado correctamente");

    // 1. Verificar autenticación
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }

    // 2. Cargar funciones visuales
    loadCartTotal();
    setupCardFormatting();
    
    // 3. Configurar el botón
    const btnAddCard = document.getElementById('btnAddCard');
    
    if (!btnAddCard) {
        console.error("❌ No se encontró el botón btnAddCard");
        return;
    }

    btnAddCard.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log("🔘 Botón presionado");

        const form = document.getElementById('paymentForm');
        
        // Validación HTML básica
        if (!form.checkValidity()) {
            showNotification('Por favor completa todos los campos requeridos', 'error');
            form.reportValidity();
            return;
        }

        // Obtener valores limpios
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardMonth = document.getElementById('cardMonth').value;
        const cardCVV = document.getElementById('cardCVV').value;
        const cardName = document.getElementById('cardName').value;

        console.log('📋 Datos capturados:', {
            cardNumber: cardNumber.replace(/\d(?=\d{4})/g, '*'),
            cardMonth,
            cardCVV: '***',
            cardName
        });

        // Validaciones Lógicas
        if (!validateCardNumber(cardNumber)) {
            showNotification('Número de tarjeta inválido (debe tener entre 13 y 19 dígitos)', 'error');
            return;
        }
        
        if (!validateExpiration(cardMonth)) {
            showNotification('Fecha de expiración inválida o vencida', 'error');
            return;
        }
        
        if (cardCVV.length < 3 || cardCVV.length > 4) {
            showNotification('CVV inválido (debe tener 3 o 4 dígitos)', 'error');
            return;
        }

        // Efecto de carga
        const originalText = btnAddCard.textContent;
        btnAddCard.textContent = 'GUARDANDO...';
        btnAddCard.disabled = true;

        try {
            console.log("📤 Enviando datos al servidor...");
            
            const result = await paymentService.addPaymentMethod({
                nombre_tarjeta: cardName,
                num_tarjeta: cardNumber,
                fecha_expiracion: cardMonth,
                CVV: cardCVV
            });

            console.log('📥 Respuesta del servidor:', result);

            if (result.success) {
                showNotification('✅ Tarjeta guardada exitosamente', 'success');
                
                // Limpiar formulario
                form.reset();
                
                setTimeout(() => {
                    window.location.href = '../html/checkout.html';
                }, 1500);
            } else {
                throw new Error(result.error || 'Error desconocido del servidor');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            showNotification(error.message || 'Error de conexión con el servidor', 'error');
            btnAddCard.textContent = originalText;
            btnAddCard.disabled = false;
        }
    });
});

// --- FUNCIONES AUXILIARES ---

function loadCartTotal() {
    const total = localStorage.getItem('cartTotal') || '0.00';
    const totalElement = document.getElementById('addPaymentTotal');
    if (totalElement) {
        totalElement.textContent = `$${total}`;
    }
}

function setupCardFormatting() {
    // Formateo Número Tarjeta (espacios cada 4)
    const cardNumber = document.getElementById('cardNumber');
    cardNumber?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value.substring(0, 19); // 16 dígitos + 3 espacios
    });
    
    // Formateo Fecha (MM/AA)
    const cardMonth = document.getElementById('cardMonth');
    cardMonth?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
    
    // Solo números en CVV
    const cardCVV = document.getElementById('cardCVV');
    cardCVV?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    // Solo letras en nombre
    const cardName = document.getElementById('cardName');
    cardName?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });
}

// ✅ VALIDACIÓN SIMPLIFICADA (Solo longitud)
function validateCardNumber(cardNumber) {
    // Validar que tenga entre 13 y 19 dígitos
    if (!/^\d{13,19}$/.test(cardNumber)) {
        console.log('❌ Tarjeta rechazada por longitud:', cardNumber.length, 'dígitos');
        return false;
    }
    
    console.log('✅ Tarjeta aceptada:', cardNumber.length, 'dígitos');
    return true;
}

// ✅ NUEVA: Validar fecha de expiración
function validateExpiration(expiration) {
    // Formato esperado: MM/AA
    const match = expiration.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
        console.log('❌ Formato de fecha inválido');
        return false;
    }
    
    const month = parseInt(match[1]);
    const year = parseInt('20' + match[2]); // Convertir AA a 20AA
    
    // Validar mes (01-12)
    if (month < 1 || month > 12) {
        console.log('❌ Mes inválido:', month);
        return false;
    }
    
    // Validar que no esté vencida
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        console.log('❌ Tarjeta vencida');
        return false;
    }
    
    console.log('✅ Fecha válida');
    return true;
}

function showNotification(message, type = 'info') {
    // Remover notificación existente
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    
    const colors = {
        success: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        error: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
        info: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: bold;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}