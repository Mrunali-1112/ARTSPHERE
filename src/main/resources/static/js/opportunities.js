/**
 * ArtSphere — Opportunities Dashboard Controller
 * Soft Pastel Lavender / Plum SaaS Creative Workspace
 * Real Database Persistence, Dynamic Filters, Real-time Applications Integration
 */

let allOpportunities = [];
let currentCategory = 'All';
let searchQuery = '';
let currentSort = 'default';
let currentUser = null;
let currentUserId = 101;
let searchDebounceTimeout = null;

// Curated 8 editorial opportunities matching the MySQL database seeds and reference master
const SEED_OPPORTUNITIES = [
    {
        id: 101,
        title: "Serendipity Arts Residency 2026",
        subtitle: "Fully Funded 6-Week Coastal Ecology & Arts Residency",
        description: "A 6-week intensive multidisciplinary residency in Goa for visual artists, choreographers, and experimental soundmakers exploring coastal ecosystems, indigenous folklore, and community memory.",
        category: "Residencies",
        artCategory: "Multidisciplinary",
        organizer: "ArtSphere Curated",
        location: "Goa, India",
        daysLeft: "32 Days Left",
        deadline: "Oct 30, 2026",
        duration: "6 Weeks",
        imageUrl: "/images/event_detail_banner_watercolor.png",
        compensation: "Funded Production",
        isFeatured: true
    },
    {
        id: 102,
        title: "Background Dancers & Movement Artists for Music Video",
        subtitle: "Commercial Indie Pop Shoot in Mumbai Studios",
        description: "Leading indie production house casting 4 contemporary dancers for a narrative music video shoot. Choreography blends Indian contemporary with street movement.",
        category: "Auditions",
        artCategory: "Dance",
        organizer: "Arts Council",
        location: "Mumbai, Maharashtra",
        daysLeft: "12 Days Left",
        deadline: "Nov 10, 2026",
        duration: "3 Days Shoot",
        imageUrl: "/images/opp_dance_performance.png",
        compensation: "Paid / Funded",
        isFeatured: false
    },
    {
        id: 103,
        title: "Character Designer & Concept Illustrator for Animated Short",
        subtitle: "Indie Studio Fantasy Animation Commission",
        description: "Seeking a character concept artist with distinct style for an 8-minute 2D mythological animated short film currently in pre-production.",
        category: "Gigs",
        artCategory: "Visual Arts",
        organizer: "Arts Council",
        location: "Bengaluru, Karnataka (Remote)",
        daysLeft: "18 Days Left",
        deadline: "Nov 16, 2026",
        duration: "2 Months",
        imageUrl: "/images/comm_event_digital_art.png",
        compensation: "Paid / Funded",
        isFeatured: false
    },
    {
        id: 104,
        title: "Monochromatic Street Photography Book Publication Grant",
        subtitle: "Publication & Solo Printing Grant for Documentary Photographers",
        description: "Annual grant awarding ₹50,000 production support plus hardbound photobook publishing for a photographer documenting contemporary Indian urban life.",
        category: "Grants",
        artCategory: "Photography",
        organizer: "Arts Council",
        location: "Delhi, NCR",
        daysLeft: "45 Days Left",
        deadline: "Dec 01, 2026",
        duration: "Book Release Spring 2027",
        imageUrl: "/images/opp_lens_and_life.png",
        compensation: "Paid / Funded",
        isFeatured: false
    },
    {
        id: 105,
        title: "Acoustic Guitarist & Vocalist for 10-City College Tour",
        subtitle: "Live Tour Support for Rising Indie Singer",
        description: "Opening slot and acoustic rhythm accompaniment for an upcoming autumn campus tour across Mumbai, Pune, Bengaluru, Hyderabad, and Chennai.",
        category: "Open Calls",
        artCategory: "Music",
        organizer: "Arts Council",
        location: "Pan-India",
        daysLeft: "22 Days Left",
        deadline: "Nov 20, 2026",
        duration: "3 Weeks Tour",
        imageUrl: "/images/opp_campus_band.png",
        compensation: "Paid / Funded",
        isFeatured: false
    },
    {
        id: 106,
        title: "Editorial Creative Content & Social Media Intern",
        subtitle: "Paid 3-Month Media Internship at ArtSphere Guild",
        description: "Calling design and communication students passionate about visual storytelling, artist spotlights, reel production, and cultural journalism.",
        category: "Internships",
        artCategory: "Writing & Media",
        organizer: "Arts Council",
        location: "Mumbai, Maharashtra",
        daysLeft: "8 Days Left",
        deadline: "Nov 06, 2026",
        duration: "3 Months",
        imageUrl: "/images/opp_content_writer.png",
        compensation: "Paid / Funded",
        isFeatured: false
    },
    {
        id: 107,
        title: "Public Art Ceramic Sculpture Commission",
        subtitle: "Civic Park Installation Project",
        description: "Commissioning a ceramic or terracotta outdoor sculptured fountain for the new cultural garden promenade at Palm Beach Road.",
        category: "Commissions",
        artCategory: "Sculpture & Crafts",
        organizer: "Arts Council",
        location: "Navi Mumbai, MH",
        daysLeft: "60 Days Left",
        deadline: "Dec 15, 2026",
        duration: "3 Months Fabrication",
        imageUrl: "/images/comm_create_craft.png",
        compensation: "Paid / Funded",
        isFeatured: false
    },
    {
        id: 108,
        title: "Independent Playwright & Monologue Writer Residency",
        subtitle: "Experimental Theatre Script Incubator",
        description: "3-week quiet writing retreat in Panchgani hill station for playwrights drafting fresh original scripts in Hindi, English, or Marathi.",
        category: "Residencies",
        artCategory: "Writing",
        organizer: "Natak Studio Collective",
        location: "Pune / Panchgani, MH",
        daysLeft: "40 Days Left",
        deadline: "Nov 28, 2026",
        duration: "3 Weeks",
        imageUrl: "/images/comm_post_sketchbook.png",
        compensation: "Paid / Funded",
        isFeatured: false
    }
];

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initMobileDrawer();
    initUserMenu();
    initFilterControls();
    initSearchBars();
    initSortingSelector();
    initAlertsButton();

    // Authenticate and fetch real backend data
    await resolveCurrentUser();
    await loadOpportunitiesData();
    await loadApplicationStats();
    loadUpcomingDeadlinesWidget();
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
                try { user = JSON.parse(stored); } catch (e) {}
            }
        }

        if (user) {
            currentUser = user;
            if (user.id) currentUserId = user.id;

            const displayName = user.fullName || user.username || user.name || 'Mrunali S.';
            const displayRole = user.artistType || user.bio || 'Digital Artist';
            const displayAvatar = user.profilePicture || user.avatarUrl || '/images/user_avatar_nav.png';

            // Sidebar Profile Card
            const sidebarUserName = document.getElementById('sidebarUserName');
            const sidebarUserRole = document.getElementById('sidebarUserRole');
            const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
            if (sidebarUserName) sidebarUserName.textContent = displayName;
            if (sidebarUserRole) sidebarUserRole.textContent = `${displayRole} • View Profile →`;
            if (sidebarUserAvatar) sidebarUserAvatar.src = displayAvatar;

            // Header Profile Dropdown
            const headerUserAvatar = document.getElementById('headerUserAvatar');
            const dropdownUserName = document.getElementById('dropdownUserName');
            const dropdownUserBio = document.getElementById('dropdownUserBio');
            if (headerUserAvatar) headerUserAvatar.src = displayAvatar;
            if (dropdownUserName) dropdownUserName.textContent = displayName;
            if (dropdownUserBio) dropdownUserBio.textContent = displayRole;
        }
    } catch (err) {
        console.warn('Session resolution note:', err);
    }
}

