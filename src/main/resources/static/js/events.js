/**
 * ArtSphere — Events & Workshops Script
 * Editorial Neo-Brutalist Architecture & Dynamic Search Engine
 */

let allEvents = [];
let activeCategory = 'All';
let searchQuery = '';
let searchDebounceTimeout = null;
let currentUserId = 101;
let currentUser = null;

// Curated default events in case backend returns empty
const DEFAULT_EVENTS = [
    {
        id: 801,
        title: "Watercolor Basics & Granulation Masterclass",
        artForm: "Painting",
        eventType: "Workshop",
        description: "Learn the fundamentals of watercolor mixing, granulation physics, wet-on-wet glazing, and negative space painting with step-by-step guidance.",
        eventDate: "15 Mar 2026",
        dateMonth: "MAR",
        dateDay: "15",
        eventTime: "4:00 PM – 6:30 PM (IST)",
        location: "Art Studio, Bandra West, Mumbai",
        organizerName: "Creative Souls Network",
        organizerId: 401,
        organizerAvatar: "/images/comm_creative_souls_avatar.png",
        imageUrl: "/images/comm_event_watercolor.png",
        attendeesCount: 34,
        registered: false
    },
    {
        id: 802,
        title: "Analog 35mm Darkroom Printing & Chemistry",
        artForm: "Photography",
        eventType: "Workshop",
        description: "Hands-on darkroom development. Expose silver gelatin prints from your negatives and master contrast filtration and toning baths.",
        eventDate: "22 Mar 2026",
        dateMonth: "MAR",
        dateDay: "22",
        eventTime: "11:00 AM – 3:00 PM (IST)",
        location: "Kala Ghoda Darkroom Collective, Mumbai",
        organizerName: "Analog Frames Collective",
        organizerId: 403,
        organizerAvatar: "/images/category_photography.png",
        imageUrl: "/images/comm_photography_circle.png",
        attendeesCount: 22,
        registered: false
    },
    {
        id: 803,
        title: "Ambient Modular Listening & Patch Jam",
        artForm: "Music",
        eventType: "Live Session",
        description: "Patch cable architects bring modular rigs for quadraphonic ambient soundscapes, field recording textures, and live tape manipulation.",
        eventDate: "28 Mar 2026",
        dateMonth: "MAR",
        dateDay: "28",
        eventTime: "6:30 PM – 9:30 PM (IST)",
        location: "Studio 4B, Koregaon Park, Pune",
        organizerName: "Modular Sound Explorers",
        organizerId: 404,
        organizerAvatar: "/images/category_music.png",
        imageUrl: "/images/comm_indie_musicians.png",
        attendeesCount: 45,
        registered: true
    },
    {
        id: 804,
        title: "Kinetic Architecture: Contemporary Movement",
        artForm: "Dance",
        eventType: "Workshop",
        description: "A spatial choreography session exploring floorwork dynamics, release techniques, and physical presence in urban architectural spaces.",
        eventDate: "04 Apr 2026",
        dateMonth: "APR",
        dateDay: "04",
        eventTime: "9:00 AM – 12:30 PM (IST)",
        location: "Gati Dance Forum Studio, New Delhi",
        organizerName: "Kinetic Motion Lab",
        organizerId: 405,
        organizerAvatar: "/images/category_dance.png",
        imageUrl: "/images/comm_dance_creators.png",
        attendeesCount: 28,
        registered: false
    },
    {
        id: 805,
        title: "Midnight Verses: Spoken Word & Chapbook Jam",
        artForm: "Writing",
        eventType: "Meetup",
        description: "An open studio evening for lyricists, poets, and translators. Bring your drafts for constructive critique, chapbook layout, and candlelit readings.",
        eventDate: "12 Apr 2026",
        dateMonth: "APR",
        dateDay: "12",
        eventTime: "7:00 PM – 10:00 PM (IST)",
        location: "The Attic Literary Salon, Bengaluru",
        organizerName: "Midnight Verses Circle",
        organizerId: 406,
        organizerAvatar: "/images/category_creative_writing.png",
        imageUrl: "/images/comm_poetry_writers.png",
        attendeesCount: 38,
        registered: false
    },
    {
        id: 806,
        title: "Spring Vernissage: Independent Collective Showcase",
        artForm: "Painting",
        eventType: "Exhibition",
        description: "A public group exhibition featuring selected original canvases, sculptures, and kinetic installations from 24 emerging studio artists.",
        eventDate: "18 Apr 2026",
        dateMonth: "APR",
        dateDay: "18",
        eventTime: "5:00 PM – 10:00 PM (IST)",
        location: "Black Box Art Centre, Indiranagar, Bengaluru",
        organizerName: "Creative Souls Network",
        organizerId: 401,
        organizerAvatar: "/images/comm_creative_souls_avatar.png",
        imageUrl: "/images/comm_event_detail_cover.png",
        attendeesCount: 110,
        registered: true
    },
    {
        id: 807,
        title: "Generative Shaders & Realtime Visuals in TouchDesigner",
        artForm: "Digital Art",
        eventType: "Workshop",
        description: "Learn audio-reactive visuals, GLSL noise synthesis, and live projection mapping pipelines for stage design and installations.",
        eventDate: "25 Apr 2026",
        dateMonth: "APR",
        dateDay: "25",
        eventTime: "3:00 PM – 7:00 PM (IST)",
        location: "Online / Discord Studio Stage",
        organizerName: "Creative Souls Network",
        organizerId: 401,
        organizerAvatar: "/images/comm_creative_souls_avatar.png",
        imageUrl: "/images/comm_feat_sunset_lake.png",
        attendeesCount: 56,
        registered: false
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initNavigationDrawer();
    initUserMenu();
    initFiltersAndSearch();
    checkUrlQueryParams();
    loadEvents();
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
function initUserMenu() {
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserBio = document.getElementById('dropdownUserBio');
    const headerUserAvatar = document.getElementById('headerUserAvatar');

    try {
        const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (stored) {
            currentUser = JSON.parse(stored);
            if (currentUser.id) currentUserId = currentUser.id;
            if (currentUser.name && dropdownUserName) dropdownUserName.textContent = currentUser.name;
            if (currentUser.bio && dropdownUserBio) dropdownUserBio.textContent = currentUser.bio;
            if (currentUser.avatarUrl && headerUserAvatar) headerUserAvatar.src = currentUser.avatarUrl;
        }
    } catch (e) {
        console.warn('Could not read user session', e);
    }

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

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/landing.html';
        });
    }
}

