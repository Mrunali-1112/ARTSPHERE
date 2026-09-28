/**
 * ArtSphere – Creative Groups & Communities Script
 * Clean 4-Column Directory Architecture matching Reference Image 2
 */

let allGroups = [];
let activeTab = 'all';
let currentLocation = 'all';
let currentSort = 'members';
let currentView = 'grid';
let searchQuery = '';
let searchDebounceTimeout = null;
let currentUserId = 101;

// Joined groups local state tracking
const JOINED_STORAGE_KEY = 'artsphere_joined_groups';
let joinedGroupIds = new Set(JSON.parse(localStorage.getItem(JOINED_STORAGE_KEY) || '[601, 604]'));

document.addEventListener('DOMContentLoaded', () => {
    initNavigationDrawer();
    initUserMenu();
    initToolbarAndTabs();
    checkUrlQueryParams();
    loadGroupsData();
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

    if (userAvatarBtn && userDropdownPanel) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userDropdownPanel.classList.toggle('show');
            userAvatarBtn.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!userDropdownPanel.contains(e.target) && !userAvatarBtn.contains(e.target)) {
                userDropdownPanel.classList.remove('show');
            }
        });
    }

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCurrentUser === 'function') {
            const user = await window.ArtSphereAPI.getCurrentUser();
            if (user) {
                if (user.id) currentUserId = user.id;
                if (dropdownUserName) dropdownUserName.textContent = user.fullName || user.username;
                if (dropdownUserBio) dropdownUserBio.textContent = user.bio || 'Artist Member';
                if (user.profilePicture && headerUserAvatar) {
                    headerUserAvatar.src = user.profilePicture;
                }
            }
        }
    } catch (e) {
        console.warn('Could not read user session', e);
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

    // Global listener to close open 3-dots menus
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card-menu-trigger-wrapper')) {
            document.querySelectorAll('.card-menu-dropdown.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

/**
 * 3. Toolbar, Tabs, Location, Sort, and View Setup
 */
function initToolbarAndTabs() {
    const searchInput = document.getElementById('communitySearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const filterTabs = document.querySelectorAll('.group-tab-btn');
    const locationSelect = document.getElementById('groupLocationSelect');
    const sortSelect = document.getElementById('groupSortSelect');
    const viewButtons = document.querySelectorAll('.view-btn');

    // Debounced Search Input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
            }
            clearTimeout(searchDebounceTimeout);
            searchDebounceTimeout = setTimeout(() => {
                filterAndRenderGroups();
            }, 200);
        });
    }

    // Clear Search
    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            searchInput.focus();
            filterAndRenderGroups();
        });
    }

    // Filter Tabs (All, My, Public, Private)
    filterTabs.forEach(tabBtn => {
        tabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            filterTabs.forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');
            activeTab = tabBtn.getAttribute('data-tab') || 'all';
            filterAndRenderGroups();
        });
    });

    // Location Select Dropdown
    if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            currentLocation = e.target.value;
            filterAndRenderGroups();
        });
    }

    // Sort Select Dropdown
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            filterAndRenderGroups();
        });
    }

    // View Switcher (Grid vs List)
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.getAttribute('data-view') || 'grid';
            
            const grid = document.getElementById('popularCommunitiesGrid');
            if (grid) {
                grid.classList.toggle('list-view', currentView === 'list');
            }
        });
    });
}

/**
 * 4. Parse URL Query Parameters
 */
function checkUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const loc = params.get('location');
    const q = params.get('q') || params.get('search');

    if (tab) {
        activeTab = tab;
        const targetTab = document.querySelector(`.group-tab-btn[data-tab="${CSS.escape(tab)}"]`);
        if (targetTab) {
            document.querySelectorAll('.group-tab-btn').forEach(b => b.classList.remove('active'));
            targetTab.classList.add('active');
        }
    }

    if (loc) {
        currentLocation = loc;
        const locSelect = document.getElementById('groupLocationSelect');
        if (locSelect) locSelect.value = loc;
    }

    if (q) {
        searchQuery = q;
        const searchInput = document.getElementById('communitySearchInput');
        const clearBtn = document.getElementById('clearSearchBtn');
        if (searchInput) searchInput.value = q;
        if (clearBtn) clearBtn.style.display = 'flex';
    }
}

