/**
 * ArtSphere – Portfolio Module
 * Editorial Neo-brutalism • Creative Archive & Gallery Grid
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Mrunali / Aanya)
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('id') ? parseInt(urlParams.get('id')) : 101;
    let currentCategory = 'All';

    // Navigation & Dropdown
    initNavigation();

    // Elements
    const btnBackToProfile = document.getElementById('btnBackToProfile');
    const breadcrumbArtistName = document.getElementById('breadcrumbArtistName');
    const portfolioPageTitle = document.getElementById('portfolioPageTitle');
    const portfolioPageSubtitle = document.getElementById('portfolioPageSubtitle');
    const worksCountBadge = document.getElementById('worksCountBadge');
    const btnAddWork = document.getElementById('btnAddWork');
    const categoryFilterLedger = document.getElementById('categoryFilterLedger');
    const portfolioCardsGrid = document.getElementById('portfolioCardsGrid');

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
    const lightboxDesc = document.getElementById('lightboxDesc');

    let allArtworks = [];

    // Setup Back Link
    if (btnBackToProfile) {
        btnBackToProfile.href = `/pages/artist-profile.html?id=${artistId}`;
    }

    // Load Artist info & Portfolio
    loadArtistHeader();
    loadPortfolio();

    // Check if ?action=add
    if (urlParams.get('action') === 'add') {
        openAddModal();
    }

    // Category click handler
    if (categoryFilterLedger) {
        categoryFilterLedger.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-pill-btn');
            if (!btn) return;

            categoryFilterLedger.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.getAttribute('data-category') || 'All';
            filterAndRender();
        });
    }

    async function loadArtistHeader() {
        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getArtistProfile === 'function') {
                const artist = await window.ArtSphereAPI.getArtistProfile(artistId);
                if (artist && (artist.fullName || artist.name)) {
                    const name = artist.fullName || artist.name;
                    if (breadcrumbArtistName) breadcrumbArtistName.textContent = `Back to ${name}'s Profile`;
                    if (portfolioPageTitle) portfolioPageTitle.textContent = `${name}'s Portfolio Archive`;
                    if (portfolioPageSubtitle) portfolioPageSubtitle.textContent = `Curated visual works and experiments by ${name}.`;
                    return;
                }
            }
        } catch (e) {
            console.warn('API error when loading artist name:', e);
        }

        if (breadcrumbArtistName) breadcrumbArtistName.textContent = `Back to Artist Profile`;
    }

    async function loadPortfolio() {
        if (!portfolioCardsGrid) return;

        portfolioCardsGrid.innerHTML = `
            <div class="col-12 loading-state-card">
                <div class="spinner"></div>
                <p>Loading portfolio pieces...</p>
            </div>
        `;

        try {
            let artworks = null;
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getArtistPortfolio === 'function') {
                const list = await window.ArtSphereAPI.getArtistPortfolio(artistId, currentCategory);
                if (Array.isArray(list) && list.length > 0) artworks = list;
            }

            if (!artworks || artworks.length === 0) {
                artworks = getFallbackPortfolio(artistId);
            }

            allArtworks = artworks;
            filterAndRender();

        } catch (err) {
            console.warn('API error, using fallback portfolio:', err);
            allArtworks = getFallbackPortfolio(artistId);
            filterAndRender();
        }
    }

    function filterAndRender() {
        let items = allArtworks;
        if (currentCategory && currentCategory !== 'All') {
            items = items.filter(a =>
                (a.category && a.category.toLowerCase().includes(currentCategory.toLowerCase())) ||
                (a.medium && a.medium.toLowerCase().includes(currentCategory.toLowerCase()))
            );
        }

        if (worksCountBadge) {
            worksCountBadge.textContent = `${items.length} Artwork${items.length !== 1 ? 's' : ''}`;
        }

        renderGrid(items);
    }

    function renderGrid(items) {
        if (!portfolioCardsGrid) return;

        if (!items || items.length === 0) {
            portfolioCardsGrid.innerHTML = `
                <div class="col-12 empty-state-card">
                    <div class="empty-state-motif">✦</div>
                    <h3 class="empty-state-heading">No Artworks in this Category</h3>
                    <p class="empty-state-desc">No portfolio items found under "${currentCategory}". Try selecting another category or add a new artwork.</p>
                </div>
            `;
            return;
        }

        portfolioCardsGrid.innerHTML = items.map((art, idx) => {
            const likes = art.likes || (12 + (idx * 7));
            return `
                <div class="col-4 col-md-6 col-sm-12">
                    <article class="portfolio-art-card">
                        <div class="art-media-frame" onclick="openLightbox(${art.id})">
                            <img src="${art.imageUrl || '/images/card_img_digital.png'}" alt="${escapeHtml(art.title)}" class="art-display-img" onerror="this.src='/images/card_img_digital.png'">
                        </div>
                        <div class="art-info-body">
                            <div>
                                <div class="art-top-tags-row">
                                    <span class="art-category-tag">${escapeHtml(art.category || 'Digital Art')}</span>
                                    <span class="art-year-text">${escapeHtml(art.year || '2026')}</span>
                                </div>
                                <h3 class="art-card-title">${escapeHtml(art.title)}</h3>
                                <p class="art-card-desc">${escapeHtml(art.description || 'Visual inquiry exploring light and texture.')}</p>
                            </div>
                            <div class="art-card-footer">
                                <button type="button" class="art-like-btn" data-id="${art.id}" onclick="event.stopPropagation(); toggleLike(this)">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                    <span class="like-counter">${likes}</span>
                                </button>
                                <span class="art-expand-link" onclick="openLightbox(${art.id})">Inspect Piece &rarr;</span>
                            </div>
                        </div>
                    </article>
                </div>
            `;
        }).join('');
    }

    // Modal Add Artwork
    if (btnAddWork) {
        btnAddWork.addEventListener('click', openAddModal);
    }

    function openAddModal() {
        if (artworkModal) artworkModal.style.display = 'flex';
    }

    function closeAddModal() {
        if (artworkModal) artworkModal.style.display = 'none';
    }

    if (closeArtworkModal) closeArtworkModal.addEventListener('click', closeAddModal);
    if (cancelArtworkBtn) cancelArtworkBtn.addEventListener('click', closeAddModal);
    if (artworkModal) {
        artworkModal.addEventListener('click', (e) => {
            if (e.target === artworkModal) closeAddModal();
        });
    }

    // Form submission
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
                console.warn('API error when creating portfolio piece, saved locally:', err);
            }

            allArtworks.unshift(newArt);
            closeAddModal();
            filterAndRender();
            showToast('Artwork added to your portfolio!');
        });
    }

    // Lightbox Handlers
    window.openLightbox = function(id) {
        const art = allArtworks.find(a => a.id === id);
        if (!art || !artworkLightboxModal) return;

        if (lightboxImg) lightboxImg.src = art.imageUrl || '/images/card_img_digital.png';
        if (lightboxTitle) lightboxTitle.textContent = art.title;
        if (lightboxCategory) lightboxCategory.textContent = (art.category || 'Digital Art').toUpperCase();
        if (lightboxDesc) lightboxDesc.textContent = art.description || 'High-resolution study exploring light, atmosphere, and visual narrative.';

        artworkLightboxModal.style.display = 'flex';
    };

    function closeLightbox() {
        if (artworkLightboxModal) artworkLightboxModal.style.display = 'none';
    }

    if (closeLightboxModal) closeLightboxModal.addEventListener('click', closeLightbox);
    if (artworkLightboxModal) {
        artworkLightboxModal.addEventListener('click', (e) => {
            if (e.target === artworkLightboxModal) closeLightbox();
        });
    }

    // Like Toggle
    window.toggleLike = function(btn) {
        btn.classList.toggle('liked');
        const counter = btn.querySelector('.like-counter');
        if (counter) {
            let val = parseInt(counter.textContent) || 0;
            val = btn.classList.contains('liked') ? val + 1 : val - 1;
            counter.textContent = val;
        }
    };

    function getFallbackPortfolio(id) {
        return [
            { id: 1, title: 'Nocturnal Mumbai: Marine Drive Study', category: 'Digital Art', year: '2026', imageUrl: '/images/card_img_digital.png', description: 'Digital painting study investigating sea-mist luminescence against Victorian lampposts at 2 AM.', likes: 48 },
            { id: 2, title: 'Old Quarter Balconies in Gouache', category: 'Paintings', year: '2026', imageUrl: '/images/card_img_visual.png', description: 'Layered gouache painting capturing weathered wooden fretwork in South Mumbai residential lanes.', likes: 62 },
            { id: 3, title: 'Monsoon Light over Churchgate', category: 'Concept Art', year: '2025', imageUrl: '/images/card_img_photography.png', description: 'Atmospheric environment concept art exploring reflective asphalt and neon umbrellas.', likes: 35 },
            { id: 4, title: 'Midnight Tea Stall Character Study', category: 'Illustrations', year: '2025', imageUrl: '/images/card_img_music.png', description: 'Character gesture sketches and color keyframes for an upcoming graphic novel.', likes: 79 },
            { id: 5, title: 'Shadow Topologies & Stone Arches', category: 'Sketches', year: '2025', imageUrl: '/images/card_img_dance.png', description: 'Raw graphite and ink architectural studies of Indo-Saracenic vaulted corridors.', likes: 21 },
            { id: 6, title: 'Ambient Cityscape Keyframe #4', category: 'Concept Art', year: '2024', imageUrl: '/images/card_img_writing.png', description: 'Keyframe illustration for an animated short film exploring forgotten city rooftops.', likes: 54 }
        ];
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
