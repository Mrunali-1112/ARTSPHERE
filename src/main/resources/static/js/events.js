/**
 * ArtSphere — Events & Gatherings Dashboard Controller
 * Soft Lavender / Plum Dashboard Visual Architecture
 * API Integration, Interactive Calendar, Carousel, Search & RSVP Engine
 */

let allEvents = [];
let activeCategory = 'All';
let searchQuery = '';
let searchDebounceTimeout = null;
let currentUserId = 101;
let currentUser = null;
let featuredIndex = 0;

// Calendar State
let calCurrentMonth = 2; // March (0-indexed)
let calCurrentYear = 2024;
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Curated default events matching the reference design and backend schema
const DEFAULT_EVENTS = [
    {
        id: 801,
        title: "Watercolor Basics Workshop",
        artForm: "Painting",
        eventType: "Workshop",
        description: "Learn the fundamentals of watercolor painting with easy techniques and step-by-step guidance.",
        eventDate: "15 Mar 2024",
        dateMonth: "MAR",
        dateDay: "15",
        eventTime: "4:00 PM - 6:00 PM (IST)",
        location: "Art Studio, Bandra West, Mumbai",
        organizerName: "Creative Souls Network",
        organizerAvatar: "/images/comm_creative_souls_avatar.png",
        imageUrl: "/images/comm_event_watercolor.png",
        attendeesCount: 32,
        isFeatured: true,
        registered: true
    },
    {
        id: 301,
        title: "Watercolor Workshop",
        artForm: "Painting",
        eventType: "Workshop",
        description: "Hands-on watercolor painting workshop with master artists.",
        eventDate: "25 Sep 2024",
        dateMonth: "SEP",
        dateDay: "25",
        eventTime: "10:00 AM - 1:00 PM (IST)",
        location: "ArtHouse, Mumbai",
        organizerName: "Creative Souls Network",
        organizerAvatar: "/images/event_watercolor_thumb.png",
        imageUrl: "/images/event_watercolor_thumb.png",
        attendeesCount: 24,
        isFeatured: false,
        registered: true
    },
    {
        id: 802,
        title: "Local Artists Exhibition",
        artForm: "Painting",
        eventType: "Exhibition",
        description: "Explore stunning works from emerging and master artists in our vibrant regional community.",
        eventDate: "22 Mar 2024",
        dateMonth: "MAR",
        dateDay: "22",
        eventTime: "10:00 AM - 5:00 PM (IST)",
        location: "Mumbai, Maharashtra",
        organizerName: "Analog Frames Collective",
        organizerAvatar: "/images/artist_ishita_thumb.png",
        imageUrl: "/images/comm_event_exhibition.png",
        attendeesCount: 48,
        isFeatured: false,
        registered: true
    },
    {
        id: 803,
        title: "Outdoor Sketching Meetup",
        artForm: "Painting",
        eventType: "Meetup",
        description: "Join fellow artists for a relaxed sketching session by the sea.",
        eventDate: "28 Mar 2024",
        dateMonth: "MAR",
        dateDay: "28",
        eventTime: "3:00 PM - 6:00 PM (IST)",
        location: "Mumbai, Maharashtra",
        organizerName: "Modular Sound Explorers",
        organizerAvatar: "/images/artist_arjun_thumb.png",
        imageUrl: "/images/comm_event_sketching.png",
        attendeesCount: 17,
        isFeatured: false,
        registered: false
    },
    {
        id: 804,
        title: "Digital Art Basics (Live)",
        artForm: "Digital Art",
        eventType: "Live Session",
        description: "Get started with digital art tools, layers, blending modes, and brush engines.",
        eventDate: "05 Apr 2024",
        dateMonth: "APR",
        dateDay: "05",
        eventTime: "5:00 PM - 7:00 PM (IST)",
        location: "Online (Google Meet)",
        organizerName: "Kinetic Motion Lab",
        organizerAvatar: "/images/cat_visual_arts.png",
        imageUrl: "/images/comm_event_digital_art.png",
        attendeesCount: 32,
        isFeatured: false,
        registered: false
    },
    {
        id: 805,
        title: "Acoustic Indie Jam & Open Mic",
        artForm: "Music",
        eventType: "Jam Session",
        description: "An unplugged evening for songwriters, guitarists, and spoken word poets.",
        eventDate: "12 Apr 2024",
        dateMonth: "APR",
        dateDay: "12",
        eventTime: "6:00 PM - 9:00 PM (IST)",
        location: "Pune, Maharashtra",
        organizerName: "Midnight Verses Circle",
        organizerAvatar: "/images/cat_music.png",
        imageUrl: "/images/comm_post_sunset_painting.png",
        attendeesCount: 28,
        isFeatured: false,
        registered: true
    },
    {
        id: 806,
        title: "Contemporary Dance Improvisation",
        artForm: "Dance",
        eventType: "Workshop",
        description: "Explore floor work, spatial awareness, and intuitive bodily expression.",
        eventDate: "18 Apr 2024",
        dateMonth: "APR",
        dateDay: "18",
        eventTime: "4:30 PM - 7:30 PM (IST)",
        location: "Bengaluru, Karnataka",
        organizerName: "Creative Souls Network",
        organizerAvatar: "/images/artist_kavya_avatar.png",
        imageUrl: "/images/cat_dance.png",
        attendeesCount: 22,
        isFeatured: false,
        registered: false
    },
    {
        id: 807,
        title: "Street Photography Masterclass",
        artForm: "Photography",
        eventType: "Masterclass",
        description: "Morning golden hour photo-walk focusing on composition, street reflections, and documentary style.",
        eventDate: "25 Apr 2024",
        dateMonth: "APR",
        dateDay: "25",
        eventTime: "7:00 AM - 10:30 AM (IST)",
        location: "Navi Mumbai, Maharashtra",
        organizerName: "Creative Souls Network",
        organizerAvatar: "/images/cat_photography.png",
        imageUrl: "/images/cat_photography.png",
        attendeesCount: 19,
        isFeatured: false,
        registered: true
    },
    {
        id: 808,
        title: "Ceramic & Clay Pottery Sculpting",
        artForm: "Painting",
        eventType: "Workshop",
        description: "Hands-on wheel throwing and hand-building ceramics session.",
        eventDate: "30 Apr 2024",
        dateMonth: "APR",
        dateDay: "30",
        eventTime: "2:00 PM - 5:30 PM (IST)",
        location: "Mumbai, Maharashtra",
        organizerName: "Creative Souls Network",
        organizerAvatar: "/images/comm_creative_souls_avatar.png",
        imageUrl: "/images/comm_event_detail_cover.png",
        attendeesCount: 16,
        isFeatured: false,
        registered: false
    }
];

