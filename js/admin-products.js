import productService from '../common/api/product-service.js';
import authService from '../services/auth-service.js';

let currentProductId = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ admin-products.js cargado');

    // Verificar autenticación de admin
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión como administrador');
        window.location.href = '/html/login.html';
        return;
    }

    const user = authService.getCurrentUser();
    if (user.rol !== 'ADMIN') {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = '/index.html';
        return;
    }

    // Cargar productos
    await loadProducts();

    // Event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Botón Añadir Productos
    const btnAdd = document.getElementById('btnAddProducts');
    if (btnAdd) {
        btnAdd.addEventListener('click', openAddModal);
    }

    // Click en el área de imagen para ingresar URL (AGREGAR)
    const addImagePreview = document.getElementById('addImagePreview');
    if (addImagePreview) {
        addImagePreview.addEventListener('click', () => {
            const currentUrl = addImagePreview.dataset.imageUrl || '';
            const url = prompt('Ingresa la URL de la imagen:', currentUrl);
            if (url && url.trim()) {
                const imgElement = new Image();
                imgElement.onload = () => {
                    addImagePreview.innerHTML = `<img src="${url}" alt="Preview">`;
                    addImagePreview.classList.add('has-image');
                    addImagePreview.dataset.imageUrl = url;
                };
                imgElement.onerror = () => {
                    showNotification('Error al cargar la imagen. Verifica la URL.', 'error');
                };
                imgElement.src = url;
            }
        });
    }

    // Click en el área de imagen para ingresar URL (EDITAR)
    const editImagePreview = document.getElementById('editImagePreview');
    if (editImagePreview) {
        editImagePreview.addEventListener('click', () => {
            const currentUrl = editImagePreview.dataset.imageUrl || '';
            const url = prompt('Ingresa la URL de la imagen:', currentUrl);
            if (url && url.trim()) {
                const imgElement = new Image();
                imgElement.onload = () => {
                    editImagePreview.innerHTML = `<img src="${url}" alt="Preview">`;
                    editImagePreview.classList.add('has-image');
                    editImagePreview.dataset.imageUrl = url;
                };
                imgElement.onerror = () => {
                    showNotification('Error al cargar la imagen. Verifica la URL.', 'error');
                };
                imgElement.src = url;
            }
        });
    }

    // Formulario de agregar producto
    const addForm = document.getElementById('addProductForm');
    if (addForm) {
        addForm.addEventListener('submit', handleAddProduct);
    }

    // Formulario de editar producto
    const editForm = document.getElementById('editProductForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditProduct);
    }

    // Actualizar contador de stock
    const addQuantity = document.getElementById('addProductQuantity');
    if (addQuantity) {
        addQuantity.addEventListener('input', (e) => {
            document.getElementById('stockCount').textContent = e.target.value || '0';
        });
    }

    const editQuantity = document.getElementById('editProductQuantity');
    if (editQuantity) {
        editQuantity.addEventListener('input', (e) => {
            document.getElementById('editStockCount').textContent = e.target.value || '0';
        });
    }
}

// ========== FUNCIONES GLOBALES ==========
window.openAddModal = function () {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

window.closeAddModal = function () {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Limpiar formulario
        const form = document.getElementById('addProductForm');
        if (form) form.reset();
        document.getElementById('stockCount').textContent = '0';

        // Resetear preview de imagen
        const preview = document.getElementById('addImagePreview');
        if (preview) {
            preview.innerHTML = `
                <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                    <rect x="10" y="15" width="70" height="60" rx="5" stroke="#F9BD31" stroke-width="4"/>
                    <circle cx="30" cy="32" r="6" fill="#F9BD31"/>
                    <path d="M10 60 L35 40 L55 55 L70 45 L80 52" stroke="#F9BD31" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M65 55 L75 45 L85 52 L85 68" stroke="#F9BD31" stroke-width="4" stroke-linecap="round"/>
                    <g transform="translate(55, 50)">
                        <circle cx="15" cy="15" r="15" fill="#F9BD31"/>
                        <path d="M15 8 L15 22 M8 15 L22 15" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    </g>
                </svg>
            `;
            preview.classList.remove('has-image');
            delete preview.dataset.imageUrl;
        }
    }
}

