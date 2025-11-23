import apiClient from './api-client.js';

class OrderService {
    async createOrder(orderData) {
        try {
            const response = await apiClient.post('/api/orders', orderData);
            return { success: true, data: response };
        } catch (error) {
            console.error("Error creando orden:", error);
            return { success: false, error: error.message };
        }
    }

    async getUserOrders(userId) {
        try {
            const response = await apiClient.get(`/api/orders?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Error obteniendo órdenes del usuario:", error);
            return { success: false, error: error.message };
        }
    }
}

export default new OrderService();