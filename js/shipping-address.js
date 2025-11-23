import shippingService from '../common/api/shipping-service.js';
import orderService from '../common/api/order-service.js'; 
import authService from '../services/auth-service.js';
import cartService from '../common/api/cart-service.js';
import productService from '../common/api/product-service.js';
import navigationContext from '../common/utils/navigation-context.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (!navigationContext.isCheckoutFlow()) {
        window.location.href = '/html/checkout.html';
        return;
    }

    if (!authService.isAuthenticated()) {
        window.location.href = '/html/login.html';
        return;
    }

    loadCartTotal();
    await loadAddresses();
    document.getElementById('btnProceedToPayment')?.addEventListener('click', handleFinalizeOrder);
});

function loadCartTotal() {
    const total = localStorage.getItem('cartTotal') || '0.00';
    const totalElement = document.getElementById('shippingTotal');
    if (totalElement) totalElement.textContent = `$${total}`;
}

async function loadAddresses() {
    const container = document.getElementById('addressesList');
    const loadingMsg = document.getElementById('loadingMessage');
    if (loadingMsg) loadingMsg.remove();

    try {
        const result = await shippingService.getAllShipments();
        container.innerHTML = '';

        if (result.success && result.data.length > 0) {
            result.data.reverse().forEach((addr, index) => {
                container.appendChild(createAddressCard(addr, index === 0));
            });
        } else {
            container.innerHTML = '<p style="text-align:center; padding:20px; color: #666;">No tienes direcciones guardadas.</p>';
        }

        const btnAdd = document.createElement('button');
        btnAdd.className = 'btn-add-address';
        btnAdd.style.cssText = 'margin-top: 15px; width: 100%; padding: 15px; cursor: pointer; background-color: #f4f4f4; border: 2px dashed #ccc; border-radius: 8px; font-weight: bold; color: #555;';
        btnAdd.innerHTML = '<span style="font-size: 1.2em; margin-right: 5px;">+</span> AGREGAR NUEVA DIRECCIÓN';
        btnAdd.addEventListener('click', () => {
            navigationContext.setContext(navigationContext.CONTEXTS.CHECKOUT, '/html/shipping-address.html');
            window.location.href = '/html/add-shipping.html';
        });
        container.appendChild(btnAdd);

    } catch (error) {
        container.innerHTML = '<p style="color:red; text-align:center;">Error al cargar direcciones</p>';
    }
}

function createAddressCard(addr, isFirst) {
    const idReal = addr.ID_Direccion || addr.idDireccion || addr.id_direccion || addr.idEnvio || addr.id || addr.ID;
    const div = document.createElement('div');
    div.className = 'address-card';
    div.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; align-items: center; cursor: pointer; background: #fff; transition: all 0.2s;';
    
    div.innerHTML = `
        <div style="flex-grow:1;">
            <p style="font-weight:bold; margin:0 0 5px 0; font-size: 1.1em;">
                ${addr.calle} ${addr.colonia ? ', ' + addr.colonia : ''}
            </p>
            <p style="margin:0; color:#555;">${addr.ciudad}, ${addr.estado}</p>
            <p style="margin:5px 0 0 0; font-size:0.9em; color: #777;">CP: ${addr.codigoPostal}</p>
        </div>
        <input type="radio" name="shipping-address" value="${idReal}" ${isFirst ? 'checked' : ''} style="transform:scale(1.5); margin-left: 10px;">
    `;

    div.onmouseover = () => div.style.borderColor = '#f4b41a';
    div.onmouseout = () => div.style.borderColor = '#ddd';
    div.addEventListener('click', () => div.querySelector('input[type="radio"]').checked = true);
    return div;
}

function getCurrentUserId() {
    try {
        const userString = localStorage.getItem('usuario');
        if (userString) {
            const user = JSON.parse(userString);
            return user.idUsuario || user.id_usuario || user.id || 3;
        }
    } catch (e) { }
    return 3;
}

function getCartTotal() {
    return parseFloat(localStorage.getItem('cartTotal') || '0');
}

async function verifyAddressExists(addressId) {
    try {
        const addresses = await shippingService.getAllShipments();
        return addresses.data.some(addr => {
            const id = addr.ID_Direccion || addr.idDireccion || addr.id_direccion || addr.idEnvio || addr.id;
            return parseInt(id) === parseInt(addressId);
        });
    } catch (error) {
        return false;
    }
}

async function getCartProducts() {
    try {
        const cartResult = await cartService.getCartItems();
        return cartResult.success ? cartResult.data : [];
    } catch (error) {
        return [];
    }
}

async function handleFinalizeOrder() {
    const btn = document.getElementById('btnProceedToPayment');
    if (!btn) return;

    const selectedAddress = document.querySelector('input[name="shipping-address"]:checked');
    if (!selectedAddress) {
        alert("Por favor selecciona una dirección de envío.");
        return;
    }

    const addressId = parseInt(selectedAddress.value);
    const paymentId = localStorage.getItem('selectedPaymentMethod') || localStorage.getItem('selectedPaymentId');
    
    if (!paymentId) {
        alert("Error: No se seleccionó método de pago.");
        return;
    }

    btn.textContent = "PROCESANDO...";
    btn.disabled = true;

    try {
        if (!await verifyAddressExists(addressId)) {
            throw new Error('La dirección seleccionada no existe.');
        }

        const cartItems = await getCartProducts();
        if (!cartItems || cartItems.length === 0) {
            throw new Error("Tu carrito está vacío.");
        }

        for (const item of cartItems) {
            const prodId = item.id_producto || item.idProducto || item.ID_Producto;
            const cantidad = item.cantidad || item.quantity || 1;
            if (!prodId) continue;

            const productRes = await productService.getProductById(prodId);
            if (productRes.success) {
                const producto = productRes.data;
                const nuevoStock = (producto.stock || 0) - cantidad;
                if (nuevoStock < 0) throw new Error(`Stock insuficiente para: ${producto.nombre}`);
                await productService.updateProduct(prodId, { ...producto, stock: nuevoStock });
            }
        }

        const orderData = {
            idUsuario: getCurrentUserId(),
            idMetodoPago: parseInt(paymentId),
            idDireccion: addressId,
            total: getCartTotal(),
            fecha: new Date().toISOString().split('T')[0],
            estado: "COMPLETADA",
            detalles: cartItems 
        };

        const result = await orderService.createOrder(orderData);
        if (result.success) {
            if (cartService.clearCart) await cartService.clearCart();
            localStorage.removeItem('cartTotal');
            localStorage.removeItem('selectedPaymentMethod');
            localStorage.removeItem('selectedPaymentId');
            localStorage.removeItem('selectedShippingAddress');
            navigationContext.clear();
            alert("¡Compra realizada con éxito!");
            window.location.href = '/index.html';
        } else {
            throw new Error(result.error || "Error al crear la orden.");
        }
    } catch (error) {
        alert("Hubo un problema: " + error.message);
        btn.textContent = "FINALIZAR COMPRA";
        btn.disabled = false;
    }
}   