/**
 * ArtSphere – Discover & Multi-Content Masonry Feed Script
 * Pinterest-Inspired High-Density Creative Discovery Flow
 */

let allDiscoverItems = [];
let currentCategory = 'all';
let currentLocation = 'all';
let currentSort = 'relevant';
let currentSearch = '';
let searchDebounceTimer = null;

// Bookmarks store in localStorage
const BOOKMARK_KEY = 'artsphere_bookmarks';
let bookmarkedIds = new Set(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]'));

document.addEventListener('DOMContentLoaded', () => {
    initNavigationDrawer();
    initUserMenu();
    initToolbarControls();
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
 * 3. Toolbar Controls (Search, Categories, Location, Sort)
 */
function initToolbarControls() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const categoryPills = document.querySelectorAll('.filter-pill-btn');
    const locationSelect = document.getElementById('locationSelect');
    const sortSelect = document.getElementById('sortSelect');
    const pillsScrollRightBtn = document.getElementById('pillsScrollRightBtn');
    const categoryPillsRow = document.getElementById('categoryPillsRow');

    // Debounced Search Input
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
            filterAndRenderDiscoverFeed();
        });
    });

    // Scroll Right for Pills
    if (pillsScrollRightBtn && categoryPillsRow) {
        pillsScrollRightBtn.addEventListener('click', () => {
            categoryPillsRow.scrollBy({ left: 160, behavior: 'smooth' });
        });
    }

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
}

/**
 * 4. Check URL query parameters
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
 * 5. Load Discover Data: Merge API data with rich multi-type feed
 */
async function loadDiscoverData() {
    let seedItems = getCuratedFeedItems();

    try {
        let apiArtists = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getFeaturedArtists === 'function') {
            apiArtists = await window.ArtSphereAPI.getFeaturedArtists();
        } else {
            const res = await fetch('/api/home/featured-artists');
            if (res.ok) {
                const json = await res.json();
                apiArtists = json.data || [];
            }
        }

        // If backend returns extra artists, merge them nicely
        if (apiArtists && apiArtists.length > 0) {
            apiArtists.forEach(artist => {
                const alreadyExists = seedItems.some(item => item.id === artist.id && item.type === 'ARTIST');
                if (!alreadyExists) {
                    seedItems.push({
                        id: artist.id,
                        type: 'ARTIST',
                        name: artist.name || artist.fullName,
                        profession: artist.profession || artist.artistType || 'Visual Artist',
                        location: artist.location || 'Mumbai, MH',
                        bio: artist.bio || 'Exploring new frontiers in craft and interdisciplinary collaboration.',
                        skills: (artist.skills || 'Concept Art, Illustration, Collabs').split(',').map(s => s.trim()),
                        followersCount: artist.followersCount || '1.2K',
                        avatarUrl: artist.avatarUrl || artist.profilePicture || '/images/artist_profile_avatar.png',
                        coverImageUrl: artist.coverImageUrl || artist.coverImage || '/images/artist_profile_cover.png',
                        imageHeightClass: 'height-medium'
                    });
                }
            });
        }
    } catch (err) {
        console.warn('Network notice: using curated discovery feed data:', err);
    }

    allDiscoverItems = seedItems;
    filterAndRenderDiscoverFeed();
}

/**
 * 6. Filter & Render Pinterest-Inspired Masonry Feed
 */