/**
 * 3. Search and Category Filter Setup
 */
function initFiltersAndSearch() {
    const searchInput = document.getElementById('eventSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const categoriesScrollRow = document.getElementById('categoriesScrollRow');
    const btnFeaturedRegister = document.getElementById('btnFeaturedRegister');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
            }
            clearTimeout(searchDebounceTimeout);
            searchDebounceTimeout = setTimeout(() => {
                applyLocalFilters();
            }, 250);
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            searchInput.focus();
            applyLocalFilters();
        });
    }

    if (categoriesScrollRow) {
        categoriesScrollRow.addEventListener('click', (e) => {
            const pill = e.target.closest('.filter-pill-btn');
            if (!pill) return;

            categoriesScrollRow.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');

            activeCategory = pill.getAttribute('data-category') || 'All';
            applyLocalFilters();
        });
    }

    if (btnFeaturedRegister) {
        btnFeaturedRegister.addEventListener('click', async () => {
            const evId = btnFeaturedRegister.getAttribute('data-id') || 801;
            await toggleEventRegistration(evId, btnFeaturedRegister);
        });
    }
}

/**
 * 4. Parse URL Query Parameters
 */
function checkUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const search = params.get('q') || params.get('search');

    if (cat) {
        activeCategory = cat;
        const pill = document.querySelector(`.filter-pill-btn[data-category="${cat}"]`);
        if (pill) {
            document.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
        }
    }

    if (search) {
        searchQuery = search;
        const searchInput = document.getElementById('eventSearchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (searchInput) searchInput.value = search;
        if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
    }
}

