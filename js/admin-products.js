// js/admin-products.js - VERSIÓN FINAL
let currentProductId = null;
const API_BASE_URL = 'http://localhost:7000/api';


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
            return { success: false, error: 'Error de conexión' };
        }
    },
    
    async createProduct(productData) {
        try {
            const backendData = {
                nombre: productData.nombre,
                descripcion: productData.descripcion,
                precio: productData.precio,
                stock: productData.cantidad,
                imagen: productData.imagen
            };

            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendData)
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
            const backendData = {
                nombre: productData.nombre,
                descripcion: productData.descripcion,
                precio: productData.precio,
                stock: productData.cantidad,
                imagen: productData.imagen_base64 || productData.imagen 
            };

            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
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
            return { success: false, error: 'Error de conexión' };
        }
    }
};


async function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    try {
        const result = await productService.getAllProducts();

        if (result.success && result.data && Array.isArray(result.data)) {
            if(result.data.length > 0) {
                productsGrid.innerHTML = result.data.map(product => {
                    const id = product.idProducto || product.ID_Producto || product.id_producto;
                    const imagen = product.imagen && product.imagen.trim() !== '' ? product.imagen : '/images/productosmiel';
                    const stock = product.stock !== undefined ? product.stock : (product.Stock || 0);
    
                    return `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="${imagen}" alt="${product.nombre}" onerror="this.src='/images/productosmiel'">
                            </div>
                            <h3 class="product-name">${product.nombre}</h3>
                            <p class="product-price">$${product.precio ? Number(product.precio).toFixed(2) : '0.00'}</p>
                            <p class="product-stock">Stock: ${stock}</p>
                            <button class="btn-edit-product" data-id="${id}">EDITAR</button>
                        </div>
                    `;
                }).join('');
    
                document.querySelectorAll('.btn-edit-product').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        currentProductId = e.target.dataset.id;
                        openEditModal(currentProductId);
                    });
                });
            } else {
                productsGrid.innerHTML = '<p>No se encontraron productos en la base de datos.</p>';
            }
        } else {
            productsGrid.innerHTML = '<p>Error al obtener los datos de productos.</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error crítico al cargar productos', 'error');
    }
}



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
            
            document.getElementById('editProductName').value = product.nombre || '';
            document.getElementById('editProductPrice').value = product.precio || '';
            document.getElementById('editProductQuantity').value = product.stock !== undefined ? product.stock : (product.Stock || 0);
            document.getElementById('editProductDescription').value = product.descripcion || '';
            document.getElementById('editStockCount').textContent = product.stock !== undefined ? product.stock : (product.Stock || '0');
            
            
        }
    } catch (error) {
        console.error('Error al cargar producto:', error);
        showNotification('Error al cargar detalles del producto', 'error');
        window.closeEditModal();
    }
}

window.closeAddModal = function() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        const form = document.getElementById('addProductForm');
        if (form) form.reset();
        
        const stockCount = document.getElementById('stockCount');
        if(stockCount) stockCount.textContent = '0';
        
    }
}

window.closeEditModal = function() {
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentProductId = null;
    }
}

window.deleteProduct = async function() {
    if (!currentProductId) return;
    
    if (!confirm('¿Estás seguro de que deseas eliminar este producto de forma permanente?')) {
        return;
    }

    try {
        const result = await productService.deleteProduct(currentProductId);
        if (result.success) {
            showNotification('Producto eliminado exitosamente', 'success');
            window.closeEditModal();
            await loadProducts();
        } else {
            showNotification(result.error || 'Error al eliminar producto', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
}

window.openAddModal = function() {
    console.log('🔘 Botón agregar producto clickeado - Abriendo modal');
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        const form = document.getElementById('addProductForm');
        if (form) form.reset();
        
        const stockCount = document.getElementById('stockCount');
        if (stockCount) stockCount.textContent = '0';
        
        console.log(' Modal de agregar producto abierto correctamente');
    } else {
        console.error(' No se encontró el modal con id: addProductModal');
    }
}

function previewImageAdd(event) {
}

function previewImageEdit(event) {
}

async function handleAddProduct(e) {
    e.preventDefault();

    const productData = {
        nombre: document.getElementById('addProductName').value,
        precio: parseFloat(document.getElementById('addProductPrice').value),
        cantidad: parseInt(document.getElementById('addProductQuantity').value),
        descripcion: document.getElementById('addProductDescription').value,
        imagen: document.getElementById('addProductImageUrl').value
    };

    if (!productData.imagen) {
        showNotification('Por favor ingresa la URL de la imagen del producto', 'error');
        return;
    }
    if (isNaN(productData.precio) || isNaN(productData.cantidad)) {
        showNotification('Por favor ingrese números válidos para precio y cantidad', 'error');
        return;
    }

    try {
        const result = await productService.createProduct(productData);
        if (result.success) {
            showNotification('Producto agregado exitosamente', 'success');
            window.closeAddModal();
            await loadProducts();
        } else {
            showNotification(result.error || 'Error al agregar producto', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
}

async function handleEditProduct(e) {
    e.preventDefault();
    
    const productData = {
        nombre: document.getElementById('editProductName').value,
        precio: parseFloat(document.getElementById('editProductPrice').value),
        cantidad: parseInt(document.getElementById('editProductQuantity').value),
        descripcion: document.getElementById('editProductDescription').value,
        imagen: document.getElementById('editProductImageUrl').value
    };

    await updateProductInternal(productData);
}

async function updateProductInternal(productData) {
    try {
        const result = await productService.updateProduct(currentProductId, productData);

        if (result.success) {
            showNotification('Producto actualizado exitosamente', 'success');
            window.closeEditModal();
            await loadProducts();
        } else {
            showNotification(result.error || 'Error al actualizar producto', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
}



document.addEventListener('DOMContentLoaded', async () => {
    console.log(' admin-products.js cargado correctamente');
    
    if (!authService.isAuthenticated()) {
        alert('Debes iniciar sesión como administrador');
        window.location.href = '/html/login.html';
        return;
    }

    await loadProducts();
    
    const btnAdd = document.getElementById('btnAddProducts');
    if (btnAdd) {
        btnAdd.addEventListener('click', window.openAddModal);
    }
    
    setupEventListeners();
});

function setupEventListeners() {
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
    
    const addForm = document.getElementById('addProductForm');
    if (addForm) {
        addForm.addEventListener('submit', handleAddProduct);
    }
    
    const editForm = document.getElementById('editProductForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditProduct);
    }
}



function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification-toast');
    if(existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    const color = type === 'success' ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 'linear-gradient(135deg, #e53935 0%, #c62828 100%)';
    
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 16px 28px;
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        font-size: 14px;
        font-weight: bold;
        transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const authService = {
    isAuthenticated() {
        const userData = localStorage.getItem('usuario');
        if (!userData) return false;
        
        try {
            const user = JSON.parse(userData);
            return user.rol && user.rol.toUpperCase() === 'ADMIN';
        } catch {
            return false;
        }
    }
};