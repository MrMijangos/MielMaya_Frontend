// .js/productos.js - Crear este archivo si no existe
import { initUserSidebar } from '../common/header/header.js';
import productService from '../common/api/product-service.js';
import cartService from '../common/api/cart-service.js';
import authService from '../common/api/auth-service.js';

// Usar la misma clase ShoppingCart de principal.js
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

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cartSidebar?.classList.contains('active')) {
                this.closeCart();
            }
        });

        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => this.addToCart(e));
        });
    }

    openCart() {
        this.cartSidebar?.classList.add('active');
        this.cartOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this.cartSidebar?.classList.remove('active');
        this.cartOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    async addToCart(e) {
        if (!authService.isAuthenticated()) {
            this.showNotification('Debes iniciar sesión para agregar productos', 'error');
            setTimeout(() => {
                window.location.href = '/html/login.html';
            }, 1500);
            return;
        }

        const button = e.target;
        const productId = button.dataset.id;

        button.style.transform = 'scale(0.95)';
        button.disabled = true;
        button.textContent = 'AGREGANDO...';

        try {
            const result = await cartService.addToCart(parseInt(productId), 1);

            if (result.success) {
                await this.loadCart();
                this.showNotification('✓ Producto agregado al carrito');
            } else {
                this.showNotification(result.error || 'Error al agregar producto', 'error');
            }
        } catch (error) {
            this.showNotification('Error de conexión', 'error');
        } finally {
            button.style.transform = 'scale(1)';
            button.disabled = false;
            button.textContent = 'AÑADIR AL CARRITO';
        }
    }

    async removeFromCart(cartItemId) {
        try {
            const result = await cartService.removeFromCart(cartItemId);
            if (result.success) {
                await this.loadCart();
                this.showNotification('Producto eliminado', 'error');
            }
        } catch (error) {
            this.showNotification('Error al eliminar producto', 'error');
        }
    }

    async updateQuantity(cartItemId, newQuantity) {
        if (newQuantity <= 0) {
            await this.removeFromCart(cartItemId);
            return;
        }

        try {
            const result = await cartService.updateCartItem(cartItemId, newQuantity);
            if (result.success) {
                await this.loadCart();
            }
        } catch (error) {
            this.showNotification('Error al actualizar cantidad', 'error');
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
                        const productResult = await productService.getProductById(item.id_producto);
                        return {
                            id_carrito: item.id_carrito,
                            id: item.id_producto,
                            name: productResult.data.nombre,
                            price: productResult.data.precio,
                            image: productResult.data.imagen_base64 || '/images/productosmiel',
                            quantity: item.cantidad
                        };
                    })
                );
                
                this.renderCart();
                this.updateCartCount();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
            this.renderCart();
        }
    }

    renderCart() {
        if (this.items.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <p>Tu carrito está vacío<br><small style="color: #999; font-size: 14px;">Agrega productos para comenzar</small></p>
                </div>
            `;
        } else {
            this.cartItemsContainer.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="qty-btn minus" data-cart-id="${item.id_carrito}" data-quantity="${item.quantity}">−</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn plus" data-cart-id="${item.id_carrito}" data-quantity="${item.quantity}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-cart-id="${item.id_carrito}" title="Eliminar producto">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `).join('');

            this.cartItemsContainer.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cartId = parseInt(e.target.dataset.cartId);
                    const currentQty = parseInt(e.target.dataset.quantity);
                    this.updateQuantity(cartId, currentQty - 1);
                });
            });

            this.cartItemsContainer.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cartId = parseInt(e.target.dataset.cartId);
                    const currentQty = parseInt(e.target.dataset.quantity);
                    this.updateQuantity(cartId, currentQty + 1);
                });
            });

            this.cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const button = e.currentTarget;
                    const cartId = parseInt(button.dataset.cartId);
                    this.removeFromCart(cartId);
                });
            });
        }

        this.updateTotal();
    }

    updateCartCount() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
            this.cartCount.classList.add('active');
        } else {
            this.cartCount.classList.remove('active');
        }
    }

    updateTotal() {
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    showNotification(message, type = 'success') {
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        
        if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #e53935 0%, #c62828 100%)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }
}

// Cargar TODOS los productos
async function loadAllProducts() {
    const productsGrid = document.querySelector('.products-grid');
    
    if (!productsGrid) return;

    try {
        const result = await productService.getAllProducts();

        if (result.success && result.data.length > 0) {
            productsGrid.innerHTML = result.data.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imagen_base64 || '/images/productosmiel'}" alt="${product.nombre}">
                    </div>
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-price">$${product.precio.toFixed(2)}</p>
                    <button class="btn-add-cart" 
                            data-id="${product.id_producto}" 
                            data-name="${product.nombre}" 
                            data-price="${product.precio}" 
                            data-image="${product.imagen_base64 || '/images/productosmiel'}">
                        AÑADIR AL CARRITO
                    </button>
                </div>
            `).join('');

            // Re-asignar event listeners
            productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
                btn.addEventListener('click', (e) => window.cart.addToCart(e));
            });
        } else {
            productsGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No hay productos disponibles</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #e53935;">Error al cargar productos</p>';
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (authService.isAuthenticated()) {
        await authService.getCurrentUser();
    }

    // Cargar TODOS los productos
    await loadAllProducts();

    // Inicializar carrito
    window.cart = new ShoppingCart();
    
    // Inicializar sidebar de usuario
    window.userSidebar = initUserSidebar();
    
    // Event listener para el botón de checkout
    document.querySelector('.btn-checkout')?.addEventListener('click', () => {
        if (window.cart.items.length > 0) {
            window.location.href = '/html/checkout.html';
        } else {
            alert('Tu carrito está vacío');
        }
    });
});