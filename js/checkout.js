import paymentService from '../common/api/payment-service.js';
import authService from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verificar Autenticación
    if (!authService.isAuthenticated()) {
        alert("Por favor inicia sesión para ver tus métodos de pago");
        window.location.href = '/html/login.html';
        return;
    }

    // 2. Configurar botón de "Agregar Nuevo"
    const btnAdd = document.getElementById('btnAddPayment');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            // Redirigir al formulario de agregar tarjeta
            window.location.href = '../html/add-payment.html';
        });
    }

    // 3. Configurar botón de "Continuar/Guardar"
    const btnProceed = document.getElementById('btnProceed');
    if (btnProceed) {
        btnProceed.addEventListener('click', handleProceed);
    }

    // 4. Cargar las tarjetas
    await loadPaymentMethods();
});

async function loadPaymentMethods() {
    const container = document.getElementById('cardsContainer');
    
    try {
        const result = await paymentService.getAllPaymentMethods();
        
        container.innerHTML = ''; // Limpiar mensaje de "Cargando..."

        if (result.success && result.data.length > 0) {
            // Recorremos cada tarjeta recibida de la API
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
    // card.detalles viene como: "Tarjeta terminada en 4242 | Exp: 12/26 | Titular: Fern"
    // Vamos a intentar parsearlo un poco para que se vea bonito
    
    const div = document.createElement('div');
    div.className = 'payment-method-card';
    div.style.cssText = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; align-items: center; cursor: pointer; background: #fff;';
    
    // Si es el primero, lo marcamos checked por defecto
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

    // Hacemos que al dar click en todo el div se seleccione el radio
    div.addEventListener('click', () => {
        div.querySelector('input[type="radio"]').checked = true;
    });

    // Lógica para eliminar
    const deleteBtn = div.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Evitar seleccionar al borrar
        if(confirm('¿Seguro que quieres eliminar esta tarjeta?')) {
            await paymentService.deletePaymentMethod(card.idMetodoPago);
            loadPaymentMethods(); // Recargar lista
        }
    });

    return div;
}

function handleProceed() {
    // 1. Buscar cuál radio button está seleccionado
    const selected = document.querySelector('input[name="payment-method"]:checked');
    
    if (!selected) {
        alert("Por favor selecciona un método de pago para continuar.");
        return;
    }

    const idMetodoPago = selected.value;

    // 2. GUARDAR EN MEMORIA (LocalStorage)
    // Esto es vital para que la siguiente página sepa qué tarjeta elegiste
    localStorage.setItem('selectedPaymentId', idMetodoPago);
    
    console.log("Método de pago guardado:", idMetodoPago);

    // 3. REDIRIGIR A LA PÁGINA DE DIRECCIONES
    // Asegúrate de que este archivo exista en tu carpeta html
    window.location.href = '../html/shipping-address.html';
}