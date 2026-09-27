/**
 * ArtSphere – Home Dashboard Script
 * Editorial Neo-Brutalist Architecture & Dynamic REST Integration
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigationDrawer();
    initUserMenu();
    loadHomeData();
});

/**
 * 1. Mobile Navigation Drawer Toggle
 */
function initNavigationDrawer() {
    const navWrapper = document.getElementById('navWrapper');
    const navMobileToggle = document.getElementById('navMobileToggle');

    if (navMobileToggle && navWrapper) {
        navMobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navWrapper.classList.toggle('menu-open');
            const isOpen = navWrapper.classList.contains('menu-open');
            navMobileToggle.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (navWrapper.classList.contains('menu-open') && !navWrapper.contains(e.target)) {
                navWrapper.classList.remove('menu-open');
            }
        });
    }
}

/**
 * 2. User Account Dropdown Menu & Auth State
 */
async function initUserMenu() {
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserBio = document.getElementById('dropdownUserBio');
    const headerUserAvatar = document.getElementById('headerUserAvatar');

    // Toggle dropdown
    if (userAvatarBtn && userDropdownPanel) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userDropdownPanel.classList.toggle('show');
            userAvatarBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdownPanel.contains(e.target) && !userAvatarBtn.contains(e.target)) {
                userDropdownPanel.classList.remove('show');
            }
        });
    }

    // Check currently logged-in user
    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCurrentUser === 'function') {
            const user = await window.ArtSphereAPI.getCurrentUser();
            if (user) {
                if (dropdownUserName) dropdownUserName.textContent = user.fullName || user.username;
                if (dropdownUserBio) dropdownUserBio.textContent = user.bio || (user.role === 'ROLE_ARTIST' ? 'Featured Artist' : 'Artist Member');
                if (user.profilePicture && headerUserAvatar) {
                    headerUserAvatar.src = user.profilePicture;
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
 * 3. Load Dynamic Data from Spring Boot REST Endpoints
 */
async function loadHomeData() {
    await Promise.allSettled([
        loadFeaturedArtists(),
        loadUpcomingEvents()
    ]);
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
            if (res.ok) {
                const json = await res.json();
                artists = json.data || [];
            }
        }

        if (artists && artists.length > 0) {
            container.innerHTML = artists.slice(0, 3).map((artist, idx) => {
                const bgClass = idx % 2 === 1 ? 'card-cream' : 'card-base';
                const coverImg = artist.coverImageUrl || '/images/artist_profile_cover.png';
                const avatarImg = artist.avatarUrl || '/images/artist_profile_avatar.png';
                const profession = artist.profession || 'Artist';
                const location = artist.location || 'Mumbai, MH';

                return `
                    <div class="col-4 col-md-4 col-sm-4 ${bgClass} artist-bento-card" data-artist-id="${escapeHtml(artist.id)}">
                        <div class="artist-cover-box">
                            <img src="${escapeHtml(coverImg)}" 
                                 alt="${escapeHtml(artist.artworkTitle || artist.name)}" 
                                 class="artist-cover-img"
                                 onerror="this.src='/images/artist_profile_cover.png'">
                            <span class="artist-cat-tag">${escapeHtml(profession)}</span>
                        </div>
                        <div class="artist-card-body">
                            <div class="artist-header-row">
                                <img src="${escapeHtml(avatarImg)}" 
                                     alt="${escapeHtml(artist.name)}" 
                                     class="artist-avatar-sm"
                                     onerror="this.src='/images/artist_profile_avatar.png'">
                                <div>
                                    <h3 class="artist-card-name">${escapeHtml(artist.name)}</h3>
                                    <span class="artist-card-loc">${escapeHtml(location)}</span>
                                </div>
                            </div>
                            <p class="artist-card-bio">${escapeHtml(artist.bio || 'Exploring new frontiers in craft and multidisciplinary expression.')}</p>
                            <div class="artist-card-footer">
                                <span class="artist-stat-snippet">${escapeHtml(artist.followersCount || '1.2K')} Followers</span>
                                <a href="/pages/artist-profile.html?id=${encodeURIComponent(artist.id)}" class="btn-pill-secondary btn-sm-card">
                                    <span>View Profile</span>
                                    <span>&rarr;</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.warn('Using fallback featured artists:', err);
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
            if (res.ok) {
                const json = await res.json();
                events = json.data || [];
            }
        }

        if (events && events.length > 0) {
            container.innerHTML = events.slice(0, 3).map(event => {
                const dateParts = (event.eventDate || '25 SEP').trim().split(/\s+/);
                const dayNum = dateParts[0] || '25';
                const monthText = dateParts[1] || 'SEP';
                const location = event.location || 'ArtHouse, Mumbai';
                const timeStr = event.eventTime || '10:00 AM – 1:00 PM';
                const thumbImg = event.imageUrl || '/images/event_watercolor_thumb.png';

                return `
                    <div class="card-base event-neo-card" data-event-id="${escapeHtml(event.id)}">
                        <div class="event-date-stamp">
                            <span class="stamp-day">${escapeHtml(dayNum)}</span>
                            <span class="stamp-month">${escapeHtml(monthText)}</span>
                        </div>
                        <div class="event-thumb-frame">
                            <img src="${escapeHtml(thumbImg)}" 
                                 alt="${escapeHtml(event.title)}" 
                                 class="event-thumb"
                                 onerror="this.src='/images/event_watercolor_thumb.png'">
                        </div>
                        <div class="event-text-block">
                            <span class="pill-tag" style="margin-bottom:6px;">${escapeHtml(event.eventType || 'SESSION')}</span>
                            <h3 class="event-heading">${escapeHtml(event.title)}</h3>
                            <p class="event-loc-line">${escapeHtml(location)} &bull; ${escapeHtml(timeStr)}</p>
                        </div>
                        <div class="event-btn-cell">
                            <a href="/pages/event-details.html?id=${encodeURIComponent(event.id)}" class="btn-pill-secondary">
                                <span>Details</span>
                                <span>&rarr;</span>
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.warn('Using fallback upcoming events:', err);
    }
}

/**
 * Utility: HTML escape
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