document.addEventListener('DOMContentLoaded', async () => {
    await initUserSession();
    initMobileDrawer();
    initSearchAndFilterSync();
    initFeaturedCarousel();
    initCalendarControls();
    initQuickLinks();
    initEventRegistrationModals();
    checkUrlQueryParams();
    loadEvents();
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

    try {
        const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (stored) {
            currentUser = JSON.parse(stored);
            if (currentUser.id) currentUserId = currentUser.id;
        }
        
        // Also query /api/auth/me to get fresh email and details if needed
        if (!currentUser || !currentUser.email) {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.data) {
                        currentUser = { ...(currentUser || {}), ...json.data };
                        if (currentUser.id) currentUserId = currentUser.id;
                    }
                }
            } catch (err) {
                // Ignore silent auth fetch error
            }
        }

        if (currentUser) {
            const name = currentUser.fullName || currentUser.name || currentUser.username || 'Mrunali';
            if (dropdownUserName) dropdownUserName.textContent = name;
            if (sidebarUserName) sidebarUserName.textContent = name;
            if (currentUser.bio && dropdownUserBio) dropdownUserBio.textContent = currentUser.bio;
            const avatarUrl = currentUser.profilePicture || currentUser.avatarUrl || '/images/user_avatar_nav.png';
            if (headerUserAvatar) headerUserAvatar.src = avatarUrl;
            if (sidebarUserAvatar) sidebarUserAvatar.src = avatarUrl;
        }
    } catch (e) {
        console.warn('Could not read user session', e);
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
    const handleLogout = () => {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        window.location.href = '/pages/landing.html';
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
 * 3. Search and Category Filter Setup (Two-Way Synced)
 */
function initSearchAndFilterSync() {
    const topSearch = document.getElementById('topHeaderSearchInput');
    const filterSearch = document.getElementById('eventSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const categoriesScrollRow = document.getElementById('categoriesScrollRow');
    const viewAllLink = document.getElementById('viewAllGatheringsLink');
    const heroExploreBtn = document.getElementById('heroExploreBtn');

    // Sync search inputs
    const handleSearchInput = (val) => {
        searchQuery = val.trim();
        if (topSearch && topSearch.value !== val) topSearch.value = val;
        if (filterSearch && filterSearch.value !== val) filterSearch.value = val;

        if (clearBtn) {
            clearBtn.style.display = searchQuery ? 'flex' : 'none';
        }

        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
            applyLocalFilters();
        }, 200);
    };

    if (topSearch) {
        topSearch.addEventListener('input', (e) => handleSearchInput(e.target.value));
    }

    if (filterSearch) {
        filterSearch.addEventListener('input', (e) => handleSearchInput(e.target.value));
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            handleSearchInput('');
            if (filterSearch) filterSearch.focus();
        });
    }

    // Category Filter Pills
    if (categoriesScrollRow) {
        categoriesScrollRow.addEventListener('click', (e) => {
            const pill = e.target.closest('.artform-pill-btn');
            if (!pill) return;

            categoriesScrollRow.querySelectorAll('.artform-pill-btn').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');

            activeCategory = pill.getAttribute('data-category') || 'All';
            applyLocalFilters();
        });
    }

    // View All Link
    if (viewAllLink) {
        viewAllLink.addEventListener('click', (e) => {
            e.preventDefault();
            activeCategory = 'All';
            searchQuery = '';
            if (topSearch) topSearch.value = '';
            if (filterSearch) filterSearch.value = '';
            if (clearBtn) clearBtn.style.display = 'none';

            if (categoriesScrollRow) {
                categoriesScrollRow.querySelectorAll('.artform-pill-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-category') === 'All');
                });
            }
            applyLocalFilters();

            const anchor = document.getElementById('gatheringsAnchor');
            if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Hero Explore CTA
    if (heroExploreBtn) {
        heroExploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const anchor = document.getElementById('gatheringsAnchor');
            if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
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
        const pill = document.querySelector(`.artform-pill-btn[data-category="${cat}"]`);
        if (pill) {
            document.querySelectorAll('.artform-pill-btn').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
        }
    }

    if (search) {
        searchQuery = search;
        const topSearch = document.getElementById('topHeaderSearchInput');
        const filterSearch = document.getElementById('eventSearchInput');
        const clearBtn = document.getElementById('clearSearchBtn');
        if (topSearch) topSearch.value = search;
        if (filterSearch) filterSearch.value = search;
        if (clearBtn) clearBtn.style.display = 'flex';
    }
}

