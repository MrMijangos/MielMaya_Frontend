import paymentService from '../common/api/payment-service.js';
import authService from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('mycards.js cargado correctamente');

    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }

    await loadPaymentMethods();

    const btnAddPayment = document.getElementById('btnAddPayment');
    if (btnAddPayment) {
        btnAddPayment.addEventListener('click', () => {
            window.location.href = '/html/add-payment.html';
        });
    }
});

async function loadPaymentMethods() {
    const container = document.getElementById('paymentMethodsContainer');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:40px;"><p>Cargando...</p></div>';

    try {
        const result = await paymentService.getAllPaymentMethods();
        
        console.log('Métodos de pago recibidos:', result);

        let paymentsArr = [];
        if (Array.isArray(result)) {
            paymentsArr = result;
        } else if (result && result.success && Array.isArray(result.data)) {
            paymentsArr = result.data;
        } else if (result && Array.isArray(result.data)) {
            paymentsArr = result.data;
        }

        container.innerHTML = '';

        if (paymentsArr.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                    </div>
                    <h3>No tienes tarjetas guardadas</h3>
                    <p>Agrega una tarjeta para realizar compras más rápido</p>
                </div>
            `;
            return;
        }

        const listContainer = document.createElement('div');
        listContainer.className = 'payment-methods-list';

        paymentsArr.forEach((card) => {
            const cardId = card.idMetodoPago || card.id_metodo_pago || card.id;
            const cardElement = createCardElement(card, cardId);
            listContainer.appendChild(cardElement);
        });

        container.appendChild(listContainer);

    } catch (error) {
        console.error('Error cargando métodos de pago:', error);
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:#f44336;">
                <p style="margin-bottom:10px;">Error al cargar tus tarjetas</p>
                <p style="font-size:14px; color:#999;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:10px 24px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">REINTENTAR</button>
            </div>
        `;
    }
}

function createCardElement(card, cardId) {
    const div = document.createElement('div');
    div.className = 'payment-method-card';
    
    let lastDigits = '****';
    let expiration = '';
    let cardHolder = '';
    
    if (card.detalles) {
        const details = card.detalles;
        
        const digitsMatch = details.match(/terminada en (\d{4})/);
        if (digitsMatch) lastDigits = digitsMatch[1];
        
        const expMatch = details.match(/Exp: ([\d\/]+)/);
        if (expMatch) expiration = expMatch[1];
        
        const holderMatch = details.match(/Titular: ([^|]+)/);
        if (holderMatch) cardHolder = holderMatch[1].trim();
    }
    
    const cardType = card.tipo || 'Tarjeta';
    
    div.innerHTML = `
        <div class="card-content">
            <div class="card-info">
                <div class="card-type">
                    <span class="card-icon"></span>
                    <span>${cardType}</span>
                </div>
                <div class="card-details">
                    <div>•••• •••• •••• ${lastDigits}</div>
                    ${expiration ? `<div style="font-size: 0.9em; color: #888;">Exp: ${expiration}</div>` : ''}
                    ${cardHolder ? `<div style="font-size: 0.9em; color: #888;">${cardHolder}</div>` : ''}
                </div>
            </div>
            <button class="btn-delete-card" onclick="deleteCard(${cardId}, '${lastDigits}')">
                Eliminar
            </button>
        </div>
    `;
    
    return div;
}

window.deleteCard = async function(cardId, lastDigits) {
    if (!confirm('¿Estás seguro de eliminar la tarjeta terminada en ' + lastDigits + '?')) {
        return;
    }

    try {
        console.log('Eliminando tarjeta ID:', cardId);
        
        const result = await paymentService.deletePaymentMethod(cardId);
        
        if (result && result.success !== false) {
            showNotification('Tarjeta eliminada exitosamente', 'success');
            await loadPaymentMethods();
        } else {
            throw new Error(result.error || 'Error al eliminar tarjeta');
        }
    } catch (error) {
        console.error('Error eliminando tarjeta:', error);
        showNotification('Error al eliminar la tarjeta: ' + error.message, 'error');
    }
}

function showNotification(message, type) {
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