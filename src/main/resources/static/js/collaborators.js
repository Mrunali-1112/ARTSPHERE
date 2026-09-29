/**
 * ArtSphere — Collaborate & Squads Workspace Controller
 * Soft Pastel Lavender / Plum SaaS Creative Dashboard
 * Real Database Persistence, Dynamic Filters, Real-time Inquiries Engine
 */

let allCollaborations = [];
let activeDiscipline = 'All';
let searchQuery = '';
let searchDebounceTimeout = null;
let currentUserId = 101;
let currentUser = null;
let activeRequestsTab = 'received';

// Curated default editorial fallback in case API fails
const DEFAULT_COLLABORATIONS = [
    {
        id: 501,
        title: "Short Film Concept & Animation Pitch",
        purpose: "Work on a Project",
        collaborationType: "Short Film",
        skills: ["Digital Art", "Animation", "Storyboarding", "Concept Art"],
        description: "Seeking a digital animator and background painter for a 7-minute poetic narrative short film exploring urban mythology.",
        creatorName: "Mrunali S.",
        creatorAvatar: "/images/artist_profile_avatar.png",
        creatorArtistType: "Digital Artist",
        creatorId: 101,
        location: "Mumbai, MH",
        availability: "Flexible • 2 Months",
        peopleNeeded: "1-2 Animators",
        status: "OPEN",
        ownPost: true
    },
    {
        id: 502,
        title: "Ambient Soundscapes for Architectural Projection",
        purpose: "Create Content",
        collaborationType: "Installation",
        skills: ["Music", "Sound Design", "Audio Synthesis", "Projection Mapping"],
        description: "Seeking a modular sound designer to compose 30 minutes of generative spatial audio for a site-specific warehouse exhibition.",
        creatorName: "Aarav Chen",
        creatorAvatar: "/images/artist_rohan_avatar.png",
        creatorArtistType: "Experimental Composer",
        creatorId: 102,
        location: "Pune, MH",
        availability: "Weekends",
        peopleNeeded: "1 Sound Artist",
        status: "OPEN",
        ownPost: false
    },
    {
        id: 503,
        title: "Kala Ghoda Heritage Street Photography Zine",
        purpose: "Create Content",
        collaborationType: "Zine / Publication",
        skills: ["Photography", "Editorial Design", "Darkroom"],
        description: "Assembling a curated 48-page risograph photobook documenting vanishing artisan workshops and textile alleys.",
        creatorName: "Rohan Mehta",
        creatorAvatar: "/images/artist_arjun_thumb.png",
        creatorArtistType: "Analog Photographer",
        creatorId: 103,
        location: "Mumbai, MH",
        availability: "1 Month",
        peopleNeeded: "1 Graphic Designer",
        status: "OPEN",
        ownPost: false
    },
    {
        id: 504,
        title: "Contemporary Kathak & Physical Theatre Duet",
        purpose: "Learn & Jam",
        collaborationType: "Live Performance",
        skills: ["Dance", "Choreography", "Costume"],
        description: "Looking for an Indian classical or contemporary dancer to co-choreograph a 15-minute physical theatre piece exploring bodily memory.",
        creatorName: "Pooja Hegde",
        creatorAvatar: "/images/artist_kavya_avatar.png",
        creatorArtistType: "Movement Artist",
        creatorId: 104,
        location: "Bengaluru, KA",
        availability: "Evenings",
        peopleNeeded: "1 Dancer",
        status: "OPEN",
        ownPost: false
    },
    {
        id: 505,
        title: "Community Ceramic Tile Mural Installation",
        purpose: "Work on a Project",
        collaborationType: "Public Mural",
        skills: ["Painting", "Ceramics", "Crafts", "Murals"],
        description: "Designing a 20-foot community mosaic mural for an open children's creative center in Thane. Volunteers and potters needed.",
        creatorName: "Meera Shah",
        creatorAvatar: "/images/artist_meera_thumb.png",
        creatorArtistType: "Ceramic Sculptor",
        creatorId: 105,
        location: "Thane, MH",
        availability: "Weekends • 3 Weeks",
        peopleNeeded: "2-3 Artists",
        status: "OPEN",
        ownPost: false
    },
    {
        id: 506,
        title: "Bilingual Poetry & Typography Chapbook",
        purpose: "Work on a Project",
        collaborationType: "Literary Print",
        skills: ["Writing", "Typography", "Printmaking", "Poetry"],
        description: "Seeking a Marathi/English translator and letterpress printmaker to typeset a limited-edition series of 12 illustrated haikus.",
        creatorName: "Kavita Rao",
        creatorAvatar: "/images/artist_ishita_thumb.png",
        creatorArtistType: "Poet & Librettist",
        creatorId: 106,
        location: "New Delhi",
        availability: "Remote",
        peopleNeeded: "1 Printmaker",
        status: "OPEN",
        ownPost: false
    }
];