/**
 * 5. Load Events from API or Fallback
 */
async function loadEvents() {
    const grid = document.getElementById('eventsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="empty-state-card" style="padding:32px;">
                <div class="empty-icon-sparkle">✦</div>
                <p>Loading upcoming gatherings...</p>
            </div>
        `;
    }

    try {
        let apiData = null;
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getEvents === 'function') {
            apiData = await window.ArtSphereAPI.getEvents(null, null, currentUserId);
        } else {
            const resp = await fetch(`/api/events?userId=${currentUserId}`);
            if (resp.ok) {
                const json = await resp.json();
                apiData = json.data;
            }
        }

        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
            allEvents = apiData.map(ev => {
                const fallback = DEFAULT_EVENTS.find(d => String(d.id) === String(ev.id)) || {};
                const dateParts = parseDateToParts(ev.eventDate || fallback.eventDate);
                return {
                    ...fallback,
                    ...ev,
                    dateMonth: dateParts.month,
                    dateDay: dateParts.day,
                    imageUrl: ev.imageUrl || fallback.imageUrl || '/images/comm_event_watercolor.png',
                    organizerAvatar: ev.organizerAvatar || fallback.organizerAvatar || '/images/comm_creative_souls_avatar.png',
                    organizerName: ev.organizer || ev.organizerName || fallback.organizerName || 'Creative Souls Network',
                    eventType: ev.eventType || fallback.eventType || 'Workshop',
                    artForm: ev.artForm || fallback.artForm || 'Painting',
                    registered: ev.registered !== undefined ? ev.registered : (fallback.registered || false)
                };
            });
        } else {
            allEvents = [...DEFAULT_EVENTS];
        }
    } catch (err) {
        console.warn('API error, using curated default events:', err);
        allEvents = [...DEFAULT_EVENTS];
    }

    applyLocalFilters();
    renderFeaturedEvent();
    renderCalendar();
    renderSchedule();
    renderRecommendations();
}

/**
 * 6. Filter & Search Logic
 */
function applyLocalFilters() {
    let filtered = [...allEvents];

    // Filter by Category / Art Form
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
            const venue = (item.venue || '').toLowerCase();
            const org = (item.organizerName || '').toLowerCase();
            return title.includes(q) || desc.includes(q) || loc.includes(q) || venue.includes(q) || org.includes(q);
        });
    }

    // Update Result Stamp
    const eventsCountBadge = document.getElementById('eventsCountBadge');
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
 * 7. Render 3-Column Gatherings Cards Grid
 */
function renderEventsGrid(events) {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    if (!events || events.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-icon-sparkle">✦</div>
                <h3>No gatherings found</h3>
                <p>No events match your active filters. Try searching for different art forms or reset filters.</p>
                <button class="btn-pill-reset" id="resetEventFiltersBtn">Reset All Filters</button>
            </div>
        `;
        const resetBtn = document.getElementById('resetEventFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                activeCategory = 'All';
                searchQuery = '';
                const topSearch = document.getElementById('topHeaderSearchInput');
                const filterSearch = document.getElementById('eventSearchInput');
                const clearBtn = document.getElementById('clearSearchBtn');
                if (topSearch) topSearch.value = '';
                if (filterSearch) filterSearch.value = '';
                if (clearBtn) clearBtn.style.display = 'none';

                const categoriesScrollRow = document.getElementById('categoriesScrollRow');
                if (categoriesScrollRow) {
                    categoriesScrollRow.querySelectorAll('.artform-pill-btn').forEach(b => {
                        b.classList.toggle('active', b.getAttribute('data-category') === 'All');
                    });
                }
                applyLocalFilters();
            });
        }
        return;
    }

    grid.innerHTML = events.map(ev => createEventCardHtml(ev)).join('');

    // Attach RSVP Action Listeners
    grid.querySelectorAll('.btn-rsvp-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const eventId = btn.getAttribute('data-id');
            handleEventRegistrationClick(eventId, btn);
        });
    });
}

