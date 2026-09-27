/**
 * ArtSphere – Discover & Artist Directory Script
 * Editorial Neo-Brutalist Architecture & Multi-Filter Engine
 */

let allArtists = [];
let currentCategory = 'all';
let currentLocation = 'all';
let currentSearch = '';
let searchDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigationDrawer();
    initUserMenu();
    initSearchAndFilters();
    checkUrlQueryParams();
    loadDiscoverData();
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
 * 3. Search and Multi-Filter Engine
 */
function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const categoryPills = document.querySelectorAll('.filter-pill-btn');
    const locationPills = document.querySelectorAll('.location-pill');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounceTimer);
            currentSearch = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = currentSearch ? 'flex' : 'none';
            }
            searchDebounceTimer = setTimeout(() => {
                filterAndRenderArtists();
            }, 250);
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearch = '';
            clearSearchBtn.style.display = 'none';
            searchInput.focus();
            filterAndRenderArtists();
        });
    }

    categoryPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-category') || 'all';
            filterAndRenderArtists();
        });
    });

    locationPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            locationPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentLocation = pill.getAttribute('data-location') || 'all';
            filterAndRenderArtists();
        });
    });
}

/**
 * 4. Check URL query parameters (e.g. ?category=Music or ?artForm=Dancers)
 */
function checkUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category') || params.get('artForm');
    const loc = params.get('location');
    const q = params.get('q');

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
        const targetLoc = document.querySelector(`.location-pill[data-location="${CSS.escape(loc)}"]`);
        if (targetLoc) {
            document.querySelectorAll('.location-pill').forEach(p => p.classList.remove('active'));
            targetLoc.classList.add('active');
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
 * 5. Load Artist Data from Spring Boot REST Endpoints
 */
async function loadDiscoverData() {
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

        // If backend returns artists, save them
        if (artists && artists.length > 0) {
            allArtists = artists;
        } else {
            allArtists = getFallbackArtists();
        }
    } catch (err) {
        console.warn('Network error loading discover artists, using seed artists:', err);
        allArtists = getFallbackArtists();
    }

    filterAndRenderArtists();
}

/**
 * 6. Filter & Render Artists Grid
 */
