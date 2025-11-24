
class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:7000';
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        let fixedEndpoint = endpoint;
        if (!fixedEndpoint.startsWith('/')) {
            fixedEndpoint = '/' + fixedEndpoint;
        }
        const url = `${this.baseURL}${fixedEndpoint}`;
        
        console.log(' API Call:', url, options.method || 'POST');
        if (options.body) {
            console.log('Request Body:', options.body); 
        }
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            console.log(' Response Status:', response.status); 

            if (response.status === 204) {
                return { success: true };
            }

            const text = await response.text();
            let data;
            
            try {
                data = text ? JSON.parse(text) : null;
            } catch (e) {
                data = text;
            }

            console.log(' Response Data:', data); 

            if (!response.ok) {
                throw new Error(
                    (data && (data.error || data.message)) || 
                    `Error: ${response.status}`
                );
            }

            return {
                success: true,
                data: data,
                status: response.status
            };
            
        } catch (error) {
            console.error(' API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT', 
            body: JSON.stringify(body)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }
}

const apiClient = new APIClient();
export default apiClient;