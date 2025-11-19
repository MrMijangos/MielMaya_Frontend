// .js/principal.js
import { initUserSidebar } from '../common/header/header.js';
import productService from '../common/api/product-service.js';
import cartService from '../common/api/cart-service.js';
import authService from '../common/api/auth-service.js';

/**
 * Lógica principal del carrito y gestión de UI de autenticación
 * - Muestra/oculta botón INICIAR SESIÓN
 * - Inserta botón de usuario cuando hay sesión
 * - Maneja apertura/cierre de userSidebar y cartSidebar
 */

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
                window.location.href = '/.html/login.html';
            }, 1200);
            return;
        }

        const button = e.currentTarget || e.target;
        const productId = button.dataset.id;

        button.style.transform = 'scale(0.95)';
        button.disabled = true;
        const prevText = button.textContent;
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
            button.textContent = prevText || 'AÑADIR AL CARRITO';
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
                            image: productResult.data.imagen_base64 || '/images/productosmiel.png',
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
        if (!this.cartItemsContainer) return;

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

            // Event listeners para botones
            this.cartItemsContainer.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cartId = parseInt(e.currentTarget.dataset.cartId);
                    const currentQty = parseInt(e.currentTarget.dataset.quantity);
                    this.updateQuantity(cartId, currentQty - 1);
                });
            });

            this.cartItemsContainer.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cartId = parseInt(e.currentTarget.dataset.cartId);
                    const currentQty = parseInt(e.currentTarget.dataset.quantity);
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
        if (!this.cartCount) return;
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
        if (this.cartTotal) this.cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    showNotification(message, type = 'success') {
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) existingNotification.remove();

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

// FUNCIONES DE UI Y AUTH

function createUserButton() {
    // Si ya existe, devolverla
    const existing = document.getElementById('userButton');
    if (existing) return existing;

    const btn = document.createElement('button');
    btn.className = 'icon-btn user-btn';
    btn.id = 'userButton';
    btn.setAttribute('aria-label', 'Abrir panel de usuario');

    const img = document.createElement('img');
    img.src = '/images/perfil.png';
    img.alt = 'Usuario';
    img.width = 35;
    img.height = 35;

    btn.appendChild(img);
    return btn;
}

function openUserSidebar() {
    const userSidebar = document.getElementById('userSidebar');
    const userOverlay = document.getElementById('userOverlay');
    if (!userSidebar || !userOverlay) return;
    userSidebar.classList.add('active');
    userOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeUserSidebar() {
    const userSidebar = document.getElementById('userSidebar');
    const userOverlay = document.getElementById('userOverlay');
    if (!userSidebar || !userOverlay) return;
    userSidebar.classList.remove('active');
    userOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

async function updateAuthUI() {
    const loginBtn = document.getElementById('loginButton');
    const headerIcons = document.querySelector('.header-icons');

    // crear botón de usuario (pero no añadirlo aún)
    const userBtn = createUserButton();

    // comprobar auth (puede ser sync como en tu ejemplo)
    let isAuth = false;
    try {
        isAuth = !!authService.isAuthenticated();
    } catch (e) {
        console.warn('authService.isAuthenticated falló:', e);
        isAuth = false;
    }

    if (isAuth) {
        // ocultar login
        if (loginBtn) loginBtn.style.display = 'none';

        // insertar botón de usuario si no está
        if (headerIcons && !document.getElementById('userButton')) {
            headerIcons.appendChild(userBtn);
        } else if (document.getElementById('userButton')) {
            document.getElementById('userButton').style.display = '';
        }

        // cargar datos del usuario y mostrarlos en el sidebar
        try {
            const user = await authService.getCurrentUser();
            // ajustar según estructura devuelta por tu authService
            const name = (user && (user.nombre || user.name || user.username)) || 'Usuario';
            const avatar = (user && (user.imagen || user.avatar || user.imagen_base64)) || '/images/perfil.png';

            const userNameEl = document.getElementById('userName');
            const userAvatarImg = document.getElementById('userAvatarImg');
            if (userNameEl) userNameEl.textContent = name;
            if (userAvatarImg) userAvatarImg.src = avatar;
        } catch (e) {
            console.warn('No se pudo obtener current user:', e);
        }

        // inicializar el sidebar (si tu initUserSidebar depende del botón, no importa: lo hacemos por seguridad)
        try {
            window.userSidebar = initUserSidebar();
        } catch (e) {
            console.warn('initUserSidebar falló (se usará fallback):', e);
        }

        // listeners: abrir sidebar
        userBtn.addEventListener('click', () => {
            openUserSidebar();
        });

        // cerrar con overlay y botón
        document.getElementById('closeUserBtn')?.addEventListener('click', () => closeUserSidebar());
        document.getElementById('userOverlay')?.addEventListener('click', () => closeUserSidebar());

        // logout: intenta llamar authService.logout() y refrescar UI
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    if (typeof authService.logout === 'function') {
                        await authService.logout();
                        // después del logout actualizar UI
                        // puedes redirigir a login si lo prefieres:
                        window.location.href = '/html/login.html';
                    } else {
                        // fallback: recargar (el backend podría limpiar la sesión)
                        window.location.reload();
                    }
                } catch (err) {
                    console.error('Error en logout:', err);
                    // aunque falle, recargamos para forzar estado
                    window.location.reload();
                }
            });
        }
    } else {
        // no autenticado: mostrar login, ocultar user button y asegurar sidebar cerrado
        if (loginBtn) loginBtn.style.display = '';
        const existingUserBtn = document.getElementById('userButton');
        if (existingUserBtn) existingUserBtn.style.display = 'none';
        closeUserSidebar();
    }
}

// Cargar productos desde backend
async function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');

    if (!productsGrid) return;

    try {
        const result = await productService.getAllProducts();

        if (result.success && result.data.length > 0) {
            const productsToShow = result.data.slice(0, 3);

            productsGrid.innerHTML = productsToShow.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imagen_base64 || '/images/productosmiel.png'}" alt="${product.nombre}">
                    </div>
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-price">$${product.precio.toFixed(2)}</p>
                    <button class="btn-add-cart" 
                            data-id="${product.id_producto}" 
                            data-name="${product.nombre}" 
                            data-price="${product.precio}" 
                            data-image="${product.imagen_base64 || '/images/productosmiel.png'}">
                        AÑADIR AL CARRITO
                    </button>
                </div>
            `).join('');

            // Re-asignar event listeners
            productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
                btn.addEventListener('click', (e) => window.cart.addToCart(e));
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializa carrito
    window.cart = new ShoppingCart();

    // Intentar actualizar UI según autenticación (es async porque getCurrentUser puede ser async)
    try {
        await updateAuthUI();
    } catch (e) {
        console.warn('updateAuthUI falló:', e);
    }

    // Cargar productos
    await loadProducts();

    // Event listener para el botón de checkout
    document.querySelector('.btn-checkout')?.addEventListener('click', () => {
        if (window.cart.items.length > 0) {
            window.location.href = '/html/checkout.html';
        } else {
            alert('Tu carrito está vacío');
        }
    });

    // Opcional: si tu app realiza login/logout en otra ventana o mediante storage, puedes escuchar storage events
    // para refrescar la UI (ej: cuando el login se realiza en otra pestaña)
    window.addEventListener('storage', (e) => {
        if (e.key === 'auth' || e.key === 'token') {
            // re-evaluar estado de autenticación
            updateAuthUI().catch(() => {});
        }
    });
});
