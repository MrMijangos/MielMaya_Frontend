import paymentService from '../common/api/payment-service.js';
import authService from '../services/auth-service.js';
import navigationContext from '../common/utils/navigation-context.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    navigationContext.setContext(
        navigationContext.CONTEXTS.USER_PROFILE,
        '/html/mycards.html'
    );

    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }

    const paymentMethodsContainer = document.getElementById('paymentMethods');
    if (!paymentMethodsContainer) return;

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
        } else {
            paymentMethodsContainer.innerHTML = paymentsArr.map(card => `
                <div class="payment-method-card" data-card-id="${card.idMetodoPago}" style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; align-items: center; background: #fff;">
                    <div class="payment-card-visual" style="flex-grow: 1;">
                        <div class="card-logo">
                            <span style="font-weight: bold; font-size: 1.1em;">${card.tipo || 'Tarjeta'}</span>
                        </div>
                        <div class="card-number">
                            <span class="card-digits" style="color: #555; font-size: 0.95em;">${card.detalles || ''}</span>
                        </div>
                    </div>
                    
                    <button class="btn-delete" data-id="${card.idMetodoPago}" style="background: #e53935; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9em; transition: all 0.2s;" title="Eliminar tarjeta">
                        Eliminar
                    </button>
                </div>
            `).join('');
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const cardId = e.target.dataset.id;
                    
                    if (confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) {
                        try {
                            await paymentService.deletePaymentMethod(cardId);
                            showNotification('Tarjeta eliminada correctamente', 'success');
                            window.location.reload();
                        } catch (error) {
                            showNotification('Error al eliminar tarjeta', 'error');
                        }
                    }
                });
            });
        }
    } catch (error) {
        paymentMethodsContainer.innerHTML = '<p class="empty-msg">Error al cargar métodos de pago.</p>';
    }

    let btnAddPayment = document.getElementById('btnAddPayment');
    if (!btnAddPayment) {
        btnAddPayment = document.createElement('button');
        btnAddPayment.className = 'btn-add-payment';
        btnAddPayment.id = 'btnAddPayment';
        btnAddPayment.style.cssText = 'width: 100%; padding: 15px; margin-top: 15px; background: #f4f4f4; border: 2px dashed #ccc; border-radius: 8px; cursor: pointer; font-weight: bold; color: #555; font-size: 14px;';
        btnAddPayment.innerHTML = '<span style="font-size: 1.2em; margin-right: 5px;">+</span> AGREGAR NUEVO MÉTODO DE PAGO';
        paymentMethodsContainer.appendChild(btnAddPayment);
    }
    
    btnAddPayment.addEventListener('click', () => {
        window.location.href = '/html/add-payment.html';
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
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}