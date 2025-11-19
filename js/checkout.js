// .js/checkout.js
import paymentService from '../common/api/payment-service.js';
import cartService from '../common/api/cart-service.js';
import authService from '../common/api/auth-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }

    // Cargar métodos de pago
    await loadPaymentMethods();
    
    // Cargar total del carrito
    await loadCartTotal();
    
    // Event listener para agregar método de pago
    document.getElementById('btnAddPayment')?.addEventListener('click', () => {
        window.location.href = '/html/add-payment.html';
    });
    
    // Event listener para proceder
    document.getElementById('btnProceed')?.addEventListener('click', async () => {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
        
        if (selectedMethod) {
            localStorage.setItem('selectedPaymentMethod', selectedMethod.value);
            window.location.href = '/html/shipping-address.html';
        } else {
            alert('Por favor selecciona un método de pago');
        }
    });
});

async function loadPaymentMethods() {
    const container = document.getElementById('paymentMethods');
    if (!container) return;

    try {
        const result = await paymentService.getAllPaymentMethods();
        
        if (result.success && result.data.length > 0) {
            // Filtrar métodos del usuario actual
            const userData = JSON.parse(localStorage.getItem('userData'));
            const userPayments = result.data.filter(p => p.id_user === userData.id_user);

            // Limpiar container (mantener solo el botón de agregar)
            const addButton = container.querySelector('.btn-add-payment');
            container.innerHTML = '';

            // Renderizar métodos de pago
            userPayments.forEach((payment, index) => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'payment-method-card';
                cardDiv.dataset.cardId = payment.id_pago;

                // Determinar tipo de tarjeta
                const cardType = payment.num_tarjeta.startsWith('5') ? 'mastercard' : 'visa';
                const last4 = payment.num_tarjeta.slice(-4);

                cardDiv.innerHTML = `
                    <div class="payment-card-visual ${cardType}">
                        <div class="card-logo">
                            ${cardType === 'mastercard' ? `
                                <div class="mastercard-circle red"></div>
                                <div class="mastercard-circle yellow"></div>
                            ` : `
                                <svg width="60" height="20" viewBox="0 0 60 20" fill="#1434CB">
                                    <path d="M24.6 3.4l-7.2 13.2h-4.8L9.4 6.8c-.2-.8-.4-1-.9-1.3-.9-.5-2.3-.9-3.6-1.2L5 3.4h7.8c1 0 1.9.7 2.1 1.9l1.9 10.1 4.8-12h4.9l.1.1zm19.2 8.9c0-3.5-4.8-3.7-4.8-5.3 0-.5.5-1 1.5-1.1.5-.1 1.9-.1 3.5.6l.6-2.9c-.9-.3-2-.6-3.4-.6-3.6 0-6.1 1.9-6.1 4.7 0 2 1.8 3.2 3.2 3.8 1.4.7 1.9 1.1 1.9 1.7 0 .9-1.1 1.3-2.1 1.3-1.8 0-2.7-.3-4.2-.9l-.7 3.4c.9.4 2.7.8 4.5.8 3.8.1 6.3-1.9 6.3-4.8l-.2.3zm9.6 4.3h4.2l-3.7-13.2h-3.9c-.9 0-1.6.5-1.9 1.3l-6.8 11.9h3.8l.8-2.1h4.7l.8 2.1zm-4.1-5.1l1.9-5.3 1.1 5.3h-3zm-20-8.1l-3.8 13.2h-3.6l3.8-13.2h3.6z"/>
                                </svg>
                            `}
                        </div>
                        <div class="card-number">
                            <span>${payment.nombre_tarjeta}</span>
                            <span class="card-digits">•••• •••• •••• ${last4}</span>
                        </div>
                    </div>
                    <input type="radio" name="payment-method" value="${payment.id_pago}" ${index === 0 ? 'checked' : ''}>
                `;

                container.appendChild(cardDiv);
            });

            // Re-agregar botón de añadir
            container.appendChild(addButton);
        }
    } catch (error) {
        console.error('Error loading payment methods:', error);
    }
}

async function loadCartTotal() {
    try {
        const result = await cartService.getCartItems();
        
        if (result.success && result.data.length > 0) {
            // Calcular total
            let total = 0;
            
            for (const item of result.data) {
                const productResult = await productService.getProductById(item.id_producto);
                if (productResult.success) {
                    total += productResult.data.precio * item.cantidad;
                }
            }

            const totalElement = document.getElementById('checkoutTotal');
            if (totalElement) {
                totalElement.textContent = `$${total.toFixed(2)}`;
            }

            // Guardar total en localStorage para otras páginas
            localStorage.setItem('cartTotal', total.toFixed(2));
        }
    } catch (error) {
        console.error('Error loading cart total:', error);
    }
}