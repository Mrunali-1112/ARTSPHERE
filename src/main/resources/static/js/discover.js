/**
 * ArtSphere – Discover Page Script
 * Search, Category Filtering, Dynamic Artist Cards & Connect Action
 */

let currentCategory = 'all';
let currentSearch = '';
let searchDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    initUserMenu();
    initActionSheet();
    initSearchAndFilters();
    checkUrlQueryParams();
    loadDiscoverData();
});

/**
 * 1. Initialize User Dropdown Menu & Auth State
 */
async function initUserMenu() {
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserBio = document.getElementById('dropdownUserBio');
    const headerUserAvatar = document.getElementById('headerUserAvatar');
    const bottomNavProfile = document.getElementById('bottomNavProfile');

    if (userAvatarBtn && userDropdownPanel) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userDropdownPanel.classList.toggle('show');
            userAvatarBtn.classList.toggle('open', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!userDropdownPanel.contains(e.target) && !userAvatarBtn.contains(e.target)) {
                userDropdownPanel.classList.remove('show');
                userAvatarBtn.classList.remove('open');
            }
        });
    }

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCurrentUser === 'function') {
            const user = await window.ArtSphereAPI.getCurrentUser();
            if (user) {
                if (dropdownUserName) dropdownUserName.textContent = user.fullName || user.username;
                if (dropdownUserBio) dropdownUserBio.textContent = user.bio || (user.role === 'ROLE_ARTIST' ? 'Featured Artist' : 'Art Enthusiast');
                if (user.profilePicture && headerUserAvatar) {
                    headerUserAvatar.src = user.profilePicture;
                }
                if (bottomNavProfile) {
                    bottomNavProfile.href = `/pages/profile.html?id=${user.id}`;
                }
            } else {
                if (dropdownUserName) dropdownUserName.textContent = 'Guest Creator';
                if (dropdownUserBio) dropdownUserBio.textContent = 'Click to log in';
                if (bottomNavProfile) {
                    bottomNavProfile.href = '/pages/login.html';
                }
            }
        }
    } catch (e) {
        console.warn('Could not load current user session:', e);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.logout === 'function') {
                await window.ArtSphereAPI.logout();
            } else {
                window.location.href = '/pages/login.html';
            }
        });
    }
}

/**
 * 2. Central Floating '+' Button & Creation Action Sheet
 */
function initActionSheet() {
    const centralCreateBtn = document.getElementById('centralCreateBtn');
    const createSheetBackdrop = document.getElementById('createSheetBackdrop');
    const btnCancelActionSheet = document.getElementById('btnCancelActionSheet');

    if (centralCreateBtn && createSheetBackdrop) {
        centralCreateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            createSheetBackdrop.classList.add('show');
        });

        if (btnCancelActionSheet) {
            btnCancelActionSheet.addEventListener('click', () => {
                createSheetBackdrop.classList.remove('show');
            });
        }

        createSheetBackdrop.addEventListener('click', (e) => {
            if (e.target === createSheetBackdrop) {
                createSheetBackdrop.classList.remove('show');
            }
        });
    }
}

/**
 * 3. Search and Category Filter Setup
 */
function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const categoryPills = document.querySelectorAll('.filter-pill-btn');

    if (headerSearchBtn && searchInput) {
        headerSearchBtn.addEventListener('click', () => {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounceTimer);
            currentSearch = e.target.value.trim();
            searchDebounceTimer = setTimeout(() => {
                filterAndRenderArtists();
            }, 300);
        });
    }

    categoryPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-category') || 'all';
            filterAndRenderArtists();
        });
    });

    const headerNotificationsBtn = document.getElementById('headerNotificationsBtn');
    if (headerNotificationsBtn) {
        headerNotificationsBtn.addEventListener('click', () => {
            const badge = headerNotificationsBtn.querySelector('.notification-badge-dot');
            if (badge) badge.style.display = 'none';
            alert('Notifications: 2 new artists near Mumbai joined ArtSphere today!');
        });
    }
}

