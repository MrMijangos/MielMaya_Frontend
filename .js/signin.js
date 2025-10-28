document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('toggleButton');

    toggleButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        
        passwordInput.setAttribute('type', type);

        
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('confirm-password');
    const toggleButton2 = document.getElementById('toggleButton2');

    toggleButton2.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        
        passwordInput.setAttribute('type', type);

        
    });
});