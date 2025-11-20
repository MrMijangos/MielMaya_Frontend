import shippingService from '../common/api/shipping-service.js';
import orderService from '../common/api/order-service.js'; 
import authService from '../services/auth-service.js';
import cartService from '../common/api/cart-service.js';
import productService from '../common/api/product-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verificar Sesión
    if (!authService.isAuthenticated()) {
        window.location.href = '/html/login.html';
        return;
    }

    loadCartTotal();
    await loadAddresses();

    // Evento para finalizar compra
    document.getElementById('btnProceedToPayment')?.addEventListener('click', handleFinalizeOrder);
});

function loadCartTotal() {
    const total = localStorage.getItem('cartTotal') || '0.00';
    const totalElement = document.getElementById('shippingTotal');
    if (totalElement) {
        totalElement.textContent = `$${total}`;
    }
}

async function loadAddresses() {
    const container = document.getElementById('addressesList');
    
    const loadingMsg = document.getElementById('loadingMessage');
    if (loadingMsg) loadingMsg.remove();

    try {
        const result = await shippingService.getAllShipments();
        
        // 🔍 DIAGNÓSTICO: Ver qué está llegando realmente
        console.log('🔍 RESPUESTA COMPLETA de direcciones:', JSON.stringify(result, null, 2));
        
        container.innerHTML = '';

        if (result.success && result.data.length > 0) {
            const direcciones = result.data.reverse(); 
            
            console.log('📍 Direcciones procesadas:');
            direcciones.forEach((addr, index) => {
                const idReal = addr.idDireccion || addr.idEnvio || addr.ID_Direccion;
                console.log(`  ${index + 1}. ID: ${idReal}, Calle: ${addr.calle}, Ciudad: ${addr.ciudad}`);
                
                const html = createAddressCard(addr, index === 0);
                container.appendChild(html);
            });
        } else {
            const emptyMsg = document.createElement('div');
            emptyMsg.innerHTML = `<p style="text-align:center; padding:20px; color: #666;">No tienes direcciones guardadas.</p>`;
            container.appendChild(emptyMsg);
        }

        // Botón agregar dirección (igual que antes)
        const btnAdd = document.createElement('button');
        btnAdd.className = 'btn-add-address';
        btnAdd.id = 'btnAddAddress';
        btnAdd.style.cssText = 'margin-top: 15px; width: 100%; padding: 15px; cursor: pointer; background-color: #f4f4f4; border: 2px dashed #ccc; border-radius: 8px; font-weight: bold; color: #555;';
        btnAdd.innerHTML = '<span style="font-size: 1.2em; margin-right: 5px;">+</span> AGREGAR NUEVA DIRECCIÓN';
        
        btnAdd.addEventListener('click', () => {
            window.location.href = '/html/add-shipping.html';
        });

        container.appendChild(btnAdd);

    } catch (error) {
        console.error("Error al cargar direcciones:", error);
        container.innerHTML = `<p style="color:red; text-align:center;">Error al cargar direcciones</p>`;
    }
}
function createAddressCard(addr, isFirst) {
    // EXTRAER EL ID CON MÁS OPCIONES
    const idReal = addr.ID_Direccion || addr.idDireccion || addr.id_direccion || addr.idEnvio || addr.id || addr.ID;
    
    console.log('📍 Creando tarjeta de dirección:', {
        datosCompletos: addr,
        idExtraido: idReal,
        tipoId: typeof idReal
    });

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
                CP: ${addr.codigoPostal}
            </p>
            <!-- MOSTRAR EL ID PARA DEBUG -->
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
        console.log('📍 Dirección seleccionada - ID:', idReal);
    });

    return div;
}
// FUNCIONES AUXILIARES QUE FALTABAN
function getCurrentUserId() {
    try {
        const userString = localStorage.getItem('usuario');
        if (userString) {
            const user = JSON.parse(userString);
            return user.idUsuario || user.id_usuario || user.id || 3;
        }
    } catch (e) { 
        console.error('Error obteniendo usuario:', e);
    }
    return 3; // Default fallback
}

function getCartTotal() {
    return parseFloat(localStorage.getItem('cartTotal') || '0');
}


