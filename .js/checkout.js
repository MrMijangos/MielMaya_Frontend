document.addEventListener('DOMContentLoaded', () => {
    // Cargar total del carrito
    loadCartTotal();
    
    // Event listener para agregar método de pago
    document.getElementById('btnAddPayment')?.addEventListener('click', () => {
        window.location.href = '/.html/add-payment.html';
    });
    
document.getElementById('btnProceed')?.addEventListener('click', () => {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    
    if (selectedMethod) {
        // Guardar método de pago seleccionado
        localStorage.setItem('selectedPaymentMethod', selectedMethod.value);
        // Redirigir a dirección de envío
        window.location.href = '/.html/shipping-address.html';
    } else {
        alert('Por favor selecciona un método de pago');
    }
});
});

function loadCartTotal() {
    const savedCart = localStorage.getItem('mielCart');
    if (savedCart) {
        try {
            const items = JSON.parse(savedCart);
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalElement = document.getElementById('checkoutTotal');
            if (totalElement) {
                totalElement.textContent = `$${total.toFixed(2)}`;
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }
}