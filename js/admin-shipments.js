import authService from '../services/auth-service.js';

const API_BASE_URL = 'http://54.152.16.222:7000/api';
const DEFAULT_IMAGE = '/images/productosmiel'; 

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Validar sesión (opcional)
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión como admin');
        window.location.href = '/html/login.html';
        return;
    }

    // 2. Iniciar lógica
    setupTabs();
    await loadOrders();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const status = tab.dataset.status;
            filterShipments(status);
        });
    });
}

async function loadOrders() {
    const container = document.getElementById('shipmentsList');
    
    try {
        // Llamada SIN parámetros para obtener JSON del admin
        const response = await fetch(`${API_BASE_URL}/orders`);
        
        if (!response.ok) throw new Error('Error al conectar con API');
        
        const orders = await response.json();

        if (!orders || orders.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px;">No hay pedidos.</p>';
            return;
        }

        renderOrders(orders);
        filterShipments('pending'); // Filtrar pendientes por defecto

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red; text-align:center;">Error al cargar datos.</p>';
    }
}

function renderOrders(orders) {
    const container = document.getElementById('shipmentsList');
    container.innerHTML = '';

    orders.forEach(order => {
        // **IMPORTANTE:** Usa el ID correcto del pedido
        const orderId = order.idPedido || order.numeroPedido; 
        
        // Lógica de estados
        let statusClass = 'pending';
        let nextStatus = ''; // El estado al que pasará
        const estadoDB = order.estado ? order.estado.toUpperCase() : 'CREADO';

        if (estadoDB === 'CREADO' || estadoDB === 'PENDING') {
            statusClass = 'pending';
            nextStatus = 'ENVIADO';
        } else if (estadoDB === 'ENVIADO' || estadoDB === 'SHIPPED') {
            statusClass = 'shipped';
            nextStatus = 'ENTREGADO';
        } else if (estadoDB === 'ENTREGADO' || estadoDB === 'DELIVERED') {
            statusClass = 'delivered';
        }

        // Botón de acción dinámico
        let actionHtml = '';
        if (statusClass === 'pending') {
            actionHtml = `<button 
                class="btn-update" 
                onclick="updateOrderStatus(${orderId}, '${nextStatus}')">
                MARCAR ENVIADO
            </button>`;
        } else if (statusClass === 'shipped') {
            actionHtml = `<button 
                class="btn-update" 
                onclick="updateOrderStatus(${orderId}, '${nextStatus}')">
                MARCAR ENTREGADO
            </button>`;
        } else {
            actionHtml = `<span style="color:green; font-weight:bold;">✓ ENTREGADO</span>`;
        }

        const div = document.createElement('div');
        div.className = 'shipment-item';
        div.dataset.status = statusClass;
        div.style.display = 'flex'; 

        div.innerHTML = `
            <div class="shipment-main">
                <div class="shipment-product">
                    <img src="${DEFAULT_IMAGE}" alt="Pedido" class="shipment-image" onerror="this.src='${DEFAULT_IMAGE}'">
                    <div class="product-details">
                        <h3 class="product-name">Pedido #${orderId}</h3>
                        <p class="product-description">Fecha: ${new Date(order.fecha).toLocaleDateString()}</p>
                        <div class="product-quantity">Total: <strong>$${order.total}</strong></div>
                    </div>
                </div>
                
                <div class="shipment-info">
                    <h4 class="customer-name">${order.nombreUsuario}</h4>
                    <p class="shipping-address">
                        ${order.direccionCompleta} <br>
                        <strong>Tel:</strong> ${order.telefono || 'N/A'}
                    </p>
                </div>
            </div>
            
            <div class="shipment-actions">
                ${actionHtml}
            </div>
        `;

        container.appendChild(div);
    });
    
    // **IMPORTANTE**: Exponer la función al scope global para que los onclick la vean
    window.updateOrderStatus = updateOrderStatus;
}


async function updateOrderStatus(orderId, newStatus) {
    if (!confirm(`¿Estás seguro de cambiar el estado del Pedido #${orderId} a ${newStatus}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT', // Usamos PUT para actualizar
            headers: {
                'Content-Type': 'application/json',
                // Si usas tokens de autenticación, añádelos aquí
            },
            body: JSON.stringify({ estado: newStatus })
        });

        if (!response.ok) {
            // Intenta leer el cuerpo del error si es JSON
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // No es JSON, usa el statusText
            }
            throw new Error(`Error al actualizar estado: ${errorMessage}`);
        }

        alert(`Estado del Pedido #${orderId} actualizado a ${newStatus} correctamente.`);
        
        // Recargar pedidos para que la lista se refresque y el pedido se mueva de pestaña
        await loadOrders(); 

    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        alert(`Fallo en la actualización: ${error.message}`);
    }
}


function filterShipments(status) {
    const items = document.querySelectorAll('.shipment-item');
    let count = 0;
    
    items.forEach(item => {
        if (item.dataset.status === status) {
            item.style.display = 'flex';
            count++;
        } else {
            item.style.display = 'none';
        }
    });

    const container = document.getElementById('shipmentsList');
    // Remover mensaje "vacío" anterior si existe
    const msg = document.getElementById('msg-empty');
    if (msg) msg.remove();

    if (count === 0) {
        const p = document.createElement('p');
        p.id = 'msg-empty';
        p.textContent = 'No hay pedidos en esta categoría.';
        p.style.textAlign = 'center';
        p.style.width = '100%';
        p.style.padding = '20px';
        container.appendChild(p);
    }
}