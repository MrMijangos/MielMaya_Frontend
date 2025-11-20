import { initUserSidebar } from '../common/header/header.js';
import productService from '../common/api/product-service.js';
import cartService from '../common/api/cart-service.js';
import authService from '../../services/auth-service.js';

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

        // Delegación de eventos global para agregar al carrito
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
                showNotification('✓ Agregado');
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
        // Buscar la cantidad actual en el array local
        const item = this.items.find(i => i.productId === productId);
        const currentQuantity = item ? item.quantity : 0;

        try {
            // Pasamos cantidad nueva y actual para calcular diferencia
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
        // Botones +/-
        this.cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.productId);
                const qty = parseInt(e.target.dataset.quantity);
                const isPlus = e.target.classList.contains('plus');
                
                if (!isPlus && qty <= 1) {
                     // Buscar ID Detalle para borrar
                     const cartItem = e.target.closest('.cart-item');
                     const removeId = parseInt(cartItem.querySelector('.cart-item-remove').dataset.cartId);
                     if(confirm('¿Eliminar?')) this.removeFromCart(removeId);
                } else {
                    this.updateQuantity(id, isPlus ? qty + 1 : qty - 1);
                }
            });
        });

        // Botón Eliminar
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

// --- FUNCIÓN MODIFICADA: CARGAR SOLO 3 PRODUCTOS ---
async function loadAllProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    try {
        const result = await productService.getAllProducts();
        if (result.success && result.data.length > 0) {
            // ✅ SOLO TOMAR LOS PRIMEROS 3 PRODUCTOS
            const limitedProducts = result.data;
            
            productsGrid.innerHTML = limitedProducts.map(product => {
                // DETECCIÓN DE ID BLINDADA
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


document.addEventListener('DOMContentLoaded', async () => {
    if (authService.isAuthenticated()) {
        await authService.getCurrentUser();
    }

    await loadAllProducts();

    window.cart = new ShoppingCart();
    window.userSidebar = initUserSidebar();
    
    document.querySelector('.btn-checkout')?.addEventListener('click', () => {
        if (window.cart && window.cart.items.length > 0) {
            window.location.href = '/html/checkout.html';
        } else {
            alert('Tu carrito está vacío');
        }
    });
});