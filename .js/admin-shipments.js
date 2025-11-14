// Gestión de tabs
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const shipments = document.querySelectorAll('.shipment-item');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover active de todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Agregar active al tab clickeado
            tab.classList.add('active');
            
            // Filtrar envíos
            const status = tab.dataset.status;
            filterShipments(status);
        });
    });
});

function filterShipments(status) {
    const shipments = document.querySelectorAll('.shipment-item');
    
    shipments.forEach(shipment => {
        if (shipment.dataset.status === status) {
            shipment.style.display = 'flex';
        } else {
            shipment.style.display = 'none';
        }
    });
}

function updateShipment(button, newStatus) {
    const shipmentItem = button.closest('.shipment-item');
    const currentStatus = shipmentItem.dataset.status;
    
    let statusText = '';
    switch(newStatus) {
        case 'shipped':
            statusText = 'enviado';
            break;
        case 'delivered':
            statusText = 'entregado';
            break;
    }
    
    if (confirm(`¿Estás seguro de marcar este pedido como ${statusText}?`)) {
        // Actualizar el estado
        shipmentItem.dataset.status = newStatus;
        
        // Animación de salida
        shipmentItem.style.opacity = '0';
        shipmentItem.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            shipmentItem.style.display = 'none';
            
            // Mostrar notificación
            showNotification(`Pedido actualizado a ${statusText}`);
            
            // Aquí harías la petición al servidor
            // updateShipmentStatus(shipmentId, newStatus);
        }, 300);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        padding: 16px 28px;
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        font-size: 14px;
        font-weight: bold;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