/**
 * Check URL query parameters (e.g. ?category=Music from Home Page)
 */
function checkUrlQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('category');
    if (cat) {
        currentCategory = cat;
        const categoryPills = document.querySelectorAll('.filter-pill-btn');
        categoryPills.forEach(pill => {
            if (pill.getAttribute('data-category')?.toLowerCase() === cat.toLowerCase()) {
                categoryPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            }
        });
    }
}

/**
 * 4. Load Data from Backend
 */
async function loadDiscoverData() {
    await Promise.allSettled([
        filterAndRenderArtists(),
        loadNearbyArtists()
    ]);
}

/**
 * Query and render featured/filtered artists dynamically
 */
async function filterAndRenderArtists() {
    const container = document.getElementById('featuredArtistsContainer');
    if (!container) return;

    try {
        let artists = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getArtists === 'function') {
            artists = await window.ArtSphereAPI.getArtists(currentCategory, null, currentSearch);
        } else if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getDiscoverArtists === 'function') {
            artists = await window.ArtSphereAPI.getDiscoverArtists({
                category: currentCategory,
                search: currentSearch
            });
        } else {
            const queryParams = new URLSearchParams();
            if (currentCategory && currentCategory !== 'all') queryParams.append('artForm', currentCategory);
            if (currentSearch) queryParams.append('q', currentSearch);
            const res = await fetch(`/api/artists?${queryParams.toString()}`);
            const json = await res.json();
            artists = json.data || [];
        }

        if (artists && artists.length > 0) {
            container.innerHTML = artists.map(artist => `
                <div class="discover-featured-card" data-artist-id="${escapeHtml(artist.id)}">
                    <div class="featured-cover-container">
                        <img src="${escapeHtml(artist.coverImageUrl || '/images/discover_aanya_cover.png')}" 
                             alt="${escapeHtml(artist.name)}" 
                             class="featured-cover-image"
                             onerror="this.src='/images/discover_aanya_cover.png'">
                        <button class="btn-card-heart" aria-label="Favorite">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${artist.favorite ? '#E65C58' : '#FFFFFF'}">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="featured-artist-meta-row">
                        <img src="${escapeHtml(artist.avatarUrl || '/images/user_avatar_nav.png')}" 
                             alt="${escapeHtml(artist.name)}" 
                             class="featured-avatar-image"
                             onerror="this.src='/images/user_avatar_nav.png'">
                        <div class="featured-meta-text">
                            <h3 class="featured-artist-name">${escapeHtml(artist.name)}</h3>
                            <span class="featured-artist-role">${escapeHtml(artist.profession || 'Artist')}</span>
                            <div class="featured-location-line">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#857996" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>${escapeHtml(artist.location || 'Mumbai, MH')}</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn-connect-artist ${artist.connected ? 'connected' : ''}" 
                            data-artist-id="${escapeHtml(artist.id)}">
                        ${artist.connected ? 'Connected' : 'Connect'}
                    </button>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 30px 10px; color: var(--text-muted);">
                    <p style="font-size: 15px; font-weight: 600;">No artists found matching "${escapeHtml(currentSearch || currentCategory)}"</p>
                    <p style="font-size: 12.5px; margin-top: 4px;">Try searching for another art form, skill or location.</p>
                </div>
            `;
        }

        bindConnectButtons();
        bindHeartButtons();
        bindProfileNavigation();
    } catch (err) {
        console.warn('Error loading discover artists:', err);
    }
}

/**
 * Load Artists Near You: GET /api/discover/near-you
 */
