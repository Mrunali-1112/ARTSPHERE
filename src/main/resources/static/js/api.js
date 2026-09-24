/**
 * ArtSphere API Service Module
 * Handles REST requests to Spring Boot backend
 */
const API_BASE = '/api';

const api = {
    async register(data) {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Registration failed');
        }
        return result;
    },

    async login(username, password) {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Invalid username or password');
        }
        return result;
    },

    async getCurrentUser() {
        try {
            const response = await fetch(`${API_BASE}/auth/me`);
            if (!response.ok) return null;
            const result = await response.json();
            return result.data;
        } catch (e) {
            return null;
        }
    },

    async logout() {
        try {
            await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        } catch (e) {
            console.error('Logout error:', e);
        }
        window.location.href = '/pages/login.html';
    },

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE}/artworks/upload`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Image upload failed');
        }
        return result.data ? result.data.imageUrl : null;
    }
};

window.ArtSphereAPI = api;
