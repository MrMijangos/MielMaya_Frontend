import apiClient from './api-client.js';

class CartService {
    async getCartItems() {
        try {
            const userString = localStorage.getItem('usuario');
            let userId = 3; 

            if (userString) {
                const user = JSON.parse(userString);
                userId = user.idUsuario || user.id_usuario || user.ID_Usuario || user.id || 3;
            }

            console.log(` Consultando carrito para Usuario ID: ${userId}`);
            
            const items = await apiClient.get(`/api/cart/items?idUsuario=${userId}`);
            
            console.log(' Items recibidos:', items);
            return { success: true, data: items };
        } catch (error) {
            console.error(' Error al obtener carrito:', error);
            return { success: false, error: error.message };
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
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
            
            await apiClient.post('/api/cart/items', requestBody);
            
            console.log('Agregado con éxito');
            return { success: true };
        } catch (error) {
            console.error('Error en addToCart:', error);
            return { success: false, error: error.message };
        }
    }

    async removeFromCart(detalleId) {
        try {
            console.log('Eliminando detalle ID:', detalleId);
            
            // Asegurar que sea número
            if(!detalleId || isNaN(detalleId)) throw new Error("ID inválido");

            await apiClient.delete(`/api/cart/items/${detalleId}`);
            console.log('Eliminado con éxito');
            return { success: true };
        } catch (error) {
            console.error(' Error en removeFromCart:', error);
            return { success: false, error: error.message };
        }
    }

  async updateCartItem(productId, newQuantity, currentQuantity) {
        try {
            const difference = newQuantity - currentQuantity;
            
            if (difference === 0) return { success: true };

            console.log(`Actualizando: Actual=${currentQuantity}, Nuevo=${newQuantity}, Dif=${difference}`);

            return await this.addToCart(productId, difference);
        } catch (error) {
            console.error('Error en updateCartItem:', error);
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

            console.log('Vaciando carrito de usuario:', userId);
            await apiClient.delete(`/api/cart/clear?idUsuario=${userId}`);
            return { success: true };
        } catch (error) {
            console.error('Error en clearCart:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new CartService();