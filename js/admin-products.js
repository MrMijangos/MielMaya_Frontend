// .js/admin-products.js
import productService from '../common/api/product-service.js';
import authService from '../common/api/auth-service.js';

let currentProductId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación de admin
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión');
        window.location.href = '/html/login.html';
        return;
    }

    // Cargar productos
    await loadProducts();
    
    // Botón Añadir Productos
    const btnAdd = document.getElementById('btnAddProducts');
    if (btnAdd) {
        btnAdd.addEventListener('click', openAddModal);
    }
    
    // Click en el área de imagen para subir archivo (AGREGAR)
    const addImagePreview = document.getElementById('addImagePreview');
    if (addImagePreview) {
        addImagePreview.addEventListener('click', () => {
            document.getElementById('addProductImage').click();
        });
    }
    
    // Click en el área de imagen para subir archivo (EDITAR)
    const editImagePreview = document.getElementById('editImagePreview');
    if (editImagePreview) {
        editImagePreview.addEventListener('click', () => {
            document.getElementById('editProductImage').click();
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
    
    // Preview de imagen al agregar
    const addProductImage = document.getElementById('addProductImage');
    if (addProductImage) {
        addProductImage.addEventListener('change', previewImageAdd);
    }
    
    // Preview de imagen al editar
    const editProductImage = document.getElementById('editProductImage');
    if (editProductImage) {
        editProductImage.addEventListener('change', previewImageEdit);
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
    
    // Cerrar modales
    document.getElementById('addProductModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'addProductModal') {
            closeAddModal();
        }
    });
    
    document.getElementById('editProductModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'editProductModal') {
            closeEditModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddModal();
            closeEditModal();
        }
    });
});

// Cargar productos desde backend
async function loadProducts() {
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
                    <button class="btn-edit-product" data-id="${product.id_producto}">EDITAR</button>
                </div>
            `).join('');

            // Agregar event listeners a botones de editar
            document.querySelectorAll('.btn-edit-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentProductId = e.target.dataset.id;
                    openEditModal(currentProductId);
                });
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error al cargar productos', 'error');
    }
}

// Abrir modal de agregar
function openAddModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de agregar
function closeAddModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Limpiar formulario
    document.getElementById('addProductForm').reset();
    document.getElementById('stockCount').textContent = '0';
    
    // Resetear preview de imagen
    const preview = document.getElementById('addImagePreview');
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
}

// Preview de imagen al agregar
function previewImageAdd(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('addImagePreview');
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.add('has-image');
        };
        
        reader.readAsDataURL(file);
    }
}

// Manejar envío de formulario agregar
async function handleAddProduct(e) {
    e.preventDefault();
    
    const file = document.getElementById('addProductImage').files[0];
    
    if (!file) {
        alert('Por favor selecciona una imagen del producto');
        return;
    }

    // Convertir imagen a base64
    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64Image = event.target.result;

        const productData = {
            nombre: document.getElementById('addProductName').value,
            precio: parseFloat(document.getElementById('addProductPrice').value),
            cantidad: parseInt(document.getElementById('addProductQuantity').value),
            descripcion: document.getElementById('addProductDescription').value,
            imagen_base64: base64Image
        };

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
            showNotification('Error de conexión', 'error');
        }
    };

    reader.readAsDataURL(file);
}

// Continuación de admin-products.js

// Abrir modal de editar
async function openEditModal(productId) {
    const modal = document.getElementById('editProductModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const result = await productService.getProductById(productId);
        
        if (result.success) {
            const product = result.data;
            
            // Llenar formulario con datos del producto
            document.getElementById('editProductName').value = product.nombre;
            document.getElementById('editProductPrice').value = product.precio;
            document.getElementById('editProductQuantity').value = product.cantidad;
            document.getElementById('editProductDescription').value = product.descripcion;
            document.getElementById('editStockCount').textContent = product.cantidad;
            
            // Mostrar imagen actual
            const preview = document.getElementById('editImagePreview');
            preview.innerHTML = `<img src="${product.imagen_base64 || '/images/productosmiel'}" alt="${product.nombre}">`;
            preview.classList.add('has-image');
        }
    } catch (error) {
        showNotification('Error al cargar producto', 'error');
        closeEditModal();
    }
}

// Cerrar modal de editar
function closeEditModal() {
    const modal = document.getElementById('editProductModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentProductId = null;
}

// Preview de imagen al editar
function previewImageEdit(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('editImagePreview');
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.add('has-image');
        };
        
        reader.readAsDataURL(file);
    }
}

// Manejar envío de formulario editar
async function handleEditProduct(e) {
    e.preventDefault();
    
    const file = document.getElementById('editProductImage').files[0];
    
    const productData = {
        nombre: document.getElementById('editProductName').value,
        precio: parseFloat(document.getElementById('editProductPrice').value),
        cantidad: parseInt(document.getElementById('editProductQuantity').value),
        descripcion: document.getElementById('editProductDescription').value
    };

    // Si hay nueva imagen, convertir a base64
    if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            productData.imagen_base64 = event.target.result;
            await updateProduct(productData);
        };
        reader.readAsDataURL(file);
    } else {
        await updateProduct(productData);
    }
}

// Actualizar producto
async function updateProduct(productData) {
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
        showNotification('Error de conexión', 'error');
    }
}

// Eliminar producto
async function deleteProduct() {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        const result = await productService.deleteProduct(currentProductId);

        if (result.success) {
            showNotification('Producto eliminado exitosamente', 'error');
            closeEditModal();
            await loadProducts();
        } else {
            showNotification(result.error || 'Error al eliminar producto', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
}

// Hacer deleteProduct global para que funcione desde el HTML
window.deleteProduct = deleteProduct;

// Mostrar notificación
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
`;
document.head.appendChild(style);