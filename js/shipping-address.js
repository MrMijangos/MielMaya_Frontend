// .js/shipping-address.js
import shippingService from '../common/api/shipping-service.js';
import authService from '../common/api/auth-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }

    // Verificar que haya un método de pago seleccionado
    if (!checkPaymentMethod()) {
        return;
    }
    
    // Cargar direcciones guardadas
    await loadAddresses();
    
    // Cargar total del carrito
    loadCartTotal();
    
    // Event listener para agregar dirección
    document.getElementById('btnAddAddress')?.addEventListener('click', () => {
        window.location.href = '/html/add-shipping.html';
    });
    
    // Event listener para proceder al pago
    document.getElementById('btnProceedToPayment')?.addEventListener('click', async () => {
        const selectedAddress = document.querySelector('input[name="shipping-address"]:checked');
        
        if (selectedAddress) {
            localStorage.setItem('selectedShippingAddress', selectedAddress.value);
            
            // Aquí procesarías el pedido completo
            await processOrder();
        } else {
            alert('Por favor selecciona una dirección de envío');
        }
    });
});

function checkPaymentMethod() {
    const paymentMethod = localStorage.getItem('selectedPaymentMethod');
    
    if (!paymentMethod) {
        alert('Debes seleccionar un método de pago primero');
        window.location.href = '/html/checkout.html';
        return false;
    }
    return true;
}

async function loadAddresses() {
    const container = document.getElementById('addressesList');
    if (!container) return;

    try {
        const result = await shippingService.getAllAddresses();
        
        if (result.success && result.data.length > 0) {
            // Filtrar direcciones del usuario actual
            const userData = JSON.parse(localStorage.getItem('userData'));
            const userAddresses = result.data.filter(a => a.id_user === userData.id_user);

            // Limpiar container (mantener solo el botón de agregar)
            const addButton = container.querySelector('.btn-add-address');
            container.innerHTML = '';

            // Renderizar direcciones
            userAddresses.forEach((address, index) => {
                const addressDiv = document.createElement('div');
                addressDiv.className = 'address-card';
                addressDiv.dataset.addressId = address.id_direccion;

                addressDiv.innerHTML = `
                    <div class="address-info">
                        <p class="address-street">${address.calle} ${address.num} ${address.ext || ''}</p>
                        <p class="address-details">${address.colonia}, ${address.municipio}</p>
                        <p class="address-details">${address.estado}</p>
                        <p class="address-zip">${address.codigo_postal}</p>
                        <p class="address-details">Tel: ${address.celular}</p>
                    </div>
                    <input type="radio" name="shipping-address" value="${address.id_direccion}" ${index === 0 ? 'checked' : ''}>
                `;

                container.appendChild(addressDiv);
            });

            // Re-agregar botón de añadir
            container.appendChild(addButton);
        }
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

function loadCartTotal() {
    const total = localStorage.getItem('cartTotal') || '0.00';
    const totalElement = document.getElementById('shippingTotal');
    if (totalElement) {
        totalElement.textContent = `$${total}`;
    }
}

async function processOrder() {
    const paymentMethodId = localStorage.getItem('selectedPaymentMethod');
    const shippingAddressId = localStorage.getItem('selectedShippingAddress');
    
    // Mostrar loading
    const btn = document.getElementById('btnProceedToPayment');
    const originalText = btn.textContent;
    btn.textContent = 'PROCESANDO...';
    btn.disabled = true;

    try {
        // Aquí harías la lógica para:
        // 1. Crear el pedido
        // 2. Vaciar el carrito
        // 3. Enviar confirmación

        showNotification('¡Pedido realizado exitosamente!', 'success');
        
        // Limpiar datos temporales
        localStorage.removeItem('selectedPaymentMethod');
        localStorage.removeItem('selectedShippingAddress');
        localStorage.removeItem('cartTotal');
        
        // Vaciar carrito en backend
        await cartService.clearCart();
        
        // Redirigir a confirmación
        setTimeout(() => {
            window.location.href = '/html/orders.html';
        }, 2000);

    } catch (error) {
        showNotification('Error al procesar pedido', 'error');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

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