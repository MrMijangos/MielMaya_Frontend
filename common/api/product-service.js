// js/common/api/product-service.js

const API_BASE_URL = 'http://localhost:7000/api';

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

          
            if (response.status === 204) {
                return { success: true };
            }

            const data = await response.json();
            return { success: response.ok, data };

        } catch (error) {
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