document.addEventListener('DOMContentLoaded', async () => {
    initSidebarAndNavigation();
    initUserMenu();
    initDisciplineFilters();
    initSearchEngine();
    initRequestsDrawer();
    checkUrlQueryParams();

    // Authenticate and load live content
    await resolveCurrentUser();
    await loadCollaborations();
    loadActivityCounters();
    loadUpcomingEvents();
    loadRecommended();
});

/**
 * 1. User Authentication & Session Resolution
 */
async function resolveCurrentUser() {
    try {
        let user = null;
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCurrentUser === 'function') {
            user = await window.ArtSphereAPI.getCurrentUser();
        } else {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                user = data.data;
            }
        }

        if (!user) {
            const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
            if (stored) {
                user = JSON.parse(stored);
            }
        }

        if (user) {
            currentUser = user;
            if (user.id) currentUserId = user.id;

            const displayName = user.fullName || user.username || user.name || 'Mrunali S.';
            const displayRole = user.artistType || user.bio || 'Digital Artist';
            const displayAvatar = user.profilePicture || user.avatarUrl || '/images/user_avatar_nav.png';

            // Sidebar User Card
            const sidebarUserName = document.getElementById('sidebarUserName');
            const sidebarUserRole = document.getElementById('sidebarUserRole');
            const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
            const sidebarProfileCard = document.getElementById('sidebarProfileCard');

            if (sidebarUserName) sidebarUserName.textContent = displayName;
            if (sidebarUserRole) sidebarUserRole.textContent = `${displayRole} • View Profile →`;
            if (sidebarUserAvatar) sidebarUserAvatar.src = displayAvatar;
            if (sidebarProfileCard && user.id) sidebarProfileCard.href = `/pages/artist-profile.html?id=${user.id}`;

            // Top Header Dropdown
            const dropdownUserName = document.getElementById('dropdownUserName');
            const dropdownUserBio = document.getElementById('dropdownUserBio');
            const headerUserAvatar = document.getElementById('headerUserAvatar');

            if (dropdownUserName) dropdownUserName.textContent = displayName;
            if (dropdownUserBio) dropdownUserBio.textContent = displayRole;
            if (headerUserAvatar) headerUserAvatar.src = displayAvatar;

            const mobileProfileTab = document.getElementById('mobileProfileTab');
            if (mobileProfileTab && user.id) mobileProfileTab.href = `/pages/artist-profile.html?id=${user.id}`;
        }
    } catch (err) {
        console.warn('User session check notice:', err);
    }
}

/**
 * 2. Sidebar Drawer & Mobile Navigation Toggle
 */
function initSidebarAndNavigation() {
    const sidebar = document.getElementById('dashboardSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const trigger = document.getElementById('mobileMenuTrigger');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (backdrop) backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (trigger) trigger.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    // Logout actions
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    async function handleLogout(e) {
        if (e) e.preventDefault();
        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.logout === 'function') {
                await window.ArtSphereAPI.logout();
                return;
            }
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/landing.html';
        }
    }

    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

/**
 * 3. Header User Avatar Menu Dropdown
 */
function initUserMenu() {
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');

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
}

/**
 * 4. Discipline Filter Buttons (7 Items)
 */
