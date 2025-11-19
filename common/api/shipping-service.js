// common/api/shipping-service.js
import apiClient from './api-client.js';

class ShippingService {
    async getAllAddresses() {
        try {
            const addresses = await apiClient.get('/shipping');
            return { success: true, data: addresses };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async addAddress(addressData) {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            const address = await apiClient.post('/shipping', {
                id_user: userData.id_user,
                calle: addressData.calle,
                num: addressData.num,
                ext: addressData.ext,
                codigo_postal: addressData.codigo_postal,
                colonia: addressData.colonia,
                estado: addressData.estado,
                municipio: addressData.municipio,
                celular: addressData.celular
            });
            
            return { success: true, data: address };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteAddress(id) {
        try {
            await apiClient.delete(`/shipping/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new ShippingService();