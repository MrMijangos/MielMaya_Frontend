// Variables globales
let currentProductId = null;

// Event Listeners cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Cargado');
    
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
    
    // Botones Editar de cada producto
    document.querySelectorAll('.btn-edit-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentProductId = e.target.dataset.id;
            console.log('Editando producto ID:', currentProductId);
            openEditModal(currentProductId);
        });
    });
    
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
    
    // Actualizar contador de stock al agregar
    const addQuantity = document.getElementById('addProductQuantity');
    if (addQuantity) {
        addQuantity.addEventListener('input', (e) => {
            document.getElementById('stockCount').textContent = e.target.value || '0';
        });
    }
    
    // Actualizar contador de stock al editar
    const editQuantity = document.getElementById('editProductQuantity');
    if (editQuantity) {
        editQuantity.addEventListener('input', (e) => {
            document.getElementById('editStockCount').textContent = e.target.value || '0';
        });
    }
    
    // Cerrar modales al hacer clic fuera
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
    
    // Cerrar modales con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddModal();
            closeEditModal();
        }
    });
});

// ========== FUNCIONES DE MODAL AGREGAR ==========

function openAddModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('Modal agregar abierto');
}

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

function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('addProductName').value,
        price: document.getElementById('addProductPrice').value,
        quantity: document.getElementById('addProductQuantity').value,
        description: document.getElementById('addProductDescription').value,
        image: document.getElementById('addProductImage').files[0]
    };
    
    // Validar que haya imagen
    if (!formData.image) {
        alert('Por favor selecciona una imagen del producto');
        return;
    }
    
    console.log('Producto a agregar:', formData);
    
    // Aquí harías la petición POST a tu backend
    // fetch('/api/products', {
    //     method: 'POST',
    //     body: formDataObject
    // })
    
    showNotification('Producto agregado exitosamente', 'success');
    closeAddModal();
    
    // Recargar productos
    // loadProducts();
}

// ========== FUNCIONES DE MODAL EDITAR ==========

function openEditModal(productId) {
    const modal = document.getElementById('editProductModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('Modal editar abierto para producto ID:', productId);
    
    // Aquí cargarías los datos reales del producto desde tu backend
    // fetch(`/api/products/${productId}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         document.getElementById('editProductName').value = data.name;
    //         document.getElementById('editProductPrice').value = data.price;
    //         // etc...
    //     });
    
    // Por ahora usamos datos de ejemplo
    document.getElementById('editProductName').value = 'MIEL PURA';
    document.getElementById('editProductPrice').value = '120';
    document.getElementById('editProductQuantity').value = '50';
    document.getElementById('editProductDescription').value = 'Ingrese aquí para ver la variedad de productos que tenemos para ofrecerles';
    document.getElementById('editStockCount').textContent = '50';
}

function closeEditModal() {
    const modal = document.getElementById('editProductModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentProductId = null;
}

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

function handleEditProduct(e) {
    e.preventDefault();
    
    const formData = {
        id: currentProductId,
        name: document.getElementById('editProductName').value,
        price: document.getElementById('editProductPrice').value,
        quantity: document.getElementById('editProductQuantity').value,
        description: document.getElementById('editProductDescription').value,
        image: document.getElementById('editProductImage').files[0]
    };
    
    console.log('Producto a actualizar:', formData);
    
    // Aquí harías la petición PUT/PATCH a tu backend
    // fetch(`/api/products/${currentProductId}`, {
    //     method: 'PUT',
    //     body: formDataObject
    // })
    
    showNotification('Producto actualizado exitosamente', 'success');
    closeEditModal();
    
    // Recargar productos
    // loadProducts();
}

function deleteProduct() {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        console.log('Eliminar producto ID:', currentProductId);
        
        // Aquí harías la petición DELETE a tu backend
        // fetch(`/api/products/${currentProductId}`, {
        //     method: 'DELETE'
        // })
        
        showNotification('Producto eliminado exitosamente', 'error');
        closeEditModal();
        
        // Recargar productos
        // loadProducts();
    }
}

// ========== FUNCIONES AUXILIARES ==========

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