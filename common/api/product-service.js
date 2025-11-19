// common/api/product-service.js
import apiClient from './api-client.js';

class ProductService {
    async getAllProducts() {
        try {
            const products = await apiClient.get('/products');
            return { success: true, data: products };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getProductById(id) {
        try {
            const product = await apiClient.get(`/products/${id}`);
            return { success: true, data: product };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createProduct(productData) {
        try {
            const product = await apiClient.post('/products', productData);
            return { success: true, data: product };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateProduct(id, productData) {
        try {
            const product = await apiClient.put(`/products/${id}`, productData);
            return { success: true, data: product };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteProduct(id) {
        try {
            await apiClient.delete(`/products/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new ProductService();