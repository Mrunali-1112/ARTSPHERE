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
    },

    // --- Module 2: Home APIs ---
    async getFeaturedArtists() {
        const response = await fetch(`${API_BASE}/home/featured-artists`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch featured artists');
        }
        return result.data || [];
    },

    async getUpcomingEvents() {
        const response = await fetch(`${API_BASE}/home/upcoming-events`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch upcoming events');
        }
        return result.data || [];
    },

    async getCommunities() {
        const response = await fetch(`${API_BASE}/home/communities`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch communities');
        }
        return result.data || [];
    },

    // --- Module 3: Discover APIs ---
    async getDiscoverArtists(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.category && params.category !== 'all') {
            queryParams.append('category', params.category);
        }
        if (params.location) {
            queryParams.append('location', params.location);
        }
        if (params.search) {
            queryParams.append('search', params.search);
        }
        const qs = queryParams.toString();
        const url = `${API_BASE}/discover/artists${qs ? '?' + qs : ''}`;
        const response = await fetch(url);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch discover artists');
        }
        return result.data || [];
    },

    async searchArtists(query) {
        const url = `${API_BASE}/discover/search?q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Search failed');
        }
        return result.data || [];
    },

    async getNearbyArtists() {
        const response = await fetch(`${API_BASE}/discover/near-you`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch nearby artists');
        }
        return result.data || [];
    },

    async connectArtist(artistId) {
        const response = await fetch(`${API_BASE}/discover/connect/${artistId}`, {
            method: 'POST'
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to connect with artist');
        }
        return result.data || {};
    }
};

window.ArtSphereAPI = api;
