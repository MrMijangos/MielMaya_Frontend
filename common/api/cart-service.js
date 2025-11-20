import apiClient from './api-client.js';

class CartService {
    // ✅ CORRECCIÓN: Enviar el ID del usuario logueado
    async getCartItems() {
        try {
            // 1. Obtener usuario del LocalStorage
            const userString = localStorage.getItem('usuario');
            let userId = 3; // Default de seguridad

            if (userString) {
                const user = JSON.parse(userString);
                // Intentamos obtener el ID de varias formas posibles
                userId = user.idUsuario || user.id_usuario || user.ID_Usuario || user.id || 3;
            }

            console.log(`🛒 Consultando carrito para Usuario ID: ${userId}`);
            
            // 2. Enviarlo en la petición GET
            const items = await apiClient.get(`/api/cart/items?idUsuario=${userId}`);
            
            console.log('✅ Items recibidos:', items);
            return { success: true, data: items };
        } catch (error) {
            console.error('❌ Error al obtener carrito:', error);
            return { success: false, error: error.message };
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            // 1. Obtener usuario
            const userString = localStorage.getItem('usuario');
            let userId = 3; 

            if (userString) {
                const user = JSON.parse(userString);
                userId = user.idUsuario || user.id_usuario || user.id || 3;
            }

            console.log(`🛒 Agregando al carrito. User: ${userId}, Prod: ${productId}, Cant: ${quantity}`);
            
            const requestBody = {
                idUsuario: parseInt(userId),
                idProducto: parseInt(productId),
                cantidad: parseInt(quantity)
            };
            
            // Nota: Tu backend devuelve 204 (No Content), así que 'item' será undefined o null, es normal.
            await apiClient.post('/api/cart/items', requestBody);
            
            console.log('✅ Agregado con éxito');
            return { success: true };
        } catch (error) {
            console.error('❌ Error en addToCart:', error);
            return { success: false, error: error.message };
        }
    }

    async removeFromCart(detalleId) {
        try {
            console.log('🗑️ Eliminando detalle ID:', detalleId);
            
            // Asegurar que sea número
            if(!detalleId || isNaN(detalleId)) throw new Error("ID inválido");

            await apiClient.delete(`/api/cart/items/${detalleId}`);
            console.log('✅ Eliminado con éxito');
            return { success: true };
        } catch (error) {
            console.error('❌ Error en removeFromCart:', error);
            return { success: false, error: error.message };
        }
    }

  async updateCartItem(productId, newQuantity, currentQuantity) {
        try {
            // Calculamos la diferencia porque el backend SUMA
            // Si tengo 5 y quiero 6, diferencia es +1
            // Si tengo 5 y quiero 4, diferencia es -1
            const difference = newQuantity - currentQuantity;
            
            if (difference === 0) return { success: true };

            console.log(`✏️ Actualizando: Actual=${currentQuantity}, Nuevo=${newQuantity}, Dif=${difference}`);

            // Reutilizamos addToCart que ya maneja la suma en el backend
            return await this.addToCart(productId, difference);
        } catch (error) {
            console.error('❌ Error en updateCartItem:', error);
            return { success: false, error: error.message };
        }
    }

    async clearCart() {
        try {
            const userString = localStorage.getItem('usuario');
            let userId = 3;
            if (userString) {
                const user = JSON.parse(userString);
                userId = user.idUsuario || user.id || 3;
            }

            console.log('🧹 Vaciando carrito de usuario:', userId);
            await apiClient.delete(`/api/cart/clear?idUsuario=${userId}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error en clearCart:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new CartService();