// common/api/cart-service.js
import apiClient from './api-client.js';

class CartService {
    async getCartItems() {
        try {
            console.log('🛒 getCartItems - Obteniendo items del carrito');
            const items = await apiClient.get('/api/cart/items');
            console.log('✅ getCartItems - Éxito:', items);
            return { success: true, data: items };
        } catch (error) {
            console.error('❌ getCartItems - Error:', error);
            return { success: false, error: error.message };
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            console.log('🛒 addToCart - Iniciando - Producto:', productId, 'Cantidad:', quantity);
            
            // ✅ CORREGIDO: Verificar que productId sea un número válido
            const parsedProductId = parseInt(productId);
            if (isNaN(parsedProductId)) {
                throw new Error('ID de producto inválido: ' + productId);
            }
            
            // ✅ CORREGIDO: Asegurar que quantity sea un número
            const parsedQuantity = parseInt(quantity);
            if (isNaN(parsedQuantity)) {
                throw new Error('Cantidad inválida: ' + quantity);
            }
            
            // ✅ DEBUG: Mostrar datos que se enviarán
            const requestBody = {
                idUsuario: 3,
                idProducto: parsedProductId,
                cantidad: parsedQuantity
            };
            
            console.log('📤 Request Body:', requestBody);
            console.log('🔍 Tipos - idUsuario:', typeof requestBody.idUsuario, 
                        'idProducto:', typeof requestBody.idProducto, 
                        'cantidad:', typeof requestBody.cantidad);
            
            const item = await apiClient.post('/api/cart/items', requestBody);
            
            console.log('✅ addToCart - Éxito:', item);
            return { success: true, data: item };
        } catch (error) {
            console.error('❌ addToCart - Error:', error);
            return { success: false, error: error.message };
        }
    }

    async removeFromCart(productId) {
        try {
            console.log('🗑️ removeFromCart - Producto:', productId);
            await apiClient.delete(`/api/cart/items/${productId}`);
            console.log('✅ removeFromCart - Éxito');
            return { success: true };
        } catch (error) {
            console.error('❌ removeFromCart - Error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateCartItem(productId, quantity) {
        try {
            console.log('✏️ updateCartItem - Producto:', productId, 'Nueva cantidad:', quantity);
            // Para simplificar, usamos remove + add
            if (quantity <= 0) {
                return await this.removeFromCart(productId);
            } else {
                // Primero removemos y luego agregamos con la nueva cantidad
                await this.removeFromCart(productId);
                return await this.addToCart(productId, quantity);
            }
        } catch (error) {
            console.error('❌ updateCartItem - Error:', error);
            return { success: false, error: error.message };
        }
    }

    async clearCart() {
        try {
            console.log('🧹 clearCart - Limpiando carrito');
            await apiClient.delete('/api/cart/clear');
            console.log('✅ clearCart - Éxito');
            return { success: true };
        } catch (error) {
            console.error('❌ clearCart - Error:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new CartService();