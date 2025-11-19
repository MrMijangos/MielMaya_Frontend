// common/api/auth-service.js
const API_BASE_URL = 'http://localhost:7000/api';

class AuthService {
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: userData.nombre,
                    correo: userData.correo,
                    contrasenia: userData.contrasenia,
                    celular: userData.celular || '' // Campo opcional
                })
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Error al registrar usuario'
                };
            }
        } catch (error) {
            console.error('Error en registro:', error);
            return {
                success: false,
                error: 'Error de conexión con el servidor'
            };
        }
    }

    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correo: credentials.correo,
                    contrasenia: credentials.contrasenia
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('usuario', JSON.stringify(data));
                return {
                    success: true,
                    data: data,
                    rol: data.rol
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Credenciales inválidas'
                };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                error: 'Error de conexión con el servidor'
            };
        }
    }

    logout() {
        localStorage.removeItem('usuario');
        window.location.href = '/html/login.html';
    }

    getCurrentUser() {
        const userData = localStorage.getItem('usuario');
        return userData ? JSON.parse(userData) : null;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }
}

export default new AuthService();