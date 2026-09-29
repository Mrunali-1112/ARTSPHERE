/**
 * ArtSphere – Discover & Creative Directory Dashboard Controller
 * Soft Pastel Lavender / Plum SaaS Creative Workspace
 * Real Dynamic APIs, Real MySQL Data, Authentication & Live Connection Toggling
 */

let allDiscoverItems = [];
let currentCategory = 'all';
let currentLocation = 'all';
let currentSort = 'relevant';
let currentSearch = '';
let searchDebounceTimer = null;
let isBookmarksOnly = false;
let currentViewMode = 'grid';

// Calendar State (August 2024 to match reference image)
let calCurrentMonth = 7; // August (0-indexed)
let calCurrentYear = 2024;
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Bookmarks store in localStorage
const BOOKMARK_KEY = 'artsphere_discover_bookmarks';
let bookmarkedIds = new Set(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]'));

document.addEventListener('DOMContentLoaded', () => {
    initUserSession();
    initMobileDrawer();
    initToolbarControls();
    initMorePillsToggle();
    initViewToggles();
    initCalendarControls();
    checkUrlQueryParams();
    loadDiscoverData();
});

/**
 * 1. User Session & Authentication Management
 */
async function initUserSession() {
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserBio = document.getElementById('dropdownUserBio');
    const headerUserAvatar = document.getElementById('headerUserAvatar');
    const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
    const sidebarUserName = document.getElementById('sidebarUserName');

    // 1. Try reading from sessionStorage or localStorage
    try {
        const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (stored) {
            const user = JSON.parse(stored);
            const name = user.name || user.fullName || user.username || 'Mrunali';
            if (dropdownUserName) dropdownUserName.textContent = name;
            if (sidebarUserName) sidebarUserName.textContent = name;
            if (user.bio && dropdownUserBio) dropdownUserBio.textContent = user.bio;
            if (user.avatarUrl) {
                if (headerUserAvatar) headerUserAvatar.src = user.avatarUrl;
                if (sidebarUserAvatar) sidebarUserAvatar.src = user.avatarUrl;
            }
        }
    } catch (e) {
        console.warn('Could not read user session from storage', e);
    }

    // 2. Fetch authenticated user from API if available
    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCurrentUser === 'function') {
            const user = await window.ArtSphereAPI.getCurrentUser();
            if (user) {
                const name = user.fullName || user.username || 'Mrunali';
                if (dropdownUserName) dropdownUserName.textContent = name;
                if (sidebarUserName) sidebarUserName.textContent = name;
                if (dropdownUserBio) dropdownUserBio.textContent = user.bio || (user.role === 'ROLE_ARTIST' ? 'Featured Artist' : 'Artist Member');
                if (user.profilePicture) {
                    if (headerUserAvatar) headerUserAvatar.src = user.profilePicture;
                    if (sidebarUserAvatar) sidebarUserAvatar.src = user.profilePicture;
                }
            }
        }
    } catch (e) {
        console.warn('Could not verify currentUser via API', e);
    }

    // Toggle Dropdown Panel
    if (userAvatarBtn && userDropdownPanel) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userDropdownPanel.classList.toggle('show');
            userAvatarBtn.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (userDropdownPanel.classList.contains('show') && !userDropdownPanel.contains(e.target)) {
                userDropdownPanel.classList.remove('show');
                userAvatarBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Logout Handlers
    const handleLogout = async (e) => {
        if (e) e.preventDefault();
        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.logout === 'function') {
                await window.ArtSphereAPI.logout();
            }
        } catch (err) {
            console.warn('Logout API failed, clearing local session:', err);
        } finally {
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/landing.html';
        }
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
}

/**
 * 2. Mobile Drawer Navigation Toggle
 */
function initMobileDrawer() {
    const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebar = document.getElementById('dashboardSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (mobileMenuTrigger && sidebar && backdrop) {
        mobileMenuTrigger.addEventListener('click', () => {
            sidebar.classList.add('drawer-open');
            backdrop.classList.add('active');
        });

        const closeDrawer = () => {
            sidebar.classList.remove('drawer-open');
            backdrop.classList.remove('active');
        };

        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeDrawer);
        backdrop.addEventListener('click', closeDrawer);
    }
}

