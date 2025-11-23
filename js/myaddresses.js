import shippingService from '../common/api/shipping-service.js';
import authService from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('myaddresses.js cargado correctamente');

    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }
    
    await loadAddresses();
});

async function loadAddresses() {
    const container = document.getElementById('addressesContainer');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:40px;"><p>Cargando...</p></div>';

    try {
        const result = await shippingService.getAllShipments();
        
        console.log('Direcciones recibidas:', result);

        container.innerHTML = '';

        if (!result.success || !result.data || result.data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </div>
                    <h3>No tienes direcciones guardadas</h3>
                    <p>Agrega una dirección para facilitar tus compras</p>
                </div>
            `;
            
            const btnAdd = createAddButton();
            container.appendChild(btnAdd);
            return;
        }

        const addresses = result.data.reverse();

        addresses.forEach((addr, index) => {
            const addressElement = createAddressElement(addr, index + 1);
            container.appendChild(addressElement);
        });

        const btnAdd = createAddButton();
        container.appendChild(btnAdd);

    } catch (error) {
        console.error('Error cargando direcciones:', error);
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:#f44336;">
                <p style="margin-bottom:10px;">Error al cargar tus direcciones</p>
                <p style="font-size:14px; color:#999;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:10px 24px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">REINTENTAR</button>
            </div>
        `;
        
        const btnAdd = createAddButton();
        container.appendChild(btnAdd);
    }
}

function createAddressElement(addr, number) {
    const addressId = addr.ID_Direccion || addr.idDireccion || addr.id_direccion || addr.idEnvio || addr.id || addr.ID;
    
    console.log('Creando dirección #' + number + ':', {
        id: addressId,
        calle: addr.calle,
        ciudad: addr.ciudad
    });

    const div = document.createElement('div');
    div.className = 'address-card-item';
    
    div.innerHTML = `
        <div class="address-info-content">
            <div class="address-street-text">
                <span class="address-icon"></span>
                <span>Dirección #${number}</span>
            </div>
            <div class="address-details-text">
                <strong>${addr.calle}</strong>
                ${addr.colonia ? ', ' + addr.colonia : ''}
            </div>
            <div class="address-details-text">
                ${addr.ciudad}, ${addr.estado}
            </div>
            <div class="address-details-text">
                CP: ${addr.codigoPostal || addr.codigo_postal || 'N/A'}
            </div>
           
        </div>
        <button class="btn-delete-address" onclick="deleteAddress(${addressId}, '${addr.calle.replace(/'/g, "\\'")}')">
            Eliminar
        </button>
    `;
    
    return div;
}

function createAddButton() {
    const btn = document.createElement('button');
    btn.className = 'btn-add-address';
    btn.innerHTML = '<span class="plus-icon">+</span> AGREGAR NUEVA DIRECCIÓN';
    btn.addEventListener('click', () => {
        window.location.href = '/html/add-shipping.html';
    });
    return btn;
}

window.deleteAddress = async function(addressId, calle) {
    if (!confirm('¿Estás seguro de eliminar la dirección:\n"' + calle + '"?')) {
        return;
    }

    try {
        console.log('Eliminando dirección ID:', addressId);
        
        if (!addressId || addressId === 'undefined' || addressId === 'null') {
            throw new Error('ID de dirección inválido');
        }

        const response = await fetch('http://localhost/api/shipping-address/' + addressId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar la dirección');
        }

        showNotification('Dirección eliminada exitosamente', 'success');
        await loadAddresses();

    } catch (error) {
        console.error('Error eliminando dirección:', error);
        showNotification('Error al eliminar la dirección: ' + error.message, 'error');
    }
}

function showNotification(message, type = 'info') {
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