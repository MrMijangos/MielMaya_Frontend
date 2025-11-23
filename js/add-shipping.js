import shippingService from '../common/api/shipping-service.js';
import authService from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
    
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }

    setupInputFormatting();

    const btnAdd = document.getElementById('btnAddAddressBtn');
    if (btnAdd) {
        btnAdd.addEventListener('click', handleSaveAddress);
    }
});

async function handleSaveAddress(e) {
    e.preventDefault();

    const form = document.getElementById('shippingForm');
    const btnAdd = document.getElementById('btnAddAddressBtn');

    if (!form.checkValidity()) {
        alert('Por favor completa todos los campos requeridos.');
        form.reportValidity();
        return;
    }

    // Obtener datos del formulario
    const street = document.getElementById('shippingStreet').value;
    const colony = document.getElementById('shippingColony').value;
    const city = document.getElementById('shippingCity').value;
    const state = document.getElementById('shippingState').value;
    const zip = document.getElementById('shippingZip').value;

    // UI Loading
    const originalText = btnAdd.textContent;
    btnAdd.textContent = 'GUARDANDO...';
    btnAdd.disabled = true;

    try {
        const result = await shippingService.addShippingMethod({
            calle: street,
            colonia: colony,
            ciudad: city,
            estado: state,
            codigoPostal: zip
        });

        if (result.success) {
            showNotification('Dirección guardada exitosamente', 'success');
            
            setTimeout(() => {
                // ✅ CORREGIDO: Detectar de dónde viene el usuario
                const referrer = document.referrer;
                const isFromCheckout = referrer.includes('shipping-address.html') || 
                                      referrer.includes('checkout.html') ||
                                      localStorage.getItem('isCheckoutFlow') === 'true';
                
                if (isFromCheckout) {
                    // Si viene del flujo de compra, regresar al shipping
                    window.location.href = '../html/shipping-address.html';
                } else {
                    // Si viene del menú de usuario, regresar a addresses.html
                    window.location.href = '../html/addresses.html';
                }
            }, 1500);
        } else {
            throw new Error(result.error || 'Error al guardar');
        }

    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
        btnAdd.textContent = originalText;
        btnAdd.disabled = false;
    }
}

function setupInputFormatting() {
    // Solo números para el CP y Teléfono
    ['shippingZip', 'shippingPhone'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    });
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