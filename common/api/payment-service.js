import apiClient from './api-client.js';

class PaymentService {
    
   // En common/api/payment-service.js

async getAllPaymentMethods() {
    try {
        // 1. Obtener datos del usuario
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        
        // 2. Extraer el ID (igual que hicimos en addPaymentMethod)
        const userId = userData?.id_user || userData?.id || userData?.idUsuario || userData?.ID_Usuario;

        if (!userId) {
            console.warn("No hay usuario logueado, no se pueden cargar métodos de pago.");
            return { success: false, error: "Usuario no identificado" };
        }

        // 3. CORRECCIÓN: Enviar el idUsuario como parámetro en la URL
        // Fíjate en el signo de interrogación (?) y el userId
        const payments = await apiClient.get(`/api/payments?idUsuario=${userId}`);
        
        return { success: true, data: payments };
    } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
        return { success: false, error: error.message };
    }
}

    async addPaymentMethod(paymentData) {
        try {
            // 1. Leemos los datos del navegador
            const userDataString = localStorage.getItem('userData');
            const userData = userDataString ? JSON.parse(userDataString) : null;
            
            // --- DEBUG: ESTO TE MOSTRARÁ EN CONSOLA QUÉ TIENES GUARDADO ---
            console.log("Datos del usuario en LocalStorage:", userData);

            // 2. Buscamos el ID con diferentes nombres posibles para evitar errores
            const userId = userData?.id_user || userData?.id || userData?.idUsuario || userData?.ID_Usuario;

            // 3. Si no encontramos ningún ID, lanzamos el error
            if (!userId) {
                throw new Error("Usuario no identificado: No se encontró el ID en localStorage");
            }

            // 4. Preparamos el string de detalles
            const detallesString = `Tarjeta terminada en ${paymentData.num_tarjeta.slice(-4)} | Exp: ${paymentData.fecha_expiracion} | Titular: ${paymentData.nombre_tarjeta}`;

            console.log("Enviando ID de usuario:", userId); // Debug

            // 5. Enviamos al Backend
            const payment = await apiClient.post('/api/payments', {
                idUsuario: userId,   // Usamos la variable userId que encontramos
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