/**
 * 5. Fetch Events from API
 */
async function loadEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="loading-state-wrapper">
            <div class="loading-spinner"></div>
            <p>Accessing guild session ledger...</p>
        </div>
    `;

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getEvents === 'function') {
            const res = await window.ArtSphereAPI.getEvents(null, null, currentUserId);
            if (res && res.length > 0) {
                allEvents = res.map(ev => {
                    const fallback = DEFAULT_EVENTS.find(d => String(d.id) === String(ev.id)) || {};
                    const dateParts = parseDateToParts(ev.eventDate || fallback.eventDate);
                    return {
                        ...fallback,
                        ...ev,
                        dateMonth: dateParts.month,
                        dateDay: dateParts.day,
                        imageUrl: ev.imageUrl || fallback.imageUrl || '/images/comm_event_watercolor.png',
                        organizerAvatar: ev.organizerAvatar || fallback.organizerAvatar || '/images/comm_creative_souls_avatar.png',
                        organizerName: ev.organizerName || fallback.organizerName || 'Creative Souls Network',
                        organizerId: ev.organizerId || fallback.organizerId || 401
                    };
                });
            } else {
                allEvents = [...DEFAULT_EVENTS];
            }
        } else {
            allEvents = [...DEFAULT_EVENTS];
        }
    } catch (err) {
        console.warn('API error, using curated editorial events:', err);
        allEvents = [...DEFAULT_EVENTS];
    }

    applyLocalFilters();
}

/**
 * 6. Local Filter and Search Engine
 */
function applyLocalFilters() {
    const grid = document.getElementById('eventsGrid');
    const eventsCountBadge = document.getElementById('eventsCountBadge');
    if (!grid) return;

    let filtered = [...allEvents];

    // Filter by Category
    if (activeCategory && activeCategory.toLowerCase() !== 'all') {
        const catLower = activeCategory.toLowerCase();
        filtered = filtered.filter(item => {
            const af = (item.artForm || '').toLowerCase();
            const et = (item.eventType || '').toLowerCase();
            return af.includes(catLower) || et.includes(catLower);
        });
    }

    // Filter by Search Query
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(item => {
            const title = (item.title || '').toLowerCase();
            const desc = (item.description || '').toLowerCase();
            const loc = (item.location || '').toLowerCase();
            const org = (item.organizerName || '').toLowerCase();
            return title.includes(q) || desc.includes(q) || loc.includes(q) || org.includes(q);
        });
    }

    // Update Result Stamp
    if (eventsCountBadge) {
        if (filtered.length === allEvents.length && !searchQuery && activeCategory === 'All') {
            eventsCountBadge.textContent = `Showing all ${filtered.length} upcoming sessions`;
        } else {
            eventsCountBadge.textContent = `Showing ${filtered.length} session${filtered.length === 1 ? '' : 's'} matching filter`;
        }
    }

    renderEventsGrid(filtered);
}

/**
 * 7. Render Events Bento Grid
 */
function renderEventsGrid(events) {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    if (!events || events.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-icon">✦</div>
                <h3>No live sessions found</h3>
                <p>No events match your active filters. Try searching for different art forms or reset filters.</p>
                <button class="btn-pill-reset" id="resetEventFiltersBtn">Reset All Filters</button>
            </div>
        `;
        const resetBtn = document.getElementById('resetEventFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                activeCategory = 'All';
                searchQuery = '';
                const searchInput = document.getElementById('eventSearchInput');
                const clearSearchBtn = document.getElementById('clearSearchBtn');
                if (searchInput) searchInput.value = '';
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';
                document.querySelectorAll('.filter-pill-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-category') === 'All');
                });
                applyLocalFilters();
            });
        }
        return;
    }

    grid.innerHTML = events.map(ev => createEventBentoCardHtml(ev)).join('');

    // Attach RSVP Toggle Listeners
    grid.querySelectorAll('.btn-card-register-toggle').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const eventId = btn.getAttribute('data-id');
            await toggleEventRegistration(eventId, btn);
        });
    });
}

