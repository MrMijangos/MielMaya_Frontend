import shippingService from '../common/api/shipping-service.js';
import authService from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
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
        console.log('🔍 RESPUESTA COMPLETA de direcciones:', JSON.stringify(result, null, 2));
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
        // Botón agregar dirección
        let btnAdd = document.getElementById('btnAddAddress');
        if (!btnAdd) {
            btnAdd = document.createElement('button');
            btnAdd.className = 'btn-add-address';
            btnAdd.id = 'btnAddAddress';
            btnAdd.style.cssText = 'margin-top: 15px; width: 100%; padding: 15px; cursor: pointer; background-color: #f4f4f4; border: 2px dashed #ccc; border-radius: 8px; font-weight: bold; color: #555;';
            btnAdd.innerHTML = '<span style="font-size: 1.2em; margin-right: 5px;">+</span> AGREGAR NUEVA DIRECCIÓN';
            btnAdd.addEventListener('click', () => {
                window.location.href = '/html/add-shipping.html';
            });
            container.appendChild(btnAdd);
        }
    } catch (error) {
        console.error("Error al cargar direcciones:", error);
        container.innerHTML = `<p style="color:red; text-align:center;">Error al cargar direcciones</p>`;
        // Botón agregar dirección en error
        let btnAdd = document.getElementById('btnAddAddress');
        if (!btnAdd) {
            btnAdd = document.createElement('button');
            btnAdd.className = 'btn-add-address';
            btnAdd.id = 'btnAddAddress';
            btnAdd.style.cssText = 'margin-top: 15px; width: 100%; padding: 15px; cursor: pointer; background-color: #f4f4f4; border: 2px dashed #ccc; border-radius: 8px; font-weight: bold; color: #555;';
            btnAdd.innerHTML = '<span style="font-size: 1.2em; margin-right: 5px;">+</span> AGREGAR NUEVA DIRECCIÓN';
            btnAdd.addEventListener('click', () => {
                window.location.href = '/html/add-shipping.html';
            });
            container.appendChild(btnAdd);
        }
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
        <input type="radio" name="shipping-address" value="${idReal}" ${isFirst ? 'checked' : ''} style="transform:scale(1.5); margin-left: 10px;">
    `;
    div.onmouseover = () => div.style.borderColor = '#f4b41a';
    div.onmouseout = () => div.style.borderColor = '#ddd';
    div.addEventListener('click', () => { 
        const radio = div.querySelector('input[type="radio"]');
        radio.checked = true; 
    });
    return div;
}