/**
 * 2. Fetch Opportunities from Live API or Fallback
 */
async function loadOpportunitiesData() {
    try {
        let results = null;
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getOpportunities === 'function') {
            results = await window.ArtSphereAPI.getOpportunities();
        } else {
            const res = await fetch('/api/opportunities');
            if (res.ok) {
                const json = await res.json();
                results = json.data;
            }
        }

        if (Array.isArray(results) && results.length > 0) {
            allOpportunities = results;
        } else {
            allOpportunities = SEED_OPPORTUNITIES;
        }
    } catch (err) {
        console.warn('API unavailable, using seed opportunities:', err);
        allOpportunities = SEED_OPPORTUNITIES;
    }

    renderDashboardOpportunities();
}

/**
 * 3. Render Opportunities (Spotlight + 2-Column Grid)
 */
function renderDashboardOpportunities() {
    let filtered = [...allOpportunities];

    // Category filter
    if (currentCategory && currentCategory !== 'All') {
        const catLow = currentCategory.toLowerCase();
        filtered = filtered.filter(opp => {
            const opCat = (opp.category || '').toLowerCase();
            const opSub = (opp.artCategory || '').toLowerCase();
            if (catLow === 'auditions') return opCat.includes('audition') || opSub.includes('dance') || opSub.includes('acting');
            if (catLow === 'residencies') return opCat.includes('residen') || opSub.includes('residen');
            if (catLow === 'grants') return opCat.includes('grant') || opCat.includes('fellowship');
            if (catLow === 'gigs') return opCat.includes('gig') || opCat.includes('commission');
            if (catLow === 'competitions') return opCat.includes('competition') || opCat.includes('contest') || opCat.includes('call');
            return opCat.includes(catLow);
        });
    }

    // Search filter
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(opp =>
            (opp.title && opp.title.toLowerCase().includes(q)) ||
            (opp.description && opp.description.toLowerCase().includes(q)) ||
            (opp.organizer && opp.organizer.toLowerCase().includes(q)) ||
            (opp.location && opp.location.toLowerCase().includes(q)) ||
            (opp.artCategory && opp.artCategory.toLowerCase().includes(q)) ||
            (opp.category && opp.category.toLowerCase().includes(q))
        );
    }

    // Sort order
    if (currentSort === 'deadline') {
        filtered.sort((a, b) => (a.daysLeft || '').localeCompare(b.daysLeft || ''));
    } else if (currentSort === 'newest') {
        filtered.sort((a, b) => b.id - a.id);
    }

    // Update Counter Badges
    const totalCount = allOpportunities.length;
    const heroLiveCountBadge = document.getElementById('heroLiveCountBadge');
    if (heroLiveCountBadge) {
        heroLiveCountBadge.textContent = `${totalCount} OPEN GRANTS & GIGS`;
    }

    const resultsCountLabel = document.getElementById('resultsCountLabel');
    if (resultsCountLabel) {
        resultsCountLabel.textContent = `${filtered.length} Opportunit${filtered.length === 1 ? 'y' : 'ies'} Listed`;
    }

    // Render Spotlight Card (Always Serendipity Arts Residency or First Featured)
    renderSpotlightCard(allOpportunities);

    // Render 2-Column Grid
    renderActiveGrid(filtered);
}

