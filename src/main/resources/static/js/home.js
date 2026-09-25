/**
 * ArtSphere – Home Page Script
 * Dynamic REST Integration & Interactive Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    initUserMenu();
    initActionSheet();
    initNotificationAndSearch();
    loadHomeData();
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

    // Toggle dropdown
    if (userAvatarBtn && userDropdownPanel) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userDropdownPanel.classList.toggle('show');
            userAvatarBtn.classList.toggle('open', isOpen);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdownPanel.contains(e.target) && !userAvatarBtn.contains(e.target)) {
                userDropdownPanel.classList.remove('show');
                userAvatarBtn.classList.remove('open');
            }
        });
    }

    // Check currently logged-in user
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

    // Logout handling
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
 * 2. Initialize Central Floating '+' Button & Creation Action Sheet
 */
function initActionSheet() {
    const centralCreateBtn = document.getElementById('centralCreateBtn');
    const createSheetBackdrop = document.getElementById('createSheetBackdrop');
    const createSheetCard = document.getElementById('createSheetCard');
    const btnCancelActionSheet = document.getElementById('btnCancelActionSheet');

    if (centralCreateBtn && createSheetBackdrop) {
        centralCreateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            createSheetBackdrop.classList.add('show');
        });

        // Close on cancel
        if (btnCancelActionSheet) {
            btnCancelActionSheet.addEventListener('click', () => {
                createSheetBackdrop.classList.remove('show');
            });
        }

        // Close when clicking backdrop outside card
        createSheetBackdrop.addEventListener('click', (e) => {
            if (e.target === createSheetBackdrop) {
                createSheetBackdrop.classList.remove('show');
            }
        });
    }
}

/**
 * 3. Search and Notification Interactions
 */
function initNotificationAndSearch() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            window.location.href = '/pages/discover.html';
        });
    }

    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            const badge = notificationsBtn.querySelector('.notification-badge-dot');
            if (badge) {
                badge.style.display = 'none';
            }
            alert('Notifications: You have 1 upcoming watercolor workshop reminder!');
        });
    }
}

/**
 * 4. Load Dynamic Data from Spring Boot REST Endpoints
 */
async function loadHomeData() {
    await Promise.allSettled([
        loadFeaturedArtists(),
        loadUpcomingEvents(),
        loadCommunities()
    ]);
    bindFavoriteButtons();
}

/**
 * Load Featured Artists: GET /api/home/featured-artists
 */
async function loadFeaturedArtists() {
    const container = document.getElementById('featuredArtistsContainer');
    if (!container) return;

    try {
        let artists = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getFeaturedArtists === 'function') {
            artists = await window.ArtSphereAPI.getFeaturedArtists();
        } else {
            const res = await fetch('/api/home/featured-artists');
            const json = await res.json();
            artists = json.data || [];
        }

        if (artists && artists.length > 0) {
            container.innerHTML = artists.map(artist => `
                <div class="featured-artist-card" data-artist-id="${escapeHtml(artist.id)}">
                    <div class="artist-cover-wrapper">
                        <img src="${escapeHtml(artist.coverImageUrl || '/images/artist_aanya_cover.png')}" 
                             alt="${escapeHtml(artist.artworkTitle || artist.name)}" 
                             class="artist-cover-img"
                             onerror="this.src='/images/artist_aanya_cover.png'">
                        <button class="btn-card-favorite" aria-label="Favorite Artist">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="artist-info-row">
                        <img src="${escapeHtml(artist.avatarUrl || '/images/user_avatar_nav.png')}" 
                             alt="${escapeHtml(artist.name)}" 
                             class="artist-avatar-img"
                             onerror="this.src='/images/user_avatar_nav.png'">
                        <div class="artist-meta">
                            <h3 class="artist-name">${escapeHtml(artist.name)}</h3>
                            <span class="artist-profession">${escapeHtml(artist.profession || 'Artist')}</span>
                        </div>
                    </div>
                    <a href="/pages/profile.html?id=${encodeURIComponent(artist.id)}" class="btn-view-profile">View Profile</a>
                </div>
            `).join('');
        }
    } catch (err) {
        console.warn('Using fallback featured artists due to network/API error:', err);
    }
}