/**
 * 5. Fetch Communities Data
 */
async function loadGroupsData() {
    let items = getReferenceGroupsData();

    try {
        let apiCommunities = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCommunities === 'function') {
            apiCommunities = await window.ArtSphereAPI.getCommunities(null, null, currentUserId);
        } else {
            const res = await fetch('/api/communities');
            if (res.ok) {
                const json = await res.json();
                apiCommunities = json.data || [];
            }
        }

        if (apiCommunities && apiCommunities.length > 0) {
            apiCommunities.forEach(comm => {
                const existing = items.find(g => String(g.id) === String(comm.id));
                if (existing) {
                    existing.memberCount = comm.memberCount || existing.memberCount;
                    existing.location = comm.location || existing.location;
                    if (comm.imageUrl) existing.imageUrl = comm.imageUrl;
                } else {
                    items.push({
                        id: comm.id,
                        name: comm.name,
                        status: comm.category === 'Crafts' || comm.category === 'Writing' ? 'PRIVATE' : 'PUBLIC',
                        memberCount: comm.memberCount || 340,
                        description: comm.description || 'A vibrant community of creators collaborating and sharing art.',
                        location: comm.location || 'Mumbai, MH',
                        imageUrl: comm.coverImage || comm.imageUrl || '/images/comm_creative_souls_cover.png',
                        avatars: ['/images/artist_profile_avatar.png', '/images/artist_arjun_thumb.png', '/images/avatar_riya.png']
                    });
                }
            });
        }
    } catch (err) {
        console.warn('Network notice: using curated directory groups data:', err);
    }

    // Set initial joined state from localStorage
    items.forEach(group => {
        group.joined = joinedGroupIds.has(Number(group.id)) || joinedGroupIds.has(String(group.id));
    });

    allGroups = items;
    updateTabCounts();
    filterAndRenderGroups();
}

/**
 * 6. Update Dynamic Filter Tab Counts
 */
function updateTabCounts() {
    const totalAll = allGroups.length;
    const totalMy = allGroups.filter(g => g.joined).length;
    const totalPublic = allGroups.filter(g => g.status === 'PUBLIC').length;
    const totalPrivate = allGroups.filter(g => g.status === 'PRIVATE').length;

    const countAllEl = document.getElementById('tabCountAll');
    const countMyEl = document.getElementById('tabCountMy');
    const countPublicEl = document.getElementById('tabCountPublic');
    const countPrivateEl = document.getElementById('tabCountPrivate');

    if (countAllEl) countAllEl.textContent = totalAll;
    if (countMyEl) countMyEl.textContent = totalMy;
    if (countPublicEl) countPublicEl.textContent = totalPublic;
    if (countPrivateEl) countPrivateEl.textContent = totalPrivate;
}

/**
 * 7. Filter & Render Groups into 4-Column Grid
 */
