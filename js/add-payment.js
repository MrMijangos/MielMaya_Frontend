import paymentService from '../common/api/payment-service.js';
import authService from '../services/auth-service.js'; 

document.addEventListener('DOMContentLoaded', () => {
    console.log("Script cargado correctamente");

    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }

    loadCartTotal();
    setupCardFormatting();
    
    const btnAddCard = document.getElementById('btnAddCard');
    
    if (!btnAddCard) {
        console.error("No se encontró el botón btnAddCard");
        return;
    }

    btnAddCard.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log("Botón presionado");

        const form = document.getElementById('paymentForm');
        
        if (!form.checkValidity()) {
            alert('Por favor completa todos los campos requeridos');
            form.reportValidity();
            return;
        }

        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardMonth = document.getElementById('cardMonth').value;
        const cardCVV = document.getElementById('cardCVV').value;
        const cardName = document.getElementById('cardName').value;

        if (!validateCardNumber(cardNumber)) {
            showNotification('Número de tarjeta inválido (Luhn Check)', 'error');
            return;
        }
        if (cardCVV.length < 3) {
            showNotification('CVV inválido', 'error');
            return;
        }

        const originalText = btnAddCard.textContent;
        btnAddCard.textContent = 'GUARDANDO...';
        btnAddCard.disabled = true;

        try {
            console.log("Enviando datos...");
            const result = await paymentService.addPaymentMethod({
                nombre_tarjeta: cardName,
                num_tarjeta: cardNumber,
                fecha_expiracion: cardMonth,
                CVV: cardCVV
            });

            if (result.success) {
                showNotification('Tarjeta guardada exitosamente', 'success');
                setTimeout(() => {
                    window.location.href = '../html/checkout.html';
                }, 1500);
            } else {
                throw new Error(result.error || 'Error desconocido del servidor');
            }
        } catch (error) {
            console.error(error);
            showNotification(error.message || 'Error de conexión', 'error');
            btnAddCard.textContent = originalText;
            btnAddCard.disabled = false;
        }
    });
});


function loadCartTotal() {
    const total = localStorage.getItem('cartTotal') || '0.00';
    const totalElement = document.getElementById('addPaymentTotal');
    if (totalElement) {
        totalElement.textContent = `$${total}`;
    }
}

function setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    cardNumber?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value.substring(0, 19);
    });
    
    const cardMonth = document.getElementById('cardMonth');
    cardMonth?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
    
    const cardCVV = document.getElementById('cardCVV');
    cardCVV?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    const cardName = document.getElementById('cardName');
    cardName?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });
}

function validateCardNumber(cardNumber) {
    if (!/^\d{13,19}$/.test(cardNumber)) return false;
    let sum = 0;
    let isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white; padding: 16px 24px; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}