/**
 * 3. Toolbar Controls (Search, Categories, Location, Sort)
 */
function initToolbarControls() {
    const searchInput = document.getElementById('searchInput');
    const topHeaderSearchInput = document.getElementById('topHeaderSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const categoryPills = document.querySelectorAll('.filter-pill-btn:not(.more-pill-btn)');
    const locationSelect = document.getElementById('locationSelect');
    const sortSelect = document.getElementById('sortSelect');
    const btnFilterBookmarks = document.getElementById('btnFilterBookmarks');
    const btnFindCreators = document.getElementById('btnFindCreators');

    // Debounced Search Input in Filter Card
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounceTimer);
            currentSearch = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = currentSearch ? 'flex' : 'none';
            }
            searchDebounceTimer = setTimeout(() => {
                filterAndRenderDiscoverFeed();
            }, 200);
        });
    }

    // Top Header Search Sync
    if (topHeaderSearchInput) {
        topHeaderSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = topHeaderSearchInput.value.trim();
                currentSearch = query;
                if (searchInput) {
                    searchInput.value = query;
                    if (clearSearchBtn) clearSearchBtn.style.display = query ? 'flex' : 'none';
                }
                filterAndRenderDiscoverFeed();
                const filterCard = document.getElementById('discoverFilterCard');
                if (filterCard) filterCard.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Clear Search Button
    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearch = '';
            clearSearchBtn.style.display = 'none';
            searchInput.focus();
            filterAndRenderDiscoverFeed();
        });
    }

    // Discipline Filter Pills
    categoryPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-category') || 'all';
            isBookmarksOnly = false;
            filterAndRenderDiscoverFeed();
        });
    });

    // Location Select Dropdown
    if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            currentLocation = e.target.value;
            filterAndRenderDiscoverFeed();
        });
    }

    // Sort Select Dropdown
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            filterAndRenderDiscoverFeed();
        });
    }

    // Quick Link: Saved Creators
    if (btnFilterBookmarks) {
        btnFilterBookmarks.addEventListener('click', () => {
            isBookmarksOnly = !isBookmarksOnly;
            if (isBookmarksOnly) {
                showToast('Filtering by Saved Creators');
            } else {
                showToast('Showing all creators');
            }
            filterAndRenderDiscoverFeed();
        });
    }

    // Hero Action: Find Creators smooth scroll
    if (btnFindCreators) {
        btnFindCreators.addEventListener('click', (e) => {
            e.preventDefault();
            const filterCard = document.getElementById('discoverFilterCard');
            if (filterCard) {
                filterCard.scrollIntoView({ behavior: 'smooth' });
                if (searchInput) searchInput.focus();
            }
        });
    }
}

/**
 * 4. Expandable "More ⌄" Pills Toggle
 */
function initMorePillsToggle() {
    const moreBtn = document.getElementById('morePillsToggle');
    const extraPills = document.querySelectorAll('.extra-pill');

    if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = moreBtn.classList.toggle('expanded');
            extraPills.forEach(p => {
                p.style.display = isExpanded ? 'inline-flex' : 'none';
            });
            const chevron = moreBtn.querySelector('.chevron-down');
            if (chevron) {
                chevron.innerHTML = isExpanded ? '&and;' : '&or;';
            }
        });
    }
}

/**
 * 5. Grid vs List View Mode Switches
 */
function initViewToggles() {
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    const container = document.getElementById('discoverCardsGrid');

    if (gridBtn && listBtn && container) {
        gridBtn.addEventListener('click', () => {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            currentViewMode = 'grid';
            container.classList.remove('list-view-mode');
        });

        listBtn.addEventListener('click', () => {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            currentViewMode = 'list';
            container.classList.add('list-view-mode');
        });
    }
}

/**
 * 6. Interactive Calendar Controller
 */
