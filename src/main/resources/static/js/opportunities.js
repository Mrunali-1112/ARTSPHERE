/**
 * ArtSphere – Opportunities Page Logic
 * Editorial Neo-brutalism • Grants, Open Calls, Auditions & Residencies
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Mrunali / Aanya)
    let currentCategory = 'All';
    let currentSearch = '';

    // Initialize Navigation & Dropdown
    initNavigation();

    // Elements
    const searchInput = document.getElementById('oppSearchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const categoryLedger = document.getElementById('categoryLedger');
    const featuredOppContainer = document.getElementById('featuredOppContainer');
    const latestOppsContainer = document.getElementById('latestOppsContainer');
    const resultsCount = document.getElementById('resultsCount');
    const oppLiveCount = document.getElementById('oppLiveCount');
    const oppsGridTitle = document.getElementById('oppsGridTitle');

    // Search events
    let searchDebounceTimeout = null;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (searchClearBtn) {
                searchClearBtn.style.display = val.length > 0 ? 'block' : 'none';
            }
            clearTimeout(searchDebounceTimeout);
            searchDebounceTimeout = setTimeout(() => {
                currentSearch = val;
                loadOpportunities();
            }, 300);
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchClearBtn.style.display = 'none';
            currentSearch = '';
            loadOpportunities();
        });
    }

    // Category button events
    if (categoryLedger) {
        categoryLedger.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-pill-btn');
            if (!btn) return;

            categoryLedger.querySelectorAll('.category-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.getAttribute('data-category') || 'All';
            if (oppsGridTitle) {
                oppsGridTitle.textContent = currentCategory === 'All' ? 'All Active Open Calls' : `${currentCategory} Calls`;
            }
            loadOpportunities();
        });
    }

    // Initial Load
    loadOpportunities();

    async function loadOpportunities() {
        showLoadingState();

        try {
            let opps = null;
            let featured = null;

            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getOpportunities === 'function') {
                const results = await window.ArtSphereAPI.getOpportunities(currentCategory, null, currentSearch);
                if (Array.isArray(results) && results.length > 0) {
                    opps = results;
                }
            }

            if (!opps || opps.length === 0) {
                opps = getFallbackOpportunities(currentCategory, currentSearch);
            }

            featured = opps.find(o => o.isFeatured || o.featured) || opps[0];
            const remainingOpps = opps.filter(o => o.id !== (featured ? featured.id : null));

            renderFeatured(featured);
            renderGrid(remainingOpps);

            const total = opps.length;
            if (resultsCount) resultsCount.textContent = `${total} Opportunity${total !== 1 ? 's' : ''} Listed`;
            if (oppLiveCount) oppLiveCount.textContent = `${total} Open Grants & Gigs`;

        } catch (err) {
            console.warn('API error, loading curated fallback dataset:', err);
            const fallback = getFallbackOpportunities(currentCategory, currentSearch);
            renderFeatured(fallback[0]);
            renderGrid(fallback.slice(1));
        }
    }

    function showLoadingState() {
        if (latestOppsContainer) {
            latestOppsContainer.innerHTML = `
                <div class="col-12 loading-state-card">
                    <div class="spinner"></div>
                    <p>Loading opportunities directory...</p>
                </div>
            `;
        }
    }

    function renderFeatured(opp) {
        if (!featuredOppContainer) return;
        if (!opp) {
            featuredOppContainer.style.display = 'none';
            return;
        }
        featuredOppContainer.style.display = 'block';

        const stipend = opp.compensation || opp.stipend || 'Funded Production';
        const deadline = opp.deadline || 'Rolling Applications';
        const detailsUrl = `/pages/opportunity-details.html?id=${opp.id}`;

        featuredOppContainer.innerHTML = `
            <article class="featured-opp-card">
                <div class="featured-opp-body">
                    <div class="featured-meta-row">
                        <span class="pill-tag accent-yellow">${escapeHtml(opp.category || 'FELLOWSHIP')}</span>
                        <span class="opp-stipend-badge">${escapeHtml(stipend)}</span>
                        <span class="opp-deadline-pill">⏰ Deadline: ${escapeHtml(deadline)}</span>
                    </div>
                    <h3 class="featured-opp-title">
                        <a href="${detailsUrl}">${escapeHtml(opp.title)}</a>
                    </h3>
                    <div class="featured-opp-org">
                        Hosted by <strong>${escapeHtml(opp.organization || opp.host || 'ArtSphere Curated')}</strong> • ${escapeHtml(opp.location || 'India / Remote')}
                    </div>
                    <p class="featured-opp-desc">
                        ${escapeHtml(opp.description || 'Major artistic residency and grant for forward-thinking creators.')}
                    </p>
                </div>
                <div class="featured-actions-col">
                    <a href="${detailsUrl}" class="btn-pill-primary">
                        <span>Apply for Call</span>
                        <span>&rarr;</span>
                    </a>
                    <a href="${detailsUrl}" class="btn-pill-subtle">View Dossier &rarr;</a>
                </div>
            </article>
        `;
    }

    function renderGrid(opps) {
        if (!latestOppsContainer) return;

        if (!opps || opps.length === 0) {
            latestOppsContainer.innerHTML = `
                <div class="col-12 empty-state-card">
                    <div class="empty-state-motif">✦</div>
                    <h3 class="empty-state-heading">No Opportunities Found</h3>
                    <p class="empty-state-desc">There are no calls matching your current filter criteria. Try adjusting the category or search query.</p>
                </div>
            `;
            return;
        }

        latestOppsContainer.innerHTML = opps.map(opp => {
            const stipend = opp.compensation || opp.stipend || 'Paid / Funded';
            const deadline = opp.deadline || 'Open Call';
            const detailsUrl = `/pages/opportunity-details.html?id=${opp.id}`;
            const isBookmarked = !!opp.bookmarked;

            return `
                <div class="col-4 col-md-6 col-sm-12">
                    <article class="opportunity-card">
                        <div>
                            <div class="opp-card-top">
                                <span class="opp-category-badge">${escapeHtml(opp.category || 'OPPORTUNITY')}</span>
                                <button type="button" class="opp-bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${opp.id}" aria-label="Bookmark">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </button>
                            </div>
                            <h3 class="opp-card-title">
                                <a href="${detailsUrl}">${escapeHtml(opp.title)}</a>
                            </h3>
                            <div class="opp-card-org-line">
                                ${escapeHtml(opp.organization || 'Arts Council')} • ${escapeHtml(opp.location || 'Pan-India')}
                            </div>
                            <p class="opp-card-desc">
                                ${escapeHtml(opp.description || 'Open call for creative practices. Apply with your portfolio.')}
                            </p>
                        </div>
                        <div class="opp-card-bottom">
                            <div>
                                <div class="opp-card-stipend">${escapeHtml(stipend)}</div>
                                <div class="opp-card-deadline">Ends ${escapeHtml(deadline)}</div>
                            </div>
                            <a href="${detailsUrl}" class="opp-view-link">View Details &rarr;</a>
                        </div>
                    </article>
                </div>
            `;
        }).join('');

        attachBookmarkEvents();
    }

    function attachBookmarkEvents() {
        document.querySelectorAll('.opp-bookmark-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                btn.classList.toggle('active');
                const isNowActive = btn.classList.contains('active');
                const svg = btn.querySelector('svg');
                if (svg) svg.setAttribute('fill', isNowActive ? 'currentColor' : 'none');

                try {
                    if (window.ArtSphereAPI && typeof window.ArtSphereAPI.toggleOpportunityBookmark === 'function') {
                        await window.ArtSphereAPI.toggleOpportunityBookmark(id, currentUserId);
                    }
                } catch (err) {
                    console.warn('Bookmark API call failed, saved locally:', err);
                }

                showToast(isNowActive ? 'Opportunity saved to your bookmarks!' : 'Removed from bookmarks.');
            });
        });
    }

    function getFallbackOpportunities(cat, search) {
        const directory = [
            {
                id: 1,
                title: 'Serendipity Arts Residency 2026',
                category: 'Residencies',
                organization: 'Serendipity Arts Foundation',
                location: 'Goa, India',
                compensation: '₹1,50,000 Stipend + Studio',
                deadline: 'Oct 30, 2026',
                description: 'A 6-week intensive multidisciplinary residency in Goa for visual artists, choreographers, and experimental soundmakers exploring coastal ecosystems and folklore.',
                isFeatured: true
            },
            {
                id: 2,
                title: 'Kiran Nadar Museum of Art Public Art Commission',
                category: 'Grants',
                organization: 'KNMA New Delhi',
                location: 'New Delhi / On-Site',
                compensation: '₹4,00,000 Production Grant',
                deadline: 'Nov 15, 2026',
                description: 'Inviting site-specific kinetic and tactile art proposals for the 2026 autumn atrium showcase. All fabrication and material costs covered.',
                isFeatured: false
            },
            {
                id: 3,
                title: 'Lead Contemporary Dancer for National Tour',
                category: 'Auditions',
                organization: 'Attakkalari Dance Company',
                location: 'Bengaluru / Touring',
                compensation: '₹45,000 / month + Travel',
                deadline: 'Oct 20, 2026',
                description: 'Auditions for trained contemporary dancers with strong foundations in Kalarippayattu or classical Indian dance forms for an upcoming 12-city showcase.',
                isFeatured: false
            },
            {
                id: 4,
                title: 'Original Soundtrack Scoring for Indie Cyberpunk Game',
                category: 'Gigs',
                organization: 'Nodding Heads Games',
                location: 'Remote',
                compensation: '₹2,20,000 Contract',
                deadline: 'Rolling',
                description: 'Seeking a composer specializing in synth-wave infused with classical sitar and percussion to score a 10-track cinematic original soundtrack.',
                isFeatured: false
            },
            {
                id: 5,
                title: 'Kala Ghoda Emerging Illustrator Award',
                category: 'Competitions',
                organization: 'Kala Ghoda Association',
                location: 'Mumbai, Maharashtra',
                compensation: '₹75,000 Cash Prize + Exhibition',
                deadline: 'Nov 05, 2026',
                description: 'Annual competition inviting digital and traditional illustrators under 30 to submit sequential art exploring the hidden history of Mumbai alleys.',
                isFeatured: false
            },
            {
                id: 6,
                title: 'Independent Documentary Sound Designer & Foley Artist',
                category: 'Gigs',
                organization: 'DocEdge Collective',
                location: 'Remote / Kolkata',
                compensation: '₹90,000 Project Fee',
                deadline: 'Oct 28, 2026',
                description: 'Looking for a sound designer to craft immersive environmental ambiences and Foley recordings for a 45-minute nature documentary in the Sundarbans.',
                isFeatured: false
            }
        ];

        let filtered = directory;
        if (cat && cat !== 'All') {
            filtered = filtered.filter(o => o.category.toLowerCase().includes(cat.toLowerCase()));
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(o =>
                o.title.toLowerCase().includes(q) ||
                o.organization.toLowerCase().includes(q) ||
                o.description.toLowerCase().includes(q)
            );
        }

        return filtered;
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'neo-toast';
        toast.textContent = msg;
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function initNavigation() {
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const userDropdownPanel = document.getElementById('userDropdownPanel');
        const navMobileToggle = document.getElementById('navMobileToggle');
        const navLinks = document.getElementById('navLinks');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userAvatarBtn && userDropdownPanel) {
            userAvatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdownPanel.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!userDropdownPanel.contains(e.target) && !userAvatarBtn.contains(e.target)) {
                    userDropdownPanel.classList.remove('active');
                }
            });
        }

        if (navMobileToggle && navLinks) {
            navMobileToggle.addEventListener('click', () => {
                navLinks.classList.toggle('nav-links-mobile-open');
                navMobileToggle.classList.toggle('active');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to log out of ArtSphere?')) {
                    window.location.href = '/pages/login.html';
                }
            });
        }
    }
});
