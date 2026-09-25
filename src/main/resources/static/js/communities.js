/**
 * ArtSphere — Communities JavaScript (Module 8 - page_28.jpg)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Current User
    let currentUser = null;
    try {
        const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (stored) {
            currentUser = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Could not parse stored user', e);
    }
    const currentUserId = currentUser ? currentUser.id : 101;

    // DOM Elements
    const searchInput = document.getElementById('communitySearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const categoriesScrollRow = document.getElementById('categoriesScrollRow');
    const resetCategoryFilter = document.getElementById('resetCategoryFilter');
    const seeAllPopularBtn = document.getElementById('seeAllPopularBtn');
    const featuredBannerCard = document.getElementById('featuredBannerCard');
    const featuredCommunitySection = document.getElementById('featuredCommunitySection');
    const featuredTitle = document.getElementById('featuredTitle');
    const featuredDesc = document.getElementById('featuredDesc');
    const featuredMembers = document.getElementById('featuredMembers');
    const featuredArtForms = document.getElementById('featuredArtForms');
    const btnJoinFeatured = document.getElementById('btnJoinFeatured');
    const popularCommunitiesGrid = document.getElementById('popularCommunitiesGrid');

    // Create Modal Elements
    const btnOpenCreate = document.getElementById('btnOpenCreateCommunityModal');
    const createModal = document.getElementById('createCommunityModal');
    const closeCreateModalBtn = document.getElementById('closeCreateModalBtn');
    const cancelCreateModalBtn = document.getElementById('cancelCreateModalBtn');
    const createCommunityForm = document.getElementById('createCommunityForm');

    // Central Plus Menu
    const centralPlusBtn = document.getElementById('centralPlusBtn');
    const plusMenuBackdrop = document.getElementById('plusMenuBackdrop');
    const btnClosePlusMenu = document.getElementById('btnClosePlusMenu');
    const plusMenuCreateCommBtn = document.getElementById('plusMenuCreateCommBtn');

    // State
    let activeCategory = 'All';
    let searchQuery = '';
    let searchDebounceTimeout = null;
    let allCommunities = [];

    // Initialize
    loadCommunities();
    setupEventListeners();

    function setupEventListeners() {
        // Search Input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim();
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
                }
                clearTimeout(searchDebounceTimeout);
                searchDebounceTimeout = setTimeout(() => {
                    loadCommunities();
                }, 300);
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.style.display = 'none';
                loadCommunities();
            });
        }

        // Category Pills
        if (categoriesScrollRow) {
            categoriesScrollRow.addEventListener('click', (e) => {
                const pill = e.target.closest('.cat-pill');
                if (!pill) return;
                const cat = pill.getAttribute('data-category');
                if (!cat) return;

                document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activeCategory = cat;
                loadCommunities();
            });
        }

        if (resetCategoryFilter) {
            resetCategoryFilter.addEventListener('click', (e) => {
                e.preventDefault();
                activeCategory = 'All';
                document.querySelectorAll('.cat-pill').forEach(p => {
                    p.classList.toggle('active', p.getAttribute('data-category') === 'All');
                });
                loadCommunities();
            });
        }

        if (seeAllPopularBtn) {
            seeAllPopularBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activeCategory = 'All';
                document.querySelectorAll('.cat-pill').forEach(p => {
                    p.classList.toggle('active', p.getAttribute('data-category') === 'All');
                });
                loadCommunities();
            });
        }

        // Featured Join/Joined Toggle
        if (btnJoinFeatured) {
            btnJoinFeatured.addEventListener('click', async (e) => {
                e.stopPropagation();
                const commId = btnJoinFeatured.getAttribute('data-id') || 601;
                await toggleCommunityJoin(commId, btnJoinFeatured);
            });
        }

        // Featured Card Click Navigation
        if (featuredBannerCard) {
            featuredBannerCard.addEventListener('click', () => {
                const commId = featuredBannerCard.getAttribute('data-community-id') || 601;
                window.location.href = `/pages/community-details.html?id=${commId}`;
            });
        }

        // Create Community Modal
        if (btnOpenCreate) {
            btnOpenCreate.addEventListener('click', () => openCreateModal());
        }

        if (closeCreateModalBtn) {
            closeCreateModalBtn.addEventListener('click', () => closeCreateModal());
        }

        if (cancelCreateModalBtn) {
            cancelCreateModalBtn.addEventListener('click', () => closeCreateModal());
        }

        if (createModal) {
            createModal.addEventListener('click', (e) => {
                if (e.target === createModal) closeCreateModal();
            });
        }

        if (createCommunityForm) {
            createCommunityForm.addEventListener('submit', handleCreateCommunitySubmit);
        }

        // Central Plus Menu
        if (centralPlusBtn && plusMenuBackdrop) {
            centralPlusBtn.addEventListener('click', () => {
                plusMenuBackdrop.style.display = 'flex';
            });
        }

        if (btnClosePlusMenu && plusMenuBackdrop) {
            btnClosePlusMenu.addEventListener('click', () => {
                plusMenuBackdrop.style.display = 'none';
            });
        }

        if (plusMenuBackdrop) {
            plusMenuBackdrop.addEventListener('click', (e) => {
                if (e.target === plusMenuBackdrop) plusMenuBackdrop.style.display = 'none';
            });
        }

        if (plusMenuCreateCommBtn) {
            plusMenuCreateCommBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (plusMenuBackdrop) plusMenuBackdrop.style.display = 'none';
                openCreateModal();
            });
        }
    }

    async function loadCommunities() {
        try {
            renderLoadingState();
            const communities = await ArtSphereAPI.getCommunities(activeCategory, searchQuery, currentUserId);
            allCommunities = communities || [];
            renderCommunities(allCommunities);
        } catch (err) {
            console.error('Failed to load communities:', err);
            renderErrorState(err.message);
        }
    }

    function renderCommunities(list) {
        if (!list || list.length === 0) {
            if (featuredCommunitySection && (activeCategory !== 'All' || searchQuery)) {
                featuredCommunitySection.style.display = 'none';
            }
            popularCommunitiesGrid.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-icon">&empty;</div>
                    <h3>No communities found</h3>
                    <p>Try searching for different art forms or create your own community.</p>
                </div>
            `;
            return;
        }

        // Identify featured community
        const featured = list.find(c => c.isFeatured || c.id === 601) || list[0];

        // Only show featured section when not searching or in 'All'
        if (featured && activeCategory === 'All' && !searchQuery) {
            if (featuredCommunitySection) {
                featuredCommunitySection.style.display = 'block';
                featuredTitle.textContent = featured.name || 'Creative Souls';
                featuredDesc.textContent = featured.description || '';
                featuredMembers.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    ${formatCount(featured.memberCount || 1200)} members
                `;
                featuredArtForms.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    ${featured.artForms || 'All art forms'}
                `;
                featuredBannerCard.setAttribute('data-community-id', featured.id);
                btnJoinFeatured.setAttribute('data-id', featured.id);

                if (featured.joined) {
                    btnJoinFeatured.classList.add('joined');
                    btnJoinFeatured.innerHTML = 'Joined &check;';
                } else {
                    btnJoinFeatured.classList.remove('joined');
                    btnJoinFeatured.textContent = 'Join';
                }
            }
        } else if (featuredCommunitySection) {
            featuredCommunitySection.style.display = 'none';
        }

        // Popular communities grid: exclude featured banner community if on 'All' without search
        const gridItems = (activeCategory === 'All' && !searchQuery)
            ? list.filter(c => c.id !== featured.id)
            : list;

        if (gridItems.length === 0) {
            popularCommunitiesGrid.innerHTML = `
                <div class="empty-state-card">
                    <p>No other communities match your criteria.</p>
                </div>
            `;
            return;
        }

        popularCommunitiesGrid.innerHTML = gridItems.map(comm => createCommunityCardHtml(comm)).join('');

        // Attach join button click handlers
        popularCommunitiesGrid.querySelectorAll('.btn-card-join').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                await toggleCommunityJoin(id, btn);
            });
        });

        // Attach card navigation handlers
        popularCommunitiesGrid.querySelectorAll('.community-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                window.location.href = `/pages/community-details.html?id=${id}`;
            });
        });
    }

    function createCommunityCardHtml(comm) {
        const cover = comm.imageUrl || comm.coverImage || '/images/comm_painting_souls.png';
        const isJoined = comm.joined;
        const joinedClass = isJoined ? 'joined' : '';
        const joinedText = isJoined ? 'Joined &check;' : 'Join';

        return `
            <div class="community-card" data-id="${comm.id}">
                <div class="card-cover-wrap">
                    <img src="${escapeHtml(cover)}" alt="${escapeHtml(comm.name)}" class="card-cover-img" onerror="this.src='/images/comm_painting_souls.png'">
                    <span class="card-cat-badge">${escapeHtml(comm.category || 'Art')}</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${escapeHtml(comm.name)}</h3>
                    <div class="card-meta-line">
                        <span class="meta-item">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                            ${formatCount(comm.memberCount || 0)} members
                        </span>
                        <span class="meta-dot">&bull;</span>
                        <span class="meta-item">
                            ${comm.postCount !== undefined ? comm.postCount : Math.floor((comm.memberCount || 500) / 20)} posts
                        </span>
                    </div>
                    <div class="card-action-row">
                        <button class="btn-card-join ${joinedClass}" data-id="${comm.id}">
                            ${joinedText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async function toggleCommunityJoin(communityId, btnElement) {
        const isCurrentlyJoined = btnElement.classList.contains('joined');
        btnElement.disabled = true;

        try {
            if (isCurrentlyJoined) {
                const res = await ArtSphereAPI.leaveCommunity(communityId, currentUserId);
                btnElement.classList.remove('joined');
                btnElement.textContent = 'Join';
                showToast('Left community');
                updateMemberCountDisplay(communityId, res.memberCount, false);
            } else {
                const res = await ArtSphereAPI.joinCommunity(communityId, currentUserId);
                btnElement.classList.add('joined');
                btnElement.innerHTML = 'Joined &check;';
                showToast('Joined community successfully!');
                updateMemberCountDisplay(communityId, res.memberCount, true);
            }
        } catch (err) {
            console.error('Error toggling community join:', err);
            showToast(err.message || 'Action failed');
        } finally {
            btnElement.disabled = false;
        }
    }

    function updateMemberCountDisplay(communityId, newCount, joined) {
        // Update local object
        const item = allCommunities.find(c => String(c.id) === String(communityId));
        if (item) {
            item.joined = joined;
            if (newCount !== undefined) item.memberCount = newCount;
        }
    }

    // Modal Handlers
    function openCreateModal() {
        if (createModal) {
            createModal.style.display = 'flex';
            const nameInput = document.getElementById('commNameInput');
            if (nameInput) setTimeout(() => nameInput.focus(), 100);
        }
    }

    function closeCreateModal() {
        if (createModal) {
            createModal.style.display = 'none';
            if (createCommunityForm) createCommunityForm.reset();
        }
    }

    async function handleCreateCommunitySubmit(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitCreateCommunityBtn');
        const name = document.getElementById('commNameInput').value.trim();
        const category = document.getElementById('commCategorySelect').value;
        const description = document.getElementById('commDescInput').value.trim();
        const location = document.getElementById('commLocationInput').value.trim() || 'Global';

        if (!name || !description) {
            showToast('Please fill all required fields');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        try {
            const newComm = await ArtSphereAPI.createCommunity({
                name,
                category,
                description,
                location,
                artForms: category === 'All' ? 'All art forms' : category
            }, currentUserId);

            showToast('Community created successfully!');
            closeCreateModal();

            // Redirect to newly created community details page
            setTimeout(() => {
                window.location.href = `/pages/community-details.html?id=${newComm.id}`;
            }, 600);
        } catch (err) {
            console.error('Failed to create community:', err);
            showToast(err.message || 'Failed to create community');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Community';
        }
    }

    function renderLoadingState() {
        popularCommunitiesGrid.innerHTML = `
            <div class="loading-state-wrapper">
                <div class="loading-spinner"></div>
                <p>Loading communities...</p>
            </div>
        `;
    }

    function renderErrorState(message) {
        popularCommunitiesGrid.innerHTML = `
            <div class="error-state-card">
                <p>Failed to load communities: ${escapeHtml(message)}</p>
                <button class="btn-retry" onclick="location.reload()">Retry</button>
            </div>
        `;
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
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }
});