function initCalendarControls() {
    const prevBtn = document.getElementById('calPrevBtn');
    const nextBtn = document.getElementById('calNextBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            calCurrentMonth--;
            if (calCurrentMonth < 0) {
                calCurrentMonth = 11;
                calCurrentYear--;
            }
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            calCurrentMonth++;
            if (calCurrentMonth > 11) {
                calCurrentMonth = 0;
                calCurrentYear++;
            }
            renderCalendar();
        });
    }

    renderCalendar();
}

function renderCalendar() {
    const monthLabel = document.getElementById('calMonthYear');
    const daysGrid = document.getElementById('calDaysGrid');
    if (!daysGrid) return;

    if (monthLabel) {
        monthLabel.textContent = `${MONTH_NAMES[calCurrentMonth]} ${calCurrentYear}`;
    }

    const firstDayIndex = new Date(calCurrentYear, calCurrentMonth, 1).getDay(); // 0 = Sun
    const totalDays = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();

    // Default highlight days in August 2024 (12, 24) to match reference design
    const eventDays = new Set();
    if (calCurrentMonth === 7 && calCurrentYear === 2024) {
        eventDays.add(12);
        eventDays.add(24);
    }

    let cellsHtml = '';

    // Empty cells before start of month
    for (let i = 0; i < firstDayIndex; i++) {
        cellsHtml += `<div class="cal-day-cell empty"></div>`;
    }

    // Days of month
    for (let day = 1; day <= totalDays; day++) {
        const hasEvent = eventDays.has(day);
        const eventClass = hasEvent ? 'has-event' : '';
        cellsHtml += `
            <div class="cal-day-cell ${eventClass}" data-day="${day}" title="${hasEvent ? 'Events scheduled' : ''}">
                ${day}
            </div>
        `;
    }

    daysGrid.innerHTML = cellsHtml;

    // Click date cell to show toast
    daysGrid.querySelectorAll('.cal-day-cell.has-event').forEach(cell => {
        cell.addEventListener('click', () => {
            const day = cell.getAttribute('data-day');
            if (day === '12') {
                showToast('Open Jam Session scheduled for August 12 (6:00 PM - 9:00 PM)');
            } else if (day === '24') {
                showToast('Indie Showcase Night scheduled for August 24 (4:00 PM - 8:00 PM)');
            } else {
                showToast(`Schedule event selected for ${MONTH_NAMES[calCurrentMonth]} ${day}`);
            }
        });
    });
}

/**
 * 7. Check URL query parameters
 */
function checkUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category') || params.get('artForm');
    const loc = params.get('location');
    const q = params.get('q') || params.get('search');

    if (cat) {
        currentCategory = cat;
        const targetPill = document.querySelector(`.filter-pill-btn[data-category="${CSS.escape(cat)}"]`);
        if (targetPill) {
            document.querySelectorAll('.filter-pill-btn').forEach(p => p.classList.remove('active'));
            targetPill.classList.add('active');
        }
    }

    if (loc) {
        currentLocation = loc;
        const locationSelect = document.getElementById('locationSelect');
        if (locationSelect) {
            locationSelect.value = loc;
        }
    }

    if (q) {
        currentSearch = q;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = q;
            const clearBtn = document.getElementById('clearSearchBtn');
            if (clearBtn) clearBtn.style.display = 'flex';
        }
    }
}

/**
 * 8. Load Discover Data: Merges real database artists with reference cards
 */
