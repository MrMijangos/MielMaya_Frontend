import productService from '../common/api/product-service.js';
import cartService from '../common/api/cart-service.js';
import authService from '../services/auth-service.js';
import reviewService from '../common/api/review-service.js';

const DEFAULT_IMAGE = '/images/productosmiel';

function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    if (type === 'error') notification.style.background = 'linear-gradient(135deg, #e53935 0%, #c62828 100%)';
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

class UserSidebar {
    constructor() {
        this.init();
        this.loadUserData();
    }

    async loadUserData() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = userData.nombre.toUpperCase();
            }
        }
    }

    init() {
        this.userButton = document.querySelector('.user-btn');
        this.userSidebar = document.getElementById('userSidebar');
        this.userOverlay = document.getElementById('userOverlay');
        this.closeUserBtn = document.getElementById('closeUserBtn');
        this.menuItems = document.querySelectorAll('.user-menu-item');
        
        this.userButton?.addEventListener('click', () => this.openSidebar());
        this.closeUserBtn?.addEventListener('click', () => this.closeSidebar());
        this.userOverlay?.addEventListener('click', () => this.closeSidebar());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.userSidebar?.classList.contains('active')) {
                this.closeSidebar();
            }
        });
        
        this.menuItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleMenuClick(e));
        });
    }

    openSidebar() {
        this.userSidebar?.classList.add('active');
        this.userOverlay?.classList.add('active');
        this.userSidebar?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.userSidebar?.classList.remove('active');
        this.userOverlay?.classList.remove('active');
        this.userSidebar?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    handleMenuClick(e) {
        const section = e.currentTarget.dataset.section;
        this.menuItems.forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.closeSidebar();
        
        switch(section) {
            case 'orders':
                window.location.href = '/html/orders.html';
                break;
            case 'reviews':
                window.location.href = '/html/my-reviews.html';
                break;
            case 'payment':
                window.location.href = '/html/mycards.html';
                break;
            case 'addresses':
                window.location.href = '/html/addresses.html';
                break;
            default:
                break;
        }
        
        if (e.currentTarget.classList.contains('logout-btn')) {
            this.logout();
        }
    }

    async logout() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            await authService.logout();
            showNotification('Sesión cerrada exitosamente');
            setTimeout(() => {
                window.location.href = '/html/login.html';
            }, 1000);
        }
    }
}

class ShoppingCart {
    constructor() {
        this.items = [];
        this.init();
        this.loadCart();
    }

