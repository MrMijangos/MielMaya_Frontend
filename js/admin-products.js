// .js/admin-products.js - VERSIÓN CORREGIDA SIN MÓDULOS
let currentProductId = null;
const API_BASE_URL = 'http://localhost:7000/api';

// Servicios simplificados
const productService = {
    async getAllProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error cargando productos:', error);
            return { success: false, error: 'Error de conexión' };
        }
    },
    
    async getProductById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`);
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error cargando producto:', error);
            return { success: false, error: 'Error de conexión' };
        }
    },
    
    async createProduct(productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error creando producto:', error);
            return { success: false, error: 'Error de conexión' };
        }
    },
    
    async updateProduct(id, productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error actualizando producto:', error);
            return { success: false, error: 'Error de conexión' };
        }
    },
    
    async deleteProduct(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error eliminando producto:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }
};

const authService = {
    isAuthenticated() {
        const userData = localStorage.getItem('usuario');
        if (!userData) return false;
        
        try {
            const user = JSON.parse(userData);
            return user.rol === 'ADMIN';
        } catch {
            return false;
        }
    },
    
    getCurrentUser() {
        const userData = localStorage.getItem('usuario');
        return userData ? JSON.parse(userData) : null;
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ admin-products.js cargado');
    
    // Verificar autenticación de admin
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión como administrador');
        window.location.href = '/html/login.html';
        return;
    }

    // Cargar productos
    await loadProducts();
    
    // Botón Añadir Productos
    const btnAdd = document.getElementById('btnAddProducts');
    if (btnAdd) {
        btnAdd.addEventListener('click', openAddModal);
        console.log('✅ Event listener agregado a btnAddProducts');
    } else {
        console.log('❌ No se encontró btnAddProducts');
    }
    
    // Event listeners para imágenes
    setupEventListeners();
});

function setupEventListeners() {
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
}

// ========== FUNCIONES GLOBALES (para onclick del HTML) ==========
window.openAddModal = function() {
    console.log('🔄 Abriendo modal agregar');
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

window.closeAddModal = function() {
    console.log('🔄 Cerrando modal agregar');
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
        }
    }
}

window.closeEditModal = function() {
    console.log('🔴 Cerrando modal editar');
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentProductId = null;
    }
}

window.deleteProduct = async function() {
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

// ========== FUNCIONES PRINCIPALES ==========

// Cargar productos desde backend
async function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    try {
        const result = await productService.getAllProducts();

        if (result.success && result.data && result.data.length > 0) {
            productsGrid.innerHTML = result.data.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imagen || product.imagen_base64 || '/images/productosmiel'}" alt="${product.nombre}">
                    </div>
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-price">$${product.precio ? product.precio.toFixed(2) : '0.00'}</p>
                    <button class="btn-edit-product" data-id="${product.id || product.ID_Producto || product.id_producto}">EDITAR</button>
                </div>
            `).join('');

            // Agregar event listeners a botones de editar
            document.querySelectorAll('.btn-edit-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentProductId = e.target.dataset.id;
                    openEditModal(currentProductId);
                });
            });
        } else {
            productsGrid.innerHTML = '<p>No hay productos disponibles</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error al cargar productos', 'error');
    }
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

// Abrir modal de editar
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
            document.getElementById('editProductQuantity').value = product.cantidad || product.stock || '';
            document.getElementById('editProductDescription').value = product.descripcion || '';
            document.getElementById('editStockCount').textContent = product.cantidad || product.stock || '0';
            
            // Mostrar imagen actual
            const preview = document.getElementById('editImagePreview');
            if (preview) {
                preview.innerHTML = `<img src="${product.imagen || product.imagen_base64 || '/images/productosmiel'}" alt="${product.nombre}">`;
                preview.classList.add('has-image');
            }
        }
    } catch (error) {
        console.error('Error al cargar producto:', error);
        showNotification('Error al cargar producto', 'error');
        closeEditModal();
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