async function loadDiscoverData() {
    let seedItems = getCuratedDiscoverItems();

    try {
        let apiArtists = [];
        const res = await fetch('/api/artists');
        if (res.ok) {
            const json = await res.json();
            apiArtists = json.data || [];
        }

        if (apiArtists && apiArtists.length > 0) {
            apiArtists.forEach(artist => {
                const existingIdx = seedItems.findIndex(item => item.id === artist.id && item.type === 'ARTIST');
                if (existingIdx !== -1) {
                    // Enrich existing curated artist with real DB state (connection, cover, etc.)
                    seedItems[existingIdx].connected = artist.connected || false;
                    if (artist.coverImageUrl) seedItems[existingIdx].coverImageUrl = artist.coverImageUrl;
                    if (artist.avatarUrl) seedItems[existingIdx].avatarUrl = artist.avatarUrl;
                    if (artist.profession) seedItems[existingIdx].profession = artist.profession;
                    if (artist.location) seedItems[existingIdx].location = artist.location;
                } else {
                    // Add extra database artists dynamically
                    seedItems.push({
                        id: artist.id,
                        type: 'ARTIST',
                        name: artist.name || artist.fullName,
                        profession: artist.profession || artist.artistType || 'Visual Artist',
                        location: artist.location || 'Mumbai, MH',
                        bio: artist.bio || 'Exploring new frontiers in craft and interdisciplinary collaboration.',
                        skills: (artist.skills || 'Concept Art, Illustration, Collabs').split(',').map(s => s.trim()),
                        followersCount: artist.followersCount || '1.4K',
                        avatarUrl: artist.avatarUrl || artist.profilePicture || '/images/artist_profile_avatar.png',
                        coverImageUrl: artist.coverImageUrl || '/images/artist_profile_cover.png',
                        connected: artist.connected || false
                    });
                }
            });
        }
    } catch (err) {
        console.warn('Using curated discover items with local state:', err);
    }

    allDiscoverItems = seedItems;
    filterAndRenderDiscoverFeed();
}

/**
 * 9. Filter & Render Discover Cards Grid
 */
function filterAndRenderDiscoverFeed() {
    const container = document.getElementById('discoverCardsGrid');
    const countLabel = document.getElementById('resultsCountLabel');
    if (!container) return;

    let filtered = allDiscoverItems.filter(item => {
        // Bookmarks only filter
        if (isBookmarksOnly) {
            if (!bookmarkedIds.has(`${item.type.toLowerCase()}_${item.id}`)) {
                return false;
            }
        }

        // 1. Discipline / Category Filter
        if (currentCategory !== 'all') {
            const catLower = currentCategory.toLowerCase();
            const prof = (item.profession || '').toLowerCase();
            const discipline = (item.discipline || '').toLowerCase();
            const skills = Array.isArray(item.skills) ? item.skills.join(' ').toLowerCase() : (item.skills || '').toLowerCase();
            const title = (item.title || '').toLowerCase();

            let match = prof.includes(catLower) || discipline.includes(catLower) || skills.includes(catLower) || title.includes(catLower);

            // Broad synonym matching
            if (catLower.includes('music') && (prof.includes('singer') || prof.includes('guitar') || prof.includes('band') || discipline.includes('music') || title.includes('jam'))) {
                match = true;
            }
            if (catLower.includes('writer') && (prof.includes('poet') || prof.includes('lyricist') || prof.includes('script') || discipline.includes('writing'))) {
                match = true;
            }
            if (catLower.includes('visual') && (prof.includes('paint') || prof.includes('illustrat') || prof.includes('graphic') || discipline.includes('visual'))) {
                match = true;
            }
            if (catLower.includes('paint') && (prof.includes('paint') || skills.includes('acrylic') || skills.includes('oil'))) {
                match = true;
            }
            if (catLower.includes('film') && (prof.includes('film') || prof.includes('cinema') || skills.includes('video'))) {
                match = true;
            }
            if (catLower.includes('design') && (prof.includes('design') || prof.includes('graphic') || skills.includes('branding'))) {
                match = true;
            }

            if (!match) return false;
        }

        // 2. Location Filter
        if (currentLocation !== 'all') {
            const locLower = currentLocation.toLowerCase();
            const itemLoc = (item.location || '').toLowerCase();
            if (!itemLoc.includes(locLower)) {
                return false;
            }
        }

        // 3. Search Filter
        if (currentSearch) {
            const q = currentSearch.toLowerCase();
            const name = (item.name || '').toLowerCase();
            const title = (item.title || '').toLowerCase();
            const bio = (item.bio || item.description || '').toLowerCase();
            const prof = (item.profession || '').toLowerCase();
            const skills = Array.isArray(item.skills) ? item.skills.join(' ').toLowerCase() : (item.skills || '').toLowerCase();
            const loc = (item.location || '').toLowerCase();

            const match = name.includes(q) || title.includes(q) || bio.includes(q) || prof.includes(q) || skills.includes(q) || loc.includes(q);
            if (!match) return false;
        }

        return true;
    });

    // 4. Sorting Logic
    if (currentSort === 'followers') {
        filtered.sort((a, b) => {
            const parseFollowers = (str) => {
                if (!str) return 0;
                let val = parseFloat(str);
                if (str.toUpperCase().includes('K')) val *= 1000;
                return val;
            };
            return parseFollowers(b.followersCount) - parseFollowers(a.followersCount);
        });
    }

    // Update Counter Heading
    if (countLabel) {
        const count = filtered.length;
        const noun = count === 1 ? 'Creative Discovery' : 'Creative Discoveries';
        countLabel.textContent = `Showing ${count} ${noun}`;
    }

    // Empty State
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-discover-state">
                <div class="empty-sparkle-icon">✦</div>
                <h3 class="empty-state-title">No creative discoveries found</h3>
                <p class="empty-state-text">Try broadening your search term or selecting 'All' disciplines to discover creators from across the network.</p>
                <button class="filter-pill-btn active" style="margin-top: 8px;" onclick="resetAllDiscoverFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    // Render Cards Grid
    container.innerHTML = filtered.map(item => {
        if (item.type === 'EVENT') {
            return renderEventDiscoveryCard(item);
        } else {
            return renderArtistDiscoveryCard(item);
        }
    }).join('');
}

