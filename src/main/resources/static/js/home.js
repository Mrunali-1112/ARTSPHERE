/**
 * ArtSphere — Studio Home Dashboard Controller
 * Soft Lavender / Plum Dashboard Visual Architecture
 * Dynamic REST Integration, Real User Session, Featured Creators, Events & Calendar
 */

let allFeaturedArtists = [];
let allUpcomingEvents = [];
let activeMedium = 'All';

// Calendar State
let calCurrentMonth = 2; // March (0-indexed)
let calCurrentYear = 2024;
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Curated default artist fallbacks matching database seed data
const DEFAULT_FEATURED_ARTISTS = [
    {
        id: 101,
        name: "Aanya Deshmukh",
        profession: "Visual Artist",
        avatarUrl: "/images/artist_profile_avatar.png",
        coverImageUrl: "/images/artwork_sunlit.png",
        location: "Mumbai, MH",
        bio: "Exploring new frontiers in craft and multidisciplinary expression.",
        followersCount: "1.2K"
    },
    {
        id: 102,
        name: "Rohan Mehta",
        profession: "Musician",
        avatarUrl: "/images/artist_rohan_avatar.png",
        coverImageUrl: "/images/artist_rohan_cover.png",
        location: "Mumbai, MH",
        bio: "Exploring new frontiers in craft and multidisciplinary expression.",
        followersCount: "1.2K"
    },
    {
        id: 103,
        name: "Kavya Iyer",
        profession: "Dancer",
        avatarUrl: "/images/artist_kavya_avatar.png",
        coverImageUrl: "/images/artist_kavya_cover.png",
        location: "Mumbai, MH",
        bio: "Exploring new frontiers in craft and multidisciplinary expression.",
        followersCount: "1.2K"
    }
];

