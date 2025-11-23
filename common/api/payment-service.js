import apiClient from './api-client.js';

class PaymentService {
    

async getAllPaymentMethods() {
    try {
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        
        const userId = userData?.id_user || userData?.id || userData?.idUsuario || userData?.ID_Usuario;

        if (!userId) {
            console.warn("No hay usuario logueado, no se pueden cargar métodos de pago.");
            return { success: false, error: "Usuario no identificado" };
        }

        const payments = await apiClient.get(`/api/payments?idUsuario=${userId}`);
        
        return { success: true, data: payments };
    } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
        return { success: false, error: error.message };
    }
}

    async addPaymentMethod(paymentData) {
        try {
            const userDataString = localStorage.getItem('userData');
            const userData = userDataString ? JSON.parse(userDataString) : null;
            
            console.log("Datos del usuario en LocalStorage:", userData);

            const userId = userData?.id_user || userData?.id || userData?.idUsuario || userData?.ID_Usuario;

            if (!userId) {
                throw new Error("Usuario no identificado: No se encontró el ID en localStorage");
            }

            const detallesString = `Tarjeta terminada en ${paymentData.num_tarjeta.slice(-4)} | Exp: ${paymentData.fecha_expiracion} | Titular: ${paymentData.nombre_tarjeta}`;

            console.log("Enviando ID de usuario:", userId); 

            const payment = await apiClient.post('/api/payments', {
                idUsuario: userId,   
                tipo: "Tarjeta",
                detalles: detallesString
            });
            
            return { success: true, data: payment };
        } catch (error) {
            console.error("Error en PaymentService:", error);
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