// FUNCIÓN PARA VERIFICAR SI LA DIRECCIÓN EXISTE
async function verifyAddressExists(addressId) {
    try {
        console.log(`🔍 Verificando si existe dirección ID: ${addressId}`);
        
        const addresses = await shippingService.getAllShipments();
        const addressExists = addresses.data.some(addr => {
            const id = addr.ID_Direccion || addr.idDireccion || addr.id_direccion || addr.idEnvio || addr.id;
            return parseInt(id) === parseInt(addressId);
        });
        
        console.log(`✅ Dirección ID ${addressId} existe en la respuesta: ${addressExists}`);
        
        if (!addressExists) {
            console.log('❌ Direcciones disponibles:', addresses.data.map(addr => ({
                id: addr.ID_Direccion || addr.idDireccion || addr.id_direccion || addr.idEnvio || addr.id,
                calle: addr.calle
            })));
        }
        
        return addressExists;
        
    } catch (error) {
        console.error('Error verificando dirección:', error);
        return false;
    }
}
async function getCartProducts() {
    try {
        const cartResult = await cartService.getCartItems();
        if (cartResult.success) {
            return cartResult.data;
        }
        return [];
    } catch (error) {
        console.error('Error obteniendo productos del carrito:', error);
        return [];
    }
}
async function handleFinalizeOrder() {
    const btn = document.getElementById('btnProceedToPayment');
    
    if (!btn) {
        console.error('Botón de finalizar compra no encontrado');
        return;
    }

    // 1. Validaciones básicas
    const selectedAddress = document.querySelector('input[name="shipping-address"]:checked');
    if (!selectedAddress) {
        alert("Por favor selecciona una dirección de envío.");
        return;
    }

    const addressId = parseInt(selectedAddress.value);
    console.log('📍 ID de dirección seleccionado del radio button:', addressId);

    const paymentId = localStorage.getItem('selectedPaymentMethod') || localStorage.getItem('selectedPaymentId');
    if (!paymentId) {
        alert("Error: No se seleccionó método de pago. Vuelve atrás.");
        return;
    }

    console.log('🔄 Iniciando proceso de orden...');
    
    btn.textContent = "PROCESANDO...";
    btn.disabled = true;

    try {
        // ✅ NUEVA VALIDACIÓN: Verificar que la dirección existe
        const addressExists = await verifyAddressExists(addressId);
        if (!addressExists) {
            throw new Error(`La dirección seleccionada (ID: ${addressId}) no existe en el sistema. Por favor selecciona una dirección válida.`);
        }

        console.log('✅ ID de dirección validado:', addressId);

        // 2. Obtener productos del carrito
        console.log("Consultando items del carrito...");
        const cartItems = await getCartProducts();
        
        if (!cartItems || cartItems.length === 0) {
            throw new Error("Tu carrito está vacío.");
        }

        console.log('📦 Productos en carrito:', cartItems);

        // 3. ✅ ACTUALIZACIÓN DE STOCK (Restar cantidad)
        console.log("Actualizando inventario...");
        for (const item of cartItems) {
            const prodId = item.id_producto || item.idProducto || item.ID_Producto;
            const cantidad = item.cantidad || item.quantity || 1;
            
            if (!prodId) {
                console.warn('Producto sin ID válido:', item);
                continue;
            }

            // Obtener info actual del producto
            const productRes = await productService.getProductById(prodId);
            
            if (productRes.success) {
                const producto = productRes.data;
                const nuevoStock = (producto.stock || 0) - cantidad;

                if (nuevoStock < 0) {
                    throw new Error(`No hay suficiente stock para: ${producto.nombre}. Stock disponible: ${producto.stock}, solicitado: ${cantidad}`);
                }

                console.log(`🔄 Actualizando stock producto ${prodId}: ${producto.stock} -> ${nuevoStock}`);
                
                // Actualizar producto en BD
                await productService.updateProduct(prodId, {
                    ...producto, 
                    stock: nuevoStock
                });
            } else {
                throw new Error(`No se pudo obtener información del producto ID: ${prodId}`);
            }
        }

        // 4. Preparar datos de la orden
        const orderData = {
            idUsuario: getCurrentUserId(),
            idMetodoPago: parseInt(paymentId),
            idDireccion: addressId,
            total: getCartTotal(),
            fecha: new Date().toISOString().split('T')[0],
            estado: "COMPLETADA",
            detalles: cartItems 
        };

        console.log("📤 Enviando Orden Final:", orderData);

        // 5. Crear la orden
        const result = await orderService.createOrder(orderData);

        if (result.success) {
            console.log('✅ Pedido creado exitosamente:', result);
            
            // 6. Limpiar todo
            if (cartService.clearCart) {
                await cartService.clearCart();
            }
            
            localStorage.removeItem('cartTotal');
            localStorage.removeItem('selectedPaymentMethod');
            localStorage.removeItem('selectedPaymentId');
            localStorage.removeItem('selectedShippingAddress');

            alert("¡Compra realizada con éxito! Gracias por tu preferencia.");
            window.location.href = '/index.html';
        } else {
            throw new Error(result.error || "Error desconocido al crear la orden.");
        }

    } catch (error) {
        console.error('❌ Error en handleFinalizeOrder:', error);
        alert("Hubo un problema: " + error.message);
        
        // Revertir el botón a su estado normal
        btn.textContent = "FINALIZAR COMPRA";
        btn.disabled = false;
    }

}