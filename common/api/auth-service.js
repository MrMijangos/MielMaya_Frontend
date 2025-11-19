// common/api/auth-service.js
import apiClient from './api-client.js';

class AuthService {
    async register(userData) {
        try {
            const response = await apiClient.post('/users', {
                nombre: userData.nombre,
                correo: userData.correo,
                contraseña: userData.contraseña
            });
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async login(correo, contraseña) {
        try {
            const response = await apiClient.post('/login', {
                correo,
                contraseña
            });

            if (response.token) {
                apiClient.setToken(response.token);
                // Guardar datos del usuario
                await this.getCurrentUser();
                return { success: true, token: response.token };
            }

            return { success: false, error: 'No se recibió token' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await apiClient.post('/logout');
            apiClient.clearToken();
            localStorage.removeItem('userData');
            return { success: true };
        } catch (error) {
            // Limpiar localmente aunque falle la petición
            apiClient.clearToken();
            localStorage.removeItem('userData');
            return { success: true };
        }
    }

    async getCurrentUser() {
        try {
            // Implementar endpoint /users/me en backend
            const user = await apiClient.get('/users/me');
            localStorage.setItem('userData', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }
}

export default new AuthService();