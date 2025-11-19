// common/api/cart-service.js
import apiClient from './api-client.js';

class CartService {
    async getCartItems() {
        try {
            const items = await apiClient.get('/cart');
            return { success: true, data: items };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            // Obtener id_user del usuario logueado
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            const item = await apiClient.post('/cart', {
                id_user: userData.id_user,
                id_producto: productId,
                cantidad: quantity
            });
            
            return { success: true, data: item };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateCartItem(id, quantity) {
        try {
            const item = await apiClient.put(`/cart/${id}`, {
                cantidad: quantity
            });
            return { success: true, data: item };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async removeFromCart(id) {
        try {
            await apiClient.delete(`/cart/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async clearCart() {
        try {
            const items = await this.getCartItems();
            if (items.success) {
                await Promise.all(
                    items.data.map(item => this.removeFromCart(item.id_carrito))
                );
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new CartService();