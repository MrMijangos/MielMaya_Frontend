// js/common/api/product-service.js

const API_BASE_URL = 'http://54.152.16.222:7000/api';

const productService = {
    async getAllProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error cargando productos:', error);
            return { success: false, error: 'Error de conexión' };
        }
    },
    
    async getProductById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`);
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    },
    
    async createProduct(productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error creando producto:', error);
            return { success: false, error: 'Error de conexión' };
        }
    },
    
    async updateProduct(id, productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            // ✅ CORRECCIÓN IMPORTANTE PARA JAVA JAVALIN:
            // Tu backend devuelve status 204 (No Content) al actualizar.
            // Si intentamos hacer response.json() en un 204, dará error.
            if (response.status === 204) {
                return { success: true };
            }

            // Si devuelve datos (por si acaso cambia el backend)
            const data = await response.json();
            return { success: response.ok, data };

        } catch (error) {
            // Si el error es de parseo JSON pero el status fue ok, lo contamos como éxito
            console.error('Error actualizando producto:', error);
            return { success: false, error: 'Error de conexión' };
        }
    },
    
    async deleteProduct(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE'
            });
            if (response.status === 204) return { success: true };
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }
};

export default productService;