/**
 * 10. Card Renderers
 */

// 1. Creator / Artist Card
function renderArtistDiscoveryCard(artist) {
    const isBookmarked = bookmarkedIds.has(`artist_${artist.id}`);
    const isConnected = !!artist.connected;
    const skillsList = (artist.skills || ['Concept Art', 'Illustration', 'Collabs']).slice(0, 3);
    const coverImg = artist.coverImageUrl || '/images/artist_profile_cover.png';
    const avatarImg = artist.avatarUrl || '/images/artist_profile_avatar.png';
    const profession = artist.profession || 'Visual Artist';
    const location = artist.location || 'Mumbai, MH';
    const bio = artist.bio || 'Exploring new frontiers in craft and interdisciplinary collaboration.';
    const followers = artist.followersCount || '1.4K';

    return `
        <article class="discover-card-box artist-card" data-artist-id="${escapeHtml(artist.id)}">
            <div class="card-media-frame">
                <img src="${escapeHtml(coverImg)}" 
                     alt="${escapeHtml(artist.name)}" 
                     class="card-media-img" 
                     loading="lazy"
                     onerror="this.src='/images/artist_profile_cover.png'">
                <span class="card-discipline-pill">${escapeHtml(profession)}</span>
                <button class="card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                        onclick="toggleBookmark('artist', '${artist.id}', this)"
                        aria-label="Bookmark artist"
                        title="${isBookmarked ? 'Remove bookmark' : 'Bookmark artist'}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.3">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>
            <div class="card-body-content">
                <div class="creator-author-row">
                    <img src="${escapeHtml(avatarImg)}" 
                         alt="${escapeHtml(artist.name)}" 
                         class="creator-avatar-circle" 
                         loading="lazy"
                         onerror="this.src='/images/artist_profile_avatar.png'">
                    <div class="creator-meta-names">
                        <a href="/pages/artist-profile.html?id=${encodeURIComponent(artist.id)}" class="creator-name-link">${escapeHtml(artist.name)}</a>
                        <span class="creator-location-caption">${escapeHtml(location)}</span>
                    </div>
                </div>
                <p class="creator-bio-text">${escapeHtml(bio)}</p>
                <div class="creator-skill-tags-row">
                    ${skillsList.map(skill => `<span class="skill-tag-badge">${escapeHtml(skill)}</span>`).join('')}
                </div>
            </div>
            <div class="card-action-footer">
                <span class="creator-follower-metric">${escapeHtml(followers)} Followers</span>
                <div class="card-footer-buttons-cluster">
                    <button class="btn-connect-pill ${isConnected ? 'connected' : ''}" 
                            onclick="toggleConnectArtist('${artist.id}', this)" 
                            data-artist-id="${escapeHtml(artist.id)}">
                        ${isConnected ? 'Connected' : '+ Connect'}
                    </button>
                    <a href="/pages/artist-profile.html?id=${encodeURIComponent(artist.id)}" class="btn-portfolio-link">
                        <span>Portfolio</span>
                        <span>&rarr;</span>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// 2. Spotlight Event / Jam Session Card
function renderEventDiscoveryCard(evt) {
    const isBookmarked = bookmarkedIds.has(`event_${evt.id}`);
    const badgeText = evt.badgeText || 'JAM SESSION';
    const dateDay = evt.dateDay || '24';
    const dateMonth = evt.dateMonth || 'AUG';
    const attendees = evt.attendeesCount || '12';
    const location = evt.location || 'Andheri, Mumbai';
    const artForm = evt.artForm || 'Music';
    const coverImg = evt.imageUrl || '/images/opp_campus_band.png';

    return `
        <article class="discover-card-box event-card" data-event-id="${escapeHtml(evt.id)}">
            <div class="card-media-frame">
                <img src="${escapeHtml(coverImg)}" 
                     alt="${escapeHtml(evt.title)}" 
                     class="card-media-img" 
                     loading="lazy"
                     onerror="this.src='/images/opp_campus_band.png'">
                <span class="card-discipline-pill">${escapeHtml(badgeText)}</span>
                <div class="card-date-badge">
                    <span class="badge-day-num">${escapeHtml(dateDay)}</span>
                    <span class="badge-month-str">${escapeHtml(dateMonth)}</span>
                </div>
            </div>
            <div class="card-body-content">
                <h3 class="event-showcase-title">${escapeHtml(evt.title)}</h3>
                <div class="event-venue-meta-line">
                    <span>📍 ${escapeHtml(location)}</span>
                    <span>&bull;</span>
                    <span>${escapeHtml(artForm)}</span>
                </div>
                <div class="event-attendees-strip">
                    <div class="stacked-avatars-group">
                        <img src="/images/artist_profile_avatar.png" class="stacked-avatar-mini" alt="Attendee">
                        <img src="/images/artist_arjun_thumb.png" class="stacked-avatar-mini" alt="Attendee">
                        <img src="/images/avatar_riya.png" class="stacked-avatar-mini" alt="Attendee">
                        <span class="attendees-counter-text">+${escapeHtml(attendees)} going</span>
                    </div>
                    <a href="/pages/event-details.html?id=${encodeURIComponent(evt.id)}" class="circular-arrow-btn" aria-label="View Event Details" title="View Event">
                        <span>&#8599;</span>
                    </a>
                </div>
            </div>
            <div class="card-action-footer">
                <span class="creator-follower-metric">${escapeHtml(artForm)} Event</span>
                <a href="/pages/event-details.html?id=${encodeURIComponent(evt.id)}" class="btn-portfolio-link">
                    <span>Details</span>
                    <span>&rarr;</span>
                </a>
            </div>
        </article>
    `;
}

/**
 * 11. Real Backend Connect / Follow Toggler
 * Calls POST /api/artists/{id}/connect, persists in MySQL, updates UI
 */
window.toggleConnectArtist = async function(artistId, btn) {
    if (!artistId || !btn) return;

    btn.disabled = true;
    const prevText = btn.textContent;
    btn.textContent = '...';

    try {
        const res = await fetch(`/api/artists/${encodeURIComponent(artistId)}/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            const json = await res.json();
            const isNowConnected = json.data && json.data.connected !== undefined ? json.data.connected : true;
            
            // Update in dataset
            const item = allDiscoverItems.find(i => String(i.id) === String(artistId));
            if (item) item.connected = isNowConnected;

            btn.classList.toggle('connected', isNowConnected);
            btn.textContent = isNowConnected ? 'Connected' : '+ Connect';

            const artistName = item ? item.name : 'Artist';
            showToast(isNowConnected ? `Connected with ${artistName}` : `Disconnected from ${artistName}`);
        } else {
            // Revert on error
            btn.textContent = prevText;
            showToast('Could not update connection. Please try again.');
        }
    } catch (err) {
        console.error('Error toggling connect:', err);
        btn.textContent = prevText;
        showToast('Connection update failed. Please check network.');
    } finally {
        btn.disabled = false;
    }
};

