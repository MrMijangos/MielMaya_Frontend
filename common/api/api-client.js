// common/api/api-client.js

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:7000';
        this.token = localStorage.getItem('authToken');
    }

    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        };

        // Agregar token si existe
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Manejar respuestas sin contenido (204)
            if (response.status === 204) {
                return { success: true };
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Métodos HTTP
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Guardar token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Eliminar token
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }
}

// Instancia global
const apiClient = new APIClient();
export default apiClient;