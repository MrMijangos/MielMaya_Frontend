// common/api/api-client.js

class APIClient {
    constructor() {
        this.baseURL = 'http://54.152.16.222:7000';
        this.token = localStorage.getItem('authToken');
    }

    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        // ✅ AGREGADO: Debug de URL
        let fixedEndpoint = endpoint;
        if (!fixedEndpoint.startsWith('/')) {
            fixedEndpoint = '/' + fixedEndpoint;
        }
        const url = `${this.baseURL}${fixedEndpoint}`;
        
        console.log('🔍 API Call:', url, options.method || 'POST');
        console.log('📦 Request Body:', options.body); // ✅ AGREGADO
        
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
            
            console.log('📡 Response Status:', response.status); 

            if (response.status === 204) {
                return { success: true };
            }

            // ✅ CORRECCIÓN: Intentar leer como texto primero
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text); // Intentar parsear JSON
            } catch (e) {
                // Si falla, usar el texto como mensaje (para "Item eliminado")
                data = { message: text };
            }

            console.log('📨 Response Data:', data); 

            if (!response.ok) {
                throw new Error(data.error || data.message || `Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
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