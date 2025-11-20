// services/auth-service.js
const API_BASE_URL = 'http://54.152.16.222:7000/api';

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
                    celular: userData.celular || '',
                    ID_Rol: userData.ID_Rol || 1 // Permite registrar como admin si se pasa el campo
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
                // ✅ CORREGIDO: Guardar el usuario completo
                localStorage.setItem('usuario', JSON.stringify(data));
                localStorage.setItem('userData', JSON.stringify(data)); // Backup
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
        localStorage.removeItem('userData');
        window.location.href = '/html/login.html';
    }

    getCurrentUser() {
        // ✅ CORREGIDO: Buscar en ambas ubicaciones
        const userData = localStorage.getItem('usuario') || localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    // ✅ NUEVO MÉTODO: Obtener ID del usuario de forma segura
    getUserId() {
        const user = this.getCurrentUser();
        if (!user) return null;
        
        // Buscar el ID en diferentes propiedades posibles
        return user.idUsuario || user.id_user || user.id || null;
    }
}

export default new AuthService();