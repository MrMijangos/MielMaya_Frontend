import paymentService from '../common/api/payment-service.js';
import authService from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    if (!authService.isAuthenticated()) {
        alert("Por favor inicia sesión para ver tus métodos de pago");
        window.location.href = '/html/login.html';
        return;
    }

    const btnAdd = document.getElementById('btnAddPayment');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = '../html/add-payment.html';
        });
    }

    const btnProceed = document.getElementById('btnProceed');
    if (btnProceed) {
        btnProceed.addEventListener('click', handleProceed);
    }

    await loadPaymentMethods();
});

async function loadPaymentMethods() {
    const container = document.getElementById('cardsContainer');
    
    try {
        const result = await paymentService.getAllPaymentMethods();
        
        container.innerHTML = ''; 

        if (result.success && result.data.length > 0) {
          
            result.data.forEach((card, index) => {
                const cardHTML = createCardHTML(card, index === 0);
                container.appendChild(cardHTML);
            });
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    <p>No tienes métodos de pago guardados.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error("Error cargando tarjetas:", error);
        container.innerHTML = '<p style="color:red; text-align:center;">Error al cargar tarjetas</p>';
    }
}

function createCardHTML(card, isFirst) {
  
    
    const div = document.createElement('div');
    div.className = 'payment-method-card';
    div.style.cssText = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; align-items: center; cursor: pointer; background: #fff;';
    
    const checkedAttr = isFirst ? 'checked' : '';

    div.innerHTML = `
        <input type="radio" name="payment-method" value="${card.idMetodoPago}" ${checkedAttr} style="margin-right: 15px; transform: scale(1.5);">
        
        <div class="payment-card-visual" style="flex-grow: 1;">
            <div class="card-number">
                <span style="font-weight: bold; font-size: 1.1em; display:block;">${card.tipo}</span>
                <span class="card-digits" style="color: #555;">${card.detalles}</span>
            </div>
        </div>

        <button class="btn-delete" data-id="${card.idMetodoPago}" style="background:none; border:none; cursor:pointer; font-size: 1.2em;" title="Eliminar">
            🗑️
        </button>
    `;

    div.addEventListener('click', () => {
        div.querySelector('input[type="radio"]').checked = true;
    });

    
    const deleteBtn = div.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); 
        if(confirm('¿Seguro que quieres eliminar esta tarjeta?')) {
            await paymentService.deletePaymentMethod(card.idMetodoPago);
            loadPaymentMethods(); 
        }
    });

    return div;
}

function handleProceed() {
    const selected = document.querySelector('input[name="payment-method"]:checked');
    
    if (!selected) {
        alert("Por favor selecciona un método de pago para continuar.");
        return;
    }

    const idMetodoPago = selected.value;

    localStorage.setItem('selectedPaymentId', idMetodoPago);
    
    console.log("Método de pago guardado:", idMetodoPago);

    window.location.href = '../html/shipping-address.html';
}