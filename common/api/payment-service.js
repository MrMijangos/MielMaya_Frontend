// common/api/payment-service.js
import apiClient from './api-client.js';

class PaymentService {
    async getAllPaymentMethods() {
        try {
            const payments = await apiClient.get('/payments');
            return { success: true, data: payments };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async addPaymentMethod(paymentData) {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            const payment = await apiClient.post('/payments', {
                id_user: userData.id_user,
                nombre_tarjeta: paymentData.nombre_tarjeta,
                num_tarjeta: paymentData.num_tarjeta,
                fecha_expiracion: paymentData.fecha_expiracion,
                CVV: paymentData.CVV
            });
            
            return { success: true, data: payment };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deletePaymentMethod(id) {
        try {
            await apiClient.delete(`/payments/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new PaymentService();