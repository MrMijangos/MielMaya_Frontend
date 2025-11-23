import apiClient from './api-client.js';

class ShippingService {
    
    async getAllShipments() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const userId = userData?.id_user || userData?.id || userData?.idUsuario;
            if (!userId) throw new Error("Usuario no identificado");

            const shipments = await apiClient.get(`/api/shipping-address?idUsuario=${userId}`);
            return { success: true, data: shipments };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async addShippingMethod(data) {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const userId = userData?.id_user || userData?.id || userData?.idUsuario;

            if (!userId) throw new Error("Usuario no identificado");

            // Armar el objeto para el backend de Java
            const shipment = await apiClient.post('/api/shipping-address', {
                idUsuario: userId,
                calle: data.calle,
                colonia: data.colonia,
                codigoPostal: data.codigoPostal,
                ciudad: data.ciudad,
                estado: data.estado
            });
            
            return { success: true, data: shipment };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ✅ NUEVO MÉTODO PARA ELIMINAR DIRECCIÓN
    async deleteAddress(addressId) {
        try {
            if (!addressId) throw new Error("ID de dirección no válido");
            
            console.log('🗑️ Eliminando dirección ID:', addressId);
            
            await apiClient.delete(`/api/shipping-address/${addressId}`);
            
            return { success: true };
        } catch (error) {
            console.error('Error eliminando dirección:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new ShippingService();