function filterAndRenderDiscoverFeed() {
    const container = document.getElementById('discoverMasonryFeed') || document.getElementById('artistsResultsGrid');
    const countLabel = document.getElementById('resultsCountLabel');
    if (!container) return;

    let filtered = allDiscoverItems.filter(item => {
        // 1. Discipline / Category Filter
        if (currentCategory !== 'all') {
            const catLower = currentCategory.toLowerCase();
            const prof = (item.profession || '').toLowerCase();
            const discipline = (item.discipline || '').toLowerCase();
            const skills = Array.isArray(item.skills) ? item.skills.join(' ').toLowerCase() : (item.skills || '').toLowerCase();
            const title = (item.title || '').toLowerCase();

            // Broad matching for discipline category
            const matchesCat = prof.includes(catLower) || 
                               discipline.includes(catLower) || 
                               skills.includes(catLower) ||
                               title.includes(catLower);

            // Special synonyms (e.g. Musicians matches Singer/Band/Music)
            if (catLower.includes('music') && (prof.includes('singer') || prof.includes('guitar') || discipline.includes('music'))) {
                return true;
            }
            if (catLower.includes('writer') && (prof.includes('poet') || prof.includes('lyricist') || discipline.includes('writing'))) {
                return true;
            }
            if (catLower.includes('visual') && (prof.includes('paint') || prof.includes('illustrat') || discipline.includes('visual'))) {
                return true;
            }

            if (!matchesCat) return false;
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
            const prof = (item.profession || item.discipline || '').toLowerCase();
            const skills = Array.isArray(item.skills) ? item.skills.join(' ').toLowerCase() : (item.skills || '').toLowerCase();
            const loc = (item.location || '').toLowerCase();

            const match = name.includes(q) || 
                          title.includes(q) || 
                          bio.includes(q) || 
                          prof.includes(q) || 
                          skills.includes(q) || 
                          loc.includes(q);
            if (!match) return false;
        }

        return true;
    });

    // Sorting Logic
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

    // Update Counter Label
    if (countLabel) {
        const catText = currentCategory === 'all' ? 'creative discoveries' : currentCategory.toLowerCase();
        const locText = currentLocation === 'all' ? '' : ` in ${currentLocation}`;
        countLabel.textContent = `Showing ${filtered.length} ${catText}${locText}`;
    }

    // Empty State
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-directory-card">
                <div class="empty-directory-icon">✦</div>
                <h3 class="empty-directory-title">No discoveries found</h3>
                <p class="empty-directory-sub">Try broadening your search query or selecting 'All' disciplines.</p>
                <button class="filter-pill-btn active" style="margin: 0 auto; display: inline-block;" onclick="resetFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    // Render Mixed Items
    container.innerHTML = filtered.map(item => {
        switch (item.type) {
            case 'EVENT':
                return renderEventCard(item);
            case 'COMMUNITY':
                return renderCommunityCard(item);
            case 'OPPORTUNITY':
                return renderOpportunityCard(item);
            case 'ARTIST':
            default:
                return renderArtistCard(item);
        }
    }).join('');
}

/**
 * 7. Card Renderers for 4 Typologies
 */