/**
 * 12. Interactive Bookmark Toggler
 */
window.toggleBookmark = function(type, id, btn) {
    const key = `${type}_${id}`;
    if (bookmarkedIds.has(key)) {
        bookmarkedIds.delete(key);
        btn.classList.remove('bookmarked');
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', 'none');
        showToast('Removed from Saved Creators');
    } else {
        bookmarkedIds.add(key);
        btn.classList.add('bookmarked');
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', 'currentColor');
        showToast('Added to Saved Creators');
    }
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(bookmarkedIds)));

    if (isBookmarksOnly) {
        filterAndRenderDiscoverFeed();
    }
};

/**
 * 13. Reset Filters Helper
 */
window.resetAllDiscoverFilters = function() {
    currentCategory = 'all';
    currentLocation = 'all';
    currentSort = 'relevant';
    currentSearch = '';
    isBookmarksOnly = false;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    const topSearch = document.getElementById('topHeaderSearchInput');
    if (topSearch) topSearch.value = '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) locationSelect.value = 'all';

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'relevant';

    document.querySelectorAll('.filter-pill-btn').forEach((p, idx) => {
        p.classList.toggle('active', p.getAttribute('data-category') === 'all');
    });

    filterAndRenderDiscoverFeed();
    showToast('Filters reset to default');
};

