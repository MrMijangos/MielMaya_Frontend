import authService from '../../services/auth-service.js';
import reviewService from '../../common/api/review-service.js';

class ReviewAdmin {
    constructor() {
        this.reviews = [];
        this.init();
    }

    async init() {
        if (!authService.isAuthenticated()) {
            window.location.href = '/html/login.html';
            return;
        }
        await this.loadReviews();
    }

    async loadReviews() {
        try {
            const result = await reviewService.getMyReviews();
            if (result.success) {
                this.reviews = result.data || [];
                this.renderReviews();
                this.updateStats();
            } else {
                this.showNotification(result.error || 'Error al cargar reseñas', 'error');
            }
        } catch (error) {
            console.error('Error cargando reseñas:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    renderReviews() {
        const grid = document.getElementById('reviewsGrid');
        
        if (this.reviews.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>No tienes reseñas aún</h3>
                    <p>Comparte tu experiencia con nuestros productos</p>
                    <a href="/html/agregar-resena.html" class="btn-view-all">
                        Agregar Primera Reseña
                    </a>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.reviews.map(review => `
            <div class="review-card" data-review-id="${review.ID_Resena || review.idResena}">
                <div class="review-header">
                    <div>
                        <div class="review-product">${review.nombreProducto || 'Producto'}</div>
                        <div class="review-rating">${this.generateStars(review.Calificacion || review.calificacion)}</div>
                    </div>
                    <div class="review-actions">
                        <button class="btn-action btn-delete" onclick="reviewAdmin.deleteReview(${review.ID_Resena || review.idResena})">
                            Eliminar
                        </button>
                    </div>
                </div>
                <div class="review-comment">${review.Comentario || review.comentario}</div>
                <div class="review-meta">
                    <span>Publicado el ${this.formatDate(review.Fecha || review.fecha)}</span>
                </div>
            </div>
        `).join('');
    }

    generateStars(rating) {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Fecha no disponible';
        }
    }

    updateStats() {
        document.getElementById('totalReviews').textContent = this.reviews.length;
        
        if (this.reviews.length > 0) {
            const totalRating = this.reviews.reduce((sum, review) => 
                sum + (review.Calificacion || review.calificacion), 0);
            const average = totalRating / this.reviews.length;
            document.getElementById('averageRating').textContent = average.toFixed(1);
        } else {
            document.getElementById('averageRating').textContent = '0';
        }
    }

    async deleteReview(reviewId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
            return;
        }

        try {
            const result = await reviewService.deleteReview(reviewId);
            if (result.success) {
                this.showNotification('Reseña eliminada exitosamente', 'success');
                await this.loadReviews(); // Recargar la lista
            } else {
                this.showNotification(result.error || 'Error al eliminar reseña', 'error');
            }
        } catch (error) {
            console.error('Error eliminando reseña:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            min-width: 250px;
            max-width: 400px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.reviewAdmin = new ReviewAdmin();
});