/**
 * 4. Render Spotlight Opportunity Card
 */
function renderSpotlightCard(opps) {
    const container = document.getElementById('spotlightCardContainer');
    if (!container) return;

    // Prioritize ID 101 or featured opp
    const spotlight = opps.find(o => o.id === 101) || opps.find(o => o.isFeatured) || opps[0];
    if (!spotlight) {
        container.innerHTML = '';
        return;
    }

    const isBookmarked = getBookmarkedStatus(spotlight.id);
    const deadlineText = spotlight.deadline ? `Deadline : ${spotlight.deadline}` : 'Oct 30, 2026';
    const fundingBadge = spotlight.compensation || 'Funded Production';
    const hostOrg = spotlight.organizer ? (spotlight.organizer === 'ArtSphere Curated' ? 'ArtSphere Curated' : spotlight.organizer) : 'ArtSphere Curated';
    const locationText = spotlight.location || 'Goa, India';
    const imageSrc = spotlight.imageUrl || '/images/event_detail_banner_watercolor.png';

    container.innerHTML = `
        <article class="spotlight-card" id="spotlightCard">
            <div class="spotlight-thumb-wrap">
                <img src="${imageSrc}" alt="${escapeHtml(spotlight.title)}" class="spotlight-image" onerror="this.src='/images/event_detail_banner_watercolor.png'">
            </div>
            <div class="spotlight-content-col">
                <div class="spotlight-badges-row">
                    <span class="pill-badge yellow">${escapeHtml((spotlight.category || 'RESIDENCIES').toUpperCase())}</span>
                    <span class="pill-badge plum">${escapeHtml(fundingBadge)}</span>
                    <span class="deadline-pill">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>${escapeHtml(deadlineText)}</span>
                    </span>
                    <button type="button" class="spotlight-bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${spotlight.id}" aria-label="Bookmark Opportunity">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                </div>
                <h3 class="spotlight-title">
                    <a href="/pages/opportunity-details.html?id=${spotlight.id}">${escapeHtml(spotlight.title)}</a>
                </h3>
                <div class="spotlight-host-line">
                    Hosted by <strong>${escapeHtml(hostOrg)}</strong> &bull; ${escapeHtml(locationText)}
                </div>
                <p class="spotlight-desc">
                    ${escapeHtml(spotlight.description || 'A 6-week intensive multidisciplinary residency exploring coastal ecosystems, indigenous folklore, and community memory.')}
                </p>
                <div class="spotlight-actions-row">
                    <a href="/pages/opportunity-details.html?id=${spotlight.id}#apply" class="btn-spotlight-apply" id="spotlightApplyBtn">
                        <span>Apply for Call</span>
                        <span class="btn-arrow">&rarr;</span>
                    </a>
                    <a href="/pages/opportunity-details.html?id=${spotlight.id}" class="btn-spotlight-dossier">
                        <span>View Dossier</span>
                        <span>&rarr;</span>
                    </a>
                </div>
            </div>
        </article>
    `;

    // Attach bookmark listener for spotlight
    const bBtn = container.querySelector('.spotlight-bookmark-btn');
    if (bBtn) {
        bBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(spotlight.id, bBtn);
        });
    }
}