// 1. Artist Card
function renderArtistCard(artist) {
    const isBookmarked = bookmarkedIds.has(`artist_${artist.id}`);
    const skillsList = (artist.skills || ['Concept Art', 'Illustration', 'Collabs']).slice(0, 3);
    const heightClass = artist.imageHeightClass || 'height-tall';

    return `
        <article class="masonry-item-card artist-card" data-id="${artist.id}">
            <div class="card-media-box ${heightClass}">
                <img src="${escapeHtml(artist.coverImageUrl)}" 
                     alt="${escapeHtml(artist.name)}" 
                     class="card-media-img" 
                     loading="lazy"
                     onerror="this.src='/images/artist_profile_cover.png'">
                <span class="card-badge-pill">${escapeHtml(artist.profession)}</span>
                <button class="card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                        onclick="toggleBookmark('artist', '${artist.id}', this)"
                        aria-label="Bookmark artist">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.3">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>
            <div class="card-info-content">
                <div class="creator-header-row">
                    <img src="${escapeHtml(artist.avatarUrl)}" 
                         alt="${escapeHtml(artist.name)}" 
                         class="creator-thumb-avatar" 
                         loading="lazy"
                         onerror="this.src='/images/artist_profile_avatar.png'">
                    <div class="creator-name-box">
                        <a href="/pages/artist-profile.html?id=${encodeURIComponent(artist.id)}" class="creator-full-name">${escapeHtml(artist.name)}</a>
                        <span class="creator-city-label">${escapeHtml(artist.location)}</span>
                    </div>
                </div>
                <p class="creator-bio-snippet">${escapeHtml(artist.bio)}</p>
                <div class="creator-skills-pills">
                    ${skillsList.map(skill => `<span class="skill-tag-pill">${escapeHtml(skill)}</span>`).join('')}
                </div>
                <div class="creator-card-footer">
                    <span class="creator-followers-count">${escapeHtml(artist.followersCount || '1.4K')} Followers</span>
                    <a href="/pages/artist-profile.html?id=${encodeURIComponent(artist.id)}" class="portfolio-link-pill">
                        <span>Portfolio</span>
                        <span>&rarr;</span>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// 2. Event & Jam Session Card
function renderEventCard(evt) {
    const heightClass = evt.imageHeightClass || 'height-medium';
    const isBookmarked = bookmarkedIds.has(`event_${evt.id}`);

    return `
        <article class="masonry-item-card event-card" data-id="${evt.id}">
            <div class="card-media-box ${heightClass}">
                <img src="${escapeHtml(evt.imageUrl)}" 
                     alt="${escapeHtml(evt.title)}" 
                     class="card-media-img" 
                     loading="lazy"
                     onerror="this.src='/images/comm_event_watercolor.png'">
                <span class="card-badge-pill">${escapeHtml(evt.badgeText || 'EVENT')}</span>
                <div class="event-date-badge">
                    <span class="event-date-day">${escapeHtml(evt.dateDay || '24')}</span>
                    <span class="event-date-month">${escapeHtml(evt.dateMonth || 'AUG')}</span>
                </div>
            </div>
            <div class="card-info-content">
                <h3 class="event-item-title">${escapeHtml(evt.title)}</h3>
                <div class="event-venue-meta">
                    <span>📍 ${escapeHtml(evt.location)}</span>
                    <span>•</span>
                    <span>${escapeHtml(evt.artForm || 'Music')}</span>
                </div>
                <div class="event-attendees-row">
                    <div class="attendees-avatars-group">
                        <img src="/images/avatar_riya.png" class="stacked-attendee-avatar" alt="Attendee">
                        <img src="/images/artist_arjun_thumb.png" class="stacked-attendee-avatar" alt="Attendee">
                        <img src="/images/avatar_sneha.png" class="stacked-attendee-avatar" alt="Attendee">
                        <span class="attendees-count-text">+${escapeHtml(evt.attendeesCount || '12')} going</span>
                    </div>
                    <a href="/pages/event-details.html?id=${encodeURIComponent(evt.id)}" class="circular-arrow-btn" aria-label="View Event Details">
                        <span>&#8599;</span>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// 3. Community Highlight Card
function renderCommunityCard(comm) {
    return `
        <article class="masonry-item-card community-highlight-card" data-id="${comm.id}">
            <div class="card-info-content">
                <div class="highlight-star-badge">
                    <span>★</span>
                    <span>COMMUNITY HIGHLIGHT</span>
                </div>
                <h3 class="community-highlight-title">${escapeHtml(comm.title || 'Stories, creations and moments from our community.')}</h3>
                <div class="community-thumbnails-strip">
                    <img src="/images/comm_feat_daisies.png" class="community-thumb-img" alt="Community feature" onerror="this.src='/images/artwork_sunlit.png'">
                    <img src="/images/comm_feat_sunset_lake.png" class="community-thumb-img" alt="Community feature" onerror="this.src='/images/artwork_beyond_the_hills.png'">
                    <img src="/images/comm_feat_street.png" class="community-thumb-img" alt="Community feature" onerror="this.src='/images/artwork_city_shades.png'">
                </div>
                <div class="community-card-footer">
                    <a href="/pages/communities.html" class="circular-arrow-btn" aria-label="Explore Communities">
                        <span>&#8599;</span>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// 4. Collaboration Opportunity Card
function renderOpportunityCard(opp) {
    const heightClass = opp.imageHeightClass || 'height-compact';
    const isBookmarked = bookmarkedIds.has(`opp_${opp.id}`);
    const tagsList = (opp.tags || ['Live Performance', 'Indie', 'Collaboration']).slice(0, 3);

    return `
        <article class="masonry-item-card opportunity-card" data-id="${opp.id}">
            <div class="card-media-box ${heightClass}">
                <img src="${escapeHtml(opp.imageUrl)}" 
                     alt="${escapeHtml(opp.title)}" 
                     class="card-media-img" 
                     loading="lazy"
                     onerror="this.src='/images/opp_campus_band.png'">
                <span class="card-badge-pill">OPPORTUNITY</span>
                <button class="card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                        onclick="toggleBookmark('opp', '${opp.id}', this)"
                        aria-label="Bookmark opportunity">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.3">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>
            <div class="card-info-content">
                <h3 class="opportunity-item-title">${escapeHtml(opp.title)}</h3>
                <div class="opportunity-location-tag">📍 ${escapeHtml(opp.location)}</div>
                <p class="opportunity-desc">${escapeHtml(opp.description)}</p>
                <div class="creator-skills-pills">
                    ${tagsList.map(tag => `<span class="skill-tag-pill">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="event-attendees-row">
                    <div class="attendees-avatars-group">
                        <img src="/images/artist_rohan_avatar.png" class="stacked-attendee-avatar" alt="Member">
                        <img src="/images/avatar_karan.png" class="stacked-attendee-avatar" alt="Member">
                        <span class="attendees-count-text">+${escapeHtml(opp.membersCount || '3')} members</span>
                    </div>
                    <a href="/pages/opportunities.html" class="apply-pill-btn">
                        <span>Apply</span>
                        <span>&rarr;</span>
                    </a>
                </div>
            </div>
        </article>
    `;
}

/**
 * 8. Interactive Bookmark Toggler
 */
window.toggleBookmark = function(type, id, btn) {
    const key = `${type}_${id}`;
    if (bookmarkedIds.has(key)) {
        bookmarkedIds.delete(key);
        btn.classList.remove('bookmarked');
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', 'none');
    } else {
        bookmarkedIds.add(key);
        btn.classList.add('bookmarked');
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', 'currentColor');
    }
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(bookmarkedIds)));
};

/**
 * 9. Reset Filters Helper
 */
window.resetFilters = function() {
    currentCategory = 'all';
    currentLocation = 'all';
    currentSort = 'relevant';
    currentSearch = '';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) locationSelect.value = 'all';

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'relevant';

    document.querySelectorAll('.filter-pill-btn').forEach((p, idx) => {
        p.classList.toggle('active', idx === 0);
    });

    filterAndRenderDiscoverFeed();
};

