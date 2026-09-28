/**
 * ArtSphere — Find Collaborators Script
 * Editorial Neo-Brutalist Architecture & Co-Creation Filter Engine
 */

let allCollaborations = [];
let activeSkill = 'All';
let searchQuery = '';
let searchDebounceTimeout = null;
let currentUserId = 101;
let currentUser = null;

// Curated default collaborations archive
const DEFAULT_COLLABORATIONS = [
    {
        id: 301,
        title: "Short Film Concept & Animation Pitch",
        purpose: "Work on a Project",
        type: "Short Film",
        skills: ["Digital Art", "Animation", "Storyboarding"],
        description: "Looking for a digital animator and background painter for a 7-minute poetic narrative short film exploring urban mythology.",
        creatorName: "Mrunali S.",
        creatorAvatar: "/images/user_avatar_nav.png",
        creatorRole: "Digital Artist & Animator",
        creatorId: 101,
        location: "Mumbai, MH",
        availability: "Flexible • 2 Months",
        peopleNeeded: "1-2 Animators",
        status: "OPEN"
    },
    {
        id: 302,
        title: "Ambient Soundscapes for Architectural Projection",
        purpose: "Create Content",
        type: "Installation",
        skills: ["Music", "Sound Design", "Audio Synthesis"],
        description: "Seeking a modular sound designer to compose 30 minutes of generative spatial audio for a site-specific warehouse exhibition.",
        creatorName: "Aarav Chen",
        creatorAvatar: "/images/category_music.png",
        creatorRole: "Experimental Composer",
        creatorId: 102,
        location: "Pune, MH",
        availability: "Weekends",
        peopleNeeded: "1 Sound Artist",
        status: "OPEN"
    },
    {
        id: 303,
        title: "Kala Ghoda Heritage Street Photography Zine",
        purpose: "Create Content",
        type: "Zine / Publication",
        skills: ["Photography", "Editorial Design", "Darkroom"],
        description: "Assembling a curated 48-page risograph photobook documenting vanishing artisan workshops and textile alleys.",
        creatorName: "Rohan Mehta",
        creatorAvatar: "/images/highlight_charcoal_portrait.png",
        creatorRole: "Analog Photographer",
        creatorId: 103,
        location: "Mumbai, MH",
        availability: "1 Month",
        peopleNeeded: "1 Graphic Designer",
        status: "OPEN"
    },
    {
        id: 304,
        title: "Contemporary Kathak & Physical Theatre Duet",
        purpose: "Learn & Jam",
        type: "Live Performance",
        skills: ["Dance", "Choreography", "Costume"],
        description: "Looking for an Indian classical or contemporary dancer to co-choreograph a 15-minute physical theatre piece exploring bodily memory.",
        creatorName: "Pooja Hegde",
        creatorAvatar: "/images/category_dance.png",
        creatorRole: "Movement Artist",
        creatorId: 104,
        location: "Bengaluru, KA",
        availability: "Evenings",
        peopleNeeded: "1 Dancer",
        status: "OPEN"
    },
    {
        id: 305,
        title: "Community Ceramic Tile Mural Installation",
        purpose: "Organize an Event",
        type: "Public Mural",
        skills: ["Painting", "Ceramics", "Crafts"],
        description: "Designing a 20-foot community mosaic mural for an open children's creative center in Thane. Volunteers and potters needed.",
        creatorName: "Meera Shah",
        creatorAvatar: "/images/opp_lens_and_life.png",
        creatorRole: "Ceramic Sculptor",
        creatorId: 105,
        location: "Thane, MH",
        availability: "Weekends • 3 Weeks",
        peopleNeeded: "2-3 Artists",
        status: "OPEN"
    },
    {
        id: 306,
        title: "Bilingual Poetry & Typography Chapbook",
        purpose: "Work on a Project",
        type: "Literary Print",
        skills: ["Writing", "Typography", "Printmaking"],
        description: "Seeking a Marathi/English translator and letterpress printmaker to typeset a limited-edition series of 12 illustrated haikus.",
        creatorName: "Kavita Rao",
        creatorAvatar: "/images/category_creative_writing.png",
        creatorRole: "Poet & Librettist",
        creatorId: 106,
        location: "New Delhi",
        availability: "Remote",
        peopleNeeded: "1 Printmaker",
        status: "OPEN"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initNavigationDrawer();
    initUserMenu();
    initFiltersAndSearch();
    checkUrlQueryParams();
    loadCollaborations();
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
 * 3. Search and Skills Filter Setup
 */
function initFiltersAndSearch() {
    const searchInput = document.getElementById('collabSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const skillsFilterList = document.getElementById('skillsFilterList');

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

    if (skillsFilterList) {
        skillsFilterList.addEventListener('click', (e) => {
            const pill = e.target.closest('.filter-pill-btn');
            if (!pill) return;

            skillsFilterList.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');

            activeSkill = pill.getAttribute('data-skill') || 'All';
            applyLocalFilters();
        });
    }
}

/**
 * 4. Parse URL Query Parameters
 */
function checkUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const skill = params.get('skill') || params.get('category');
    const search = params.get('q') || params.get('search');

    if (skill) {
        activeSkill = skill;
        const pill = document.querySelector(`.filter-pill-btn[data-skill="${skill}"]`);
        if (pill) {
            document.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
        }
    }

    if (search) {
        searchQuery = search;
        const searchInput = document.getElementById('collabSearchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (searchInput) searchInput.value = search;
        if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
    }
}

/**
 * 5. Fetch Collaborations from API
 */
async function loadCollaborations() {
    const grid = document.getElementById('collabGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="loading-state-wrapper">
            <div class="loading-spinner"></div>
            <p>Accessing collaboration pitch records...</p>
        </div>
    `;

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCollaborations === 'function') {
            const res = await window.ArtSphereAPI.getCollaborations(null, null, currentUserId);
            if (res && res.length > 0) {
                allCollaborations = res.map(c => {
                    const fallback = DEFAULT_COLLABORATIONS.find(d => String(d.id) === String(c.id)) || {};
                    return {
                        ...fallback,
                        ...c,
                        creatorAvatar: c.creatorAvatar || fallback.creatorAvatar || '/images/user_avatar_nav.png',
                        creatorName: c.creatorName || fallback.creatorName || 'Artist',
                        creatorId: c.creatorId || fallback.creatorId || 101,
                        location: c.location || fallback.location || 'Remote',
                        status: c.status || fallback.status || 'OPEN',
                        skills: Array.isArray(c.skills) ? c.skills : (fallback.skills || ['Art'])
                    };
                });
            } else {
                allCollaborations = [...DEFAULT_COLLABORATIONS];
            }
        } else {
            allCollaborations = [...DEFAULT_COLLABORATIONS];
        }
    } catch (err) {
        console.warn('API error, using curated editorial collaborations:', err);
        allCollaborations = [...DEFAULT_COLLABORATIONS];
    }

    applyLocalFilters();
}

/**
 * 6. Local Filter and Search Engine
 */
function applyLocalFilters() {
    const grid = document.getElementById('collabGrid');
    const countBadge = document.getElementById('collabCountBadge');
    if (!grid) return;

    let filtered = [...allCollaborations];

    // Filter by Skill / Discipline
    if (activeSkill && activeSkill.toLowerCase() !== 'all') {
        const target = activeSkill.toLowerCase();
        filtered = filtered.filter(item => {
            const skillsStr = (item.skills || []).join(' ').toLowerCase();
            const typeStr = (item.type || '').toLowerCase();
            const purposeStr = (item.purpose || '').toLowerCase();
            return skillsStr.includes(target) || typeStr.includes(target) || purposeStr.includes(target);
        });
    }

    // Filter by Search Query
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

    // Update Result Stamp
    if (countBadge) {
        if (filtered.length === allCollaborations.length && !searchQuery && activeSkill === 'All') {
            countBadge.textContent = `Showing all ${filtered.length} open creative calls`;
        } else {
            countBadge.textContent = `Showing ${filtered.length} call${filtered.length === 1 ? '' : 's'} matching filter`;
        }
    }

    renderCollabGrid(filtered);
}

/**
 * 7. Render Collaborations Bento Grid
 */
function renderCollabGrid(collabs) {
    const grid = document.getElementById('collabGrid');
    if (!grid) return;

    if (!collabs || collabs.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-icon">✦</div>
                <h3>No creative calls found</h3>
                <p>No project calls match your active filters. Try searching for different skills or reset filters.</p>
                <button class="btn-pill-reset" id="resetCollabFiltersBtn">Reset All Filters</button>
            </div>
        `;
        const resetBtn = document.getElementById('resetCollabFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                activeSkill = 'All';
                searchQuery = '';
                const searchInput = document.getElementById('collabSearchInput');
                const clearSearchBtn = document.getElementById('clearSearchBtn');
                if (searchInput) searchInput.value = '';
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';
                document.querySelectorAll('.filter-pill-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-skill') === 'All');
                });
                applyLocalFilters();
            });
        }
        return;
    }

    grid.innerHTML = collabs.map(c => createCollabCardHtml(c)).join('');
}

