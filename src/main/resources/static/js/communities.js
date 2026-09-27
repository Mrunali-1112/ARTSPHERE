/**
 * ArtSphere – Creative Communities & Guilds Script
 * Editorial Neo-Brutalist Architecture & Dynamic Search Filter
 */

let allCommunities = [];
let activeCategory = 'All';
let searchQuery = '';
let searchDebounceTimeout = null;
let currentUserId = 101;

// Curated default guilds in case backend returns empty
const DEFAULT_GUILDS = [
    {
        id: 401,
        name: "Creative Souls Network",
        category: "All",
        artForms: "Multidisciplinary",
        description: "A welcoming collective for artists across all mediums to share feedback, form collab crews, and host jam sessions.",
        memberCount: 1250,
        postCount: 84,
        location: "Global",
        imageUrl: "/images/comm_creative_souls_cover.png",
        avatarUrl: "/images/comm_creative_souls_avatar.png",
        joined: true
    },
    {
        id: 402,
        name: "Canvas & Ink Guild",
        category: "Painting",
        artForms: "Oil, Acrylic & Gouache",
        description: "Traditional and contemporary painters gathering weekly for live critique, texture studies, and gallery group shows.",
        memberCount: 820,
        postCount: 52,
        location: "Mumbai",
        imageUrl: "/images/comm_painting_souls.png",
        avatarUrl: "/images/category_visual_arts.png",
        joined: false
    },
    {
        id: 403,
        name: "Analog Frames Collective",
        category: "Photography",
        artForms: "35mm Film & Documentary",
        description: "Dedicated to the art of darkroom chemistry, 35mm street photography, and slow visual storytelling.",
        memberCount: 640,
        postCount: 41,
        location: "Bengaluru",
        imageUrl: "/images/comm_photography_circle.png",
        avatarUrl: "/images/category_photography.png",
        joined: false
    },
    {
        id: 404,
        name: "Modular Sound Explorers",
        category: "Music",
        artForms: "Ambient & Electronic",
        description: "Patch cable architects, ambient producers, and sound designers hosting monthly tape swaps and listening sessions.",
        memberCount: 490,
        postCount: 38,
        location: "Pune",
        imageUrl: "/images/comm_indie_musicians.png",
        avatarUrl: "/images/category_music.png",
        joined: true
    },
    {
        id: 405,
        name: "Kinetic Motion Lab",
        category: "Dance",
        artForms: "Contemporary & Kathak Fusion",
        description: "Exploring bodily architecture, site-specific choreography, and improvisational physical theatre.",
        memberCount: 380,
        postCount: 29,
        location: "Mumbai",
        imageUrl: "/images/comm_dance_creators.png",
        avatarUrl: "/images/category_dance.png",
        joined: false
    },
    {
        id: 406,
        name: "Midnight Verses Circle",
        category: "Writing",
        artForms: "Poetry & Flash Fiction",
        description: "A sanctuary for poets, librettists, and lyricists. Prompt marathons, chapbook exchanges, and open mics.",
        memberCount: 510,
        postCount: 67,
        location: "New Delhi",
        imageUrl: "/images/comm_poetry_writers.png",
        avatarUrl: "/images/category_creative_writing.png",
        joined: false
    },
    {
        id: 407,
        name: "Terra & Fire Ceramic Guild",
        category: "Crafts",
        artForms: "Stoneware & Raku Pottery",
        description: "Studio potters and ceramic sculptors sharing kiln glaze recipes, wheel techniques, and pop-up market stalls.",
        memberCount: 320,
        postCount: 24,
        location: "Thane",
        imageUrl: "/images/comm_ceramics_craft.png",
        avatarUrl: "/images/category_crafts.png",
        joined: false
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initNavigationDrawer();
    initUserMenu();
    initFiltersAndSearch();
    checkUrlQueryParams();
    loadCommunities();
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

    // Retrieve user session
    try {
        const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (stored) {
            const user = JSON.parse(stored);
            if (user.id) currentUserId = user.id;
            if (user.name && dropdownUserName) dropdownUserName.textContent = user.name;
            if (user.bio && dropdownUserBio) dropdownUserBio.textContent = user.bio;
            if (user.avatarUrl && headerUserAvatar) headerUserAvatar.src = user.avatarUrl;
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
    const searchInput = document.getElementById('communitySearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const categoriesScrollRow = document.getElementById('categoriesScrollRow');

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
        const searchInput = document.getElementById('communitySearchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (searchInput) searchInput.value = search;
        if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
    }
}

/**
 * 5. Fetch Communities from API
 */
async function loadCommunities() {
    const grid = document.getElementById('popularCommunitiesGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="loading-state-wrapper">
            <div class="loading-spinner"></div>
            <p>Accessing guild directory archives...</p>
        </div>
    `;

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCommunities === 'function') {
            const res = await window.ArtSphereAPI.getCommunities(null, null, currentUserId);
            if (res && res.length > 0) {
                // Merge backend data with fallback attributes for rich presentation
                allCommunities = res.map(comm => {
                    const fallback = DEFAULT_GUILDS.find(d => String(d.id) === String(comm.id)) || {};
                    return {
                        ...fallback,
                        ...comm,
                        imageUrl: comm.imageUrl || comm.coverImage || fallback.imageUrl || '/images/comm_creative_souls_cover.png',
                        avatarUrl: comm.avatarUrl || fallback.avatarUrl || '/images/comm_creative_souls_avatar.png',
                        location: comm.location || fallback.location || 'Global',
                        memberCount: comm.memberCount || fallback.memberCount || 100,
                        postCount: comm.postCount !== undefined ? comm.postCount : (fallback.postCount || 12)
                    };
                });
            } else {
                allCommunities = [...DEFAULT_GUILDS];
            }
        } else {
            allCommunities = [...DEFAULT_GUILDS];
        }
    } catch (err) {
        console.warn('API error, using curated editorial guilds:', err);
        allCommunities = [...DEFAULT_GUILDS];
    }

    applyLocalFilters();
}

/**
 * 6. Local Filter and Search Engine
 */
function applyLocalFilters() {
    const grid = document.getElementById('popularCommunitiesGrid');
    const resultsCountLabel = document.getElementById('resultsCountLabel');
    if (!grid) return;

    let filtered = [...allCommunities];

    // Filter by Category
    if (activeCategory && activeCategory.toLowerCase() !== 'all') {
        const catLower = activeCategory.toLowerCase();
        filtered = filtered.filter(item => {
            const c = (item.category || '').toLowerCase();
            const af = (item.artForms || '').toLowerCase();
            return c.includes(catLower) || af.includes(catLower);
        });
    }

    // Filter by Search Query
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(item => {
            const name = (item.name || '').toLowerCase();
            const desc = (item.description || '').toLowerCase();
            const medium = (item.artForms || '').toLowerCase();
            const loc = (item.location || '').toLowerCase();
            return name.includes(q) || desc.includes(q) || medium.includes(q) || loc.includes(q);
        });
    }

    // Update Result Stamp
    if (resultsCountLabel) {
        if (filtered.length === allCommunities.length && !searchQuery && activeCategory === 'All') {
            resultsCountLabel.textContent = `Showing all ${filtered.length} creative collectives`;
        } else {
            resultsCountLabel.textContent = `Showing ${filtered.length} guild${filtered.length === 1 ? '' : 's'} matching filter`;
        }
    }

    renderGuildGrid(filtered);
}

/**
 * 7. Render Guild Bento Grid
 */
function renderGuildGrid(guilds) {
    const grid = document.getElementById('popularCommunitiesGrid');
    if (!grid) return;

    if (!guilds || guilds.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-icon">✦</div>
                <h3>No creative guilds found</h3>
                <p>No collectives match your active filters. Try searching for different art mediums or reset filters.</p>
                <button class="btn-pill-reset" id="resetGuildFiltersBtn">Reset All Filters</button>
            </div>
        `;
        const resetBtn = document.getElementById('resetGuildFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                activeCategory = 'All';
                searchQuery = '';
                const searchInput = document.getElementById('communitySearchInput');
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

    grid.innerHTML = guilds.map(guild => createGuildCardHtml(guild)).join('');

    // Attach Join Toggle Listeners
    grid.querySelectorAll('.btn-card-join-toggle').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const guildId = btn.getAttribute('data-id');
            await toggleGuildJoin(guildId, btn);
        });
    });
}

/**
 * 8. Guild Card HTML Generator
 */
function createGuildCardHtml(guild) {
    const isJoined = Boolean(guild.joined);
    const joinedClass = isJoined ? 'joined' : '';
    const joinedText = isJoined ? 'Joined ✦' : 'Join Guild';
    const memberFormatted = formatCount(guild.memberCount || 0);

    return `
        <a href="/pages/community-details.html?id=${guild.id}" class="guild-bento-card" data-id="${guild.id}">
            <div class="guild-card-media">
                <img src="${escapeHtml(guild.imageUrl)}" alt="${escapeHtml(guild.name)}" class="guild-cover-img" onerror="this.src='/images/comm_creative_souls_cover.png'">
                <div class="guild-media-badge-left">
                    <span class="pill-tag accent-yellow">${escapeHtml(guild.category || 'Collective')}</span>
                </div>
                <div class="guild-media-badge-right">
                    <span>${escapeHtml(guild.location || 'Global')}</span>
                </div>
            </div>

            <div class="guild-card-content">
                <div class="guild-card-header-row">
                    <img src="${escapeHtml(guild.avatarUrl)}" alt="${escapeHtml(guild.name)}" class="guild-mini-avatar" onerror="this.src='/images/comm_creative_souls_avatar.png'">
                    <div>
                        <h3 class="guild-name">${escapeHtml(guild.name)}</h3>
                    </div>
                </div>

                <p class="guild-desc">${escapeHtml(guild.description || '')}</p>

                <div class="guild-stats-ledger">
                    <div class="guild-stat-cell">
                        <span class="stat-label">MEMBERS</span>
                        <span class="stat-val" id="memberCount-${guild.id}">${memberFormatted}</span>
                    </div>
                    <div class="guild-stat-cell">
                        <span class="stat-label">FOCUS</span>
                        <span class="stat-val">${escapeHtml(guild.artForms || 'Art')}</span>
                    </div>
                </div>

                <div class="guild-card-footer">
                    <span class="btn-card-explore">
                        <span>Enter Guild</span>
                        <span>&rarr;</span>
                    </span>
                    <button class="btn-card-join-toggle ${joinedClass}" data-id="${guild.id}">
                        ${joinedText}
                    </button>
                </div>
            </div>
        </a>
    `;
}

/**
 * 9. Join / Leave Toggle Action
 */
async function toggleGuildJoin(guildId, btnElement) {
    const isCurrentlyJoined = btnElement.classList.contains('joined');
    btnElement.disabled = true;

    try {
        if (window.ArtSphereAPI) {
            if (isCurrentlyJoined) {
                if (typeof window.ArtSphereAPI.leaveCommunity === 'function') {
                    await window.ArtSphereAPI.leaveCommunity(guildId, currentUserId);
                }
            } else {
                if (typeof window.ArtSphereAPI.joinCommunity === 'function') {
                    await window.ArtSphereAPI.joinCommunity(guildId, currentUserId);
                }
            }
        }

        // Toggle state locally
        const targetGuild = allCommunities.find(g => String(g.id) === String(guildId));
        if (targetGuild) {
            targetGuild.joined = !isCurrentlyJoined;
            targetGuild.memberCount = (targetGuild.memberCount || 100) + (targetGuild.joined ? 1 : -1);
            
            const countDisplay = document.getElementById(`memberCount-${guildId}`);
            if (countDisplay) {
                countDisplay.textContent = formatCount(targetGuild.memberCount);
            }
        }

        if (isCurrentlyJoined) {
            btnElement.classList.remove('joined');
            btnElement.textContent = 'Join Guild';
            showToast('Left community guild');
        } else {
            btnElement.classList.add('joined');
            btnElement.textContent = 'Joined ✦';
            showToast('Welcome to the guild!');
        }
    } catch (err) {
        console.error('Error toggling join status:', err);
        showToast('Action failed. Please try again.');
    } finally {
        btnElement.disabled = false;
    }
}

function formatCount(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
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
