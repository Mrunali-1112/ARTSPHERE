/**
 * ArtSphere – Portfolio Module
 * Source of Truth: Approved page_13.jpg reference
 * Loads portfolio dynamically via GET /api/artists/{id}/portfolio
 * Supports Add Work (POST), Edit Work (PUT), Delete Work (DELETE)
 */

document.addEventListener('DOMContentLoaded', () => {
    initPortfolio();
});

let currentArtistId = 101;
let currentCategory = 'All';
let currentArtworks = [];
let selectedArtworkForAction = null;

async function initPortfolio() {
    // 1. Read artist ID and optional action from URL
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id') || urlParams.get('artistId');
    if (paramId && !isNaN(paramId)) {
        currentArtistId = parseInt(paramId, 10);
    }

    // 2. Setup Back button and bottom profile link
    setupNavigation();

    // 3. Category filter pills
    setupCategoryFilters();

    // 4. Modal and Action menu
    setupModalsAndMenu();

    // 5. Initial fetch of portfolio items
    await loadPortfolio(currentCategory);

    // If navigated with ?action=add, open modal
    if (urlParams.get('action') === 'add') {
        openArtworkModal('add');
    }
}

function setupNavigation() {
    const btnBack = document.getElementById('btnBackToProfile');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            window.location.href = `/pages/artist-profile.html?id=${currentArtistId}`;
        });
    }

    const bottomNavProfile = document.getElementById('bottomNavProfile');
    if (bottomNavProfile) {
        bottomNavProfile.href = `/pages/artist-profile.html?id=${currentArtistId}`;
    }

    const centralCreateBtn = document.getElementById('centralCreateBtn');
    if (centralCreateBtn) {
        centralCreateBtn.addEventListener('click', () => {
            openArtworkModal('add');
        });
    }

    const btnAddWork = document.getElementById('btnAddWork');
    if (btnAddWork) {
        btnAddWork.addEventListener('click', () => {
            openArtworkModal('add');
        });
    }
}

function setupCategoryFilters() {
    const pills = document.querySelectorAll('.portfolio-filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', async () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-category') || 'All';
            await loadPortfolio(currentCategory);
        });
    });
}

async function loadPortfolio(category) {
    const container = document.getElementById('portfolioCardsGrid');
    if (!container) return;

    try {
        let artworks = [];
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getArtistPortfolio === 'function') {
            artworks = await window.ArtSphereAPI.getArtistPortfolio(currentArtistId, category);
        } else {
            const query = (category && category.toLowerCase() !== 'all') ? `?category=${encodeURIComponent(category)}` : '';
            const res = await fetch(`/api/artists/${currentArtistId}/portfolio${query}`);
            const json = await res.json();
            artworks = json.data || [];
        }

        currentArtworks = artworks;
        renderPortfolioGrid(artworks);
    } catch (err) {
        console.warn('Failed to fetch portfolio artworks:', err);
    }
}