/**
 * 8. Event Bento Card HTML Generator
 */
function createEventBentoCardHtml(ev) {
    const isRegistered = Boolean(ev.registered);
    const regClass = isRegistered ? 'registered' : '';
    const regText = isRegistered ? 'Registered ✦' : 'RSVP Now';

    return `
        <a href="/pages/event-details.html?id=${ev.id}" class="event-bento-card" data-id="${ev.id}">
            <div class="event-card-media">
                <img src="${escapeHtml(ev.imageUrl)}" alt="${escapeHtml(ev.title)}" class="event-cover-img" onerror="this.src='/images/comm_event_watercolor.png'">
                <div class="event-card-date-badge">
                    <span class="date-month">${escapeHtml(ev.dateMonth || 'MAR')}</span>
                    <span class="date-day">${escapeHtml(ev.dateDay || '15')}</span>
                </div>
                <div class="event-card-type-badge">
                    <span class="pill-tag accent-yellow">${escapeHtml(ev.eventType || 'Workshop')}</span>
                </div>
            </div>

            <div class="event-card-content">
                <h3 class="event-name">${escapeHtml(ev.title)}</h3>
                <p class="event-desc">${escapeHtml(ev.description || '')}</p>

                <div class="event-meta-block">
                    <div class="event-meta-row">
                        <span>⏰</span>
                        <span>${escapeHtml(ev.eventTime || '4:00 PM – 6:00 PM')}</span>
                    </div>
                    <div class="event-meta-row">
                        <span>📍</span>
                        <span>${escapeHtml(ev.location || 'Online Session')}</span>
                    </div>
                    <div class="event-meta-row">
                        <span>✦</span>
                        <span>${ev.attendeesCount || 24} artists attending</span>
                    </div>
                </div>

                <div class="event-organizer-row">
                    <div class="organizer-info-link">
                        <img src="${escapeHtml(ev.organizerAvatar)}" alt="${escapeHtml(ev.organizerName)}" class="organizer-thumb" onerror="this.src='/images/comm_creative_souls_avatar.png'">
                        <div class="organizer-label-box">
                            <span class="org-sub">Host</span>
                            <span class="org-name-text">${escapeHtml(ev.organizerName || 'ArtSphere')}</span>
                        </div>
                    </div>
                    <button class="btn-card-register-toggle ${regClass}" data-id="${ev.id}">
                        ${regText}
                    </button>
                </div>
            </div>
        </a>
    `;
}

/**
 * 9. Event Registration Toggle
 */
async function toggleEventRegistration(eventId, btnElement) {
    const isCurrentlyReg = btnElement.classList.contains('registered');
    btnElement.disabled = true;

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.registerForEvent === 'function') {
            await window.ArtSphereAPI.registerForEvent(eventId, currentUserId);
        }

        const ev = allEvents.find(e => String(e.id) === String(eventId));
        if (ev) {
            ev.registered = !isCurrentlyReg;
            ev.attendeesCount = (ev.attendeesCount || 24) + (ev.registered ? 1 : -1);
        }

        if (isCurrentlyReg) {
            btnElement.classList.remove('registered');
            btnElement.textContent = 'RSVP Now';
            showToast('Registration cancelled');
        } else {
            btnElement.classList.add('registered');
            btnElement.textContent = 'Registered ✦';
            showToast('You are RSVPed! See you at the session.');
        }
    } catch (err) {
        console.error('Error toggling registration:', err);
        showToast('Action failed. Please try again.');
    } finally {
        btnElement.disabled = false;
    }
}

function parseDateToParts(dateStr) {
    if (!dateStr) return { month: 'MAR', day: '15' };
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 2) {
        const day = parts[0].replace(/\D/g, '') || '15';
        const month = parts[1].substring(0, 3).toUpperCase() || 'MAR';
        return { month, day };
    }
    return { month: 'MAR', day: '15' };
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 350);
    }, 2400);
}
