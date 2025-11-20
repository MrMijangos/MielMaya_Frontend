import APIClient from './api-client.js';
import authService from '../../services/auth-service.js';


class ReviewService {
    async addReview(reviewData) {
        try {
            // Obtener el ID del usuario actual
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

            console.log('📤 Enviando reseña:', reviewWithUser);
            
            // Usar el helper .post para enviar JSON correctamente
            const response = await APIClient.post('/api/comments', reviewWithUser);
            return response;
        } catch (error) {
            console.error('Error agregando reseña:', error);
            return { success: false, error: error.message };
        }
    }

    async getMyReviews() {
        try {
            // Como no tienes endpoint para "mis reseñas", simulamos obteniendo todas
            // y filtrando por el usuario actual (esto es temporal)
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Usuario no autenticado' };
            }

            // Obtener todos los productos primero para mostrar nombres
            const productsResponse = await APIClient.get('/api/products');
            const products = productsResponse.success ? productsResponse.data : [];

            // Obtener todas las reseñas (esto no es óptimo, idealmente tendrías un endpoint para mis reseñas)
            const allReviews = [];
            
            // Para cada producto, obtener sus reseñas y filtrar por usuario
            for (const product of products.slice(0, 10)) { // Limitar a 10 productos por performance
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
            // Nota: Necesitarías agregar un endpoint DELETE en tu backend
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
}

export default new ReviewService();