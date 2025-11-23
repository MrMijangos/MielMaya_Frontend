import orderService from '../common/api/order-service.js';
import authService from '../services/auth-service.js';

function toggleOrderMenu(button) {
    const dropdown = button.closest('.order-status-section').querySelector('.order-dropdown');
    const allDropdowns = document.querySelectorAll('.order-dropdown');
    
    allDropdowns.forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('active');
        }
    });
    
    dropdown.classList.toggle('active');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.order-status-section')) {
        document.querySelectorAll('.order-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.repurchase-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const orderItem = btn.closest('.order-item');
            const productName = orderItem.querySelector('.order-product-name').textContent;
            alert(`Agregando "${productName}" al carrito...`);
            window.location.href = '/index.html';
        });
    });
    
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
                const orderItem = btn.closest('.order-item');
                orderItem.style.opacity = '0.5';
                alert('Pedido cancelado exitosamente');
            }
        }); 
    }); 
    
    async function loadUserOrders() {
        const ordersList = document.getElementById('ordersList');
        if (!ordersList) return;
        const userId = authService.getUserId();
        if (!userId) {
            ordersList.innerHTML = '<p class="empty-msg">Debes iniciar sesión para ver tus pedidos.</p>';
            return;
        }
        try {
            const result = await orderService.getUserOrders(userId);
            let ordersArr = [];
            if (Array.isArray(result)) {
                ordersArr = result;
            } else if (result && Array.isArray(result.data)) {
                ordersArr = result.data;
            }
            if (ordersArr.length === 0) {
                ordersList.innerHTML = '<p class="empty-msg">No tienes pedidos realizados.</p>';
                return;
            }
            ordersList.innerHTML = ordersArr.map(order => `
                <div class="order-item">
                    <div class="order-main">
                        <div class="order-image">
                            <img src="${order.imagen || '/images/productosmiel'}" alt="${order.nombreProducto || 'Producto'}">
                        </div>
                        <div class="order-info">
                            <h3 class="order-product-name">${order.nombreProducto || 'Producto'}</h3>
                            <p class="order-description">${order.descripcion || ''}</p>
                            <div class="order-quantity">Cant: <strong>${order.cantidad || 1}</strong></div>
                        </div>
                    </div>
                    <div class="order-status-section">
                        <div class="order-status ${order.estado || 'in-process'}">
                            <span class="status-text">${order.estadoTexto || order.estado || 'EN PROCESO'}</span>
                            <button class="order-menu-btn" onclick="toggleOrderMenu(this)">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="order-dropdown">
                            <button class="order-action-btn repurchase-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                VOLVER A COMPRAR
                            </button>
                            <button class="order-action-btn cancel-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            ordersList.innerHTML = '<p class="empty-msg">Error al cargar tus pedidos.</p>';
        }
    }
    
    loadUserOrders();
});