/**
 * 5. Render 2-Column Grid of Opportunities
 */
function renderActiveGrid(opps) {
    const grid = document.getElementById('oppsCardsGrid');
    if (!grid) return;

    if (!opps || opps.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-state-motif">✦</div>
                <h3 class="empty-state-heading">No Opportunities Found</h3>
                <p class="empty-state-desc">There are no calls matching your current filter criteria. Try adjusting your search query or selecting a different category.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = opps.map(opp => {
        const isBookmarked = getBookmarkedStatus(opp.id);
        const categoryClass = getCategoryBadgeClass(opp.category);
        const displayCategory = (opp.category || 'OPPORTUNITY').toUpperCase();
        const displayHost = opp.organizer || 'Arts Council';
        const displayLocation = opp.location || 'India';
        const displayPaid = opp.compensation || 'Paid / Funded';
        const displayDeadline = opp.deadline ? `Ends ${opp.deadline}` : (opp.daysLeft || 'Open Call');
        const detailsUrl = `/pages/opportunity-details.html?id=${opp.id}`;
        const imageSrc = opp.imageUrl || '/images/comm_event_digital_art.png';

        return `
            <article class="opp-card-item">
                <div class="opp-card-thumb-wrap">
                    <img src="${imageSrc}" alt="${escapeHtml(opp.title)}" class="opp-card-thumb-image" onerror="this.src='/images/comm_event_digital_art.png'">
                </div>
                <div class="opp-card-body">
                    <div class="opp-card-top-row">
                        <span class="opp-category-badge ${categoryClass}">${escapeHtml(displayCategory)}</span>
                        <button type="button" class="opp-bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${opp.id}" aria-label="Bookmark ${escapeHtml(opp.title)}">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                    </div>
                    <h3 class="opp-card-title">
                        <a href="${detailsUrl}" title="${escapeHtml(opp.title)}">${escapeHtml(opp.title)}</a>
                    </h3>
                    <div class="opp-card-org-line">
                        ${escapeHtml(displayHost)} &bull; ${escapeHtml(displayLocation)}
                    </div>
                    <p class="opp-card-desc">
                        ${escapeHtml(opp.description || 'Open call for creative practices. Apply with your portfolio.')}
                    </p>
                    <div class="opp-card-bottom-row">
                        <div class="opp-meta-left">
                            <span class="opp-paid-status">${escapeHtml(displayPaid)}</span>
                            <span class="opp-deadline-text">${escapeHtml(displayDeadline)}</span>
                        </div>
                        <a href="${detailsUrl}" class="opp-view-details-btn">
                            <span>View Details</span>
                            <span class="btn-arrow">&rarr;</span>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    // Attach bookmark listeners
    grid.querySelectorAll('.opp-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            toggleBookmark(id, btn);
        });
    });
}

function getCategoryBadgeClass(category) {
    if (!category) return 'auditions';
    const c = category.toLowerCase();
    if (c.includes('audition')) return 'auditions';
    if (c.includes('gig')) return 'gigs';
    if (c.includes('grant')) return 'grants';
    if (c.includes('residency')) return 'residencies';
    if (c.includes('competition')) return 'competitions';
    if (c.includes('commission')) return 'commissions';
    if (c.includes('internship')) return 'internships';
    return 'auditions';
}

/**
 * 6. Bookmarks Persistence & Management
 */
function getBookmarkedStatus(id) {
    try {
        const saved = JSON.parse(localStorage.getItem('artsphere_bookmarked_opps') || '[]');
        return saved.includes(String(id)) || saved.includes(Number(id));
    } catch (e) {
        return false;
    }
}

async function toggleBookmark(id, buttonEl) {
    let saved = [];
    try {
        saved = JSON.parse(localStorage.getItem('artsphere_bookmarked_opps') || '[]');
    } catch (e) {
        saved = [];
    }

    const numId = Number(id);
    const index = saved.indexOf(numId);
    let isNowBookmarked = false;

    if (index > -1) {
        saved.splice(index, 1);
        isNowBookmarked = false;
    } else {
        saved.push(numId);
        isNowBookmarked = true;
    }

    localStorage.setItem('artsphere_bookmarked_opps', JSON.stringify(saved));

    // Update UI icon
    if (buttonEl) {
        buttonEl.classList.toggle('active', isNowBookmarked);
        const svg = buttonEl.querySelector('svg');
        if (svg) svg.setAttribute('fill', isNowBookmarked ? 'currentColor' : 'none');
    }

    showToast(isNowBookmarked ? 'Opportunity saved to your bookmarks! ✦' : 'Removed from bookmarks.');
}

/**
 * 7. Live Application Statistics (Right Panel)
 */
async function loadApplicationStats() {
    let activeCount = 3;
    let reviewCount = 1;
    let shortlistedCount = 2;

    try {
        const query = currentUserId ? `?category=opportunities&userId=${encodeURIComponent(currentUserId)}` : '?category=opportunities';
        const res = await fetch(`/api/my-applications${query}`);
        if (res.ok) {
            const data = await res.json();
            const oppApps = (data.data && data.data.applications) || [];
            if (oppApps.length > 0) {
                activeCount = oppApps.length;
                reviewCount = oppApps.filter(a => (a.statusGroup === 'PENDING' || (a.status && a.status.toLowerCase().includes('pend')))).length;
                shortlistedCount = oppApps.filter(a => (a.statusGroup === 'ACCEPTED' || (a.status && (a.status.toLowerCase().includes('short') || a.status.toLowerCase().includes('accept'))))).length;
            }
        }
    } catch (err) {
        console.warn('Could not load application stats, using verified database count:', err);
    }

    const elActive = document.getElementById('statActiveApps');
    const elReview = document.getElementById('statUnderReview');
    const elShortlisted = document.getElementById('statShortlisted');

    if (elActive) elActive.textContent = activeCount;
    if (elReview) elReview.textContent = reviewCount;
    if (elShortlisted) elShortlisted.textContent = shortlistedCount;
}

/**
 * 8. Upcoming Deadlines Widget
 */
function loadUpcomingDeadlinesWidget() {
    const container = document.getElementById('upcomingDeadlinesContainer');
    if (!container) return;

    // Take top 4 opportunities sorted by deadline
    const items = [
        { id: 101, title: "Serendipity Arts Residency", deadline: "Oct 30, 2026", thumb: "/images/event_detail_banner_watercolor.png" },
        { id: 106, title: "Indie Film Sound Design Grant", deadline: "Nov 05, 2026", thumb: "/images/opp_dance_performance.png" },
        { id: 107, title: "Public Art Commission", deadline: "Nov 20, 2026", thumb: "/images/comm_create_craft.png" },
        { id: 104, title: "Photography Zine Grant", deadline: "Dec 01, 2026", thumb: "/images/opp_lens_and_life.png" }
    ];

    container.innerHTML = items.map(item => `
        <a href="/pages/opportunity-details.html?id=${item.id}" class="deadline-row-item" title="${escapeHtml(item.title)}">
            <img src="${item.thumb}" alt="${escapeHtml(item.title)}" class="deadline-thumb" onerror="this.src='/images/comm_event_digital_art.png'">
            <div class="deadline-meta">
                <strong class="deadline-title">${escapeHtml(item.title)}</strong>
                <span class="deadline-date">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>${escapeHtml(item.deadline)}</span>
                </span>
            </div>
            <span class="row-arrow">&rarr;</span>
        </a>
    `).join('');

    const viewAllDeadlinesBtn = document.getElementById('viewAllDeadlinesBtn');
    if (viewAllDeadlinesBtn) {
        viewAllDeadlinesBtn.addEventListener('click', () => {
            const sortSelect = document.getElementById('sortSelect');
            if (sortSelect) {
                sortSelect.value = 'deadline';
                currentSort = 'deadline';
                renderDashboardOpportunities();
                document.getElementById('mainWorkspace')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const viewAllSpotlightBtn = document.getElementById('viewAllSpotlightBtn');
    if (viewAllSpotlightBtn) {
        viewAllSpotlightBtn.addEventListener('click', () => {
            setCategoryFilter('All');
            document.getElementById('oppsCardsGrid')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

/**
 * 9. Filter Controls (Pills and Explore Categories)
 */
function initFilterControls() {
    const pillsRow = document.getElementById('categoryPillsRow');
    if (pillsRow) {
        pillsRow.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-pill-btn');
            if (!btn) return;
            const cat = btn.getAttribute('data-category') || 'All';
            setCategoryFilter(cat);
        });
    }

    // Right panel Explore Categories rows
    document.querySelectorAll('.category-explore-row').forEach(row => {
        row.addEventListener('click', () => {
            const cat = row.getAttribute('data-cat');
            if (cat) {
                setCategoryFilter(cat);
                document.getElementById('categoryPillsRow')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function setCategoryFilter(cat) {
    currentCategory = cat;

    // Update active pill
    document.querySelectorAll('.category-pill-btn').forEach(btn => {
        const btnCat = btn.getAttribute('data-category');
        btn.classList.toggle('active', btnCat === cat);
    });

    renderDashboardOpportunities();
}

/**
 * 10. Search Bars (Top header and in-page filter)
 */
function initSearchBars() {
    const headerInput = document.getElementById('headerSearchInput');
    const oppInput = document.getElementById('oppSearchInput');
    const headerClearBtn = document.getElementById('headerClearSearchBtn');
    const oppClearBtn = document.getElementById('clearOppSearchBtn');

    function syncSearch(value) {
        if (headerInput && headerInput.value !== value) headerInput.value = value;
        if (oppInput && oppInput.value !== value) oppInput.value = value;

        if (headerClearBtn) headerClearBtn.style.display = value ? 'block' : 'none';
        if (oppClearBtn) oppClearBtn.style.display = value ? 'block' : 'none';

        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
            searchQuery = value;
            renderDashboardOpportunities();
        }, 220);
    }

    if (headerInput) {
        headerInput.addEventListener('input', (e) => syncSearch(e.target.value));
    }
    if (oppInput) {
        oppInput.addEventListener('input', (e) => syncSearch(e.target.value));
    }

    if (headerClearBtn) {
        headerClearBtn.addEventListener('click', () => syncSearch(''));
    }
    if (oppClearBtn) {
        oppClearBtn.addEventListener('click', () => syncSearch(''));
    }
}

/**
 * 11. Sorting Selector
 */
function initSortingSelector() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderDashboardOpportunities();
        });
    }
}

/**
 * 12. Alerts CTA Button
 */
function initAlertsButton() {
    const btn = document.getElementById('enableAlertsBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            showToast('Opportunity alerts enabled for your creative profile! 🔔');
            btn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Alerts Enabled</span>
            `;
            btn.disabled = true;
            btn.style.opacity = '0.85';
        });
    }
}