function filterAndRenderArtists() {
    const container = document.getElementById('artistsResultsGrid');
    const countLabel = document.getElementById('resultsCountLabel');
    if (!container) return;

    let filtered = allArtists.filter(artist => {
        // 1. Category Filter
        if (currentCategory !== 'all') {
            const profession = (artist.profession || '').toLowerCase();
            const skills = (artist.skills || '').toLowerCase();
            const catLower = currentCategory.toLowerCase();
            if (!profession.includes(catLower) && !skills.includes(catLower)) {
                return false;
            }
        }

        // 2. Location Filter
        if (currentLocation !== 'all') {
            const loc = (artist.location || '').toLowerCase();
            const locLower = currentLocation.toLowerCase();
            if (!loc.includes(locLower)) {
                return false;
            }
        }

        // 3. Search Filter
        if (currentSearch) {
            const q = currentSearch.toLowerCase();
            const name = (artist.name || '').toLowerCase();
            const bio = (artist.bio || '').toLowerCase();
            const prof = (artist.profession || '').toLowerCase();
            const skills = (artist.skills || '').toLowerCase();
            const loc = (artist.location || '').toLowerCase();

            if (!name.includes(q) && !bio.includes(q) && !prof.includes(q) && !skills.includes(q) && !loc.includes(q)) {
                return false;
            }
        }

        return true;
    });

    if (countLabel) {
        const catStr = currentCategory === 'all' ? 'all disciplines' : currentCategory;
        countLabel.textContent = `Showing ${filtered.length} artist${filtered.length === 1 ? '' : 's'} in ${catStr}`;
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-directory-card">
                <div class="empty-directory-icon">✦</div>
                <h3 class="empty-directory-title">No creators found matching criteria</h3>
                <p class="empty-directory-sub">Try expanding your search query or switching to 'All Art Forms' or 'All Cities'.</p>
                <button class="btn-pill-primary" onclick="resetFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map((artist, idx) => {
        const isAlt = idx % 2 === 1;
        const bgClass = isAlt ? 'alt-cream' : '';
        const coverImg = artist.coverImageUrl || '/images/artist_profile_cover.png';
        const avatarImg = artist.avatarUrl || '/images/artist_profile_avatar.png';
        const profession = artist.profession || 'Artist';
        const location = artist.location || 'Mumbai, MH';
        const followers = artist.followersCount || '1.4K';
        const skillsArray = (artist.skills || 'Concept Art, Portfolio, Collaborations').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);

        return `
            <div class="col-4 col-md-4 col-sm-4 artist-directory-card ${bgClass}">
                <div class="card-cover-box">
                    <img src="${escapeHtml(coverImg)}" 
                         alt="${escapeHtml(artist.artworkTitle || artist.name)}" 
                         class="card-cover-img"
                         onerror="this.src='/images/artist_profile_cover.png'">
                    <span class="card-discipline-pill">${escapeHtml(profession)}</span>
                </div>
                <div class="card-content-body">
                    <div>
                        <div class="card-artist-header">
                            <img src="${escapeHtml(avatarImg)}" 
                                 alt="${escapeHtml(artist.name)}" 
                                 class="card-artist-avatar"
                                 onerror="this.src='/images/artist_profile_avatar.png'">
                            <div>
                                <h3 class="card-artist-name">${escapeHtml(artist.name)}</h3>
                                <span class="card-artist-location">${escapeHtml(location)}</span>
                            </div>
                        </div>
                        <p class="card-artist-bio">${escapeHtml(artist.bio || 'Exploring new frontiers in craft and interdisciplinary collaboration.')}</p>
                        <div class="card-skills-tags">
                            ${skillsArray.map(skill => `<span class="skill-pill-tag">${escapeHtml(skill)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="card-footer-action">
                        <span class="card-follower-count">${escapeHtml(followers)} Followers</span>
                        <a href="/pages/artist-profile.html?id=${encodeURIComponent(artist.id)}" class="btn-pill-secondary btn-card-action">
                            <span>Portfolio</span>
                            <span>&rarr;</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 7. Reset Filters Helper
 */
window.resetFilters = function() {
    currentCategory = 'all';
    currentLocation = 'all';
    currentSearch = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    document.querySelectorAll('.filter-pill-btn').forEach((p, idx) => {
        p.classList.toggle('active', idx === 0);
    });
    document.querySelectorAll('.location-pill').forEach((p, idx) => {
        p.classList.toggle('active', idx === 0);
    });

    filterAndRenderArtists();
};

/**
 * Fallback Seed Creators
 */
function getFallbackArtists() {
    return [
        {
            id: 101,
            name: "Aanya Deshmukh",
            profession: "Visual Artist",
            location: "Mumbai, MH",
            bio: "Illustrator and digital artist exploring everyday moments, warm light and character studies.",
            skills: "Digital Art, Illustration, Portraits, Concept Art",
            followersCount: "1.8K",
            avatarUrl: "/images/artist_profile_avatar.png",
            coverImageUrl: "/images/artist_profile_cover.png"
        },
        {
            id: 102,
            name: "Rohan Mehta",
            profession: "Musician",
            location: "Pune, MH",
            bio: "Acoustic fingerstyle guitarist & indie composer creating raw, soulful tracks and soundtrack textures.",
            skills: "Acoustic Guitar, Indie Folk, Songwriting, Fingerstyle",
            followersCount: "2.1K",
            avatarUrl: "/images/artist_rohan_avatar.png",
            coverImageUrl: "/images/artist_rohan_cover.png"
        },
        {
            id: 103,
            name: "Kavya Iyer",
            profession: "Dancer",
            location: "Bengaluru, KA",
            bio: "Contemporary fusion dancer and stage choreographer exploring rhythmic movement and theatricality.",
            skills: "Contemporary, Classical Fusion, Stage Choreography",
            followersCount: "1.4K",
            avatarUrl: "/images/artist_kavya_avatar.png",
            coverImageUrl: "/images/artist_kavya_cover.png"
        },
        {
            id: 104,
            name: "Arjun Rao",
            profession: "Photographer",
            location: "Mumbai, MH",
            bio: "Street and documentary photographer capturing urban geometries and candid human moments.",
            skills: "Street Photography, Monochrome, Architectural, Urban",
            followersCount: "980",
            avatarUrl: "/images/artist_arjun_thumb.png",
            coverImageUrl: "/images/artist_profile_cover.png"
        },
        {
            id: 105,
            name: "Meera Singh",
            profession: "Singer",
            location: "Mumbai, MH",
            bio: "Soulful vocalist and playback artist blending classical ragas with indie acoustic arrangements.",
            skills: "Vocal Performance, Ghazals, Classical Ragas",
            followersCount: "1.6K",
            avatarUrl: "/images/artist_meera_thumb.png",
            coverImageUrl: "/images/artist_rohan_cover.png"
        },
        {
            id: 106,
            name: "Ishita Kulkarni",
            profession: "Painter",
            location: "Thane, MH",
            bio: "Oil and acrylic canvas painter working with heavy texture, architectural shadows, and raw palette knife work.",
            skills: "Oil Painting, Acrylics, Textured Canvas, Abstract",
            followersCount: "890",
            avatarUrl: "/images/artist_ishita_thumb.png",
            coverImageUrl: "/images/artist_profile_cover.png"
        }
    ];
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