/**
 * 14. Toast Notification Helper
 */
function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'dashboard-toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 320);
    }, 2400);
}

/**
 * 15. HTML Escape Utility
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

/**
 * 16. Curated Discover Dataset matching exact Reference Image composition
 */
function getCuratedDiscoverItems() {
    return [
        // 1. Aanya Deshmukh (Visual Artist)
        {
            id: 101,
            type: 'ARTIST',
            name: "Aanya Deshmukh",
            profession: "Visual Artist",
            location: "Mumbai, MH",
            bio: "Exploring new frontiers in craft and interdisciplinary collaboration.",
            skills: ["Concept Art", "Illustration", "Collabs"],
            followersCount: "1.4K",
            avatarUrl: "/images/artist_profile_avatar.png",
            coverImageUrl: "/images/artwork_sunlit.png",
            connected: false
        },
        // 2. Open Jam Session (Spotlight Event)
        {
            id: 805,
            type: 'EVENT',
            title: "Open Jam Session",
            badgeText: "JAM SESSION",
            dateDay: "24",
            dateMonth: "AUG",
            location: "Andheri, Mumbai",
            artForm: "Music",
            attendeesCount: "12",
            imageUrl: "/images/opp_campus_band.png"
        },
        // 3. Neel Joshi (Filmmaker)
        {
            id: 111,
            type: 'ARTIST',
            name: "Neel Joshi",
            profession: "Filmmaker",
            location: "Mumbai, MH",
            bio: "Short films, cinematography and visual storytelling.",
            skills: ["Short Films", "Cinematography", "Editing"],
            followersCount: "1.4K",
            avatarUrl: "/images/avatar_arjun_collab.png",
            coverImageUrl: "/images/opp_short_film_illustrator.png",
            connected: false
        },
        // 4. Karan Shah (Graphic Designer)
        {
            id: 109,
            type: 'ARTIST',
            name: "Karan Shah",
            profession: "Graphic Designer",
            location: "Mumbai, MH",
            bio: "Branding, typography and visual systems.",
            skills: ["Branding", "Typography", "Editorial"],
            followersCount: "1.4K",
            avatarUrl: "/images/avatar_karan.png",
            coverImageUrl: "/images/avatar_karan.png",
            connected: false
        },
        // 5. Rohan Mehta (Singer / Musician)
        {
            id: 102,
            type: 'ARTIST',
            name: "Rohan Mehta",
            profession: "Singer",
            location: "Mumbai, MH",
            bio: "Blending indie, electronic and folk sounds to create immersive live experiences.",
            skills: ["Vocals", "Indie", "Songwriting"],
            followersCount: "2.4K",
            avatarUrl: "/images/artist_rohan_avatar.png",
            coverImageUrl: "/images/artist_rohan_cover.png",
            connected: true
        },
        // 6. Kavya Iyer (Dancer)
        {
            id: 103,
            type: 'ARTIST',
            name: "Kavya Iyer",
            profession: "Dancer",
            location: "Mumbai, MH",
            bio: "Movement, expression and storytelling through dance.",
            skills: ["Contemporary", "Choreography", "Performance"],
            followersCount: "1.4K",
            avatarUrl: "/images/artist_kavya_avatar.png",
            coverImageUrl: "/images/opp_dance_performance.png",
            connected: true
        },
        // 7. Ishita Kulkarni (Painter)
        {
            id: 106,
            type: 'ARTIST',
            name: "Ishita Kulkarni",
            profession: "Painter",
            location: "Mumbai, MH",
            bio: "Exploring colours, textures and human emotion through paint.",
            skills: ["Acrylic", "Oil", "Mixed Media"],
            followersCount: "1.4K",
            avatarUrl: "/images/artist_ishita_thumb.png",
            coverImageUrl: "/images/artwork_beyond_the_hills.png",
            connected: false
        },
        // 8. Indie Showcase Night (Spotlight Event)
        {
            id: 802,
            type: 'EVENT',
            title: "Indie Showcase Night",
            badgeText: "EXHIBITION",
            dateDay: "30",
            dateMonth: "AUG",
            location: "Lower Parel, Mumbai",
            artForm: "Visual Arts",
            attendeesCount: "32",
            imageUrl: "/images/comm_event_exhibition.png"
        },
        // 9. Arjun Rao (Photographer)
        {
            id: 104,
            type: 'ARTIST',
            name: "Arjun Rao",
            profession: "Photographer",
            location: "Mumbai, MH",
            bio: "Documenting stories through travel and street photography.",
            skills: ["Street", "Portrait", "Documentary"],
            followersCount: "2.1K",
            avatarUrl: "/images/artist_arjun_thumb.png",
            coverImageUrl: "/images/opp_lens_and_life.png",
            connected: true
        },
        // 10. Riya Deshmukh (Illustrator)
        {
            id: 107,
            type: 'ARTIST',
            name: "Riya Deshmukh",
            profession: "Illustrator",
            location: "Mumbai, MH",
            bio: "Exploring character expressions, flora patterns, and editorial narrative.",
            skills: ["Digital Art", "Character Design", "Storytelling"],
            followersCount: "1.4K",
            avatarUrl: "/images/avatar_riya.png",
            coverImageUrl: "/images/artwork_bloom.png",
            connected: true
        },
        // 11. Sneha Patil (Writer)
        {
            id: 108,
            type: 'ARTIST',
            name: "Sneha Patil",
            profession: "Writer",
            location: "Mumbai, MH",
            bio: "Poetry, evocative storytelling, and lyrical creative prose.",
            skills: ["Poetry", "Storytelling", "Scriptwriting"],
            followersCount: "1.4K",
            avatarUrl: "/images/avatar_sneha.png",
            coverImageUrl: "/images/opp_content_writer.png",
            connected: true
        },
        // 12. Meera Singh (Musician)
        {
            id: 105,
            type: 'ARTIST',
            name: "Meera Singh",
            profession: "Musician",
            location: "Mumbai, MH",
            bio: "Exploring sound, ambient space, and electronic modular synthesis.",
            skills: ["Electronic", "Live Sets", "Collabs"],
            followersCount: "1.4K",
            avatarUrl: "/images/artist_meera_thumb.png",
            coverImageUrl: "/images/cat_music.png",
            connected: false
        }
    ];
}
