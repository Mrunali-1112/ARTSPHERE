/**
 * ArtSphere — Artist Profile & Studio Controller
 * Soft Warm Ivory / Lavender Visual Direction
 * Handles Dynamic Artist Data, Real Follow Toggle, Portfolio Filtering,
 * Session Resolution, Related Artists, and Mobile Controls.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. URL Parameters & State
    const urlParams = new URLSearchParams(window.location.search);
    const rawId = urlParams.get('id');
    let artistId = rawId ? parseInt(rawId, 10) : null;

    let currentUserId = 101;
    let currentUser = null;
    let currentArtistData = null;
    let allArtworks = [];
    let isFollowing = false;

    // DOM Elements - Shell & State Containers
    const loadingState = document.getElementById('profileLoadingState');
    const errorState = document.getElementById('profileErrorState');
    const loadedContent = document.getElementById('profileLoadedContent');
    const errorTitle = document.getElementById('errorTitle');
    const errorMessage = document.getElementById('errorMessage');
    const btnRetryLoad = document.getElementById('btnRetryLoad');

    // DOM Elements - Hero Profile
    const artistCoverImg = document.getElementById('artistCoverImg');
    const artistAvatarImg = document.getElementById('artistAvatarImg');
    const artistCraftBadge = document.getElementById('artistCraftBadge');
    const artistName = document.getElementById('artistName');
    const artistLocation = document.getElementById('artistLocation');
    const artistCraft = document.getElementById('artistCraft');
    const artistBio = document.getElementById('artistBio');

    const artworksCount = document.getElementById('artworksCount');
    const postsCount = document.getElementById('postsCount');
    const followersCount = document.getElementById('followersCount');
    const followingCount = document.getElementById('followingCount');

    // Action Buttons
    const btnFollow = document.getElementById('btnFollow');
    const followBtnText = document.getElementById('followBtnText');
    const followBtnIcon = document.getElementById('followBtnIcon');
    const btnProposeCollab = document.getElementById('btnProposeCollab');
    const btnRightProposeCollab = document.getElementById('btnRightProposeCollab');
    const btnShareProfile = document.getElementById('btnShareProfile');
    const linkFullArchive = document.getElementById('linkFullArchive');

    // Portfolio & Tabs Elements
    const profilePortfolioGrid = document.getElementById('profilePortfolioGrid');
    const filterButtons = document.querySelectorAll('.filter-pill-btn');
    const profileTabs = document.querySelectorAll('.profile-pill-tab');
    const paneCuratedWorks = document.getElementById('paneCuratedWorks');
    const paneCollaborations = document.getElementById('paneCollaborations');
    const paneArtisticStatement = document.getElementById('paneArtisticStatement');
    const profileCollabsGrid = document.getElementById('profileCollabsGrid');
    const statementSkillsContainer = document.getElementById('statementSkillsContainer');
    const aboutArtistSummary = document.getElementById('aboutArtistSummary');

    // External Links & Related Artists
    const artistExternalLinksList = document.getElementById('artistExternalLinksList');
    const noLinksHint = document.getElementById('noLinksHint');
    const linkTileInstagram = document.getElementById('linkTileInstagram');
    const linkTileBehance = document.getElementById('linkTileBehance');
    const linkTileWebsite = document.getElementById('linkTileWebsite');
    const relatedArtistsList = document.getElementById('relatedArtistsList');

    // Initialize Navigation & Drawer UI
    initSidebarDrawer();
    initUserDropdown();
    initSearchInput();

    // Resolve Current Authenticated User
    await resolveCurrentUser();

    // Default Artist ID if none provided
    if (!artistId || isNaN(artistId)) {
        if (currentUser && currentUser.id) {
            artistId = currentUser.id;
        } else {
            artistId = 101; // Primary default artist Aanya Deshmukh
        }
    }

    // Attach retry button listener
    if (btnRetryLoad) {
        btnRetryLoad.addEventListener('click', () => {
            loadArtistProfile(artistId);
        });
    }

    // Load Profile
    await loadArtistProfile(artistId);

    // Load Related Artists
    loadRelatedArtists(artistId);

    // Initialize Tab Switching
    initTabsSwitcher();

    // Initialize Filter Buttons
    initArtworkFilters();

    // Initialize Action Buttons (Follow, Share, Collab)
    initActionButtons();

    /**
     * =========================================================================
     * 1. RESOLVE CURRENT AUTHENTICATED USER
     * =========================================================================
     */
    async function resolveCurrentUser() {
        try {
            let user = null;
            if (window.api && typeof window.api.getCurrentUser === 'function') {
                user = await window.api.getCurrentUser();
            } else {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const json = await res.json();
                    user = json.data;
                }
            }

            if (!user) {
                const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
                if (stored) {
                    try { user = JSON.parse(stored); } catch (_) {}
                }
            }

            if (user) {
                currentUser = user;
                if (user.id) currentUserId = user.id;

                const displayName = user.fullName || user.username || user.name || 'Mrunali S.';
                const displayRole = user.artistType || user.bio || 'Digital Artist';
                const displayAvatar = user.profilePicture || user.avatarUrl || '/images/user_avatar_nav.png';

                // Update Sidebar Mini-Card
                const sidebarUserName = document.getElementById('sidebarUserName');
                const sidebarUserRole = document.getElementById('sidebarUserRole');
                const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
                const sidebarProfileCard = document.getElementById('sidebarProfileCard');

                if (sidebarUserName) sidebarUserName.textContent = displayName;
                if (sidebarUserRole) sidebarUserRole.textContent = displayRole;
                if (sidebarUserAvatar) sidebarUserAvatar.src = displayAvatar;
                if (sidebarProfileCard) sidebarProfileCard.href = `/pages/artist-profile.html?id=${user.id || 101}`;

                // Update Header Dropdown
                const headerUserAvatar = document.getElementById('headerUserAvatar');
                const dropdownUserName = document.getElementById('dropdownUserName');
                const dropdownUserBio = document.getElementById('dropdownUserBio');
                const dropdownProfileLink = document.getElementById('dropdownProfileLink');
                const dropdownPortfolioLink = document.getElementById('dropdownPortfolioLink');

                if (headerUserAvatar) headerUserAvatar.src = displayAvatar;
                if (dropdownUserName) dropdownUserName.textContent = displayName;
                if (dropdownUserBio) dropdownUserBio.textContent = displayRole;
                if (dropdownProfileLink) dropdownProfileLink.href = `/pages/artist-profile.html?id=${user.id || 101}`;
                if (dropdownPortfolioLink) dropdownPortfolioLink.href = `/pages/portfolio.html?id=${user.id || 101}`;

                // Mobile Profile Nav Button
                const mobileProfileNavBtn = document.getElementById('mobileProfileNavBtn');
                if (mobileProfileNavBtn) {
                    mobileProfileNavBtn.href = `/pages/artist-profile.html?id=${user.id || 101}`;
                }
            }
        } catch (e) {
            console.warn('Could not resolve current user session:', e);
        }
    }

    /**
     * =========================================================================
     * 2. LOAD ARTIST PROFILE FROM BACKEND API
     * =========================================================================
     */
    async function loadArtistProfile(id) {
        showLoadingState();

        try {
            const response = await fetch(`/api/artists/${id}`);
            const result = await response.json();

            if (!response.ok || !result.success || !result.data) {
                // Check if 404 / artist not found
                if (response.status === 404 || (result.message && result.message.toLowerCase().includes('not found'))) {
                    showErrorState('Artist not found', 'This artist profile is unavailable or has been removed.', false);
                    return;
                }
                showErrorState('Unable to load artist profile', result.message || 'Network request failed.', true);
                return;
            }

            currentArtistData = result.data;
            renderArtistProfile(currentArtistData);

            // Hide skeleton, show loaded profile
            hideLoadingAndError();
            if (loadedContent) loadedContent.style.display = 'grid';

        } catch (err) {
            console.error('Network or server error while loading artist:', err);
            showErrorState('Unable to load artist profile', 'Please check your internet connection or server status.', true);
        }
    }

    /**
     * =========================================================================
     * 3. RENDER ARTIST PROFILE DATA
     * =========================================================================
     */
    function renderArtistProfile(artist) {
        if (!artist) return;

        // Identity info
        const displayName = artist.fullName || artist.username || 'Creative Artist';
        const craftText = artist.artistType || 'Visual Artist';
        const locationText = artist.location || 'Mumbai, MH';
        const bioText = artist.bio || 'Passionate multidisciplinary creator building immersive stories and visual worlds.';

        if (artistName) artistName.textContent = displayName;
        if (artistCraft) artistCraft.textContent = craftText;
        if (artistCraftBadge) artistCraftBadge.textContent = craftText.toUpperCase();
        if (artistLocation) artistLocation.textContent = locationText;
        if (artistBio) artistBio.textContent = bioText;
        if (aboutArtistSummary) aboutArtistSummary.textContent = bioText;

        // Banner and Avatar
        if (artistCoverImg && artist.coverImage) {
            artistCoverImg.src = artist.coverImage;
        }
        if (artistAvatarImg && artist.profilePicture) {
            artistAvatarImg.src = artist.profilePicture;
        }

        // Stats
        const portfolioList = artist.portfolio || [];
        allArtworks = portfolioList;

        if (artworksCount) artworksCount.textContent = portfolioList.length > 0 ? portfolioList.length : (artist.postsCount || 9);
        if (postsCount) postsCount.textContent = artist.postsCount || 9;
        if (followersCount) followersCount.textContent = artist.followersCount || '1.8K';
        if (followingCount) followingCount.textContent = artist.followingCount || 356;

        // Follow Status
        isFollowing = !!artist.following;
        updateFollowBtnUI();

        // Propose Collab URLs
        const collabUrl = `/pages/create-collaboration.html?partnerId=${artist.id}&partnerName=${encodeURIComponent(displayName)}`;
        if (btnProposeCollab) btnProposeCollab.href = collabUrl;
        if (btnRightProposeCollab) btnRightProposeCollab.href = collabUrl;

        // Archive Link
        if (linkFullArchive) {
            linkFullArchive.href = `/pages/portfolio.html?id=${artist.id}`;
        }

        // External Links & Profiles
        renderExternalLinks(artist);

        // Skills Pills in Statement Pane
        renderSkills(artist.skills);

        // Render Portfolio Grid
        renderArtworksGrid(allArtworks);
    }

    /**
     * =========================================================================
     * 4. RENDER EXTERNAL PROFILES & SOCIAL LINKS
     * =========================================================================
     */
    function renderExternalLinks(artist) {
        let hasAnyLink = false;

        if (artist.instagramUrl && linkTileInstagram) {
            linkTileInstagram.href = artist.instagramUrl;
            linkTileInstagram.style.display = 'flex';
            hasAnyLink = true;
        } else if (linkTileInstagram) {
            linkTileInstagram.href = 'https://instagram.com';
            linkTileInstagram.style.display = 'flex';
            hasAnyLink = true;
        }

        if (artist.behanceUrl && linkTileBehance) {
            linkTileBehance.href = artist.behanceUrl;
            linkTileBehance.style.display = 'flex';
            hasAnyLink = true;
        } else if (linkTileBehance) {
            linkTileBehance.href = 'https://behance.net';
            linkTileBehance.style.display = 'flex';
            hasAnyLink = true;
        }

        if (artist.websiteUrl && linkTileWebsite) {
            linkTileWebsite.href = artist.websiteUrl;
            linkTileWebsite.style.display = 'flex';
            hasAnyLink = true;
        } else if (linkTileWebsite) {
            linkTileWebsite.href = `/pages/artist-profile.html?id=${artist.id}`;
            linkTileWebsite.style.display = 'flex';
            hasAnyLink = true;
        }

        if (noLinksHint) {
            noLinksHint.style.display = hasAnyLink ? 'none' : 'block';
        }
    }

    /**
     * =========================================================================
     * 5. RENDER SKILLS IN ARTISTIC STATEMENT PANE
     * =========================================================================
     */
    function renderSkills(skills) {
        if (!statementSkillsContainer) return;
        const skillsList = Array.isArray(skills) && skills.length > 0
            ? skills
            : ['Digital Art', 'Illustration', 'Portraits', 'Concept Art', 'Nature Art'];

        statementSkillsContainer.innerHTML = skillsList.map(skill => `
            <span class="skill-tag-pill">${escapeHtml(skill)}</span>
        `).join('');
    }

    /**
     * =========================================================================
     * 6. RENDER CURATED ARTWORKS GRID & FILTERING
     * =========================================================================
     */
    function renderArtworksGrid(items) {
        if (!profilePortfolioGrid) return;

        if (!items || items.length === 0) {
            profilePortfolioGrid.innerHTML = `
                <div class="empty-gallery-state">
                    <span class="empty-gallery-motif">✦</span>
                    <h4 class="empty-gallery-title">No Artworks Found</h4>
                    <p class="empty-gallery-desc">No portfolio pieces match the selected filter category.</p>
                </div>
            `;
            return;
        }

        const portfolioBaseUrl = `/pages/portfolio.html?id=${artistId || 101}`;

        profilePortfolioGrid.innerHTML = items.map(item => {
            const title = item.title || 'Untitled Artwork';
            const category = item.category || 'Digital Art';
            const year = '2026';
            const imgSrc = item.imageUrl || '/images/artwork_sunlit.png';

            return `
                <article class="artwork-card-item" onclick="window.location.href='${portfolioBaseUrl}'">
                    <div class="artwork-thumbnail-box">
                        <img src="${imgSrc}" alt="${escapeHtml(title)}" class="artwork-image" onerror="this.src='/images/artwork_sunlit.png'">
                    </div>
                    <div class="artwork-content-box">
                        <div class="artwork-headline-row">
                            <h4 class="artwork-title">${escapeHtml(title)}</h4>
                            <span class="artwork-year-badge">◆ ${year}</span>
                        </div>
                        <span class="artwork-category-meta">${escapeHtml(category)}</span>
                    </div>
                </article>
            `;
        }).join('');
    }

    /**
     * =========================================================================
     * 7. ARTWORK FILTER PILLS HANDLER
     * =========================================================================
     */
    function initArtworkFilters() {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const selectedCat = btn.getAttribute('data-category');
                if (!selectedCat || selectedCat.toLowerCase() === 'all') {
                    renderArtworksGrid(allArtworks);
                } else {
                    const filtered = allArtworks.filter(art => {
                        const cat = (art.category || '').toLowerCase();
                        const filterKey = selectedCat.toLowerCase();
                        return cat.includes(filterKey) ||
                               (filterKey === 'illustration' && cat.includes('illustrations')) ||
                               (filterKey === 'nature art' && (cat.includes('paintings') || cat.includes('photography')));
                    });
                    renderArtworksGrid(filtered);
                }
            });
        });
    }

    /**
     * =========================================================================
     * 8. PROFILE TABS SWITCHER
     * =========================================================================
     */
    function initTabsSwitcher() {
        profileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                profileTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                const targetTab = tab.getAttribute('data-tab');

                if (paneCuratedWorks) paneCuratedWorks.style.display = targetTab === 'curated' ? 'flex' : 'none';
                if (paneCollaborations) paneCollaborations.style.display = targetTab === 'collabs' ? 'flex' : 'none';
                if (paneArtisticStatement) paneArtisticStatement.style.display = targetTab === 'statement' ? 'flex' : 'none';

                if (targetTab === 'collabs') {
                    loadArtistCollaborationPitches(artistId);
                }
            });
        });
    }

    /**
     * =========================================================================
     * 9. LOAD COLLABORATION PITCHES FOR ARTIST
     * =========================================================================
     */
    async function loadArtistCollaborationPitches(id) {
        if (!profileCollabsGrid) return;

        try {
            const res = await fetch('/api/collaborations');
            if (res.ok) {
                const json = await res.json();
                const list = json.data || [];
                // Filter pitches where creator is this artist, or show available calls
                const artistPitches = list.filter(c => c.creatorId === id || c.userId === id);
                const displayPitches = artistPitches.length > 0 ? artistPitches : list.slice(0, 2);

                if (displayPitches.length > 0) {
                    profileCollabsGrid.innerHTML = displayPitches.map(p => `
                        <article class="pitch-card-item">
                            <span class="pitch-tag">${escapeHtml(p.purpose || 'OPEN CALL')}</span>
                            <h4 class="pitch-title">${escapeHtml(p.title || 'Creative Multidisciplinary Collaboration')}</h4>
                            <p class="pitch-desc">${escapeHtml(p.description || 'Looking for passionate creators to collaborate on an experimental visual storytelling piece.')}</p>
                            <a href="/pages/collaboration-details.html?id=${p.id}" class="btn-plum-primary full-width-action" style="margin-top: 8px;">
                                <span>View Collaboration Call</span>
                                <span>&rarr;</span>
                            </a>
                        </article>
                    `).join('');
                    return;
                }
            }
        } catch (e) {
            console.warn('Could not load collaboration pitches from API:', e);
        }

        // Graceful fallback card
        profileCollabsGrid.innerHTML = `
            <article class="pitch-card-item">
                <span class="pitch-tag">OPEN COLLAB</span>
                <h4 class="pitch-title">Atmospheric Urban Narrative Short Film</h4>
                <p class="pitch-desc">Open call for modular synthesists, sound designers, and poets to collaborate on a series of animated mood studies.</p>
                <a href="/pages/collaboration-details.html?id=1" class="btn-plum-primary full-width-action" style="margin-top: 8px;">
                    <span>View Collaboration Pitch</span>
                    <span>&rarr;</span>
                </a>
            </article>
        `;
    }

    /**
     * =========================================================================
     * 10. LOAD RELATED ARTISTS FROM BACKEND
     * =========================================================================
     */
    async function loadRelatedArtists(excludeId) {
        if (!relatedArtistsList) return;

        try {
            const res = await fetch('/api/artists');
            if (res.ok) {
                const json = await res.json();
                const artists = json.data || [];
                // Filter out current artist and pick 3
                const related = artists.filter(a => a.id !== excludeId).slice(0, 3);

                if (related.length > 0) {
                    relatedArtistsList.innerHTML = related.map(a => `
                        <div class="related-artist-row">
                            <img src="${a.avatar || a.profilePicture || '/images/user_avatar_nav.png'}" alt="${escapeHtml(a.fullName || a.name)}" class="related-artist-avatar" onerror="this.src='/images/user_avatar_nav.png'">
                            <div class="related-artist-meta">
                                <span class="related-artist-name">${escapeHtml(a.fullName || a.name)}</span>
                                <span class="related-artist-craft">${escapeHtml(a.craft || a.artistType || 'Creative Artist')}</span>
                            </div>
                            <a href="/pages/artist-profile.html?id=${a.id}" class="btn-circle-mini" aria-label="View ${escapeHtml(a.fullName || a.name)}'s Profile" title="View Profile">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </a>
                        </div>
                    `).join('');
                }
            }
        } catch (e) {
            console.warn('Could not load related artists:', e);
        }
    }

    /**
     * =========================================================================
     * 11. ACTION BUTTONS: FOLLOW TOGGLE, SHARE, PROPOSE COLLAB
     * =========================================================================
     */
    function initActionButtons() {
        // Follow Toggle Button
        if (btnFollow) {
            btnFollow.addEventListener('click', async () => {
                const targetId = artistId || 101;
                try {
                    let endpoint = `/api/artists/${targetId}/follow`;
                    const res = await fetch(endpoint, { method: 'POST' });
                    const json = await res.json();

                    if (json.success && json.data) {
                        isFollowing = !!json.data.following;
                    } else {
                        isFollowing = !isFollowing;
                    }
                } catch (e) {
                    console.warn('Follow request error, toggling client state:', e);
                    isFollowing = !isFollowing;
                }

                updateFollowBtnUI();

                // Update followers count badge locally
                if (followersCount) {
                    let countText = followersCount.textContent;
                    if (!countText.includes('K')) {
                        let num = parseInt(countText, 10) || 0;
                        followersCount.textContent = isFollowing ? num + 1 : Math.max(0, num - 1);
                    }
                }

                const artistNameText = currentArtistData ? currentArtistData.fullName : 'this artist';
                showToast(isFollowing ? `You are now following ${artistNameText}!` : `Unfollowed ${artistNameText}.`);
            });
        }

        // Share Profile Button
        if (btnShareProfile) {
            btnShareProfile.addEventListener('click', async () => {
                const currentUrl = window.location.href;
                const pageTitle = currentArtistData ? `${currentArtistData.fullName} — ArtSphere Profile` : document.title;

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: pageTitle,
                            text: `Check out ${currentArtistData ? currentArtistData.fullName : 'this artist'} on ArtSphere!`,
                            url: currentUrl
                        });
                        return;
                    } catch (_) {}
                }

                // Fallback: Copy to clipboard
                if (navigator.clipboard) {
                    try {
                        await navigator.clipboard.writeText(currentUrl);
                        showToast('Profile link copied to clipboard!');
                        return;
                    } catch (_) {}
                }

                // Generic fallback
                showToast('Profile link ready: ' + currentUrl);
            });
        }
    }

    function updateFollowBtnUI() {
        if (!btnFollow) return;

        if (isFollowing) {
            btnFollow.classList.add('following');
            if (followBtnText) followBtnText.textContent = 'Following';
            if (followBtnIcon) followBtnIcon.innerHTML = '&#10003;';
        } else {
            btnFollow.classList.remove('following');
            if (followBtnText) followBtnText.textContent = 'Follow Creator';
            if (followBtnIcon) followBtnIcon.innerHTML = '&rarr;';
        }
    }

    /**
     * =========================================================================
     * 12. LOADING & ERROR STATE HELPERS
     * =========================================================================
     */
    function showLoadingState() {
        if (loadingState) loadingState.style.display = 'block';
        if (errorState) errorState.style.display = 'none';
        if (loadedContent) loadedContent.style.display = 'none';
    }

    function showErrorState(title, message, canRetry) {
        if (loadingState) loadingState.style.display = 'none';
        if (loadedContent) loadedContent.style.display = 'none';
        if (errorState) errorState.style.display = 'block';

        if (errorTitle) errorTitle.textContent = title;
        if (errorMessage) errorMessage.textContent = message;
        if (btnRetryLoad) btnRetryLoad.style.display = canRetry ? 'inline-flex' : 'none';
    }

    function hideLoadingAndError() {
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
    }

    /**
     * =========================================================================
     * 13. TOAST NOTIFICATIONS
     * =========================================================================
     */
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'profile-toast-item';
        toast.textContent = msg;

        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 280);
        }, 3000);
    }

    /**
     * =========================================================================
     * 14. SIDEBAR DRAWER & MOBILE CONTROLS
     * =========================================================================
     */
    function initSidebarDrawer() {
        const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
        const dashboardSidebar = document.getElementById('dashboardSidebar');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');

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
    }

    /**
     * =========================================================================
     * 15. USER DROPDOWN & LOGOUT
     * =========================================================================
     */
    function initUserDropdown() {
        const userMenuTrigger = document.getElementById('userMenuTrigger');
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

        if (userMenuTrigger && userDropdownMenu) {
            userMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = userDropdownMenu.classList.toggle('active');
                userMenuTrigger.setAttribute('aria-expanded', isOpen);
            });

            document.addEventListener('click', (e) => {
                if (!userDropdownMenu.contains(e.target) && !userMenuTrigger.contains(e.target)) {
                    userDropdownMenu.classList.remove('active');
                    userMenuTrigger.setAttribute('aria-expanded', 'false');
                }
            });
        }

        async function handleLogout() {
            if (confirm('Are you sure you want to log out of ArtSphere?')) {
                if (window.api && typeof window.api.logout === 'function') {
                    await window.api.logout();
                } else {
                    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
                    window.location.href = '/pages/login.html';
                }
            }
        }

        if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);
        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
    }

    /**
     * =========================================================================
     * 16. TOP GLOBAL SEARCH INPUT
     * =========================================================================
     */
    function initSearchInput() {
        const searchInput = document.getElementById('globalSearchInput');
        if (!searchInput) return;

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `/pages/discover.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
