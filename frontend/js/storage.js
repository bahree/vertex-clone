// Storage utility for local and API-based data
const Storage = {
    // Get JWT token
    getToken() {
        return localStorage.getItem('vertex_token');
    },

    // Set JWT token
    setToken(token) {
        localStorage.setItem('vertex_token', token);
    },

    // Remove JWT token
    removeToken() {
        localStorage.removeItem('vertex_token');
    },

    // Get user data
    getUser() {
        const userStr = localStorage.getItem('vertex_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Set user data
    setUser(user) {
        localStorage.setItem('vertex_user', JSON.stringify(user));
    },

    // Remove user data
    removeUser() {
        localStorage.removeItem('vertex_user');
    },

    // Clear all data
    clear() {
        this.removeToken();
        this.removeUser();
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }
};
