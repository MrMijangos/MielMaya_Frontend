import paymentService from '../common/api/payment-service.js';
import authService from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }

    const paymentMethodsContainer = document.getElementById('paymentMethods');
    if (!paymentMethodsContainer) return;

    // Cargar métodos de pago del usuario
    try {
        const result = await paymentService.getAllPaymentMethods();
        let paymentsArr = [];
        if (Array.isArray(result)) {
            paymentsArr = result;
        } else if (result && Array.isArray(result.data)) {
            paymentsArr = result.data;
        }
        if (paymentsArr.length === 0) {
            paymentMethodsContainer.innerHTML = '<p class="empty-msg">No tienes métodos de pago guardados.</p>';
            return;
        }
        paymentMethodsContainer.innerHTML = paymentsArr.map(card => `
            <div class="payment-method-card" data-card-id="${card.id}">
                <div class="payment-card-visual">
                    <div class="card-logo">
                        <span>${card.tipo || 'Tarjeta'}</span>
                    </div>
                    <div class="card-number">
                        <span class="card-digits">${card.detalles || ''}</span>
                    </div>
                </div>
                <input type="radio" name="payment-method" value="${card.id}">
            </div>
        `).join('');
    } catch (error) {
        paymentMethodsContainer.innerHTML = '<p class="empty-msg">Error al cargar métodos de pago.</p>';
    }

    // Botón para agregar nuevo método de pago
    let btnAddPayment = document.getElementById('btnAddPayment');
    if (!btnAddPayment) {
        // Si no existe, lo agregamos al final del contenedor
        btnAddPayment = document.createElement('button');
        btnAddPayment.className = 'btn-add-payment';
        btnAddPayment.id = 'btnAddPayment';
        btnAddPayment.innerHTML = '<span class="plus-icon">+</span> <span>AGREGAR NUEVO MÉTODO DE PAGO</span>';
        paymentMethodsContainer.appendChild(btnAddPayment);
    }
    btnAddPayment.addEventListener('click', () => {
        window.location.href = '/html/add-payment.html';
    });
});
