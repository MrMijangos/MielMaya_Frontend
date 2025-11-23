import shippingService from '../common/api/shipping-service.js';
import authService from '../services/auth-service.js';
import navigationContext from '../common/utils/navigation-context.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    navigationContext.setContext(
        navigationContext.CONTEXTS.USER_PROFILE,
        '/html/addresses.html'
    );

    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }
    
    await loadAddresses();
});

async function loadAddresses() {
    const container = document.getElementById('addressesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    try {
        const result = await shippingService.getAllShipments();
        console.log('Respuesta completa de direcciones:', JSON.stringify(result, null, 2));
        
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            const direcciones = result.data.reverse();
            
            direcciones.forEach((addr, index) => {
                const card = createAddressCard(addr, index === 0);
                container.appendChild(card);
            });
        } else {
            const emptyMsg = document.createElement('div');
            emptyMsg.innerHTML = `<p style="text-align:center; padding:20px; color: #666;">No tienes direcciones guardadas.</p>`;
            container.appendChild(emptyMsg);
        }
        
        let btnAdd = document.getElementById('btnAddAddress');
        if (!btnAdd) {
            btnAdd = document.createElement('button');
            btnAdd.className = 'btn-add-address';
            btnAdd.id = 'btnAddAddress';
            btnAdd.style.cssText = 'margin-top: 15px; width: 100%; padding: 15px; cursor: pointer; background-color: #f4f4f4; border: 2px dashed #ccc; border-radius: 8px; font-weight: bold; color: #555;';
            btnAdd.innerHTML = '<span style="font-size: 1.2em; margin-right: 5px;">+</span> AGREGAR NUEVA DIRECCIÓN';
            
            btnAdd.addEventListener('click', () => {
                navigationContext.setContext(
                    navigationContext.CONTEXTS.USER_PROFILE,
                    '/html/addresses.html'
                );
                window.location.href = '/html/add-shipping.html';
            });
            
            container.appendChild(btnAdd);
        }
    } catch (error) {
        console.error("Error al cargar direcciones:", error);
        container.innerHTML = `<p style="color:red; text-align:center;">Error al cargar direcciones</p>`;
    }
}

function createAddressCard(addr, isFirst) {
    const idReal = addr.ID_Direccion || addr.idDireccion || addr.id_direccion || addr.idEnvio || addr.id || addr.ID;
    
    const div = document.createElement('div');
    div.className = 'address-card';
    div.style.cssText = `
        border: 1px solid #ddd; 
        padding: 15px; 
        margin-bottom: 10px; 
        border-radius: 8px; 
        display: flex; 
        align-items: center; 
        cursor: pointer; 
        background: #fff; 
        transition: all 0.2s;
    `;
    
    div.innerHTML = `
        <div style="flex-grow:1;">
            <p class="address-street" style="font-weight:bold; margin:0 0 5px 0; font-size: 1.1em;">
                ${addr.calle} ${addr.colonia ? ', ' + addr.colonia : ''}
            </p>
            <p class="address-details" style="margin:0; color:#555;">
                ${addr.ciudad}, ${addr.estado}
            </p>
            <p class="address-zip" style="margin:5px 0 0 0; font-size:0.9em; color: #777;">
                CP: ${addr.codigoPostal || addr.codigo_postal || ''}
            </p>
            <p class="address-id" style="margin:2px 0 0 0; font-size:0.8em; color: #999;">
                ID: ${idReal}
            </p>
        </div>
        
        <button class="btn-delete-address" data-id="${idReal}" style="background: #e53935; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9em; margin-left: 10px;" title="Eliminar dirección">
            Eliminar
        </button>
    `;
    
    div.onmouseover = () => div.style.borderColor = '#f4b41a';
    div.onmouseout = () => div.style.borderColor = '#ddd';
    
    const deleteBtn = div.querySelector('.btn-delete-address');
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const addressId = e.target.dataset.id;
        
        if (confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
            try {
                showNotification('Dirección eliminada correctamente', 'success');
                await loadAddresses();
            } catch (error) {
                showNotification('Error al eliminar dirección', 'error');
            }
        }
    });
    
    return div;
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
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function createAddressCard(addr, isFirst) {
    const idReal = addr.ID_Direccion || addr.idDireccion || addr.id_direccion || addr.idEnvio || addr.id || addr.ID;
    
    const div = document.createElement('div');
    div.className = 'address-card';
    div.style.cssText = `
        border: 1px solid #ddd; 
        padding: 15px; 
        margin-bottom: 10px; 
        border-radius: 8px; 
        display: flex; 
        align-items: center; 
        cursor: pointer; 
        background: #fff; 
        transition: all 0.2s;
    `;
    
    div.innerHTML = `
        <div style="flex-grow:1;">
            <p class="address-street" style="font-weight:bold; margin:0 0 5px 0; font-size: 1.1em;">
                ${addr.calle} ${addr.colonia ? ', ' + addr.colonia : ''}
            </p>
            <p class="address-details" style="margin:0; color:#555;">
                ${addr.ciudad}, ${addr.estado}
            </p>
            <p class="address-zip" style="margin:5px 0 0 0; font-size:0.9em; color: #777;">
                CP: ${addr.codigoPostal || addr.codigo_postal || ''}
            </p>
            <p class="address-id" style="margin:2px 0 0 0; font-size:0.8em; color: #999;">
                ID: ${idReal}
            </p>
        </div>
        
        <button class="btn-delete-address" data-id="${idReal}" style="background: #e53935; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9em; margin-left: 10px;" title="Eliminar dirección">
            Eliminar
        </button>
    `;
    
    div.onmouseover = () => div.style.borderColor = '#f4b41a';
    div.onmouseout = () => div.style.borderColor = '#ddd';
    
    const deleteBtn = div.querySelector('.btn-delete-address');
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const addressId = e.target.dataset.id;
        
        if (confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
            try {
                showNotification('Dirección eliminada correctamente', 'success');
                await loadAddresses();
            } catch (error) {
                showNotification('Error al eliminar dirección', 'error');
            }
        }
    });
    
    return div;
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
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}