function filterAndRenderGroups() {
    const grid = document.getElementById('popularCommunitiesGrid');
    const resultsCountLabel = document.getElementById('resultsCountLabel');
    if (!grid) return;

    let filtered = allGroups.filter(group => {
        // 1. Tab Filter
        if (activeTab === 'my' && !group.joined) return false;
        if (activeTab === 'public' && group.status !== 'PUBLIC') return false;
        if (activeTab === 'private' && group.status !== 'PRIVATE') return false;

        // 2. Location Filter
        if (currentLocation !== 'all') {
            const locLower = currentLocation.toLowerCase();
            const groupLoc = (group.location || '').toLowerCase();
            if (!groupLoc.includes(locLower)) return false;
        }

        // 3. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const name = (group.name || '').toLowerCase();
            const desc = (group.description || '').toLowerCase();
            const loc = (group.location || '').toLowerCase();
            const cat = (group.category || '').toLowerCase();

            if (!name.includes(q) && !desc.includes(q) && !loc.includes(q) && !cat.includes(q)) {
                return false;
            }
        }

        return true;
    });

    // Sorting
    if (currentSort === 'members') {
        filtered.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
    } else if (currentSort === 'alphabetical') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'active') {
        filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    // Results Counter
    if (resultsCountLabel) {
        const tabTitle = activeTab === 'all' ? 'creative groups' : `${activeTab} groups`;
        const locTitle = currentLocation === 'all' ? '' : ` in ${currentLocation}`;
        resultsCountLabel.textContent = `Showing ${filtered.length} ${tabTitle}${locTitle}`;
    }

    // Empty State
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-directory-card">
                <div class="empty-directory-icon">✦</div>
                <h3 class="empty-directory-title">No groups found</h3>
                <p class="empty-directory-sub">Try expanding your search query or selecting 'All Groups'.</p>
                <button class="filter-pill-btn active" style="margin: 0 auto; display: inline-block;" onclick="resetGroupsFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    // Render 4-Column Grid Cards
    grid.innerHTML = filtered.map(group => createGroupCardHtml(group)).join('');

    // Attach Three-Dots Menu Triggers
    grid.querySelectorAll('.card-menu-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parent = btn.closest('.card-menu-trigger-wrapper');
            const dropdown = parent.querySelector('.card-menu-dropdown');
            
            // Close other open menus
            document.querySelectorAll('.card-menu-dropdown.show').forEach(m => {
                if (m !== dropdown) m.classList.remove('show');
            });

            dropdown.classList.toggle('show');
        });
    });

    // Attach Join Buttons
    grid.querySelectorAll('.btn-join-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const groupId = btn.getAttribute('data-id');
            toggleGroupJoin(groupId, btn);
        });
    });
}

/**
 * 8. Group Card HTML Generator (Matching Reference Image 2)
 */
function createGroupCardHtml(group) {
    const isPublic = group.status === 'PUBLIC';
    const statusText = isPublic ? 'PUBLIC GROUP' : 'PRIVATE GROUP';
    const statusClass = isPublic ? 'status-public' : 'status-private';
    const isJoined = Boolean(group.joined);
    const joinText = isJoined ? 'Joined ✓' : 'Join Group';
    const joinClass = isJoined ? 'joined' : '';
    const formattedCount = formatMemberCount(group.memberCount);

    const avatarImages = group.avatars || [
        '/images/artist_profile_avatar.png',
        '/images/artist_rohan_avatar.png',
        '/images/artist_kavya_avatar.png'
    ];

    return `
        <article class="group-directory-card" data-id="${group.id}">
            <div>
                <!-- Top Bar -->
                <div class="group-card-top-bar">
                    <span class="status-pill ${statusClass}">${statusText}</span>
                    <div class="card-top-meta-right">
                        <span class="card-member-summary">${formattedCount} members</span>
                        <div class="card-menu-trigger-wrapper">
                            <button class="card-menu-trigger" aria-label="Group options" title="Options">⋮</button>
                            <div class="card-menu-dropdown">
                                <a href="/pages/community-details.html?id=${group.id}" class="card-menu-item">
                                    <span>↗</span>
                                    <span>View Details</span>
                                </a>
                                <button class="card-menu-item" onclick="toggleGroupJoin('${group.id}')">
                                    <span>${isJoined ? '✕' : '＋'}</span>
                                    <span>${isJoined ? 'Leave Group' : 'Join Group'}</span>
                                </button>
                                <button class="card-menu-item" onclick="copyGroupLink('${group.id}')">
                                    <span>⎘</span>
                                    <span>Copy Link</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Banner Image Box -->
                <a href="/pages/community-details.html?id=${group.id}" class="group-banner-wrapper">
                    <img src="${escapeHtml(group.imageUrl)}" 
                         alt="${escapeHtml(group.name)}" 
                         class="group-banner-img"
                         loading="lazy"
                         onerror="this.src='/images/comm_creative_souls_cover.png'">
                </a>

                <!-- Group Title & Description -->
                <div class="group-card-body">
                    <a href="/pages/community-details.html?id=${group.id}" class="group-card-title">${escapeHtml(group.name)}</a>
                    <p class="group-card-desc">${escapeHtml(group.description)}</p>
                </div>
            </div>

            <!-- Footer Row -->
            <div class="group-card-footer">
                <div class="group-avatars-row">
                    ${avatarImages.slice(0, 3).map(av => `
                        <img src="${escapeHtml(av)}" class="stacked-mini-avatar" alt="Member" loading="lazy" onerror="this.src='/images/artist_profile_avatar.png'">
                    `).join('')}
                    <span class="avatars-count-text">+${formattedCount}</span>
                </div>
                <button class="btn-join-pill ${joinClass}" data-id="${group.id}">
                    <span>${joinText}</span>
                </button>
            </div>
        </article>
    `;
}

