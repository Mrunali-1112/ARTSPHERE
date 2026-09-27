/**
 * ArtSphere API Service Module
 * Handles REST requests to Spring Boot backend
 */
const API_BASE = '/api';

const api = {
    // --- Authentication ---
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
        return result.data || [];
    },

    async getUpcomingEvents() {
        const response = await fetch(`${API_BASE}/home/upcoming-events`);
        const result = await response.json();
        return result.data || [];
    },

    // --- Module 3: Discover & Artists APIs ---
    async getArtists(artForm, location, q) {
        const params = new URLSearchParams();
        if (artForm && artForm !== 'All') params.append('artForm', artForm);
        if (location) params.append('location', location);
        if (q) params.append('q', q);
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/artists${queryStr}`);
        const result = await response.json();
        return result.data || [];
    },

    async searchArtists(q) {
        const response = await fetch(`${API_BASE}/artists/search?q=${encodeURIComponent(q)}`);
        const result = await response.json();
        return result.data || [];
    },

    async getFeaturedDiscoverArtists() {
        const response = await fetch(`${API_BASE}/artists/featured`);
        const result = await response.json();
        return result.data || [];
    },

    async getNearbyArtists() {
        const response = await fetch(`${API_BASE}/artists/near-you`);
        const result = await response.json();
        return result.data || [];
    },

    async connectArtist(artistId) {
        const response = await fetch(`${API_BASE}/artists/${artistId}/connect`, {
            method: 'POST'
        });
        const result = await response.json();
        return result;
    },

    async getArtistProfile(artistId) {
        const response = await fetch(`${API_BASE}/artists/${artistId}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch artist profile');
        }
        return result.data;
    },

    async updateArtistProfile(artistId, data) {
        const response = await fetch(`${API_BASE}/artists/${artistId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update profile');
        }
        return result.data;
    },

    async getArtistPortfolio(artistId, category) {
        const query = (category && category.toLowerCase() !== 'all') ? `?category=${encodeURIComponent(category)}` : '';
        const response = await fetch(`${API_BASE}/artists/${artistId}/portfolio${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async toggleFollowArtist(artistId) {
        const response = await fetch(`${API_BASE}/artists/${artistId}/follow`, {
            method: 'POST'
        });
        const result = await response.json();
        return result.data || result;
    },

    // --- Module 4 & 5: Portfolio & Opportunities ---
    async createPortfolioItem(data) {
        const response = await fetch(`${API_BASE}/portfolio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create portfolio item');
        }
        return result.data;
    },

    async updatePortfolioItem(id, data) {
        const response = await fetch(`${API_BASE}/portfolio/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update portfolio item');
        }
        return result.data;
    },

    async deletePortfolioItem(id) {
        const response = await fetch(`${API_BASE}/portfolio/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete portfolio item');
        }
        return result.data;
    },

    async getOpportunities(category, location, q) {
        const params = new URLSearchParams();
        if (category && category.toLowerCase() !== 'all') params.append('category', category);
        if (location) params.append('location', location);
        if (q) params.append('search', q);
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/opportunities${queryStr}`);
        const result = await response.json();
        return result.data || [];
    },

    async searchOpportunities(q) {
        const response = await fetch(`${API_BASE}/opportunities/search?q=${encodeURIComponent(q)}`);
        const result = await response.json();
        return result.data || [];
    },

    async getFeaturedOpportunity() {
        const response = await fetch(`${API_BASE}/opportunities/featured`);
        const result = await response.json();
        return result.data || null;
    },

    async getOpportunityDetails(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/opportunities/${id}${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch opportunity details');
        }
        return result.data;
    },

    async applyToOpportunity(id, userId, notes) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/opportunities/${id}/apply${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: notes || 'Applied via ArtSphere web portal' })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit application');
        }
        return result;
    },

    // --- Module 6: Posts & Feed ---
    async getPosts(artForm, tab, search, userId) {
        const params = new URLSearchParams();
        if (artForm && artForm.toLowerCase() !== 'all') params.append('artForm', artForm);
        if (tab) params.append('tab', tab);
        if (search) params.append('search', search);
        if (userId) params.append('userId', userId);
        const qStr = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/posts${qStr}`);
        const result = await response.json();
        return result.data || [];
    },

    async searchPosts(query, userId) {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (userId) params.append('userId', userId);
        const qStr = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/posts/search${qStr}`);
        const result = await response.json();
        return result.data || [];
    },

    async getPostDetails(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/posts/${id}${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch post details');
        }
        return result.data;
    },

    async createPost(postData, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/posts${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create post');
        }
        return result.data;
    },

    async togglePostLike(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/posts/${id}/like${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        return result.data;
    },

    async togglePostSave(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/posts/${id}/save${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        return result.data;
    },

    async getPostComments(id) {
        const response = await fetch(`${API_BASE}/posts/${id}/comments`);
        const result = await response.json();
        return result.data || [];
    },

    async addPostComment(id, commentData, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/posts/${id}/comments${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commentData)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add comment');
        }
        return result.data;
    },

    // --- Module 7: Collaborations & Requests ---
    async getCollaborations(skill, location, search, userId) {
        const params = new URLSearchParams();
        if (skill && skill.toLowerCase() !== 'all') params.append('skill', skill);
        if (location) params.append('location', location);
        if (search) params.append('search', search);
        if (userId) params.append('userId', userId);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/collaborations${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async searchCollaborations(searchQuery, userId) {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (userId) params.append('userId', userId);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/collaborations/search${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async getCollaborationDetails(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/collaborations/${id}${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch collaboration details');
        }
        return result.data;
    },

    async createCollaboration(collabData, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/collaborations${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(collabData)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create collaboration post');
        }
        return result.data;
    },

    async updateCollaborationStatus(id, status, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/collaborations/${id}/status${query}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        return result.data;
    },

    async sendCollaborationRequest(collabId, requestData, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const url = collabId ? `${API_BASE}/collaborations/${collabId}/requests${query}` : `${API_BASE}/collaboration-requests${query}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to send collaboration request');
        }
        return result.data;
    },

    async getCollaborationRequests(type = 'received', userId) {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (userId) params.append('userId', userId);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/collaboration-requests${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async acceptCollaborationRequest(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/collaboration-requests/${id}/accept${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        return result.data;
    },

    async rejectCollaborationRequest(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/collaboration-requests/${id}/reject${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        return result.data;
    },

    // --- Module 8: Communities ---
    async getCommunities(category, search, userId) {
        const params = new URLSearchParams();
        if (category && category.toLowerCase() !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        if (userId) params.append('userId', userId);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/communities${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async searchCommunities(query, userId) {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (userId) params.append('userId', userId);
        const qStr = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/communities/search${qStr}`);
        const result = await response.json();
        return result.data || [];
    },

    async getCommunityDetails(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/communities/${id}${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch community details');
        }
        return result.data;
    },

    async createCommunity(commData, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/communities${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commData)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create community');
        }
        return result.data;
    },

    async joinCommunity(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/communities/${id}/join${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to join community');
        }
        return result.data;
    },

    async leaveCommunity(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/communities/${id}/leave${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to leave community');
        }
        return result.data;
    },

    async getCommunityMembers(id) {
        const response = await fetch(`${API_BASE}/communities/${id}/members`);
        const result = await response.json();
        return result.data || [];
    },

    async getCommunityPosts(id, category, userId) {
        const params = new URLSearchParams();
        if (category && category.toLowerCase() !== 'all') params.append('category', category);
        if (userId) params.append('userId', userId);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/communities/${id}/posts${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async createCommunityPost(id, postData, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/communities/${id}/posts${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create community post');
        }
        return result.data;
    },

    async getCommunityEvents(id, type, userId) {
        const params = new URLSearchParams();
        if (type && type.toLowerCase() !== 'all') params.append('type', type);
        if (userId) params.append('userId', userId);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/communities/${id}/events${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async registerCommunityEvent(eventId, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/communities/events/${eventId}/register${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to register for event');
        }
        return result.data;
    },

    // --- Module 9: Events ---
    async getEvents(artForm, search, userId) {
        const params = new URLSearchParams();
        if (artForm && artForm.toLowerCase() !== 'all') params.append('artForm', artForm);
        if (search) params.append('search', search);
        if (userId) params.append('userId', userId);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/events${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async searchEvents(q, userId) {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (userId) params.append('userId', userId);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/events/search${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async getFeaturedEvents(userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/events/featured${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async getEventDetails(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/events/${id}${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch event details');
        }
        return result.data;
    },

    async registerForEvent(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/events/${id}/register${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to register for event');
        }
        return result.data;
    },

    async getEventRegistrationStatus(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/events/${id}/registration-status${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch registration status');
        }
        return result.data;
    },

    // --- Module 10: My Applications ---
    async getMyApplications(userId, category, status) {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (category && category !== 'ALL') params.append('category', category);
        if (status && status !== 'ALL') params.append('status', status);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/my-applications${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch applications');
        }
        return result.data;
    },

    async getMyApplicationsSummary(userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/my-applications/summary${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch applications summary');
        }
        return result.data;
    },

    // --- Module 11: Opportunities ---
    async getOpportunities(category, location, search) {
        const params = new URLSearchParams();
        if (category && category.toLowerCase() !== 'all') params.append('category', category);
        if (location) params.append('location', location);
        if (search) params.append('search', search);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/opportunities${query}`);
        const result = await response.json();
        return result.data || [];
    },

    async getFeaturedOpportunity() {
        const response = await fetch(`${API_BASE}/opportunities/featured`);
        const result = await response.json();
        return result.data;
    },

    async getOpportunityDetails(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/opportunities/${id}${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch opportunity details');
        }
        return result.data;
    },

    async applyToOpportunity(id, userId, notes) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/opportunities/${id}/apply${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: notes || 'Applied via ArtSphere web portal' })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to apply to opportunity');
        }
        return result.data;
    },

    async toggleOpportunityBookmark(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/opportunities/${id}/bookmark${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        return result.data;
    },

    // --- Notifications ---
    async getNotifications(userId, category) {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (category && category !== 'ALL') params.append('category', category);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE}/notifications${query}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch notifications');
        }
        return result.data;
    },

    async markNotificationRead(id, userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/notifications/${id}/read${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        return result.data;
    },

    async markAllNotificationsRead(userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const response = await fetch(`${API_BASE}/notifications/read-all${query}`, {
            method: 'POST'
        });
        const result = await response.json();
        return result.data;
    }
};

window.ArtSphereAPI = api;