window.closeEditModal = function () {
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentProductId = null;
    }
}

window.deleteProduct = async function () {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        const result = await productService.deleteProduct(currentProductId);
        if (result.success) {
            showNotification('Producto eliminado exitosamente', 'success');
            closeEditModal();
            await loadProducts();
        } else {
            showNotification(result.error || 'Error al eliminar producto', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
}

// ========== CARGAR PRODUCTOS ==========
async function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    try {
        const result = await productService.getAllProducts();

        console.log('📦 Respuesta completa:', result); // Debug
        console.log('📦 Datos:', result.data); // Debug

        if (result.success && result.data && result.data.length > 0) {
            productsGrid.innerHTML = result.data.map(product => {
                console.log('🔍 Producto completo:', product); // Ver TODOS los campos

                // Intentar múltiples variaciones del campo ID
                const productId = product.ID_Producto ||
                    product.id_producto ||
                    product.idProducto ||
                    product.ID ||
                    product.id ||
                    product.Id_Producto;

                console.log('🆔 ID detectado:', productId, 'para producto:', product.nombre || product.Nombre); // Debug

                // Usar nombres con mayúsculas también
                const nombre = product.nombre || product.Nombre || product.NOMBRE || 'Sin nombre';
                const precio = product.precio || product.Precio || product.PRECIO || 0;
                const stock = product.stock || product.Stock || product.STOCK || product.cantidad || product.Cantidad || 0;
                const imagen = product.imagen || product.Imagen || product.IMAGEN || '/images/productosmiel';

                return `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${imagen}" 
                                 alt="${nombre}"
                                 onerror="this.src='/images/productosmiel'">
                        </div>
                        <h3 class="product-name">${nombre}</h3>
                        <p class="product-price">$${parseFloat(precio).toFixed(2)}</p>
                        <p class="product-stock">Stock: ${stock}</p>
                        <button class="btn-edit-product" data-id="${productId}">EDITAR</button>
                    </div>
                `;
            }).join('');

            // Agregar event listeners a botones de editar
            document.querySelectorAll('.btn-edit-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    console.log('🔍 ID del botón clickeado:', id); // Debug
                    console.log('🔍 Tipo de ID:', typeof id); // Debug

                    if (!id || id === 'undefined' || id === 'null') {
                        showNotification('Error: ID de producto no válido', 'error');
                        console.error('❌ Botón sin ID válido');
                        return;
                    }

                    currentProductId = id;
                    openEditModal(id);
                });
            });
        } else {
            productsGrid.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">No hay productos disponibles</p>';
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showNotification('Error al cargar productos', 'error');
        productsGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: red; grid-column: 1/-1;">Error al cargar productos</p>';
    }
}

// ========== ABRIR MODAL EDITAR ==========
async function openEditModal(productId) {
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    try {
        const result = await productService.getProductById(productId);

        if (result.success && result.data) {
            const product = result.data;

            // Llenar formulario con datos del producto
            document.getElementById('editProductName').value = product.nombre || '';
            document.getElementById('editProductPrice').value = product.precio || '';
            document.getElementById('editProductQuantity').value = product.stock || '';
            document.getElementById('editProductDescription').value = product.descripcion || '';
            document.getElementById('editStockCount').textContent = product.stock || '0';

            // Mostrar imagen actual
            const preview = document.getElementById('editImagePreview');
            if (preview) {
                preview.innerHTML = `<img src="${product.imagen || '/images/productosmiel'}" alt="${product.nombre}" onerror="this.src='/images/productosmiel'">`;
                preview.classList.add('has-image');
                preview.dataset.imageUrl = product.imagen;
            }
        } else {
            showNotification('Error al cargar producto', 'error');
            closeEditModal();
        }
    } catch (error) {
        console.error('Error al cargar producto:', error);
        showNotification('Error al cargar producto', 'error');
        closeEditModal();
    }
}

