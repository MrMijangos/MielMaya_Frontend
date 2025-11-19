// common/api/comment-service.js
import apiClient from './api-client.js';

class CommentService {
    async getAllComments() {
        try {
            const comments = await apiClient.get('/comments');
            return { success: true, data: comments };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createComment(commentData) {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            const comment = await apiClient.post('/comments', {
                descripcion: commentData.descripcion,
                id_user: userData.id_user,
                calificacion: commentData.calificacion
            });
            
            return { success: true, data: comment };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteComment(id) {
        try {
            await apiClient.delete(`/comments/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new CommentService();