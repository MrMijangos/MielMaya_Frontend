const API_BASE_URL = 'http://localhost:7000/api';
import APIClient from './api-client.js';
import authService from '../../services/auth-service.js';


class ReviewService {
    async addReview(reviewData) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const reviewWithUser = {
                idProducto: reviewData.idProducto,
                idUsuario: user.idUsuario || user.ID_Usuario,
                calificacion: reviewData.calificacion,
                comentario: reviewData.comentario
            };

            console.log('Enviando reseña:', reviewWithUser);
            
            const response = await APIClient.post('/api/comments', reviewWithUser);
            return response;
        } catch (error) {
            console.error('Error agregando reseña:', error);
            return { success: false, error: error.message };
        }
    }

    async getMyReviews() {
        try {
          
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Usuario no autenticado' };
            }

            const productsResponse = await APIClient.get('/api/products');
            const products = productsResponse.success ? productsResponse.data : [];

            const allReviews = [];
            
            for (const product of products.slice(0, 10)) { 
                try {
                    const productId = product.idProducto || product.ID_Producto || product.id;
                    const reviewsResponse = await APIClient.get(`/api/comments/${productId}`);
                    
                    if (reviewsResponse.success && reviewsResponse.data) {
                        const myReviews = reviewsResponse.data.filter(review => 
                            review.ID_Usuario === user.idUsuario || review.idUsuario === user.idUsuario
                        );
                        
                        myReviews.forEach(review => {
                            review.nombreProducto = product.nombre;
                        });
                        
                        allReviews.push(...myReviews);
                    }
                } catch (error) {
                    console.warn(`Error obteniendo reseñas del producto:`, error);
                }
            }

            return { success: true, data: allReviews };
            
        } catch (error) {
            console.error('Error obteniendo reseñas:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteReview(reviewId) {
        try {
            console.log('Eliminar reseña no implementado - ID:', reviewId);
            return { success: false, error: 'Funcionalidad no implementada en el backend' };
        } catch (error) {
            console.error('Error eliminando reseña:', error);
            return { success: false, error: error.message };
        }
    }

    async getProductReviews(productId) {
        try {
            const response = await APIClient.get(`/api/comments/${productId}`);
            return response;
        } catch (error) {
            console.error('Error obteniendo reseñas del producto:', error);
            return { success: false, error: error.message };
        }
    }
    async getAllReviews() {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews`);
        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Error obteniendo todas las reseñas:', error);
        return { success: false, error: 'Error de conexión' };
    }
}
}



export default new ReviewService();