// ========== AGREGAR PRODUCTO ==========
async function handleAddProduct(e) {
    e.preventDefault();

    const preview = document.getElementById('addImagePreview');
    const imageUrl = preview.dataset.imageUrl;

    if (!imageUrl || !imageUrl.trim()) {
        showNotification('Por favor ingresa una URL de imagen válida', 'error');
        return;
    }

    const productData = {
        nombre: document.getElementById('addProductName').value.trim(),
        descripcion: document.getElementById('addProductDescription').value.trim(),
        precio: parseFloat(document.getElementById('addProductPrice').value),
        stock: parseInt(document.getElementById('addProductQuantity').value),
        imagen: imageUrl.trim()
    };

    // Validaciones
    if (!productData.nombre) {
        showNotification('El nombre del producto es requerido', 'error');
        return;
    }
    if (!productData.descripcion) {
        showNotification('La descripción del producto es requerida', 'error');
        return;
    }
    if (isNaN(productData.precio) || productData.precio <= 0) {
        showNotification('El precio debe ser mayor a 0', 'error');
        return;
    }
    if (isNaN(productData.stock) || productData.stock < 0) {
        showNotification('El stock debe ser mayor o igual a 0', 'error');
        return;
    }

    console.log('📦 Enviando producto:', productData);

    try {
        const result = await productService.createProduct(productData);

        if (result.success) {
            showNotification('Producto agregado exitosamente', 'success');
            closeAddModal();
            await loadProducts();
        } else {
            showNotification(result.error || 'Error al agregar producto', 'error');
        }
    } catch (error) {
        console.error('Error al agregar producto:', error);
        showNotification('Error de conexión con el servidor', 'error');
    }
}

// ========== EDITAR PRODUCTO ==========
async function handleEditProduct(e) {
    e.preventDefault();

    const preview = document.getElementById('editImagePreview');
    const imageUrl = preview.dataset.imageUrl;

    if (!imageUrl || !imageUrl.trim()) {
        showNotification('Por favor ingresa una URL de imagen válida', 'error');
        return;
    }

    const productData = {
        nombre: document.getElementById('editProductName').value.trim(),
        descripcion: document.getElementById('editProductDescription').value.trim(),
        precio: parseFloat(document.getElementById('editProductPrice').value),
        stock: parseInt(document.getElementById('editProductQuantity').value),
        imagen: imageUrl.trim()
    };

    // Validaciones
    if (!productData.nombre) {
        showNotification('El nombre del producto es requerido', 'error');
        return;
    }
    if (!productData.descripcion) {
        showNotification('La descripción del producto es requerida', 'error');
        return;
    }
    if (isNaN(productData.precio) || productData.precio <= 0) {
        showNotification('El precio debe ser mayor a 0', 'error');
        return;
    }
    if (isNaN(productData.stock) || productData.stock < 0) {
        showNotification('El stock debe ser mayor o igual a 0', 'error');
        return;
    }

    console.log('📝 Actualizando producto:', currentProductId, productData);

    try {
        const result = await productService.updateProduct(currentProductId, productData);

        if (result.success) {
            showNotification('Producto actualizado exitosamente', 'success');
            closeEditModal();
            await loadProducts();
        } else {
            showNotification(result.error || 'Error al actualizar producto', 'error');
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        showNotification('Error de conexión con el servidor', 'error');
    }
}

// ========== NOTIFICACIONES ==========
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 'linear-gradient(135deg, #e53935 0%, #c62828 100%)'};
        color: white;
        padding: 16px 28px;
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        font-size: 14px;
        font-weight: bold;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    .product-stock {
        font-size: 14px;
        color: #666;
        margin-bottom: 15px;
        font-weight: 500;
    }
`;
document.head.appendChild(style);