async function loadNearbyArtists() {
    const container = document.getElementById('nearYouContainer');
    if (!container) return;

    try {
        let nearby = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getNearbyArtists === 'function') {
            nearby = await window.ArtSphereAPI.getNearbyArtists();
        } else {
            const res = await fetch('/api/artists/near-you');
            const json = await res.json();
            nearby = json.data || [];
        }

        if (nearby && nearby.length > 0) {
            container.innerHTML = nearby.map(artist => `
                <div class="near-artist-card" data-artist-id="${escapeHtml(artist.id)}">
                    <div class="near-artist-thumb-wrapper">
                        <img src="${escapeHtml(artist.avatarUrl || '/images/artist_arjun_thumb.png')}" 
                             alt="${escapeHtml(artist.name)}" 
                             class="near-artist-thumb-img"
                             onerror="this.src='/images/artist_arjun_thumb.png'">
                    </div>
                    <div class="near-artist-info">
                        <div class="near-title-heart-row">
                            <h3 class="near-artist-name">${escapeHtml(artist.name)}</h3>
                            <button class="btn-near-heart" aria-label="Favorite">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#857996" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </button>
                        </div>
                        <span class="near-artist-role">${escapeHtml(artist.profession || 'Creator')}</span>
                        <div class="near-location-line">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#857996" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>${escapeHtml(artist.location || 'Mumbai')}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            bindNearHeartButtons();
            bindProfileNavigation();
        }
    } catch (err) {
        console.warn('Error loading nearby artists:', err);
    }
}

/**
 * 5. Handle Connect Button Click with Backend REST API
 */
function bindConnectButtons() {
    const connectButtons = document.querySelectorAll('.btn-connect-artist');
    connectButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const artistId = btn.getAttribute('data-artist-id');
            if (!artistId) return;

            btn.disabled = true;
            try {
                let res;
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.connectArtist === 'function') {
                    res = await window.ArtSphereAPI.connectArtist(artistId);
                } else {
                    const response = await fetch(`/api/artists/${artistId}/connect`, { method: 'POST' });
                    const json = await response.json();
                    res = json.data;
                }

                const isConnected = res && res.connected;
                if (isConnected) {
                    btn.classList.add('connected');
                    btn.textContent = 'Connected';
                } else {
                    btn.classList.remove('connected');
                    btn.textContent = 'Connect';
                }
            } catch (err) {
                console.error('Connection error:', err);
                // Fallback toggle for instant UI responsiveness
                const isNowConnected = btn.classList.toggle('connected');
                btn.textContent = isNowConnected ? 'Connected' : 'Connect';
            } finally {
                btn.disabled = false;
            }
        });
    });
}

/**
 * 6. Heart favorite toggles
 */
function bindHeartButtons() {
    const heartButtons = document.querySelectorAll('.btn-card-heart');
    heartButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isFav = btn.getAttribute('data-fav') === 'true';
            const svgPath = btn.querySelector('svg path');

            if (isFav) {
                btn.setAttribute('data-fav', 'false');
                btn.style.background = 'rgba(255, 255, 255, 0.35)';
                if (svgPath) svgPath.setAttribute('fill', '#FFFFFF');
            } else {
                btn.setAttribute('data-fav', 'true');
                btn.style.background = '#FFFFFF';
                if (svgPath) svgPath.setAttribute('fill', '#E65C58');
            }
        });
    });
}

function bindNearHeartButtons() {
    const nearHeartBtns = document.querySelectorAll('.btn-near-heart');
    nearHeartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isFav = btn.getAttribute('data-fav') === 'true';
            const svg = btn.querySelector('svg');

            if (isFav) {
                btn.setAttribute('data-fav', 'false');
                if (svg) {
                    svg.setAttribute('stroke', '#857996');
                    svg.setAttribute('fill', 'none');
                }
            } else {
                btn.setAttribute('data-fav', 'true');
                if (svg) {
                    svg.setAttribute('stroke', '#E65C58');
                    svg.setAttribute('fill', '#E65C58');
                }
            }
        });
    });
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function bindProfileNavigation() {
    const cards = document.querySelectorAll('.discover-featured-card, .near-artist-card');
    cards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-connect-artist') || e.target.closest('.btn-card-heart') || e.target.closest('.btn-near-heart')) {
                return;
            }
            const artistId = card.getAttribute('data-artist-id');
            if (artistId) {
                window.location.href = `/pages/artist-profile.html?id=${artistId}`;
            }
        });
    });
}