/**
 * 9. Toggle Group Join/Leave Action
 */
window.toggleGroupJoin = async function(groupId, buttonEl) {
    const group = allGroups.find(g => String(g.id) === String(groupId));
    if (!group) return;

    group.joined = !group.joined;

    if (group.joined) {
        joinedGroupIds.add(Number(groupId));
        group.memberCount = (group.memberCount || 100) + 1;
    } else {
        joinedGroupIds.delete(Number(groupId));
        group.memberCount = Math.max(1, (group.memberCount || 100) - 1);
    }

    localStorage.setItem(JOINED_STORAGE_KEY, JSON.stringify(Array.from(joinedGroupIds)));

    // Optional API call
    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.joinCommunity === 'function') {
            if (group.joined) {
                await window.ArtSphereAPI.joinCommunity(groupId, currentUserId);
            } else if (typeof window.ArtSphereAPI.leaveCommunity === 'function') {
                await window.ArtSphereAPI.leaveCommunity(groupId, currentUserId);
            }
        }
    } catch (e) {
        // Non-blocking
    }

    updateTabCounts();
    filterAndRenderGroups();
};

/**
 * 10. Copy Group Link Action
 */
window.copyGroupLink = function(groupId) {
    const url = `${window.location.origin}/pages/community-details.html?id=${groupId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert('Community link copied to clipboard!');
        });
    } else {
        alert(`Community Link: ${url}`);
    }
};

/**
 * 11. Reset Filters Helper
 */
window.resetGroupsFilters = function() {
    activeTab = 'all';
    currentLocation = 'all';
    currentSort = 'members';
    searchQuery = '';

    const searchInput = document.getElementById('communitySearchInput');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    const locSelect = document.getElementById('groupLocationSelect');
    if (locSelect) locSelect.value = 'all';

    const sortSelect = document.getElementById('groupSortSelect');
    if (sortSelect) sortSelect.value = 'members';

    document.querySelectorAll('.group-tab-btn').forEach((b, idx) => {
        b.classList.toggle('active', idx === 0);
    });

    filterAndRenderGroups();
};

/**
 * 12. Helper: Format Member Count
 */
function formatMemberCount(count) {
    if (!count) return '100';
    if (count >= 1000) {
        return (count / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return String(count);
}

/**
 * 13. Curated Reference Groups Dataset (Matching Reference Image 2)
 */
function getReferenceGroupsData() {
    return [
        {
            id: 601,
            name: "Creative Souls",
            status: "PUBLIC",
            memberCount: 1200,
            location: "Mumbai",
            category: "All",
            description: "A space for all kinds of artists to share, support and inspire each other.",
            imageUrl: "/images/comm_creative_souls_cover.png",
            avatars: ["/images/artist_profile_avatar.png", "/images/artist_arjun_thumb.png", "/images/avatar_riya.png"]
        },
        {
            id: 608,
            name: "Illustration Hub",
            status: "PRIVATE",
            memberCount: 856,
            location: "Mumbai",
            category: "Visual Arts",
            description: "Character design, digital art, concept art and everything in between.",
            imageUrl: "/images/artwork_bloom.png",
            avatars: ["/images/avatar_riya.png", "/images/avatar_sneha.png", "/images/artist_ishita_thumb.png"]
        },
        {
            id: 604,
            name: "SoundSphere",
            status: "PUBLIC",
            memberCount: 642,
            location: "Mumbai",
            category: "Music",
            description: "Musicians, producers, lyricists and indie bands jamming and collaborating.",
            imageUrl: "/images/cat_music.png",
            avatars: ["/images/artist_rohan_avatar.png", "/images/artist_meera_thumb.png", "/images/artist_arjun_thumb.png"]
        },
        {
            id: 603,
            name: "Lens & Life",
            status: "PUBLIC",
            memberCount: 1100,
            location: "Pune",
            category: "Photography",
            description: "Street, portrait, travel and experimental photography.",
            imageUrl: "/images/opp_lens_and_life.png",
            avatars: ["/images/artist_arjun_thumb.png", "/images/artist_profile_avatar.png", "/images/avatar_karan.png"]
        },
        {
            id: 605,
            name: "Move Together",
            status: "PRIVATE",
            memberCount: 498,
            location: "Bengaluru",
            category: "Dance",
            description: "Dancers, choreographers and movement artists uniting to express through rhythm.",
            imageUrl: "/images/opp_dance_performance.png",
            avatars: ["/images/artist_kavya_avatar.png", "/images/avatar_riya.png", "/images/artist_meera_thumb.png"]
        },
        {
            id: 607,
            name: "Create & Craft",
            status: "PUBLIC",
            memberCount: 521,
            location: "Mumbai",
            category: "Crafts",
            description: "Ceramic sculptors, clay artists, and DIY makers turning raw materials into magic.",
            imageUrl: "/images/highlight_clay_character.png",
            avatars: ["/images/artist_ishita_thumb.png", "/images/avatar_sneha.png", "/images/artist_rohan_avatar.png"]
        },
        {
            id: 606,
            name: "Words & Worlds",
            status: "PUBLIC",
            memberCount: 379,
            location: "Global",
            category: "Writing",
            description: "Poets, authors, and scriptwriters spinning universes with ink and imagination.",
            imageUrl: "/images/opp_content_writer.png",
            avatars: ["/images/avatar_sneha.png", "/images/artist_profile_avatar.png", "/images/artist_meera_thumb.png"]
        },
        {
            id: 609,
            name: "Frame by Frame",
            status: "PRIVATE",
            memberCount: 310,
            location: "Mumbai",
            category: "Film",
            description: "Filmmakers, editors, and visual storytellers bringing ideas to life.",
            imageUrl: "/images/opp_short_film_illustrator.png",
            avatars: ["/images/avatar_arjun_collab.png", "/images/artist_arjun_thumb.png", "/images/avatar_karan.png"]
        },
        {
            id: 610,
            name: "Design Circle",
            status: "PUBLIC",
            memberCount: 293,
            location: "Mumbai",
            category: "Design",
            description: "Graphic design, UI/UX, typography and visual communication.",
            imageUrl: "/images/artwork_city_shades.png",
            avatars: ["/images/avatar_karan.png", "/images/avatar_riya.png", "/images/artist_profile_avatar.png"]
        },
        {
            id: 611,
            name: "Live & Local",
            status: "PUBLIC",
            memberCount: 264,
            location: "Mumbai",
            category: "Music",
            description: "Share upcoming shows, jam sessions and open mics in your city.",
            imageUrl: "/images/opp_campus_band.png",
            avatars: ["/images/artist_rohan_avatar.png", "/images/artist_arjun_thumb.png", "/images/avatar_sneha.png"]
        },
        {
            id: 612,
            name: "Exhibition Space",
            status: "PRIVATE",
            memberCount: 198,
            location: "Thane",
            category: "Visual Arts",
            description: "Share works, get feedback, and organize virtual or local exhibitions.",
            imageUrl: "/images/comm_event_exhibition.png",
            avatars: ["/images/artist_ishita_thumb.png", "/images/artwork_beyond_the_hills.png", "/images/avatar_karan.png"]
        },
        {
            id: 613,
            name: "Animation Station",
            status: "PUBLIC",
            memberCount: 176,
            location: "Mumbai",
            category: "Animation",
            description: "2D, 3D, motion graphics, and animation enthusiasts.",
            imageUrl: "/images/artwork_sunlit.png",
            avatars: ["/images/avatar_riya.png", "/images/artist_profile_avatar.png", "/images/artist_rohan_avatar.png"]
        }
    ];
}

/**
 * 14. HTML Escape Utility
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