    init() {
        this.cartButton = document.getElementById('cartButton');
        this.cartSidebar = document.getElementById('cartSidebar');
        this.cartOverlay = document.getElementById('cartOverlay');
        this.closeCartBtn = document.getElementById('closeCartBtn');
        this.cartItemsContainer = document.getElementById('cartItems');
        this.cartCount = document.getElementById('cartCount');
        this.cartTotal = document.getElementById('cartTotal');

        this.cartButton?.addEventListener('click', () => this.openCart());
        this.closeCartBtn?.addEventListener('click', () => this.closeCart());
        this.cartOverlay?.addEventListener('click', () => this.closeCart());

        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-cart')) {
                this.addToCart(e);
            }
        });
    }

    openCart() {
        this.cartSidebar?.classList.add('active');
        this.cartOverlay?.classList.add('active');
        this.cartSidebar?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this.cartSidebar?.classList.remove('active');
        this.cartOverlay?.classList.remove('active');
        this.cartSidebar?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    async addToCart(e) {
        if (!authService.isAuthenticated()) {
            showNotification('Debes iniciar sesión', 'error');
            return;
        }

        const button = e.target;
        const productId = parseInt(button.dataset.id);

        if (isNaN(productId)) {
            console.error("ID inválido en botón:", button);
            return;
        }

        const originalText = button.textContent;
        button.style.transform = 'scale(0.95)';
        button.disabled = true;
        button.textContent = '...';

        try {
            const result = await cartService.addToCart(productId, 1);
            if (result.success) {
                await this.loadCart();
                showNotification('Agregado');
                this.openCart();
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            showNotification('Error de conexión', 'error');
        } finally {
            button.style.transform = 'scale(1)';
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    async removeFromCart(cartItemId) {
        try {
            const result = await cartService.removeFromCart(cartItemId);
            if (result.success) {
                await this.loadCart();
                showNotification('Producto eliminado');
            }
        } catch (error) {
            showNotification('Error al eliminar', 'error');
        }
    }

    async updateQuantity(productId, newQuantity) {
        const item = this.items.find(i => i.productId === productId);
        const currentQuantity = item ? item.quantity : 0;

        try {
            const result = await cartService.updateCartItem(productId, newQuantity, currentQuantity);
            if (result.success) {
                await this.loadCart();
            }
        } catch (error) {
            showNotification('Error al actualizar', 'error');
        }
    }

    async loadCart() {
        if (!authService.isAuthenticated()) {
            this.items = [];
            this.renderCart();
            return;
        }

        try {
            const result = await cartService.getCartItems();
            
            if (result.success) {
                this.items = await Promise.all(
                    result.data.map(async (item) => {
                        const prodId = item.id_producto || item.ID_Producto || item.idProducto;
                        const detalleId = item.ID_Detalle || item.id_detalle || item.idDetalle;

                        const productResult = await productService.getProductById(prodId);
                        const productData = productResult.data || {};
                        const imgSrc = productData.imagen_base64 || productData.imagen || DEFAULT_IMAGE;
                        
                        return {
                            cartItemId: detalleId, 
                            productId: prodId,
                            name: productData.nombre || 'Producto',
                            price: parseFloat(productData.precio || 0),
                            image: imgSrc,
                            quantity: item.cantidad || 1
                        };
                    })
                );
                
                this.renderCart();
                this.updateCartCount();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    renderCart() {
        if (!this.cartItemsContainer) return;

        if (this.items.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <p>Tu carrito está vacío</p>
                </div>`;
        } else {
            this.cartItemsContainer.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='${DEFAULT_IMAGE}'">
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="qty-btn minus" data-product-id="${item.productId}" data-quantity="${item.quantity}">−</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn plus" data-product-id="${item.productId}" data-quantity="${item.quantity}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-cart-id="${item.cartItemId}" title="Eliminar">✕</button>
                </div>
            `).join('');

            this.attachCartEventListeners();
        }
        this.updateTotal();
    }

    attachCartEventListeners() {
        this.cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.productId);
                const qty = parseInt(e.target.dataset.quantity);
                const isPlus = e.target.classList.contains('plus');
                
                if (!isPlus && qty <= 1) {
                     const cartItem = e.target.closest('.cart-item');
                     const removeId = parseInt(cartItem.querySelector('.cart-item-remove').dataset.cartId);
                     if(confirm('¿Eliminar?')) this.removeFromCart(removeId);
                } else {
                    this.updateQuantity(id, isPlus ? qty + 1 : qty - 1);
                }
            });
        });

        this.cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.cartId);
                if(confirm('¿Eliminar?')) this.removeFromCart(id);
            });
        });
    }

    updateCartCount() {
        if (!this.cartCount) return;
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        if (totalItems > 0) this.cartCount.classList.add('active');
        else this.cartCount.classList.remove('active');
    }

    updateTotal() {
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (this.cartTotal) this.cartTotal.textContent = `$${total.toFixed(2)}`;
    }
}

async function loadAllProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    try {
        const result = await productService.getAllProducts();
        if (result.success && result.data.length > 0) {
            const limitedProducts = result.data.slice(0, 3);
            
            productsGrid.innerHTML = limitedProducts.map(product => {
                const id = product.idProducto || product.id_producto || product.ID_Producto || product.id;
                const imgSrc = product.imagen || product.imagen_base64 || DEFAULT_IMAGE;
                
                if (!id) console.error("Producto sin ID:", product);

                return `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${imgSrc}" alt="${product.nombre}" onerror="this.src='${DEFAULT_IMAGE}'">
                        </div>
                        <h3 class="product-name">${product.nombre}</h3>
                        <p class="product-price">$${Number(product.precio).toFixed(2)}</p>
                        <button class="btn-add-cart" data-id="${id}">AÑADIR AL CARRITO</button>
                    </div>
                `;
            }).join('');
        } else {
            productsGrid.innerHTML = '<p class="empty-msg">No hay productos disponibles.</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p class="empty-msg">Error al cargar productos.</p>';
    }
}