/**
 * 8. Event Card HTML Generator (Reference Style)
 */
function createEventCardHtml(ev) {
    const isRegistered = Boolean(ev.registered);
    const regClass = isRegistered ? 'registered' : '';
    const regText = isRegistered ? 'Registered ✓' : 'RSVP Now';
    const badgeTypeClass = getBadgeTypeClass(ev.eventType);

    return `
        <a href="/pages/event-details.html?id=${ev.id}" class="event-gather-card" data-id="${ev.id}">
            <!-- Media Frame -->
            <div class="card-media-box">
                <img src="${escapeHtml(ev.imageUrl)}" alt="${escapeHtml(ev.title)}" class="card-cover-image" onerror="this.src='/images/comm_event_watercolor.png'">
                <!-- Top-Left Date Stamp Badge -->
                <div class="card-date-badge">
                    <span class="badge-month">${escapeHtml(ev.dateMonth || 'MAR')}</span>
                    <span class="badge-day">${escapeHtml(ev.dateDay || '15')}</span>
                </div>
                <!-- Top-Right Type Pill Badge -->
                <div class="card-type-badge ${badgeTypeClass}">
                    ${escapeHtml(ev.eventType || 'Workshop')}
                </div>
            </div>

            <!-- Card Body -->
            <div class="card-content-body">
                <h3 class="card-event-title">${escapeHtml(ev.title)}</h3>
                <p class="card-event-description">${escapeHtml(ev.description || '')}</p>

                <div class="card-meta-list">
                    <div class="card-meta-row" title="${escapeHtml(ev.eventTime || '4:00 PM - 6:00 PM')}">
                        <span class="card-meta-icon">⏰</span>
                        <span>${escapeHtml(ev.eventTime || '4:00 PM - 6:00 PM (IST)')}</span>
                    </div>
                    <div class="card-meta-row" title="${escapeHtml(ev.location || 'Mumbai, Maharashtra')}">
                        <span class="card-meta-icon">📍</span>
                        <span>${escapeHtml(ev.location || 'Mumbai, Maharashtra')}</span>
                    </div>
                    <div class="card-meta-row">
                        <span class="card-meta-icon">✦</span>
                        <span>${ev.attendeesCount || 24} artists attending</span>
                    </div>
                </div>
            </div>

            <!-- Card Footer: Host Info + RSVP Button -->
            <div class="card-footer-row">
                <div class="host-info-block">
                    <img src="${escapeHtml(ev.organizerAvatar || '/images/comm_creative_souls_avatar.png')}" alt="Host" class="host-avatar-img" onerror="this.src='/images/comm_creative_souls_avatar.png'">
                    <div class="host-names-stack">
                        <span class="host-title-name">${escapeHtml(ev.organizerName || 'ArtSphere')}</span>
                        <span class="host-sub-caption">Host</span>
                    </div>
                </div>
                <button class="btn-rsvp-action ${regClass}" data-id="${ev.id}">
                    ${regText}
                </button>
            </div>
        </a>
    `;
}

/**
 * 9. Featured Event Carousel & Renderer
 */
function initFeaturedCarousel() {
    const prevBtn = document.getElementById('featuredPrevBtn');
    const nextBtn = document.getElementById('featuredNextBtn');
    const registerBtn = document.getElementById('btnFeaturedRegister');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (allEvents.length === 0) return;
            featuredIndex = (featuredIndex - 1 + allEvents.length) % allEvents.length;
            renderFeaturedEvent();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (allEvents.length === 0) return;
            featuredIndex = (featuredIndex + 1) % allEvents.length;
            renderFeaturedEvent();
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const evId = registerBtn.getAttribute('data-id');
            if (evId) {
                handleEventRegistrationClick(evId, registerBtn);
            }
        });
    }
}

