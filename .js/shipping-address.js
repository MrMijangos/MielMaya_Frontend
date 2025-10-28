document.addEventListener('DOMContentLoaded', () => {
    // Verificar que haya un método de pago seleccionado
    checkPaymentMethod();
    
    // Cargar total del carrito
    loadCartTotal();
    
    // Event listener para agregar dirección
    document.getElementById('btnAddAddress')?.addEventListener('click', () => {
        // Guardar método de pago seleccionado antes de navegar
        const paymentMethod = localStorage.getItem('selectedPaymentMethod');
        if (paymentMethod) {
            window.location.href = '/.html/add-shipping.html';
        }
    });
    
    // Event listener para proceder al método de pago
    document.getElementById('btnProceedToPayment')?.addEventListener('click', () => {
        const selectedAddress = document.querySelector('input[name="shipping-address"]:checked');
        
        if (selectedAddress) {document.addEventListener('DOMContentLoaded', () => {
    // Verificar que haya un método de pago seleccionado
    checkPaymentMethod();
    
    // Cargar total del carrito
    loadCartTotal();
    
    // Formateo de campos
    setupAddressFormatting();
    
    // Event listener para agregar dirección
    document.getElementById('btnAddShipping')?.addEventListener('click', (e) => {
        e.preventDefault();
        
        const form = document.getElementById('shippingForm');
        if (form.checkValidity()) {
            // Guardar dirección
            const newAddress = {
                street: document.getElementById('street').value,
                zipCode: document.getElementById('zipCode').value,
                colony: document.getElementById('colony').value,
                state: document.getElementById('state').value,
                municipality: document.getElementById('municipality').value,
                phone: document.getElementById('phone').value
            };
            
            // Aquí guardarías la dirección en tu base de datos
            alert('Dirección agregada exitosamente');
            window.location.href = '/shipping-address.html';
        } else {
            alert('Por favor completa todos los campos');
            form.reportValidity();
        }
    });
});

function checkPaymentMethod() {
    const paymentMethod = localStorage.getItem('selectedPaymentMethod');
    
    if (!paymentMethod) {
        alert('Debes seleccionar un método de pago primero');
        window.location.href = '/checkout.html';
        return false;
    }
    return true;
}

function loadCartTotal() {
    const savedCart = localStorage.getItem('mielCart');
    if (savedCart) {
        try {
            const items = JSON.parse(savedCart);
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalElement = document.getElementById('addShippingTotal');
            if (totalElement) {
                totalElement.textContent = `$${total.toFixed(2)}`;
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }
}

function setupAddressFormatting() {
    // Solo números en código postal
    const zipCode = document.getElementById('zipCode');
    zipCode?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    // Solo números en teléfono
    const phone = document.getElementById('phone');
    phone?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    // Cargar municipios según el estado seleccionado
    const stateSelect = document.getElementById('state');
    const municipalitySelect = document.getElementById('municipality');
    
    stateSelect?.addEventListener('change', (e) => {
        // Aquí cargarías los municipios según el estado
        // Por ahora, ejemplo simple:
        municipalitySelect.innerHTML = '<option value="" disabled selected>Municipio</option>';
        const municipalities = ['Municipio 1', 'Municipio 2', 'Municipio 3'];
        municipalities.forEach(mun => {
            const option = document.createElement('option');
            option.value = mun;
            option.textContent = mun;
            municipalitySelect.appendChild(option);
        });
    });
}
            // Guardar dirección seleccionada
            localStorage.setItem('selectedShippingAddress', selectedAddress.value);
            // Redirigir a confirmación final o procesar compra
            alert('Procesando compra...');
            // window.location.href = '/order-confirmation.html';
        } else {
            alert('Por favor selecciona una dirección de envío');
        }
    });
});

function checkPaymentMethod() {
    const paymentMethod = localStorage.getItem('selectedPaymentMethod');
    
    if (!paymentMethod) {
        alert('Debes seleccionar un método de pago primero');
        window.location.href = '/.html/checkout.html';
        return false;
    }
    return true;
}

function loadCartTotal() {
    const savedCart = localStorage.getItem('mielCart');
    if (savedCart) {
        try {
            const items = JSON.parse(savedCart);
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalElement = document.getElementById('shippingTotal');
            if (totalElement) {
                totalElement.textContent = `$${total.toFixed(2)}`;
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }
}