function setupReviewButton() {
    const addReviewBtn = document.querySelector('.btn-add-review');
    
    if (addReviewBtn) {
        addReviewBtn.addEventListener('click', () => {
            if (!authService.isAuthenticated()) {
                showNotification('Debes iniciar sesión para agregar una reseña', 'error');
                setTimeout(() => {
                    window.location.href = '/html/login.html';
                }, 1500);
                return;
            }
            
            window.location.href = '/html/agregar-resena.html';
        });
    }
}

async function loadReviews() {
    const reviewsGrid = document.querySelector('.reviews-grid');
    if (!reviewsGrid) return;

    let products = [];
    try {
        const result = await productService.getAllProducts();
        if (result.success && result.data.length > 0) {
            products = result.data.slice(0, 3);
        }
    } catch (error) {
        console.error('Error obteniendo productos para reseñas:', error);
    }

    let allReviews = [];
    for (const product of products) {
        const productId = product.idProducto || product.id_producto || product.ID_Producto || product.id;
        try {
            const res = await reviewService.getProductReviews(productId);
            let reviewsArr = [];
            if (Array.isArray(res)) {
                reviewsArr = res;
            } else if (res && Array.isArray(res.data)) {
                reviewsArr = res.data;
            }
            reviewsArr.forEach(r => r.nombreProducto = product.nombre);
            allReviews.push(...reviewsArr);
        } catch (error) {
            console.warn('Error obteniendo reseñas del producto', productId, error);
        }
    }

    const limitedReviews = allReviews.slice(0, 6);
    if (limitedReviews.length === 0) {
        reviewsGrid.innerHTML = '<p class="empty-msg">No hay reseñas disponibles.</p>';
        return;
    }

    function formatDate(fecha) {
        if (!fecha) return '';
        if (typeof fecha === 'number') {
            const d = new Date(fecha * 1000);
            return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        if (typeof fecha === 'string') {
            const parts = fecha.split(' ');
            if (parts.length === 2) {
                const [datePart, timePart] = parts;
                const [year, month, day] = datePart.split('-');
                const [hour, min, sec] = timePart.split(':');
                const d = new Date(year, month - 1, day, hour, min, sec);
                return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
            }
        }
        return fecha;
    }

    reviewsGrid.innerHTML = limitedReviews.map(review => {
        const nombre = `Usuario #${review.idUsuario || ''}`;
        const comentario = review.comentario || '';
        const calificacion = review.calificacion || '';
        const fecha = formatDate(review.fecha);
        const producto = review.nombreProducto || review.idProducto || '';
        return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">
                    <img src="/images/perfil.png" alt="" class="review-avatar">
                </div>
                <div class="review-info">
                    <h4 class="review-name">${nombre}</h4>
                    <p class="review-text">${comentario}</p>
                </div>
            </div>
            <div class="review-footer">
                <span class="review-label">${calificacion ? `Calificación: ${calificacion}/5` : ''}</span>
                <span class="review-label">${producto ? `Producto: ${producto}` : ''}</span>
                <span class="review-label">${fecha ? `Fecha: ${fecha}` : ''}</span>
            </div>
        </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user && (user.rol === 2 || user.rol === 'admin')) {
            window.location.href = '/html/admin-products.html';
            return;
        }
        await authService.getCurrentUser();
        window.userSidebar = new UserSidebar();
    }

    await loadAllProducts();
    await loadReviews();
    window.cart = new ShoppingCart();
    
    document.querySelector('.btn-checkout')?.addEventListener('click', () => {
        if (window.cart && window.cart.items.length > 0) {
            window.location.href = '/html/checkout.html';
        } else {
            alert('Tu carrito está vacío');
        }
    });

    setupReviewButton();
});