function renderFeaturedEvent() {
    if (allEvents.length === 0) return;
    const ev = allEvents[featuredIndex] || allEvents[0];
    if (!ev) return;

    const coverImg = document.getElementById('featuredCoverImg');
    const titleEl = document.getElementById('featuredTitle');
    const venueEl = document.getElementById('featuredVenue');
    const timeEl = document.getElementById('featuredTime');
    const regBtn = document.getElementById('btnFeaturedRegister');
    const dateBadge = document.getElementById('featuredDateBadge');
    const typeBadge = document.getElementById('featuredTypeBadge');

    if (coverImg) coverImg.src = ev.imageUrl || '/images/comm_event_watercolor.png';
    if (titleEl) titleEl.textContent = ev.title;
    if (venueEl) venueEl.textContent = ev.venue || ev.location || 'Art Studio, Bandra West, Mumbai';
    if (timeEl) timeEl.textContent = ev.eventTime || '4:00 PM - 6:00 PM (IST)';

    if (dateBadge) {
        dateBadge.innerHTML = `
            <span class="stamp-month">${escapeHtml(ev.dateMonth || 'MAR')}</span>
            <span class="stamp-day">${escapeHtml(ev.dateDay || '15')}</span>
        `;
    }

    if (typeBadge) {
        typeBadge.textContent = ev.eventType || 'Workshop';
        typeBadge.className = `event-type-pill-badge ${getBadgeTypeClass(ev.eventType)}`;
    }

    if (regBtn) {
        regBtn.setAttribute('data-id', ev.id);
        if (ev.registered) {
            regBtn.classList.add('registered');
            regBtn.innerHTML = `<span>Registered ✓</span>`;
        } else {
            regBtn.classList.remove('registered');
            regBtn.innerHTML = `<span>Register Now</span><span>→</span>`;
        }
    }
}

/**
 * 10. Interactive Calendar & Schedule Engine
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

    // Map of dates with events in this month
    const currentMonthPrefix = MONTH_NAMES[calCurrentMonth].substring(0, 3).toUpperCase();
    const eventDays = new Set();

    allEvents.forEach(ev => {
        if (ev.dateMonth && ev.dateMonth.toUpperCase() === currentMonthPrefix) {
            const dayNum = parseInt(ev.dateDay, 10);
            if (!isNaN(dayNum)) eventDays.add(dayNum);
        }
    });

    // Also include default highlight days if March 2024 to match reference image (15, 22, 28)
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

    // Click on date cell filter
    daysGrid.querySelectorAll('.cal-day-cell.has-event').forEach(cell => {
        cell.addEventListener('click', () => {
            const day = cell.getAttribute('data-day');
            const dayPad = day.padStart(2, '0');
            const matched = allEvents.filter(e => e.dateDay === day || e.dateDay === dayPad);
            if (matched.length > 0) {
                renderEventsGrid(matched);
                const badge = document.getElementById('eventsCountBadge');
                if (badge) badge.textContent = `Showing sessions on ${day} ${currentMonthPrefix}`;
                showToast(`Filtered for ${day} ${currentMonthPrefix}`);
            }
        });
    });
}

function renderSchedule() {
    const list = document.getElementById('scheduleEventsList');
    if (!list) return;

    // Show registered events first; fallback to top upcoming events
    let scheduleItems = allEvents.filter(e => e.registered);
    if (scheduleItems.length === 0) {
        scheduleItems = allEvents.slice(0, 3);
    } else if (scheduleItems.length > 3) {
        scheduleItems = scheduleItems.slice(0, 3);
    }

    if (scheduleItems.length === 0) {
        list.innerHTML = `
            <div class="schedule-empty-state">
                <span>No registered gatherings yet. RSVP above to add sessions here!</span>
            </div>
        `;
        return;
    }

    list.innerHTML = scheduleItems.map(ev => `
        <a href="/pages/event-details.html?id=${ev.id}" class="schedule-event-row" title="View Details">
            <div class="schedule-date-pill">
                ${escapeHtml(ev.dateDay || '15')}
            </div>
            <div class="schedule-event-details">
                <span class="schedule-event-title">${escapeHtml(ev.title)}</span>
                <span class="schedule-event-time">${escapeHtml(ev.eventTime ? ev.eventTime.split('(')[0].trim() : '4:00 PM - 6:00 PM')}</span>
            </div>
        </a>
    `).join('');
}

/**
 * 11. Recommended for You Section
 */
function renderRecommendations() {
    const recList = document.getElementById('recommendedList');
    if (!recList) return;

    // Pick 2 events distinct from the featured event
    const recCandidates = allEvents.filter((_, idx) => idx !== featuredIndex);
    const selected = recCandidates.slice(0, 2);

    if (selected.length === 0) {
        recList.innerHTML = `<p style="font-size:12px;color:var(--text-muted);padding:8px;">More sessions coming soon</p>`;
        return;
    }

    recList.innerHTML = selected.map(ev => `
        <a href="/pages/event-details.html?id=${ev.id}" class="recommended-card-item">
            <img src="${escapeHtml(ev.imageUrl || '/images/comm_event_watercolor.png')}" alt="Thumbnail" class="recommended-thumb-img" onerror="this.src='/images/comm_event_watercolor.png'">
            <div class="recommended-info-block">
                <span class="recommended-item-title">${escapeHtml(ev.title)}</span>
                <span class="recommended-item-sub">${escapeHtml(ev.eventDate || 'Upcoming')} · ${escapeHtml(ev.location ? ev.location.split(',')[0] : 'Online')}</span>
            </div>
            <span class="recommended-chevron">›</span>
        </a>
    `).join('');
}

/**
 * 12. Quick Links Actions
 */