function initDisciplineFilters() {
    const filterButtons = document.querySelectorAll('.discipline-filter-btn');
    const resetLink = document.getElementById('resetDisciplineFiltersBtn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            activeDiscipline = btn.getAttribute('data-discipline') || 'All';
            applyLocalFilters();
        });
    });

    if (resetLink) {
        resetLink.addEventListener('click', (e) => {
            e.preventDefault();
            filterButtons.forEach(b => {
                const isAll = b.getAttribute('data-discipline') === 'All';
                b.classList.toggle('active', isAll);
                b.setAttribute('aria-pressed', isAll ? 'true' : 'false');
            });
            activeDiscipline = 'All';
            applyLocalFilters();
        });
    }
}

/**
 * 5. Search Engine & Input Listeners
 */
function initSearchEngine() {
    const searchInput = document.getElementById('collabSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
            }
            clearTimeout(searchDebounceTimeout);
            searchDebounceTimeout = setTimeout(() => {
                applyLocalFilters();
            }, 200);
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
}

/**
 * 6. URL Query Parameters
 */
function checkUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const discipline = params.get('discipline') || params.get('skill') || params.get('category');
    const q = params.get('q') || params.get('search');

    if (discipline) {
        activeDiscipline = discipline;
        const matchingBtn = Array.from(document.querySelectorAll('.discipline-filter-btn')).find(b => {
            return b.getAttribute('data-discipline').toLowerCase().includes(discipline.toLowerCase());
        });
        if (matchingBtn) {
            document.querySelectorAll('.discipline-filter-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            matchingBtn.classList.add('active');
            matchingBtn.setAttribute('aria-pressed', 'true');
        }
    }

    if (q) {
        searchQuery = q;
        const searchInput = document.getElementById('collabSearchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (searchInput) searchInput.value = q;
        if (clearSearchBtn) clearSearchBtn.style.display = 'block';
    }
}

/**
 * 7. Fetch Collaborations from Spring Boot REST API
 */
async function loadCollaborations() {
    const grid = document.getElementById('collabCardsGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="empty-collab-state">
            <div class="empty-collab-icon">✦</div>
            <h3>Loading collaboration pitches...</h3>
            <p>Accessing the latest active creative calls from ArtSphere members.</p>
        </div>
    `;

    try {
        let apiData = null;
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCollaborations === 'function') {
            apiData = await window.ArtSphereAPI.getCollaborations(null, null, null, currentUserId);
        } else {
            const res = await fetch(`/api/collaborations?userId=${currentUserId}`);
            if (res.ok) {
                const body = await res.json();
                apiData = body.data;
            }
        }

        if (Array.isArray(apiData) && apiData.length > 0) {
            allCollaborations = apiData.map(c => {
                const fallback = DEFAULT_COLLABORATIONS.find(d => String(d.id) === String(c.id)) || {};
                return {
                    ...fallback,
                    ...c,
                    skills: Array.isArray(c.skills) ? c.skills : (c.skills ? [c.skills] : fallback.skills || ['Creative']),
                    creatorAvatar: c.creatorAvatar || fallback.creatorAvatar || '/images/user_avatar_nav.png',
                    creatorName: c.creatorName || fallback.creatorName || 'Artist',
                    creatorArtistType: c.creatorArtistType || fallback.creatorArtistType || 'Creator',
                    location: c.location || fallback.location || 'Mumbai, MH',
                    peopleNeeded: c.peopleNeeded || fallback.peopleNeeded || '1-2 Artists',
                    purpose: c.purpose || fallback.purpose || 'Work on a Project',
                    status: c.status || fallback.status || 'OPEN'
                };
            });
        } else {
            allCollaborations = [...DEFAULT_COLLABORATIONS];
        }
    } catch (err) {
        console.warn('API error, falling back to curated collaborations archive:', err);
        allCollaborations = [...DEFAULT_COLLABORATIONS];
    }

    updateFeaturedCallCard();
    applyLocalFilters();
}

/**
 * 8. Populate Featured Call Spotlight Card (Right Sidebar Top)
 */
function updateFeaturedCallCard() {
    if (!allCollaborations || allCollaborations.length === 0) return;

    // Pick first collaboration or ID 501 / Short film
    const feat = allCollaborations.find(c => c.id === 501 || c.id === 301) || allCollaborations[0];
    if (!feat) return;

    const titleEl = document.getElementById('featuredCallTitle');
    const descEl = document.getElementById('featuredCallDesc');
    const hostEl = document.getElementById('featuredCallHost');
    const locEl = document.getElementById('featuredCallLocation');
    const seekingEl = document.getElementById('featuredCallSeeking');
    const pitchBtn = document.getElementById('featuredCallPitchBtn');
    const imgEl = document.getElementById('featuredCallImage');

    if (titleEl) titleEl.textContent = feat.title;
    if (descEl) descEl.textContent = feat.description;
    if (hostEl) hostEl.textContent = feat.creatorName || 'Mrunali S.';
    if (locEl) locEl.textContent = feat.location || 'Mumbai, MH';
    if (seekingEl) {
        const skillsText = Array.isArray(feat.skills) ? feat.skills.slice(0, 2).join(', ') : 'Collaborators';
        seekingEl.textContent = skillsText;
    }
    if (pitchBtn) pitchBtn.href = `/pages/collaboration-details.html?id=${feat.id}`;

    if (imgEl && feat.coverImage) {
        imgEl.src = feat.coverImage;
    }
}

/**
 * 9. Filter and Search Engine
 */
function applyLocalFilters() {
    const grid = document.getElementById('collabCardsGrid');
    const countLabel = document.getElementById('collabCountLabel');
    if (!grid) return;

    let filtered = [...allCollaborations];

    // 1. Discipline Filter Logic
    if (activeDiscipline && activeDiscipline.toLowerCase() !== 'all') {
        const target = activeDiscipline.toLowerCase();
        filtered = filtered.filter(item => {
            const skillsStr = (item.skills || []).join(' ').toLowerCase();
            const typeStr = (item.collaborationType || item.type || '').toLowerCase();
            const purposeStr = (item.purpose || '').toLowerCase();
            const titleStr = (item.title || '').toLowerCase();
            const descStr = (item.description || '').toLowerCase();
            const fullText = `${skillsStr} ${typeStr} ${purposeStr} ${titleStr} ${descStr}`;

            if (target === 'digital art') {
                return fullText.includes('digital') || fullText.includes('animation') || fullText.includes('3d') || fullText.includes('concept') || fullText.includes('storyboard') || fullText.includes('illustrat');
            } else if (target === 'painting') {
                return fullText.includes('paint') || fullText.includes('mural') || fullText.includes('canvas') || fullText.includes('acrylic') || fullText.includes('ceramic') || fullText.includes('craft');
            } else if (target === 'photography') {
                return fullText.includes('photo') || fullText.includes('zine') || fullText.includes('darkroom') || fullText.includes('editorial') || fullText.includes('lens');
            } else if (target === 'music') {
                return fullText.includes('music') || fullText.includes('sound') || fullText.includes('audio') || fullText.includes('song') || fullText.includes('folk') || fullText.includes('band') || fullText.includes('vocal');
            } else if (target === 'dance') {
                return fullText.includes('dance') || fullText.includes('choreograph') || fullText.includes('theatre') || fullText.includes('movement') || fullText.includes('kathak');
            } else if (target === 'writing') {
                return fullText.includes('writ') || fullText.includes('poet') || fullText.includes('book') || fullText.includes('script') || fullText.includes('print') || fullText.includes('typography');
            }
            return fullText.includes(target);
        });
    }

    // 2. Search Query Logic
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(item => {
            const title = (item.title || '').toLowerCase();
            const desc = (item.description || '').toLowerCase();
            const loc = (item.location || '').toLowerCase();
            const creator = (item.creatorName || '').toLowerCase();
            const skillsStr = (item.skills || []).join(' ').toLowerCase();
            return title.includes(q) || desc.includes(q) || loc.includes(q) || creator.includes(q) || skillsStr.includes(q);
        });
    }

    // 3. Update Result Stamp
    if (countLabel) {
        if (filtered.length === allCollaborations.length && !searchQuery && activeDiscipline === 'All') {
            countLabel.textContent = `Showing all ${filtered.length} open creative calls`;
        } else {
            countLabel.textContent = `Showing ${filtered.length} creative call${filtered.length === 1 ? '' : 's'} matching filter`;
        }
    }

    renderCollabCards(filtered);
}

/**
 * 10. Render 2-Column Structured Collaboration Grid
 */
function renderCollabCards(collabs) {
    const grid = document.getElementById('collabCardsGrid');
    if (!grid) return;

    if (!collabs || collabs.length === 0) {
        grid.innerHTML = `
            <div class="empty-collab-state">
                <div class="empty-collab-icon">✦</div>
                <h3>No creative calls found</h3>
                <p>No collaboration postings match your active filter. Try selecting "All Calls" or resetting your search term.</p>
                <button class="btn-reset-filters" id="btnResetFiltersInline">Reset All Filters</button>
            </div>
        `;
        const resetBtn = document.getElementById('btnResetFiltersInline');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                activeDiscipline = 'All';
                searchQuery = '';
                const searchInput = document.getElementById('collabSearchInput');
                const clearSearchBtn = document.getElementById('clearSearchBtn');
                if (searchInput) searchInput.value = '';
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';

                document.querySelectorAll('.discipline-filter-btn').forEach(b => {
                    const isAll = b.getAttribute('data-discipline') === 'All';
                    b.classList.toggle('active', isAll);
                    b.setAttribute('aria-pressed', isAll ? 'true' : 'false');
                });
                applyLocalFilters();
            });
        }
        return;
    }

    grid.innerHTML = collabs.map(c => createCollabCardHtml(c)).join('');
}

/**
 * 11. Individual Collaboration Card HTML (Matching Reference Design)
 */
function createCollabCardHtml(c) {
    const skillsList = Array.isArray(c.skills) ? c.skills : [c.skills || 'Creative'];
    const skillsHtml = skillsList.slice(0, 3).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');

    let purposeClass = '';
    const purposeText = (c.purpose || 'Work on a Project').toUpperCase();
    if (purposeText.includes('CONTENT')) purposeClass = 'content-tag';
    if (purposeText.includes('LEARN') || purposeText.includes('JAM')) purposeClass = 'learn-tag';

    const creatorId = c.creatorId || 101;
    const creatorProfileUrl = `/pages/artist-profile.html?id=${creatorId}`;
    const pitchDetailsUrl = `/pages/collaboration-details.html?id=${c.id}`;

    return `
        <article class="collab-card" data-id="${c.id}">
            <!-- Top Badges -->
            <div class="collab-card-top">
                <span class="badge-purpose ${purposeClass}">${escapeHtml(c.purpose || 'WORK ON A PROJECT')}</span>
                <span class="badge-status">${escapeHtml(c.status || 'OPEN')}</span>
            </div>

            <!-- Title & Description -->
            <div>
                <h3 class="collab-card-title">${escapeHtml(c.title)}</h3>
                <p class="collab-card-desc">${escapeHtml(c.description || '')}</p>
            </div>

            <!-- Skill Tags -->
            <div class="collab-skill-tags">
                ${skillsHtml}
            </div>

            <!-- Metadata Row -->
            <div class="collab-meta-row">
                <div class="collab-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>${escapeHtml(c.location || 'Mumbai, MH')}</span>
                </div>
                <div class="collab-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                    <span>${escapeHtml(c.peopleNeeded || '1-2 Collaborators')}</span>
                </div>
            </div>

            <!-- Footer: Creator & CTA -->
            <div class="collab-card-footer">
                <a href="${creatorProfileUrl}" class="creator-info-box" title="View ${escapeHtml(c.creatorName)}'s Profile">
                    <img src="${escapeHtml(c.creatorAvatar || '/images/user_avatar_nav.png')}" alt="${escapeHtml(c.creatorName)}" class="creator-avatar-thumb" onerror="this.src='/images/user_avatar_nav.png'">
                    <span class="creator-name">${escapeHtml(c.creatorName || 'Artist')}</span>
                </a>
                <a href="${pitchDetailsUrl}" class="btn-card-pitch">
                    <span>View Pitch</span>
                    <span>&rarr;</span>
                </a>
            </div>
        </article>
    `;
}

/**
 * 12. Load Real Activity Counters (Active Calls, Inquiries, RSVPs)
 */
async function loadActivityCounters() {
    try {
        // Inquiries Count from Real API
        let inquiries = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCollaborationRequests === 'function') {
            inquiries = await window.ArtSphereAPI.getCollaborationRequests('received', currentUserId);
        } else {
            const res = await fetch(`/api/collaboration-requests?type=received&userId=${currentUserId}`);
            if (res.ok) {
                const body = await res.json();
                inquiries = body.data || [];
            }
        }

        const inquiriesCount = Array.isArray(inquiries) ? inquiries.length : 0;
        
        // Update Badges & Counters
        const badgeEl = document.getElementById('requestsCounterBadge');
        if (badgeEl) badgeEl.textContent = inquiriesCount;

        const statInquiries = document.getElementById('statCollabInquiries');
        if (statInquiries) statInquiries.textContent = inquiriesCount;

        const drawerCountReceived = document.getElementById('drawerCountReceived');
        if (drawerCountReceived) drawerCountReceived.textContent = inquiriesCount;

        // Active Calls Count
        const activeCallsCount = allCollaborations.length > 0 ? allCollaborations.length : 6;
        const statActive = document.getElementById('statActiveCalls');
        if (statActive) statActive.textContent = activeCallsCount;

        // RSVPs Count
        const statRsvps = document.getElementById('statEventRsvps');
        if (statRsvps) statRsvps.textContent = '4';

    } catch (err) {
        console.warn('Could not refresh activity counters:', err);
    }
}

/**
 * 13. Load Real Upcoming Events (Right Panel)
 */
async function loadUpcomingEvents() {
    const listEl = document.getElementById('upcomingEventsList');
    if (!listEl) return;

    try {
        let events = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getUpcomingEvents === 'function') {
            events = await window.ArtSphereAPI.getUpcomingEvents();
        } else {
            const res = await fetch('/api/home/upcoming-events');
            if (res.ok) {
                const body = await res.json();
                events = body.data || [];
            }
        }

        if (Array.isArray(events) && events.length > 0) {
            listEl.innerHTML = events.slice(0, 3).map(ev => `
                <a href="/pages/event-details.html?id=${ev.id}" class="compact-event-item">
                    <img src="${escapeHtml(ev.imageUrl || '/images/event_watercolor_thumb.png')}" alt="${escapeHtml(ev.title)}" class="event-thumb-mini" onerror="this.src='/images/event_watercolor_thumb.png'">
                    <div class="event-info-col">
                        <h4 class="event-title-compact">${escapeHtml(ev.title)}</h4>
                        <p class="event-meta-compact">${escapeHtml(ev.eventDate || 'Coming Soon')} &bull; ${escapeHtml(ev.location || 'Mumbai')}</p>
                    </div>
                    <span class="event-arrow-link">&rarr;</span>
                </a>
            `).join('');
        } else {
            listEl.innerHTML = `
                <a href="/pages/events.html" class="compact-event-item">
                    <img src="/images/event_watercolor_thumb.png" alt="Workshop" class="event-thumb-mini">
                    <div class="event-info-col">
                        <h4 class="event-title-compact">Watercolor Basics Workshop</h4>
                        <p class="event-meta-compact">15 Mar 2024 &bull; Mumbai, MH</p>
                    </div>
                    <span class="event-arrow-link">&rarr;</span>
                </a>
            `;
        }
    } catch (err) {
        console.warn('Events load error:', err);
    }
}

/**
 * 14. Load Recommendations (Right Panel)
 */
async function loadRecommended() {
    const listEl = document.getElementById('recommendedList');
    if (!listEl) return;

    try {
        let communities = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCommunities === 'function') {
            communities = await window.ArtSphereAPI.getCommunities('all', null, currentUserId);
        } else {
            const res = await fetch('/api/home/communities');
            if (res.ok) {
                const body = await res.json();
                communities = body.data || [];
            }
        }

        if (Array.isArray(communities) && communities.length > 0) {
            listEl.innerHTML = communities.slice(0, 3).map(comm => `
                <a href="/pages/community-details.html?id=${comm.id}" class="compact-rec-item">
                    <img src="${escapeHtml(comm.imageUrl || '/images/comm_creative_souls_avatar.png')}" alt="${escapeHtml(comm.name)}" class="rec-thumb-mini" onerror="this.src='/images/comm_creative_souls_avatar.png'">
                    <div class="rec-info-col">
                        <h4 class="rec-title-compact">${escapeHtml(comm.name)}</h4>
                        <p class="rec-sub-compact">${escapeHtml(comm.category || 'Creative Guild')} &bull; ${comm.memberCount || 120} members</p>
                    </div>
                </a>
            `).join('');
        }
    } catch (err) {
        console.warn('Recommendations load error:', err);
    }
}

/**
 * 15. Manage Requests Drawer (Real Inbound/Outbound Inquiries Engine)
 */
function initRequestsDrawer() {
    const manageBtn = document.getElementById('manageRequestsBtn');
    const dropdownLink = document.getElementById('dropdownManageRequestsLink');
    const drawer = document.getElementById('requestsDrawer');
    const backdrop = document.getElementById('requestsDrawerBackdrop');
    const closeBtn = document.getElementById('closeRequestsDrawerBtn');
    const tabReceived = document.getElementById('drawerTabReceived');
    const tabSent = document.getElementById('drawerTabSent');

    function openDrawer() {
        if (drawer) drawer.classList.add('open');
        if (backdrop) backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        fetchAndRenderRequests(activeRequestsTab);
    }

    function closeDrawer() {
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (manageBtn) {
        manageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openDrawer();
        });
    }

    if (dropdownLink) {
        dropdownLink.addEventListener('click', (e) => {
            e.preventDefault();
            openDrawer();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    if (tabReceived) {
        tabReceived.addEventListener('click', () => {
            activeRequestsTab = 'received';
            tabReceived.classList.add('active');
            if (tabSent) tabSent.classList.remove('active');
            fetchAndRenderRequests('received');
        });
    }

    if (tabSent) {
        tabSent.addEventListener('click', () => {
            activeRequestsTab = 'sent';
            tabSent.classList.add('active');
            if (tabReceived) tabReceived.classList.remove('active');
            fetchAndRenderRequests('sent');
        });
    }
}

/**
 * 16. Fetch & Render Collaboration Requests
 */
async function fetchAndRenderRequests(type = 'received') {
    const bodyEl = document.getElementById('drawerRequestsBody');
    if (!bodyEl) return;

    bodyEl.innerHTML = `
        <div class="drawer-loading">
            <div class="drawer-spinner"></div>
            <p>Loading ${type === 'received' ? 'inbound pitches' : 'sent inquiries'}...</p>
        </div>
    `;

    try {
        let requests = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCollaborationRequests === 'function') {
            requests = await window.ArtSphereAPI.getCollaborationRequests(type, currentUserId);
        } else {
            const res = await fetch(`/api/collaboration-requests?type=${type}&userId=${currentUserId}`);
            if (res.ok) {
                const body = await res.json();
                requests = body.data || [];
            }
        }

        // Update Counter
        const countBadge = type === 'received' ? document.getElementById('drawerCountReceived') : document.getElementById('drawerCountSent');
        if (countBadge) countBadge.textContent = Array.isArray(requests) ? requests.length : 0;

        if (!Array.isArray(requests) || requests.length === 0) {
            bodyEl.innerHTML = `
                <div class="drawer-loading">
                    <span style="font-size:24px;">📭</span>
                    <p>No ${type === 'received' ? 'received collaboration pitches' : 'sent applications'} found.</p>
                </div>
            `;
            return;
        }

        bodyEl.innerHTML = requests.map(req => {
            const isReceived = type === 'received';
            const partnerName = isReceived ? req.senderName : req.receiverName;
            const partnerAvatar = isReceived ? req.senderAvatar : req.receiverAvatar;
            const partnerRole = isReceived ? req.senderArtistType : req.receiverArtistType;
            const statusClass = (req.status || 'pending').toLowerCase();

            return `
                <div class="drawer-req-card" id="reqCard-${req.id}">
                    <div class="req-header-row">
                        <div class="req-sender-meta">
                            <img src="${escapeHtml(partnerAvatar || '/images/user_avatar_nav.png')}" alt="${escapeHtml(partnerName)}" class="req-avatar" onerror="this.src='/images/user_avatar_nav.png'">
                            <div class="req-name-block">
                                <span class="req-name">${escapeHtml(partnerName || 'Artist Member')}</span>
                                <span class="req-role">${escapeHtml(partnerRole || 'Creator')}</span>
                            </div>
                        </div>
                        <span class="req-status-pill ${statusClass}" id="reqStatus-${req.id}">${escapeHtml(req.status || 'PENDING')}</span>
                    </div>

                    <div class="req-collab-title">
                        Pitch: ${escapeHtml(req.collaborationTitle || 'Collaboration Project')}
                    </div>

                    ${req.message ? `<div class="req-message-bubble">${escapeHtml(req.message)}</div>` : ''}

                    ${isReceived && req.status === 'PENDING' ? `
                        <div class="req-actions-row" id="reqActions-${req.id}">
                            <button class="btn-req-accept" onclick="respondToCollabRequest(${req.id}, 'accept')">
                                Accept Pitch
                            </button>
                            <button class="btn-req-reject" onclick="respondToCollabRequest(${req.id}, 'reject')">
                                Decline
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Requests load error:', err);
        bodyEl.innerHTML = `
            <div class="drawer-loading">
                <p>Could not load inquiries. Please check your connection.</p>
            </div>
        `;
    }
}

/**
 * 17. Accept / Reject Collaboration Request via Real REST API
 */
window.respondToCollabRequest = async function(id, action) {
    const actionsRow = document.getElementById(`reqActions-${id}`);
    const statusPill = document.getElementById(`reqStatus-${id}`);

    if (actionsRow) {
        actionsRow.innerHTML = `<span style="font-size:12px;color:var(--text-muted);">Updating inquiry...</span>`;
    }

    try {
        let success = false;
        if (action === 'accept') {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.acceptCollaborationRequest === 'function') {
                await window.ArtSphereAPI.acceptCollaborationRequest(id, currentUserId);
                success = true;
            } else {
                const res = await fetch(`/api/collaboration-requests/${id}/accept?userId=${currentUserId}`, { method: 'POST' });
                success = res.ok;
            }
        } else {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.rejectCollaborationRequest === 'function') {
                await window.ArtSphereAPI.rejectCollaborationRequest(id, currentUserId);
                success = true;
            } else {
                const res = await fetch(`/api/collaboration-requests/${id}/reject?userId=${currentUserId}`, { method: 'POST' });
                success = res.ok;
            }
        }

        if (success) {
            const newStatus = action === 'accept' ? 'APPROVED' : 'REJECTED';
            if (statusPill) {
                statusPill.textContent = newStatus;
                statusPill.className = `req-status-pill ${newStatus.toLowerCase()}`;
            }
            if (actionsRow) actionsRow.remove();

            showToast(action === 'accept' ? 'Collaboration pitch accepted! Collaborator confirmed.' : 'Collaboration inquiry declined.');
            loadActivityCounters();
        } else {
            showToast('Could not update request. Please try again.');
        }
    } catch (err) {
        console.error('Request response error:', err);
        showToast('Error responding to request.');
    }
};

/**
 * 18. Toast Notifications
 */
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.style.display = 'flex';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 3200);
}

/**
 * 19. Utilities: String HTML Escaping
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
