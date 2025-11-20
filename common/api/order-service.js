import apiClient from './api-client.js';

class OrderService {
    // Crear la orden (El backend debería encargarse de descontar stock aquí)
    async createOrder(orderData) {
        try {
            // POST /api/orders
            const response = await apiClient.post('/api/orders', orderData);
            return { success: true, data: response };
        } catch (error) {
            console.error("Error creando orden:", error);
            return { success: false, error: error.message };
        }
    }

    // Obtener todas las órdenes de un usuario
    async getUserOrders(userId) {
        try {
            // GET /api/orders?userId=...
            const response = await apiClient.get(`/api/orders?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Error obteniendo órdenes del usuario:", error);
            return { success: false, error: error.message };
        }
    }
}

export default new OrderService();