// Curated default upcoming events matching database seed data
const DEFAULT_UPCOMING_EVENTS = [
    {
        id: 301,
        title: "Watercolor Workshop",
        eventType: "WORKSHOP",
        eventDate: "25 SEP",
        eventTime: "10:00 AM - 1:00 PM",
        location: "ArtHouse, Mumbai",
        imageUrl: "/images/event_watercolor_thumb.png"
    },
    {
        id: 801,
        title: "Watercolor Basics Workshop",
        eventType: "SESSION",
        eventDate: "15 MAR",
        eventTime: "4:00 PM - 6:00 PM (IST)",
        location: "Mumbai, Maharashtra",
        imageUrl: "/images/comm_event_watercolor.png"
    },
    {
        id: 802,
        title: "Local Artists Exhibition",
        eventType: "EXHIBITION",
        eventDate: "22 MAR",
        eventTime: "10:00 AM - 5:00 PM (IST)",
        location: "Mumbai, Maharashtra",
        imageUrl: "/images/comm_event_exhibition.png"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initUserSession();
    initMobileDrawer();
    initSearchAndMediumFilters();
    initCalendarControls();
    loadDashboardData();
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
 * 3. Search Bar & Medium Filter Pills
 */
function initSearchAndMediumFilters() {
    const searchInput = document.getElementById('homeSearchInput');
    const mediumPillsRow = document.getElementById('mediumPillsRow');

    // Header search navigation
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `/pages/discover.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // Explore by Medium Filter Pills
    if (mediumPillsRow) {
        mediumPillsRow.addEventListener('click', (e) => {
            const pill = e.target.closest('.medium-pill-btn');
            if (!pill) return;

            mediumPillsRow.querySelectorAll('.medium-pill-btn').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');

            activeMedium = pill.getAttribute('data-medium') || 'All';
            filterFeaturedCreators(activeMedium);
        });
    }
}

/**
 * 4. Load Dynamic Dashboard Data
 */
async function loadDashboardData() {
    await Promise.allSettled([
        loadFeaturedArtists(),
        loadUpcomingEvents(),
        loadFeaturedCommunity()
    ]);
    renderCalendar();
}

/**
 * 5. Load Featured Artists: GET /api/home/featured-artists
 */
async function loadFeaturedArtists() {
    const container = document.getElementById('featuredArtistsContainer');
    if (!container) return;

    try {
        let artists = [];
        const res = await fetch('/api/home/featured-artists');
        if (res.ok) {
            const json = await res.json();
            artists = json.data || [];
        }

        if (artists && artists.length > 0) {
            allFeaturedArtists = artists.map((a, idx) => {
                const fallback = DEFAULT_FEATURED_ARTISTS[idx] || DEFAULT_FEATURED_ARTISTS[0];
                return {
                    id: a.id || fallback.id,
                    name: a.name || fallback.name,
                    profession: a.profession || fallback.profession,
                    avatarUrl: a.avatarUrl || fallback.avatarUrl,
                    coverImageUrl: a.coverImageUrl || fallback.coverImageUrl,
                    location: a.location || fallback.location || 'Mumbai, MH',
                    bio: a.bio || fallback.bio,
                    followersCount: a.followersCount || fallback.followersCount
                };
            });
        } else {
            allFeaturedArtists = [...DEFAULT_FEATURED_ARTISTS];
        }
    } catch (err) {
        console.warn('Using fallback featured artists:', err);
        allFeaturedArtists = [...DEFAULT_FEATURED_ARTISTS];
    }

    renderFeaturedArtists(allFeaturedArtists.slice(0, 3));
}

function filterFeaturedCreators(medium) {
    if (!medium || medium.toLowerCase() === 'all') {
        renderFeaturedArtists(allFeaturedArtists.slice(0, 3));
        return;
    }

    const medLower = medium.toLowerCase();
    const filtered = allFeaturedArtists.filter(a => {
        const prof = (a.profession || '').toLowerCase();
        return prof.includes(medLower) || (medLower.includes('visual') && prof.includes('visual')) || (medLower.includes('music') && prof.includes('music')) || (medLower.includes('dance') && prof.includes('dance'));
    });

    if (filtered.length > 0) {
        renderFeaturedArtists(filtered.slice(0, 3));
    } else {
        renderFeaturedArtists(allFeaturedArtists.slice(0, 3));
    }
}

function renderFeaturedArtists(artists) {
    const container = document.getElementById('featuredArtistsContainer');
    if (!container) return;

    container.innerHTML = artists.map(artist => {
        const coverImg = artist.coverImageUrl || '/images/artist_profile_cover.png';
        const avatarImg = artist.avatarUrl || '/images/artist_profile_avatar.png';
        const profession = artist.profession || 'Visual Artist';
        const location = artist.location || 'Mumbai, MH';
        const bio = artist.bio || 'Exploring new frontiers in craft and multidisciplinary expression.';
        const followers = artist.followersCount || '1.2K';

        return `
            <div class="creator-card-box" data-artist-id="${escapeHtml(artist.id)}">
                <div class="creator-cover-frame">
                    <img src="${escapeHtml(coverImg)}" 
                         alt="${escapeHtml(artist.name)}" 
                         class="creator-cover-img"
                         onerror="this.src='/images/artist_profile_cover.png'">
                    <span class="creator-profession-pill">${escapeHtml(profession)}</span>
                </div>
                <div class="creator-body-info">
                    <div class="creator-author-row">
                        <img src="${escapeHtml(avatarImg)}" 
                             alt="${escapeHtml(artist.name)}" 
                             class="creator-avatar-img"
                             onerror="this.src='/images/artist_profile_avatar.png'">
                        <div class="creator-names-stack">
                            <span class="creator-full-name">${escapeHtml(artist.name)}</span>
                            <span class="creator-location-text">${escapeHtml(location)}</span>
                        </div>
                    </div>
                    <p class="creator-bio-snippet">${escapeHtml(bio)}</p>
                </div>
                <div class="creator-card-footer">
                    <span class="creator-follower-count">${escapeHtml(followers)} Followers</span>
                    <a href="/pages/artist-profile.html?id=${encodeURIComponent(artist.id)}" class="btn-creator-profile">
                        <span>View Profile</span>
                        <span>&rarr;</span>
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 6. Load Upcoming Events: GET /api/home/upcoming-events
 */
async function loadUpcomingEvents() {
    const container = document.getElementById('upcomingEventsContainer');
    if (!container) return;

    try {
        let events = [];
        const res = await fetch('/api/home/upcoming-events');
        if (res.ok) {
            const json = await res.json();
            events = json.data || [];
        }

        if (events && events.length > 0) {
            allUpcomingEvents = events.map((ev, idx) => {
                const fallback = DEFAULT_UPCOMING_EVENTS[idx] || DEFAULT_UPCOMING_EVENTS[0];
                return {
                    id: ev.id || fallback.id,
                    title: ev.title || fallback.title,
                    eventType: ev.eventType || fallback.eventType,
                    eventDate: ev.eventDate || fallback.eventDate,
                    eventTime: ev.eventTime || fallback.eventTime,
                    location: ev.location || fallback.location,
                    imageUrl: ev.imageUrl || fallback.imageUrl
                };
            });
        } else {
            allUpcomingEvents = [...DEFAULT_UPCOMING_EVENTS];
        }
    } catch (err) {
        console.warn('Using fallback upcoming events:', err);
        allUpcomingEvents = [...DEFAULT_UPCOMING_EVENTS];
    }

    renderUpcomingEvents(allUpcomingEvents.slice(0, 3));
}

function renderUpcomingEvents(events) {
    const container = document.getElementById('upcomingEventsContainer');
    if (!container) return;

    container.innerHTML = events.map(event => {
        const dateParts = (event.eventDate || '25 SEP').trim().split(/\s+/);
        const dayNum = dateParts[0] || '25';
        const monthText = (dateParts[1] || 'SEP').toUpperCase();
        const location = event.location || 'ArtHouse, Mumbai';
        const timeStr = event.eventTime || '10:00 AM - 1:00 PM';
        const thumbImg = event.imageUrl || '/images/event_watercolor_thumb.png';
        let eventType = 'WORKSHOP';
        if (event.eventType && event.eventType.trim().length > 0) {
            eventType = event.eventType;
        } else {
            const t = (event.title || '').toLowerCase();
            if (t.includes('workshop')) eventType = 'WORKSHOP';
            else if (t.includes('exhibition')) eventType = 'EXHIBITION';
            else if (t.includes('meetup')) eventType = 'MEETUP';
            else if (t.includes('jam')) eventType = 'JAM';
            else if (t.includes('masterclass')) eventType = 'MASTERCLASS';
            else if (t.includes('session')) eventType = 'SESSION';
        }

        return `
            <a href="/pages/event-details.html?id=${encodeURIComponent(event.id)}" class="event-compact-row" data-event-id="${escapeHtml(event.id)}">
                <div class="event-date-stamp-cell">
                    <span class="stamp-day-text">${escapeHtml(dayNum)}</span>
                    <span class="stamp-month-text">${escapeHtml(monthText)}</span>
                </div>
                <div class="event-thumb-cell">
                    <img src="${escapeHtml(thumbImg)}" 
                         alt="${escapeHtml(event.title)}" 
                         class="event-thumb-img"
                         onerror="this.src='/images/event_watercolor_thumb.png'">
                </div>
                <div class="event-text-cell">
                    <span class="event-type-micro-tag">${escapeHtml(eventType)}</span>
                    <h3 class="event-compact-title">${escapeHtml(event.title)}</h3>
                    <p class="event-loc-line">${escapeHtml(location)} &bull; ${escapeHtml(timeStr)}</p>
                </div>
                <div class="event-details-btn-cell">
                    <span class="btn-event-details-pill">
                        <span>Details</span>
                        <span>&rarr;</span>
                    </span>
                </div>
            </a>
        `;
    }).join('');
}

/**
 * 7. Load Featured Community: GET /api/home/communities
 */
async function loadFeaturedCommunity() {
    try {
        const res = await fetch('/api/home/communities');
        if (res.ok) {
            const json = await res.json();
            const communities = json.data || [];
            if (communities.length > 0) {
                const comm = communities[0];
                const titleEl = document.getElementById('guildTitle');
                const descEl = document.getElementById('guildDesc');
                const ctaBtn = document.getElementById('guildCtaBtn');

                if (titleEl && comm.name) titleEl.textContent = comm.name;
                if (descEl && comm.description) descEl.textContent = comm.description;
                if (ctaBtn && comm.id) ctaBtn.href = `/pages/community-details.html?id=${encodeURIComponent(comm.id)}`;
            }
        }
    } catch (e) {
        console.warn('Could not load featured community:', e);
    }
}

/**
 * 8. Interactive Calendar Controller
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
}

function renderCalendar() {
    const monthLabel = document.getElementById('calMonthYear');
    const daysGrid = document.getElementById('calDaysGrid');
    if (!daysGrid) return;

    if (monthLabel) {
        monthLabel.textContent = `${MONTH_NAMES[calCurrentMonth]} ${calCurrentYear}`;
    }

    // Days in current month & start day
    const firstDayIndex = new Date(calCurrentYear, calCurrentMonth, 1).getDay(); // 0 is Sun
    const totalDays = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();

    // Default highlight days in March 2024 to match reference design (15, 22, 28)
    const eventDays = new Set();
    if (calCurrentMonth === 2 && calCurrentYear === 2024) {
        eventDays.add(15);
        eventDays.add(22);
        eventDays.add(28);
    }

    let cellsHtml = '';

    // Empty cells before start of month
    for (let i = 0; i < firstDayIndex; i++) {
        cellsHtml += `<div class="cal-day-cell empty"></div>`;
    }

    // Days of the month
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

    // Click date cell to filter or show toast
    daysGrid.querySelectorAll('.cal-day-cell.has-event').forEach(cell => {
        cell.addEventListener('click', () => {
            const day = cell.getAttribute('data-day');
            showToast(`Schedule event selected for March ${day}`);
        });
    });
}

/**
 * 9. Toast Notification Helper
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
 * 10. Utility: HTML Escape
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