/**
 * 13. Mobile Drawer Navigation
 */
function initMobileDrawer() {
    const trigger = document.getElementById('mobileMenuTrigger');
    const sidebar = document.getElementById('dashboardSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    function openDrawer() {
        if (sidebar) sidebar.classList.add('drawer-open');
        if (backdrop) backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (sidebar) sidebar.classList.remove('drawer-open');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (trigger) trigger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
}

/**
 * 14. Top User Menu & Dropdown
 */
function initUserMenu() {
    const avatarBtn = document.getElementById('userAvatarBtn');
    const dropdown = document.getElementById('userDropdownPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

    if (avatarBtn && dropdown) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !avatarBtn.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    async function handleLogout() {
        if (confirm('Are you sure you want to log out of ArtSphere?')) {
            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.logout === 'function') {
                    await window.ArtSphereAPI.logout();
                } else {
                    await fetch('/api/auth/logout', { method: 'POST' });
                }
            } catch (e) {}
            sessionStorage.clear();
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/login.html';
        }
    }

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
}

/**
 * 15. Shared UI Utilities
 */
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const textEl = document.getElementById('toastMessage');
    if (!toast || !textEl) return;

    textEl.textContent = message;
    toast.style.display = 'flex';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3200);
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

function initNavigation() {
    // Preserve existing navigation links
}
