/**
 * ArtSphere – Opportunities Page Logic
 * Source of Truth: Approved page_11.jpg UI Reference
 */

document.addEventListener('DOMContentLoaded', () => {
    let currentCategory = 'All';
    let currentSearch = '';
    let searchTimeout = null;

    // DOM Elements
    const categoriesScroll = document.getElementById('categoriesScroll');
    const categoryButtons = document.querySelectorAll('.opp-cat-pill');
    const searchInput = document.getElementById('oppSearchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const featuredContainer = document.getElementById('featuredOppContainer');
    const latestContainer = document.getElementById('latestOppsContainer');
    const userMenuWrapper = document.getElementById('userMenuWrapper');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    // 1. Initialize
    initUserMenu();
    setupCategoryFilters();
    setupSearch();
    loadOpportunities(currentCategory, currentSearch);

    // -------------------------------------------------------------
    // Category Filtering
    // -------------------------------------------------------------
    function setupCategoryFilters() {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.getAttribute('data-category');
                loadOpportunities(currentCategory, currentSearch);
            });
        });
    }

    // -------------------------------------------------------------
    // Search Handling
    // -------------------------------------------------------------
    function setupSearch() {
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            currentSearch = val;

            if (val.length > 0) {
                searchClearBtn.style.display = 'block';
            } else {
                searchClearBtn.style.display = 'none';
            }

            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadOpportunities(currentCategory, currentSearch);
            }, 300);
        });

        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentSearch = '';
                searchClearBtn.style.display = 'none';
                searchInput.focus();
                loadOpportunities(currentCategory, currentSearch);
            });
        }
    }

    // -------------------------------------------------------------
    // Load Opportunities Data
    // -------------------------------------------------------------
    async function loadOpportunities(category, search) {
        showLoadingState();

        try {
            const opps = await ArtSphereAPI.getOpportunities(category, null, search);
            renderOpportunities(opps);
        } catch (error) {
            console.error('Failed to load opportunities:', error);
            showErrorState('Unable to load opportunities at this moment. Please try again.');
        }
    }

    function showLoadingState() {
        if (featuredContainer) {
            featuredContainer.innerHTML = '<div class="card-loading-shimmer"></div>';
        }
        if (latestContainer) {
            latestContainer.innerHTML = `
                <div class="card-loading-shimmer"></div>
                <div class="card-loading-shimmer" style="margin-top: 14px;"></div>
            `;
        }
    }

    function showErrorState(msg) {
        const errorHtml = `<div class="opp-empty-state"><p>${msg}</p></div>`;
        if (featuredContainer) featuredContainer.innerHTML = errorHtml;
        if (latestContainer) latestContainer.innerHTML = '';
    }

    // -------------------------------------------------------------
    // Render Opportunities
    // -------------------------------------------------------------
    function renderOpportunities(opps) {
        if (!opps || opps.length === 0) {
            const emptyHtml = `
                <div class="opp-empty-state">
                    <p style="font-weight: 600; font-size: 1rem; margin-bottom: 6px;">No opportunities found</p>
                    <p style="font-size: 0.85rem;">Try selecting a different category or clearing your search.</p>
                </div>
            `;
            if (featuredContainer) featuredContainer.innerHTML = '';
            document.getElementById('featuredSection').style.display = 'none';
            if (latestContainer) latestContainer.innerHTML = emptyHtml;
            return;
        }

        document.getElementById('featuredSection').style.display = 'block';

        // Separate featured opportunity
        let featured = opps.find(o => o.featured);
        let latestList = opps;

        // If a specific category is active (e.g. not 'All'), or search is active:
        // We can display the first item as featured if none explicitly marked featured in filtered subset
        if (!featured && opps.length > 0) {
            featured = opps[0];
            latestList = opps.slice(1);
        } else if (featured) {
            latestList = opps.filter(o => o.id !== featured.id);
        }

        // 1. Render Featured Card
        if (featured && featuredContainer) {
            featuredContainer.innerHTML = createCardHtml(featured, true);
        } else if (featuredContainer) {
            document.getElementById('featuredSection').style.display = 'none';
        }

        // 2. Render Latest Cards List
        if (latestContainer) {
            if (latestList.length === 0) {
                latestContainer.innerHTML = `
                    <div class="opp-empty-state">
                        <p style="font-size: 0.88rem;">No more opportunities in this category.</p>
                    </div>
                `;
            } else {
                latestContainer.innerHTML = latestList.map(opp => createCardHtml(opp, false)).join('');
            }
        }

        // Attach event listeners for bookmark buttons
        attachBookmarkEvents();
    }

    // -------------------------------------------------------------
    // Create HTML for a single opportunity card
    // -------------------------------------------------------------
    function createCardHtml(opp, isFeaturedCard) {
        const categoryBadge = (opp.category || 'Audition').toUpperCase();
        const artCategory = opp.artCategory || 'Music';
        const daysLeft = opp.daysLeft || '5 days left';
        const location = opp.location || 'Mumbai, MH';

        // Art form icon SVG
        const artIconSvg = getArtCategoryIcon(artCategory);

        return `
            <article class="opportunity-card" onclick="window.location.href='/pages/opportunity-details.html?id=${opp.id}'">
                <div class="card-thumb-wrapper">
                    <img src="${opp.imageUrl}" alt="${escapeHtml(opp.title)}" class="card-thumb-img" onerror="this.src='/images/opp_campus_band.png'">
                    <span class="card-category-badge">${categoryBadge}</span>
                </div>

                <div class="card-content">
                    <div class="card-top-row">
                        <h3 class="card-title" title="${escapeHtml(opp.title)}">${escapeHtml(opp.title)}</h3>
                        <p class="card-organizer">${escapeHtml(opp.organizer || 'ArtSphere Organizer')}</p>
                    </div>

                    <button class="card-bookmark-btn ${opp.bookmarked ? 'active' : ''}" data-id="${opp.id}" aria-label="Bookmark Opportunity" onclick="event.stopPropagation();">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="${opp.bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>

                    <div class="card-bottom-row">
                        <div class="card-meta-tags">
                            <span class="meta-chip">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                ${escapeHtml(daysLeft)}
                            </span>

                            <span class="meta-chip">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                ${escapeHtml(location)}
                            </span>

                            <span class="meta-chip">
                                ${artIconSvg}
                                ${escapeHtml(artCategory)}
                            </span>
                        </div>

                        <a href="/pages/opportunity-details.html?id=${opp.id}" class="card-view-btn" onclick="event.stopPropagation();">
                            <span>View Details</span>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    function getArtCategoryIcon(artCat) {
        const lower = (artCat || '').toLowerCase();
        if (lower.includes('music')) {
            return `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            `;
        } else if (lower.includes('photo')) {
            return `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                </svg>
            `;
        } else if (lower.includes('dance')) {
            return `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="5" r="2"></circle>
                    <path d="M10 22l4-8 3 3"></path>
                    <path d="M7 11l5-4 5 4"></path>
                </svg>
            `;
        } else if (lower.includes('writing')) {
            return `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                </svg>
            `;
        } else {
            // Visual Arts / default palette icon
            return `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path>
                </svg>
            `;
        }
    }

    // -------------------------------------------------------------
    // Bookmark Toggle Interaction
    // -------------------------------------------------------------
    function attachBookmarkEvents() {
        document.querySelectorAll('.card-bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.classList.toggle('active');
                const svg = btn.querySelector('svg');
                if (btn.classList.contains('active')) {
                    svg.setAttribute('fill', 'currentColor');
                } else {
                    svg.setAttribute('fill', 'none');
                }
            });
        });
    }

    // -------------------------------------------------------------
    // Header User Menu & Logout
    // -------------------------------------------------------------
    function initUserMenu() {
        if (userMenuWrapper && userDropdownMenu) {
            userMenuWrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdownMenu.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                userDropdownMenu.classList.remove('show');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to log out?')) {
                    await ArtSphereAPI.logout();
                }
            });
        }
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
});