function renderPortfolioGrid(artworks) {
    const container = document.getElementById('portfolioCardsGrid');
    if (!container) return;

    if (!artworks || artworks.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 10px; color: #7B728F;">
                <p style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">No artworks in this category</p>
                <p style="font-size: 13px;">Click "+ Add Work" to add an artwork to this portfolio.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = artworks.map(art => `
        <div class="artwork-portfolio-card" data-artwork-id="${escapeHtml(art.id)}">
            <div class="artwork-img-box">
                <img src="${escapeHtml(art.imageUrl || '/images/artwork_sunlit.png')}" 
                     alt="${escapeHtml(art.title)}" 
                     class="artwork-card-img"
                     onerror="this.src='/images/artwork_sunlit.png'">
            </div>
            <div class="artwork-meta-box">
                <div class="artwork-title-dots-row">
                    <h3 class="artwork-card-title" title="${escapeHtml(art.title)}">${escapeHtml(art.title)}</h3>
                    <button class="btn-card-dots" data-artwork-id="${escapeHtml(art.id)}" aria-label="Artwork Actions">
                        &#8942;
                    </button>
                </div>
                <span class="artwork-card-category">${escapeHtml(art.category || 'Digital Art')}</span>
                <div class="artwork-metrics-row">
                    <button class="like-btn" data-artwork-id="${escapeHtml(art.id)}" aria-label="Like">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span class="like-count">${art.likesCount != null ? art.likesCount : 124}</span>
                    </button>
                    <div class="metric-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>${art.commentsCount != null ? art.commentsCount : 8}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    bindCardActions();
}

function bindCardActions() {
    // 1. Like button click
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const countEl = btn.querySelector('.like-count');
            let count = parseInt(countEl.textContent, 10) || 0;
            const isLiked = btn.classList.toggle('liked');
            if (isLiked) {
                countEl.textContent = count + 1;
            } else {
                countEl.textContent = Math.max(0, count - 1);
            }
        });
    });

    // 2. Three dots click
    const dotsButtons = document.querySelectorAll('.btn-card-dots');
    const menu = document.getElementById('cardActionMenu');

    dotsButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-artwork-id');
            selectedArtworkForAction = currentArtworks.find(a => String(a.id) === String(id));

            if (!selectedArtworkForAction) return;

            // Position the floating menu near the clicked button
            const rect = btn.getBoundingClientRect();
            menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
            menu.style.left = `${Math.min(rect.left + window.scrollX - 90, window.innerWidth - 150)}px`;
            menu.classList.add('open');
        });
    });
}

function setupModalsAndMenu() {
    const menu = document.getElementById('cardActionMenu');
    const modalBackdrop = document.getElementById('artworkModalBackdrop');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const form = document.getElementById('artworkForm');

    // Close menu on click outside
    document.addEventListener('click', () => {
        if (menu) menu.classList.remove('open');
    });

    // Menu: Edit Work
    const menuActionEdit = document.getElementById('menuActionEdit');
    if (menuActionEdit) {
        menuActionEdit.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu) menu.classList.remove('open');
            if (selectedArtworkForAction) {
                openArtworkModal('edit', selectedArtworkForAction);
            }
        });
    }

    // Menu: Delete Work
    const menuActionDelete = document.getElementById('menuActionDelete');
    if (menuActionDelete) {
        menuActionDelete.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (menu) menu.classList.remove('open');
            if (!selectedArtworkForAction) return;

            const confirmed = confirm(`Are you sure you want to delete "${selectedArtworkForAction.title}"?`);
            if (confirmed) {
                await deleteArtwork(selectedArtworkForAction.id);
            }
        });
    }

    // Modal close
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeArtworkModal);
    }
    if (btnCancelModal) {
        btnCancelModal.addEventListener('click', closeArtworkModal);
    }
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeArtworkModal();
        });
    }

    // Preset image chips
    const presetChips = document.querySelectorAll('.preset-chip');
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const url = chip.getAttribute('data-url');
            const imgInput = document.getElementById('artworkImageInput');
            if (imgInput && url) {
                imgInput.value = url;
            }
        });
    });

    // Form submit: Create or Update
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('editArtworkId').value;
            const title = document.getElementById('artworkTitleInput').value.trim();
            const category = document.getElementById('artworkCategorySelect').value;
            const imageUrl = document.getElementById('artworkImageInput').value.trim();
            const description = document.getElementById('artworkDescInput').value.trim();

            const payload = {
                title,
                category,
                imageUrl: imageUrl || '/images/artwork_sunlit.png',
                description: description || 'Creative artwork by artist',
                artistId: currentArtistId,
                likesCount: editId ? (selectedArtworkForAction ? selectedArtworkForAction.likesCount : 100) : 100,
                commentsCount: editId ? (selectedArtworkForAction ? selectedArtworkForAction.commentsCount : 5) : 5
            };

            const submitBtn = document.getElementById('btnSaveArtwork');
            if (submitBtn) submitBtn.disabled = true;

            try {
                if (editId) {
                    // PUT /api/portfolio/{id}
                    if (window.ArtSphereAPI && typeof window.ArtSphereAPI.updatePortfolioItem === 'function') {
                        await window.ArtSphereAPI.updatePortfolioItem(editId, payload);
                    } else {
                        await fetch(`/api/portfolio/${editId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                    }
                } else {
                    // POST /api/portfolio
                    if (window.ArtSphereAPI && typeof window.ArtSphereAPI.createPortfolioItem === 'function') {
                        await window.ArtSphereAPI.createPortfolioItem(payload);
                    } else {
                        await fetch('/api/portfolio', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                    }
                }

                closeArtworkModal();
                await loadPortfolio(currentCategory);
            } catch (err) {
                console.error('Failed to save artwork:', err);
                alert('Could not save artwork: ' + err.message);
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}

function openArtworkModal(mode, artwork = null) {
    const modal = document.getElementById('artworkModalBackdrop');
    const modalTitle = document.getElementById('modalTitle');
    const editIdInput = document.getElementById('editArtworkId');
    const titleInput = document.getElementById('artworkTitleInput');
    const categorySelect = document.getElementById('artworkCategorySelect');
    const imageInput = document.getElementById('artworkImageInput');
    const descInput = document.getElementById('artworkDescInput');

    if (!modal) return;

    if (mode === 'edit' && artwork) {
        modalTitle.textContent = 'Edit Artwork';
        editIdInput.value = artwork.id;
        titleInput.value = artwork.title || '';
        categorySelect.value = artwork.category || 'Digital Art';
        imageInput.value = artwork.imageUrl || '';
        descInput.value = artwork.description || '';
    } else {
        modalTitle.textContent = 'Add Work';
        editIdInput.value = '';
        titleInput.value = '';
        categorySelect.value = 'Digital Art';
        imageInput.value = '/images/artwork_sunlit.png';
        descInput.value = '';
    }

    modal.classList.add('open');
}

function closeArtworkModal() {
    const modal = document.getElementById('artworkModalBackdrop');
    if (modal) modal.classList.remove('open');
}

async function deleteArtwork(id) {
    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.deletePortfolioItem === 'function') {
            await window.ArtSphereAPI.deletePortfolioItem(id);
        } else {
            await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
        }
        await loadPortfolio(currentCategory);
    } catch (err) {
        console.error('Failed to delete artwork:', err);
        alert('Failed to delete artwork: ' + err.message);
    }
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