function initQuickLinks() {
    const savedBtn = document.getElementById('quickLinkSaved');
    const pastBtn = document.getElementById('quickLinkPast');

    if (savedBtn) {
        savedBtn.addEventListener('click', () => {
            const registered = allEvents.filter(e => e.registered);
            if (registered.length > 0) {
                renderEventsGrid(registered);
                showToast(`Showing ${registered.length} registered events`);
            } else {
                showToast("No saved events found yet. RSVP to save sessions!");
            }
        });
    }

    if (pastBtn) {
        pastBtn.addEventListener('click', () => {
            showToast("You are viewing all active and upcoming 2024 gatherings.");
        });
    }
}

/**
 * 13. Event Registration Flow & Modal Engine
 */
let activeRegisteringEvent = null;

function handleEventRegistrationClick(eventId, btnElement) {
    const ev = allEvents.find(e => String(e.id) === String(eventId));
    if (!ev) {
        showToast('Event information not found.');
        return;
    }

    // Duplicate registration protection check
    if (ev.registered) {
        openAlreadyRegisteredModal(ev);
        return;
    }

    openEventRegistrationModal(ev);
}

function openAlreadyRegisteredModal(ev) {
    const alreadyModal = document.getElementById('eventAlreadyRegModal');
    const titleEl = document.getElementById('alreadyRegEventTitle');
    if (titleEl && ev) {
        titleEl.textContent = ev.title || 'Event';
    }
    if (alreadyModal) {
        alreadyModal.style.display = 'flex';
    }
}

function openEventRegistrationModal(ev) {
    activeRegisteringEvent = ev;
    const modal = document.getElementById('eventRegModal');
    if (!modal) return;

    // Header & Compact Event Summary
    const headerEventName = document.getElementById('regModalEventName');
    const summaryTitle = document.getElementById('regSummaryTitle');
    const summaryDate = document.getElementById('regSummaryDate');
    const summaryTime = document.getElementById('regSummaryTime');
    const summaryLocation = document.getElementById('regSummaryLocation');
    const summaryHost = document.getElementById('regSummaryHost');
    const summaryType = document.getElementById('regSummaryType');

    if (headerEventName) headerEventName.textContent = ev.title || 'Event';
    if (summaryTitle) summaryTitle.textContent = ev.title || 'Event';
    if (summaryDate) summaryDate.textContent = ev.eventDate || (ev.dateMonth && ev.dateDay ? `${ev.dateDay} ${ev.dateMonth}` : 'Upcoming');
    if (summaryTime) summaryTime.textContent = ev.eventTime || '4:00 PM - 6:00 PM (IST)';
    if (summaryLocation) summaryLocation.textContent = ev.location || 'ArtHouse, Mumbai';
    if (summaryHost) summaryHost.textContent = ev.organizerName || ev.organizer || 'ArtSphere Host';
    if (summaryType) summaryType.textContent = (ev.eventType || 'Workshop').toUpperCase();

    // Pre-fill inputs from authenticated user
    const nameInput = document.getElementById('regNameInput');
    const emailInput = document.getElementById('regEmailInput');
    const disciplineSelect = document.getElementById('regDisciplineSelect');
    const attendeesInput = document.getElementById('regAttendeesInput');
    const noteInput = document.getElementById('regNoteInput');
    const confirmCheck = document.getElementById('regConfirmCheck');

    if (nameInput) {
        nameInput.value = (currentUser && (currentUser.fullName || currentUser.username || currentUser.name)) || '';
    }
    if (emailInput) {
        emailInput.value = (currentUser && currentUser.email) || '';
    }
    if (disciplineSelect) {
        const userDiscipline = (currentUser && (currentUser.artistType || currentUser.artForm || currentUser.discipline)) || '';
        let matched = false;
        for (let i = 0; i < disciplineSelect.options.length; i++) {
            if (disciplineSelect.options[i].value && userDiscipline.toLowerCase().includes(disciplineSelect.options[i].value.toLowerCase())) {
                disciplineSelect.selectedIndex = i;
                matched = true;
                break;
            }
        }
        if (!matched) disciplineSelect.value = '';
    }
    if (attendeesInput) attendeesInput.value = '1';
    if (noteInput) noteInput.value = '';
    if (confirmCheck) confirmCheck.checked = false;

    // Clear previous inline errors
    clearFormErrors();

    modal.style.display = 'flex';
}

function clearFormErrors() {
    document.querySelectorAll('#eventRegModal .reg-inline-error').forEach(el => el.classList.remove('show-error'));
    document.querySelectorAll('#eventRegModal .reg-form-input, #eventRegModal .reg-form-select').forEach(el => el.classList.remove('input-invalid'));
}

function closeAllEventModals() {
    const regModal = document.getElementById('eventRegModal');
    const successModal = document.getElementById('eventSuccessModal');
    const alreadyModal = document.getElementById('eventAlreadyRegModal');

    if (regModal) regModal.style.display = 'none';
    if (successModal) successModal.style.display = 'none';
    if (alreadyModal) alreadyModal.style.display = 'none';
    clearFormErrors();
}

