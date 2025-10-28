// Importar el componente del header
import { initUserSidebar } from '../common/header/header.js';

// Carrito de compras
class ShoppingCart {
    constructor() {
        this.items = [];
        this.init();
        this.loadCart();
    }

    init() {
        // Elementos del DOM
        this.cartButton = document.getElementById('cartButton');
        this.cartSidebar = document.getElementById('cartSidebar');
        this.cartOverlay = document.getElementById('cartOverlay');
        this.closeCartBtn = document.getElementById('closeCartBtn');
        this.cartItemsContainer = document.getElementById('cartItems');
        this.cartCount = document.getElementById('cartCount');
        this.cartTotal = document.getElementById('cartTotal');

        // Event listeners
        this.cartButton.addEventListener('click', () => this.openCart());
        this.closeCartBtn.addEventListener('click', () => this.closeCart());
        this.cartOverlay.addEventListener('click', () => this.closeCart());

        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cartSidebar.classList.contains('active')) {
                this.closeCart();
            }
        });

        // Agregar event listeners a todos los botones "Añadir al carrito"
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => this.addToCart(e));
        });
    }

    openCart() {
        this.cartSidebar.classList.add('active');
        this.cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this.cartSidebar.classList.remove('active');
        this.cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    addToCart(e) {
        const button = e.target;
        const product = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: parseFloat(button.dataset.price),
            image: button.dataset.image,
            quantity: 1
        };

        // Verificar si el producto ya existe en el carrito
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push(product);
        }

        this.saveCart();
        this.renderCart();
        this.updateCartCount();
        this.showNotification('✓ Producto agregado al carrito');
        
        // Animación del botón
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    removeFromCart(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
        this.showNotification('Producto eliminado', 'error');
    }

    updateQuantity(id, change) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(id);
            } else {
                this.saveCart();
                this.renderCart();
                this.updateCartCount();
            }
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
                            <button class="qty-btn minus" data-id="${item.id}">−</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}" title="Eliminar producto">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `).join('');

            // Agregar event listeners a los botones
            this.cartItemsContainer.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.updateQuantity(e.target.dataset.id, -1);
                });
            });

            this.cartItemsContainer.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.updateQuantity(e.target.dataset.id, 1);
                });
            });

            this.cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const button = e.currentTarget;
                    this.removeFromCart(button.dataset.id);
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

    saveCart() {
        localStorage.setItem('mielCart', JSON.stringify(this.items));
    }

    loadCart() {
        const savedCart = localStorage.getItem('mielCart');
        if (savedCart) {
            try {
                this.items = JSON.parse(savedCart);
                this.renderCart();
                this.updateCartCount();
            } catch (error) {
                console.error('Error loading cart:', error);
                this.items = [];
            }
        }
    }

    showNotification(message, type = 'success') {
        // Eliminar notificaciones previas
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        
        if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #e53935 0%, #c62828 100%)';
        }

        document.body.appendChild(notification);

        // Remover después de 2.5 segundos
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar carrito
    window.cart = new ShoppingCart();
    
    // Inicializar sidebar de usuario
    window.userSidebar = initUserSidebar();
    
    // Event listener para el botón de checkout
    document.querySelector('.btn-checkout')?.addEventListener('click', () => {
        if (window.cart.items.length > 0) {
            window.location.href = '/.html/checkout.html';
        } else {
            alert('Tu carrito está vacío');
        }
    });
});