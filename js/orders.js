// Toggle del menú de acciones del pedido
function toggleOrderMenu(button) {
    const dropdown = button.closest('.order-status-section').querySelector('.order-dropdown');
    const allDropdowns = document.querySelectorAll('.order-dropdown');
    
    // Cerrar todos los otros dropdowns
    allDropdowns.forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('active');
        }
    });
    
    // Toggle del dropdown actual
    dropdown.classList.toggle('active');
}

// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.order-status-section')) {
        document.querySelectorAll('.order-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

// Manejar acciones de pedido
document.addEventListener('DOMContentLoaded', () => {
    // Volver a comprar
    document.querySelectorAll('.repurchase-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const orderItem = btn.closest('.order-item');
            const productName = orderItem.querySelector('.order-product-name').textContent;
            alert(`Agregando "${productName}" al carrito...`);
            // Aquí agregarías el producto al carrito
            window.location.href = '/index.html';
        });
    });
    
    // Cancelar pedido
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
                const orderItem = btn.closest('.order-item');
                orderItem.style.opacity = '0.5';
                alert('Pedido cancelado exitosamente');
            }
        }); 
    }); 
}); 