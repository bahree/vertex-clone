// Authentication module
const Auth = {
    API_BASE: '/api',

    // API request helper
    async request(endpoint, options = {}) {
        const token = Storage.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${this.API_BASE}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Sign up
    async signup(email, password, username) {
        const data = await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, username })
        });

        Storage.setToken(data.token);
        Storage.setUser(data.user);
        return data.user;
    },

    // Login
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        Storage.setToken(data.token);
        Storage.setUser(data.user);
        return data.user;
    },

    // Logout
    logout() {
        Storage.clear();
        window.location.reload();
    },

    // Get current user
    getCurrentUser() {
        return Storage.getUser();
    },

    // Update profile
    async updateProfile(username) {
        const data = await this.request('/users/me', {
            method: 'PUT',
            body: JSON.stringify({ username })
        });

        Storage.setUser(data.user);
        return data.user;
    },

    // Get user statistics
    async getStats() {
        const data = await this.request('/puzzles/stats/me');
        return data.stats;
    }
};