function initEventRegistrationModals() {
    const regModal = document.getElementById('eventRegModal');
    const successModal = document.getElementById('eventSuccessModal');
    const alreadyModal = document.getElementById('eventAlreadyRegModal');

    // Close buttons
    const closeRegBtn = document.getElementById('closeEventRegModal');
    const cancelRegBtn = document.getElementById('btnCancelReg');
    const closeSuccessBtn = document.getElementById('closeEventSuccessModal');
    const backToEventsBtn = document.getElementById('btnBackToEvents');
    const closeAlreadyBtn = document.getElementById('closeAlreadyRegModal');
    const backAlreadyBtn = document.getElementById('btnCloseAlreadyReg');

    if (closeRegBtn) closeRegBtn.addEventListener('click', closeAllEventModals);
    if (cancelRegBtn) cancelRegBtn.addEventListener('click', closeAllEventModals);
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeAllEventModals);
    if (backToEventsBtn) backToEventsBtn.addEventListener('click', closeAllEventModals);
    if (closeAlreadyBtn) closeAlreadyBtn.addEventListener('click', closeAllEventModals);
    if (backAlreadyBtn) backAlreadyBtn.addEventListener('click', closeAllEventModals);

    // Backdrop click handlers
    [regModal, successModal, alreadyModal].forEach(m => {
        if (m) {
            m.addEventListener('click', (e) => {
                if (e.target === m) closeAllEventModals();
            });
        }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllEventModals();
    });

    // Stepper buttons
    const minusBtn = document.getElementById('btnAttendeeMinus');
    const plusBtn = document.getElementById('btnAttendeePlus');
    const attendeesInput = document.getElementById('regAttendeesInput');

    if (minusBtn && attendeesInput) {
        minusBtn.addEventListener('click', () => {
            let val = parseInt(attendeesInput.value, 10) || 1;
            if (val > 1) {
                attendeesInput.value = val - 1;
                document.getElementById('regAttendeesError')?.classList.remove('show-error');
                attendeesInput.classList.remove('input-invalid');
            }
        });
    }

    if (plusBtn && attendeesInput) {
        plusBtn.addEventListener('click', () => {
            let val = parseInt(attendeesInput.value, 10) || 1;
            if (val < 5) {
                attendeesInput.value = val + 1;
                document.getElementById('regAttendeesError')?.classList.remove('show-error');
                attendeesInput.classList.remove('input-invalid');
            }
        });
    }

    if (attendeesInput) {
        attendeesInput.addEventListener('change', () => {
            let val = parseInt(attendeesInput.value, 10);
            if (isNaN(val) || val < 1) attendeesInput.value = 1;
            else if (val > 5) attendeesInput.value = 5;
        });
    }

    // Real-time input error dismissal
    const nameInput = document.getElementById('regNameInput');
    const emailInput = document.getElementById('regEmailInput');
    const disciplineSelect = document.getElementById('regDisciplineSelect');
    const confirmCheck = document.getElementById('regConfirmCheck');

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            if (nameInput.value.trim()) {
                document.getElementById('regNameError')?.classList.remove('show-error');
                nameInput.classList.remove('input-invalid');
            }
        });
    }
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailInput.value.trim())) {
                document.getElementById('regEmailError')?.classList.remove('show-error');
                emailInput.classList.remove('input-invalid');
            }
        });
    }
    if (disciplineSelect) {
        disciplineSelect.addEventListener('change', () => {
            if (disciplineSelect.value) {
                document.getElementById('regDisciplineError')?.classList.remove('show-error');
                disciplineSelect.classList.remove('input-invalid');
            }
        });
    }
    if (confirmCheck) {
        confirmCheck.addEventListener('change', () => {
            if (confirmCheck.checked) {
                document.getElementById('regConfirmError')?.classList.remove('show-error');
            }
        });
    }

    // Form submit listener
    const regForm = document.getElementById('eventRegistrationForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!activeRegisteringEvent) return;

            let isValid = true;
            let firstInvalidEl = null;

            // 1. Full Name Validation
            const nameVal = nameInput ? nameInput.value.trim() : '';
            const nameErr = document.getElementById('regNameError');
            if (!nameVal) {
                isValid = false;
                nameErr?.classList.add('show-error');
                nameInput?.classList.add('input-invalid');
                if (!firstInvalidEl) firstInvalidEl = nameInput;
            } else {
                nameErr?.classList.remove('show-error');
                nameInput?.classList.remove('input-invalid');
            }

            // 2. Email Validation
            const emailVal = emailInput ? emailInput.value.trim() : '';
            const emailErr = document.getElementById('regEmailError');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailVal || !emailRegex.test(emailVal)) {
                isValid = false;
                emailErr?.classList.add('show-error');
                emailInput?.classList.add('input-invalid');
                if (!firstInvalidEl) firstInvalidEl = emailInput;
            } else {
                emailErr?.classList.remove('show-error');
                emailInput?.classList.remove('input-invalid');
            }

            // 3. Discipline Validation
            const discVal = disciplineSelect ? disciplineSelect.value.trim() : '';
            const discErr = document.getElementById('regDisciplineError');
            if (!discVal) {
                isValid = false;
                discErr?.classList.add('show-error');
                disciplineSelect?.classList.add('input-invalid');
                if (!firstInvalidEl) firstInvalidEl = disciplineSelect;
            } else {
                discErr?.classList.remove('show-error');
                disciplineSelect?.classList.remove('input-invalid');
            }

            // 4. Attendees Validation
            const attVal = attendeesInput ? parseInt(attendeesInput.value, 10) : 1;
            const attErr = document.getElementById('regAttendeesError');
            if (isNaN(attVal) || attVal < 1 || attVal > 5) {
                isValid = false;
                attErr?.classList.add('show-error');
                attendeesInput?.classList.add('input-invalid');
                if (!firstInvalidEl) firstInvalidEl = attendeesInput;
            } else {
                attErr?.classList.remove('show-error');
                attendeesInput?.classList.remove('input-invalid');
            }

            // 5. Confirmation Checkbox
            const checkVal = confirmCheck ? confirmCheck.checked : false;
            const checkErr = document.getElementById('regConfirmError');
            if (!checkVal) {
                isValid = false;
                checkErr?.classList.add('show-error');
                if (!firstInvalidEl) firstInvalidEl = confirmCheck;
            } else {
                checkErr?.classList.remove('show-error');
            }

            if (!isValid) {
                if (firstInvalidEl) firstInvalidEl.focus();
                return;
            }

            // Submit Registration
            const submitBtn = document.getElementById('btnConfirmReg');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Confirming...</span>`;
            }

            const ev = activeRegisteringEvent;
            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.registerForEvent === 'function') {
                    await window.ArtSphereAPI.registerForEvent(ev.id, currentUserId);
                } else {
                    const res = await fetch(`/api/events/${ev.id}/register?userId=${currentUserId}`, { method: 'POST' });
                    if (!res.ok) {
                        const errJson = await res.json().catch(() => ({}));
                        throw new Error(errJson.message || 'Registration failed');
                    }
                }

                // Update event state
                ev.registered = true;
                ev.attendeesCount = (ev.attendeesCount || 24) + attVal;

                // Update event card buttons
                document.querySelectorAll(`.btn-rsvp-action[data-id="${ev.id}"]`).forEach(btn => {
                    btn.classList.add('registered');
                    btn.textContent = 'Registered ✓';
                });

                // Update Featured button if matching
                const featuredRegBtn = document.getElementById('btnFeaturedRegister');
                if (featuredRegBtn && String(featuredRegBtn.getAttribute('data-id')) === String(ev.id)) {
                    featuredRegBtn.classList.add('registered');
                    featuredRegBtn.innerHTML = `<span>Registered ✓</span>`;
                }

                // Re-render schedule list to show this new registered gathering
                renderSchedule();

                // Close form modal
                if (regModal) regModal.style.display = 'none';

                // Populate and open success modal
                const successTitle = document.getElementById('successEventTitle');
                const ledgerEvent = document.getElementById('successLedgerEvent');
                const ledgerDate = document.getElementById('successLedgerDate');
                const ledgerTime = document.getElementById('successLedgerTime');
                const ledgerLocation = document.getElementById('successLedgerLocation');

                if (successTitle) successTitle.textContent = ev.title;
                if (ledgerEvent) ledgerEvent.textContent = ev.title;
                if (ledgerDate) ledgerDate.textContent = ev.eventDate || (ev.dateMonth && ev.dateDay ? `${ev.dateDay} ${ev.dateMonth}` : 'Confirmed');
                if (ledgerTime) ledgerTime.textContent = ev.eventTime || '4:00 PM - 6:00 PM (IST)';
                if (ledgerLocation) ledgerLocation.textContent = ev.location || 'ArtHouse, Mumbai';

                if (successModal) successModal.style.display = 'flex';

                showToast(`You're registered for ${ev.title}!`);

            } catch (err) {
                console.error('Registration submission error:', err);
                showToast(err.message || 'Registration could not be completed. Please try again.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<span>Confirm Registration</span><span>&rarr;</span>`;
                }
            }
        });
    }
}

/**
 * 14. Utilities & Helpers
 */
function getBadgeTypeClass(eventType) {
    if (!eventType) return 'badge-workshop';
    const lower = eventType.toLowerCase().replace(/\s+/g, '');
    if (lower.includes('workshop')) return 'badge-workshop';
    if (lower.includes('exhibition')) return 'badge-exhibition';
    if (lower.includes('meetup')) return 'badge-meetup';
    if (lower.includes('live')) return 'badge-livesession';
    if (lower.includes('jam')) return 'badge-jamsession';
    if (lower.includes('masterclass')) return 'badge-masterclass';
    return 'badge-default';
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
    return String(str)
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