/**
 * 8. Collaboration Bento Card HTML Generator
 */
function createCollabCardHtml(c) {
    const skillsList = Array.isArray(c.skills) ? c.skills : [c.skills || 'Creative'];
    const skillsHtml = skillsList.slice(0, 3).map(s => `<span class="collab-skill-pill">${escapeHtml(s)}</span>`).join('');

    return `
        <a href="/pages/collaboration-details.html?id=${c.id}" class="collab-bento-card" data-id="${c.id}">
            <div class="collab-card-top">
                <span class="pill-tag accent-yellow">${escapeHtml(c.purpose || 'Project')}</span>
                <span class="status-open-pill">${escapeHtml(c.status || 'OPEN')}</span>
            </div>

            <h3 class="collab-card-title">${escapeHtml(c.title)}</h3>
            <p class="collab-card-desc">${escapeHtml(c.description || '')}</p>

            <div class="collab-skills-tags">
                ${skillsHtml}
            </div>

            <div class="collab-facts-ledger">
                <div class="collab-fact-cell">
                    <span class="fact-label">LOCATION</span>
                    <span class="fact-val">${escapeHtml(c.location || 'Remote')}</span>
                </div>
                <div class="collab-fact-cell">
                    <span class="fact-label">NEEDED</span>
                    <span class="fact-val">${escapeHtml(c.peopleNeeded || '1-2 Artists')}</span>
                </div>
            </div>

            <div class="collab-card-footer">
                <div class="collab-creator-link">
                    <img src="${escapeHtml(c.creatorAvatar || '/images/user_avatar_nav.png')}" alt="${escapeHtml(c.creatorName)}" class="creator-thumb-mini" onerror="this.src='/images/user_avatar_nav.png'">
                    <span class="creator-name-bold">${escapeHtml(c.creatorName || 'Artist')}</span>
                </div>
                <span class="btn-card-view-pitch">
                    <span>View Pitch</span>
                    <span>&rarr;</span>
                </span>
            </div>
        </a>
    `;
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