/**
 * 10. Curated Feed Dataset (Reflecting Reference 4 Layout & Density)
 */
function getCuratedFeedItems() {
    return [
        // Column 1
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
            imageHeightClass: "height-tall"
        },
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
            imageHeightClass: "height-tall"
        },

        // Column 2
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
            imageHeightClass: "height-medium"
        },
        {
            id: 105,
            type: 'ARTIST',
            name: "Meera Singh",
            profession: "Musician",
            location: "Mumbai, MH",
            bio: "Exploring sound, space and experimental music.",
            skills: ["Electronic", "Live Sets", "Collabs"],
            followersCount: "1.4K",
            avatarUrl: "/images/artist_meera_thumb.png",
            coverImageUrl: "/images/cat_music.png",
            imageHeightClass: "height-compact"
        },

        // Column 3
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
            imageUrl: "/images/opp_campus_band.png",
            imageHeightClass: "height-medium"
        },
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
            imageHeightClass: "height-compact"
        },
        {
            id: 112,
            type: 'ARTIST',
            name: "Sneha Patil",
            profession: "Writer",
            location: "Mumbai, MH",
            bio: "Poetry, storytelling and scriptwriting.",
            skills: ["Poetry", "Storytelling", "Scriptwriting"],
            followersCount: "1.4K",
            avatarUrl: "/images/avatar_sneha.png",
            coverImageUrl: "/images/opp_content_writer.png",
            imageHeightClass: "height-compact"
        },

        // Column 4
        {
            id: 107,
            type: 'ARTIST',
            name: "Riya Deshmukh",
            profession: "Illustrator",
            location: "Mumbai, MH",
            bio: "Exploring new frontiers in craft and interdisciplinary collaboration.",
            skills: ["Digital Art", "Character Design", "Storytelling"],
            followersCount: "1.4K",
            avatarUrl: "/images/avatar_riya.png",
            coverImageUrl: "/images/artwork_bloom.png",
            imageHeightClass: "height-tall"
        },
        {
            id: 601,
            type: 'COMMUNITY',
            title: "Stories, creations and moments from our community."
        },
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
            imageHeightClass: "height-medium"
        },

        // Column 5
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
            imageHeightClass: "height-tall"
        },
        {
            id: 501,
            type: 'OPPORTUNITY',
            title: "Looking for a Guitarist",
            location: "Navi Mumbai",
            description: "We're a indie band looking for a lead guitarist for upcoming gigs.",
            tags: ["Live Performance", "Indie", "Collaboration"],
            membersCount: "3",
            imageUrl: "/images/guitar_decor.png",
            imageHeightClass: "height-medium"
        },
        {
            id: 809,
            type: 'EVENT',
            title: "Creative Meetup",
            badgeText: "EVENT",
            dateDay: "12",
            dateMonth: "SEP",
            location: "Bandra, Mumbai",
            artForm: "Networking",
            attendeesCount: "28",
            imageUrl: "/images/comm_event_sketching.png",
            imageHeightClass: "height-compact"
        },

        // Column 6
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
            coverImageUrl: "/images/artwork_city_shades.png",
            imageHeightClass: "height-tall"
        },
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
            imageUrl: "/images/comm_event_exhibition.png",
            imageHeightClass: "height-medium"
        }
    ];
}

/**
 * 11. HTML Escape Utility
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
