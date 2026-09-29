/**
 * ArtSphere – Portfolio / Discover Archive Module
 * Pastel-Purple Creative Community Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. URL Context & State
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('id') ? parseInt(urlParams.get('id'), 10) : 101;
    let currentCategory = 'All';
    let searchQuery = '';
    let allArtworks = [];

    // Fallback artworks matching backend seeded data & UI reference
    const FALLBACK_ARTWORKS = [
        {
            id: 211,
            title: "Sunlit",
            description: "Digital portrait illustration exploring sunlight and calm expressions.",
            category: "Digital Art",
            imageUrl: "/images/artwork_sunlit.png",
            year: "2026",
            likes: 12
        },
        {
            id: 212,
            title: "Beyond the Hills",
            description: "Lush mountainous landscape with sunset clouds and pine forests.",
            category: "Paintings",
            imageUrl: "/images/artwork_beyond_the_hills.png",
            year: "2026",
            likes: 19
        },
        {
            id: 213,
            title: "Curious",
            description: "Golden sunlit portrait of a domestic tabby feline.",
            category: "Photography",
            imageUrl: "/images/artwork_curious.png",
            year: "2026",
            likes: 26
        },
        {
            id: 214,
            title: "Still",
            description: "Morning sunlight casting floral shadows in glass vase.",
            category: "Digital Art",
            imageUrl: "/images/artwork_still.png",
            year: "2026",
            likes: 33
        },
        {
            id: 215,
            title: "City Shades",
            description: "Architectural shadow play and street lamp geometry.",
            category: "Photography",
            imageUrl: "/images/artwork_city_shades.png",
            year: "2026",
            likes: 40
        },
        {
            id: 216,
            title: "Bloom",
            description: "Floral hair portrait celebrating spring warmth.",
            category: "Illustrations",
            imageUrl: "/images/artwork_bloom.png",
            year: "2026",
            likes: 47
        },
        {
            id: 217,
            title: "Evening Calm",
            description: "Waves rolling gently along dusk shoreline under radiant sunset.",
            category: "Photography",
            imageUrl: "/images/artwork_evening_calm.png",
            year: "2026",
            likes: 54
        },
        {
            id: 218,
            title: "Thoughts",
            description: "Introspective pencil and ink portrait study.",
            category: "Illustrations",
            imageUrl: "/images/artwork_thoughts.png",
            year: "2026",
            likes: 61
        },
        {
            id: 219,
            title: "A Better Day",
            description: "Cozy café interior with typography art wall.",
            category: "Digital Art",
            imageUrl: "/images/artwork_a_better_day.png",
            year: "2026",
            likes: 68
        }
    ];

    // DOM Elements
    const btnBackToProfile = document.getElementById('btnBackToProfile');
    const breadcrumbArtistName = document.getElementById('breadcrumbArtistName');
    const portfolioPageTitle = document.getElementById('portfolioPageTitle');
    const portfolioPageSubtitle = document.getElementById('portfolioPageSubtitle');
    const worksCountBadge = document.getElementById('worksCountBadge');
    const btnAddWork = document.getElementById('btnAddWork');
    const categoryFilterLedger = document.getElementById('categoryFilterLedger');
    const portfolioCardsGrid = document.getElementById('portfolioCardsGrid');
    const topHeaderSearchInput = document.getElementById('topHeaderSearchInput');

    // Modals
    const artworkModal = document.getElementById('artworkModal');
    const closeArtworkModal = document.getElementById('closeArtworkModal');
    const cancelArtworkBtn = document.getElementById('cancelArtworkBtn');
    const artworkForm = document.getElementById('artworkForm');

    const artworkLightboxModal = document.getElementById('artworkLightboxModal');
    const closeLightboxModal = document.getElementById('closeLightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCategory = document.getElementById('lightboxCategory');
    const lightboxYear = document.getElementById('lightboxYear');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxLikeBtn = document.getElementById('lightboxLikeBtn');
    const lightboxLikeCount = document.getElementById('lightboxLikeCount');

    let currentActiveLightboxArt = null;

    // 2. Initialize Navigation & Session
    initNavigationAndSession();

    // 3. Setup Back to Profile Link
    if (btnBackToProfile) {
        btnBackToProfile.href = `/pages/artist-profile.html?id=${artistId}`;
    }

    // 4. Load Data
    loadArtistHeader();
    loadPortfolio();

    // 5. Check URL ?action=add
    if (urlParams.get('action') === 'add') {
        openAddModal();
    }

    // 6. Category Filter Ledger Handler
    if (categoryFilterLedger) {
        categoryFilterLedger.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-pill-btn');
            if (!btn) return;

            categoryFilterLedger.querySelectorAll('.filter-pill-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            currentCategory = btn.getAttribute('data-category') || 'All';
            filterAndRender();
        });
    }

    // 7. Top Header Real-time Search Handler
    if (topHeaderSearchInput) {
        topHeaderSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            filterAndRender();
        });
    }

    // -------------------------------------------------------------
    // Data Loading Functions
    // -------------------------------------------------------------
    async function loadArtistHeader() {
        let artistName = (artistId === 101) ? "Aanya Deshmukh" : "Artist";
        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getArtistProfile === 'function') {
                const artist = await window.ArtSphereAPI.getArtistProfile(artistId);
                if (artist && (artist.fullName || artist.name)) {
                    artistName = artist.fullName || artist.name;
                }
            }
        } catch (e) {
            console.info('Using default artist profile title:', e);
        }

        if (breadcrumbArtistName) {
            breadcrumbArtistName.textContent = `Back to ${artistName}'s Profile`;
        }
        if (portfolioPageTitle) {
            portfolioPageTitle.textContent = `${artistName}'s Portfolio Archive`;
        }
        if (portfolioPageSubtitle) {
            portfolioPageSubtitle.textContent = `Curated visual works and experiments by ${artistName}.`;
        }
    }

    async function loadPortfolio() {
        if (!portfolioCardsGrid) return;

        portfolioCardsGrid.innerHTML = `
            <div class="portfolio-loading-card">
                <div class="dash-spinner"></div>
                <p>Loading curated archive pieces...</p>
            </div>
        `;

        try {
            let artworks = null;
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getArtistPortfolio === 'function') {
                const list = await window.ArtSphereAPI.getArtistPortfolio(artistId);
                if (Array.isArray(list) && list.length > 0) {
                    artworks = list.map((art, idx) => ({
                        id: art.id,
                        title: art.title,
                        description: art.description,
                        category: art.category,
                        imageUrl: art.imageUrl,
                        year: art.year || '2026',
                        likes: (art.likes !== undefined && art.likes !== null) ? art.likes : (12 + (idx * 7))
                    }));
                }
            }

            if (!artworks || artworks.length === 0) {
                artworks = FALLBACK_ARTWORKS;
            }

            allArtworks = artworks;
            filterAndRender();

        } catch (err) {
            console.warn('Backend API portfolio fetch failed, using fallback:', err);
            allArtworks = FALLBACK_ARTWORKS;
            filterAndRender();
        }
    }

    // -------------------------------------------------------------
    // Filtering & Rendering
    // -------------------------------------------------------------
    function matchesCategory(art, filterCat) {
        if (!filterCat || filterCat === 'All') return true;
        const cat = (art.category || '').toLowerCase();
        const desc = (art.description || '').toLowerCase();
        const filter = filterCat.toLowerCase();

        if (filter === 'digital art' || filter === 'digital painting') {
            return cat.includes('digital');
        }
        if (filter === 'illustrations' || filter === 'illustration') {
            return cat.includes('illustration');
        }
        if (filter === 'concept art' || filter === 'concept') {
            return cat.includes('concept');
        }
        if (filter === 'paintings' || filter === 'gouache & traditional' || filter === 'traditional') {
            return cat.includes('paint') || cat.includes('gouache') || cat.includes('traditional');
        }
        if (filter === 'photography' || filter === 'photo') {
            return cat.includes('photo');
        }
        if (filter === 'sketches' || filter === 'studies & sketches') {
            return cat.includes('sketch') || cat.includes('study') || desc.includes('study') || desc.includes('sketch');
        }
        return cat.includes(filter);
    }

    function filterAndRender() {
        let items = allArtworks;

        // Apply category filter
        if (currentCategory && currentCategory !== 'All') {
            items = items.filter(a => matchesCategory(a, currentCategory));
        }

        // Apply search query
        if (searchQuery) {
            items = items.filter(a =>
                (a.title && a.title.toLowerCase().includes(searchQuery)) ||
                (a.category && a.category.toLowerCase().includes(searchQuery)) ||
                (a.description && a.description.toLowerCase().includes(searchQuery))
            );
        }

        // Update works badge
        if (worksCountBadge) {
            worksCountBadge.textContent = `${items.length} ARTWORK${items.length !== 1 ? 'S' : ''}`;
        }

        renderGrid(items);
    }

    function renderGrid(items) {
        if (!portfolioCardsGrid) return;

        if (!items || items.length === 0) {
            portfolioCardsGrid.innerHTML = `
                <div class="portfolio-empty-card">
                    <div class="empty-state-motif">✦</div>
                    <h3 class="empty-state-heading">No Artworks Found</h3>
                    <p class="empty-state-desc">No portfolio items matched your current filter or search criteria. Try choosing another category or clearing search.</p>
                </div>
            `;
            return;
        }

        portfolioCardsGrid.innerHTML = items.map((art, idx) => {
            const likes = (art.likes !== undefined && art.likes !== null) ? art.likes : (12 + (idx * 7));
            const categoryDisplay = (art.category || 'Digital Art').toUpperCase();
            const yearDisplay = art.year || '2026';
            const imgUrl = art.imageUrl || '/images/artwork_sunlit.png';

            return `
                <article class="portfolio-art-card" data-id="${art.id}">
                    <div class="art-media-frame" onclick="window.openLightbox(${art.id})">
                        <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(art.title)}" class="art-display-img" onerror="this.src='/images/artwork_sunlit.png'">
                        <button type="button" class="art-more-btn" aria-label="Artwork Actions" title="Artwork Options" onclick="event.stopPropagation(); window.handleCardMenu(event, ${art.id})">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="5" cy="12" r="2"></circle>
                                <circle cx="12" cy="12" r="2"></circle>
                                <circle cx="19" cy="12" r="2"></circle>
                            </svg>
                        </button>
                    </div>
                    <div class="art-info-body">
                        <div class="art-top-tags-row">
                            <span class="art-category-tag">${escapeHtml(categoryDisplay)}</span>
                            <span class="art-year-text">${escapeHtml(yearDisplay)}</span>
                        </div>
                        <h3 class="art-card-title">${escapeHtml(art.title)}</h3>
                        <p class="art-card-desc">${escapeHtml(art.description || 'Curated study exploring color, texture, and light narrative.')}</p>
                        
                        <div class="art-card-footer">
                            <button type="button" class="art-like-btn" data-id="${art.id}" onclick="event.stopPropagation(); window.toggleLike(this)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span class="like-counter">${likes}</span>
                            </button>
                            <span class="art-expand-link" onclick="window.openLightbox(${art.id})">
                                Inspect Piece &rarr;
                            </span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    // -------------------------------------------------------------
    // Artwork Interaction Handlers
    // -------------------------------------------------------------
    window.toggleLike = function(btn) {
        btn.classList.toggle('liked');
        const counter = btn.querySelector('.like-counter');
        if (counter) {
            let val = parseInt(counter.textContent, 10) || 0;
            val = btn.classList.contains('liked') ? val + 1 : val - 1;
            counter.textContent = val;
        }

        const id = parseInt(btn.getAttribute('data-id'), 10);
        const art = allArtworks.find(a => a.id === id);
        if (art) {
            art.likes = parseInt(counter.textContent, 10) || 0;
        }
    };

    window.handleCardMenu = function(e, id) {
        e.stopPropagation();
        const art = allArtworks.find(a => a.id === id);
        if (!art) return;
        
        // Copy link to clipboard
        const url = `${window.location.origin}/pages/portfolio.html?id=${artistId}#art-${id}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                showToast(`Artwork link copied: "${art.title}"`);
            }).catch(() => {
                showToast(`Inspecting artwork: "${art.title}"`);
            });
        } else {
            showToast(`Inspecting artwork: "${art.title}"`);
        }
    };

    // -------------------------------------------------------------
    // Lightbox Handlers
    // -------------------------------------------------------------
    window.openLightbox = function(id) {
        const art = allArtworks.find(a => a.id === id);
        if (!art || !artworkLightboxModal) return;

        currentActiveLightboxArt = art;

        if (lightboxImg) lightboxImg.src = art.imageUrl || '/images/artwork_sunlit.png';
        if (lightboxTitle) lightboxTitle.textContent = art.title;
        if (lightboxCategory) lightboxCategory.textContent = (art.category || 'Digital Art').toUpperCase();
        if (lightboxYear) lightboxYear.textContent = art.year || '2026';
        if (lightboxDesc) lightboxDesc.textContent = art.description || 'High-resolution piece exploring light, atmosphere, and aesthetic emotion.';
        if (lightboxLikeCount) lightboxLikeCount.textContent = `Appreciate (${art.likes || 12})`;

        artworkLightboxModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    function closeLightbox() {
        if (artworkLightboxModal) {
            artworkLightboxModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        currentActiveLightboxArt = null;
    }

    if (closeLightboxModal) closeLightboxModal.addEventListener('click', closeLightbox);
    if (artworkLightboxModal) {
        artworkLightboxModal.addEventListener('click', (e) => {
            if (e.target === artworkLightboxModal) closeLightbox();
        });
    }

    if (lightboxLikeBtn) {
        lightboxLikeBtn.addEventListener('click', () => {
            if (!currentActiveLightboxArt) return;
            currentActiveLightboxArt.likes = (currentActiveLightboxArt.likes || 12) + 1;
            lightboxLikeCount.textContent = `Appreciated (${currentActiveLightboxArt.likes})`;
            showToast(`Thank you for appreciating "${currentActiveLightboxArt.title}"!`);
            filterAndRender();
        });
    }

    // -------------------------------------------------------------
    // Add Artwork Modal Handlers
    // -------------------------------------------------------------
    if (btnAddWork) {
        btnAddWork.addEventListener('click', openAddModal);
    }

    function openAddModal() {
        if (artworkModal) {
            artworkModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeAddModal() {
        if (artworkModal) {
            artworkModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    if (closeArtworkModal) closeArtworkModal.addEventListener('click', closeAddModal);
    if (cancelArtworkBtn) cancelArtworkBtn.addEventListener('click', closeAddModal);
    if (artworkModal) {
        artworkModal.addEventListener('click', (e) => {
            if (e.target === artworkModal) closeAddModal();
        });
    }

    // Form Submission
    if (artworkForm) {
        artworkForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('artTitleInput').value.trim();
            const category = document.getElementById('artCategorySelect').value;
            const year = document.getElementById('artYearInput').value.trim() || '2026';
            const imageUrl = document.getElementById('artImageUrlInput').value.trim();
            const description = document.getElementById('artDescInput').value.trim();

            if (!title || !imageUrl) {
                showToast('Please provide an artwork title and image URL.');
                return;
            }

            const newArt = {
                id: Date.now(),
                artistId: artistId,
                title,
                category,
                year,
                imageUrl,
                description,
                likes: 1
            };

            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.createPortfolioItem === 'function') {
                    await window.ArtSphereAPI.createPortfolioItem(newArt);
                }
            } catch (err) {
                console.warn('API sync failed, saved in local portfolio state:', err);
            }

            allArtworks.unshift(newArt);
            closeAddModal();
            filterAndRender();
            showToast('Artwork successfully added to your portfolio!');
            artworkForm.reset();
        });
    }

    // -------------------------------------------------------------
    // Navigation, User Session & Mobile Drawer
    // -------------------------------------------------------------
    function initNavigationAndSession() {
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const userDropdownPanel = document.getElementById('userDropdownPanel');
        const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const dashboardSidebar = document.getElementById('dashboardSidebar');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');

        // Check for authenticated user in storage
        let user = null;
        try {
            const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || sessionStorage.getItem('artsphere_user');
            if (stored) user = JSON.parse(stored);
        } catch (e) {
            console.info('Session parse error:', e);
        }

        if (user) {
            const name = user.fullName || user.username || 'Mrunali';
            const firstName = name.split(' ')[0] || 'Mrunali';
            const avatar = user.profilePicture || '/images/avatar_creator_mrunali.png';

            const sidebarUserName = document.getElementById('sidebarUserName');
            const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
            const headerUserAvatar = document.getElementById('headerUserAvatar');
            const dropdownUserName = document.getElementById('dropdownUserName');
            const dropdownUserBio = document.getElementById('dropdownUserBio');

            if (sidebarUserName) sidebarUserName.textContent = firstName;
            if (sidebarUserAvatar) sidebarUserAvatar.src = avatar;
            if (headerUserAvatar) headerUserAvatar.src = avatar;
            if (dropdownUserName) dropdownUserName.textContent = name;
            if (dropdownUserBio) dropdownUserBio.textContent = user.artistType || user.role || 'Artist Member';
        }

        // Profile Dropdown Toggle
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

        // Mobile Drawer Toggle
        function openDrawer() {
            if (dashboardSidebar) dashboardSidebar.classList.add('drawer-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            if (dashboardSidebar) dashboardSidebar.classList.remove('drawer-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (mobileMenuTrigger) mobileMenuTrigger.addEventListener('click', openDrawer);
        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeDrawer);
        if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeDrawer);

        // Logout
        function handleLogout() {
            if (confirm('Are you sure you want to log out of ArtSphere?')) {
                try {
                    localStorage.removeItem('currentUser');
                    sessionStorage.removeItem('currentUser');
                    sessionStorage.removeItem('artsphere_user');
                } catch (e) {}
                window.location.href = '/pages/login.html';
            }
        }

        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
        if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);
    }

    // -------------------------------------------------------------
    // Utility Helpers
    // -------------------------------------------------------------
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'neo-toast';
        toast.textContent = msg;
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 250);
        }, 3200);
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