/**
 * Load Upcoming Events: GET /api/home/upcoming-events
 */
async function loadUpcomingEvents() {
    const container = document.getElementById('upcomingEventsContainer');
    if (!container) return;

    try {
        let events = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getUpcomingEvents === 'function') {
            events = await window.ArtSphereAPI.getUpcomingEvents();
        } else {
            const res = await fetch('/api/home/upcoming-events');
            const json = await res.json();
            events = json.data || [];
        }

        if (events && events.length > 0) {
            container.innerHTML = events.map(event => {
                const dateParts = (event.eventDate || '25 SEP').split(' ');
                const dayNum = dateParts[0] || '25';
                const monthText = dateParts[1] || 'SEP';

                return `
                    <div class="event-banner-card" data-event-id="${escapeHtml(event.id)}">
                        <div class="event-date-box">
                            <span class="event-day-number">${escapeHtml(dayNum)}</span>
                            <span class="event-month-text">${escapeHtml(monthText)}</span>
                        </div>
                        <div class="event-thumb-wrapper">
                            <img src="${escapeHtml(event.imageUrl || '/images/event_watercolor_thumb.png')}" 
                                 alt="${escapeHtml(event.title)}" 
                                 class="event-thumb-img"
                                 onerror="this.src='/images/event_watercolor_thumb.png'">
                        </div>
                        <div class="event-details-content">
                            <h3 class="event-title">${escapeHtml(event.title)}</h3>
                            <div class="event-info-line">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B5E7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>${escapeHtml(event.location)}</span>
                            </div>
                            <div class="event-info-line">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B5E7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>${escapeHtml(event.eventTime)}</span>
                            </div>
                        </div>
                        <div class="event-action-wrapper">
                            <a href="/pages/discover.html?event=${encodeURIComponent(event.id)}" class="btn-event-details">View Details</a>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.warn('Using fallback upcoming events due to network/API error:', err);
    }
}

/**
 * Load Communities: GET /api/home/communities
 */
async function loadCommunities() {
    const container = document.getElementById('communityBannerContainer');
    if (!container) return;

    try {
        let communities = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCommunities === 'function') {
            communities = await window.ArtSphereAPI.getCommunities();
        } else {
            const res = await fetch('/api/home/communities');
            const json = await res.json();
            communities = json.data || [];
        }

        if (communities && communities.length > 0) {
            const primaryComm = communities[0];
            container.innerHTML = `
                <div class="community-content-left">
                    <h2 class="community-heading">${escapeHtml(primaryComm.name || "Let's Create Together")}</h2>
                    <p class="community-subtext">${escapeHtml(primaryComm.description || "Join communities, find collaborators and be part of a growing creative world.")}</p>
                </div>
                <div class="community-right-wrapper">
                    <img src="${escapeHtml(primaryComm.imageUrl || '/images/community_leaf_decor.png')}" 
                         alt="Floral decor" 
                         class="community-leaf-img"
                         onerror="this.src='/images/community_leaf_decor.png'">
                    <a href="/pages/communities.html" class="btn-explore-communities">
                        <span>Explore Communities</span>
                        <span class="arrow-right">&rarr;</span>
                    </a>
                </div>
            `;
        }
    } catch (err) {
        console.warn('Using fallback communities due to network/API error:', err);
    }
}

/**
 * Interactive favorite/heart button click handler
 */
function bindFavoriteButtons() {
    const favButtons = document.querySelectorAll('.btn-card-favorite');
    favButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const svgPath = btn.querySelector('svg path');
            const isFav = btn.getAttribute('data-fav') === 'true';

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

/**
 * XSS Helper
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
