/**
 * ArtSphere – Artist Profile Module
 * Editorial Neo-brutalism • Creator Dossier & Portfolio Showcase
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Mrunali / Aanya)
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('id') ? parseInt(urlParams.get('id')) : 101;

    // Navigation & Dropdown
    initNavigation();

    // Elements
    const artistCoverImg = document.getElementById('artistCoverImg');
    const artistAvatarImg = document.getElementById('artistAvatarImg');
    const artistName = document.getElementById('artistName');
    const artistCraft = document.getElementById('artistCraft');
    const artistCraftBadge = document.getElementById('artistCraftBadge');
    const artistLocation = document.getElementById('artistLocation');
    const artistBio = document.getElementById('artistBio');

    const artworksCount = document.getElementById('artworksCount');
    const postsCount = document.getElementById('postsCount');
    const followersCount = document.getElementById('followersCount');
    const followingCount = document.getElementById('followingCount');

    const artistSkillsContainer = document.getElementById('artistSkillsContainer');
    const socialInstagram = document.getElementById('socialInstagram');
    const socialBehance = document.getElementById('socialBehance');
    const socialWebsite = document.getElementById('socialWebsite');

    const btnFollow = document.getElementById('btnFollow');
    const btnMessage = document.getElementById('btnMessage');
    const btnShareProfile = document.getElementById('btnShareProfile');
    const linkSeeAllPortfolio = document.getElementById('linkSeeAllPortfolio');
    const profilePortfolioGrid = document.getElementById('profilePortfolioGrid');

    let currentArtistData = null;
    let isFollowing = false;

    // Section tabs switcher
    initSectionTabs();

    // Load Artist Data
    loadArtist(artistId);

    async function loadArtist(id) {
        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getArtistProfile === 'function') {
                const data = await window.ArtSphereAPI.getArtistProfile(id);
                if (data && (data.name || data.fullName)) {
                    currentArtistData = data;
                    renderArtist(data);
                    loadPortfolio(id);
                    return;
                }
            }
        } catch (err) {
            console.warn('API error, falling back to curated artist dossier:', err);
        }

        currentArtistData = getFallbackArtist(id);
        renderArtist(currentArtistData);
        loadPortfolio(id);
    }

    function renderArtist(a) {
        if (!a) return;

        const displayName = a.fullName || a.name || 'Creative Artist';
        const craft = a.craft || a.artistType || a.discipline || 'Visual Artist & Illustrator';
        const location = a.location || 'Mumbai, Maharashtra';
        const bio = a.bio || 'Passionate independent multidisciplinary creator building immersive stories.';

        if (artistName) artistName.textContent = displayName;
        if (artistCraft) artistCraft.textContent = craft;
        if (artistCraftBadge) artistCraftBadge.textContent = (a.category || a.craft || 'VISUAL ARTIST').toUpperCase();
        if (artistLocation) artistLocation.textContent = location;
        if (artistBio) artistBio.textContent = bio;

        if (artistCoverImg && a.coverImage) artistCoverImg.src = a.coverImage;
        if (artistAvatarImg && (a.avatar || a.profileImage)) artistAvatarImg.src = a.avatar || a.profileImage;

        if (artworksCount) artworksCount.textContent = a.artworksCount || (a.portfolio ? a.portfolio.length : 18);
        if (postsCount) postsCount.textContent = a.postsCount || 24;
        if (followersCount) followersCount.textContent = a.followersCount || '1.8K';
        if (followingCount) followingCount.textContent = a.followingCount || 356;

        if (linkSeeAllPortfolio) {
            linkSeeAllPortfolio.href = `/pages/portfolio.html?id=${a.id || artistId}`;
        }

        // Skills Pills
        if (artistSkillsContainer) {
            const skills = a.skills && a.skills.length > 0 ? a.skills : ['Digital Art', 'Visual Narrative', 'Background Design', 'Gouache', 'Concept Art'];
            artistSkillsContainer.innerHTML = skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');
        }

        // Follow Button State
        if (btnFollow) {
            isFollowing = !!a.isFollowing;
            updateFollowButtonState();
            btnFollow.onclick = () => toggleFollow(a.id || artistId);
        }

        // Share Button
        if (btnShareProfile) {
            btnShareProfile.onclick = () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Profile link copied to clipboard!');
                } else {
                    showToast('Profile link ready: ' + window.location.href);
                }
            };
        }
    }

    async function loadPortfolio(id) {
        if (!profilePortfolioGrid) return;

        try {
            let artworks = null;
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getArtistPortfolio === 'function') {
                const list = await window.ArtSphereAPI.getArtistPortfolio(id);
                if (Array.isArray(list) && list.length > 0) artworks = list;
            }

            if (!artworks || artworks.length === 0) {
                artworks = getFallbackArtworks(id);
            }

            renderPortfolio(artworks);
        } catch (e) {
            console.warn('API error loading portfolio, using fallback:', e);
            renderPortfolio(getFallbackArtworks(id));
        }
    }

    function renderPortfolio(items) {
        if (!profilePortfolioGrid) return;

        if (!items || items.length === 0) {
            profilePortfolioGrid.innerHTML = `
                <div class="col-12 empty-state-card">
                    <div class="empty-state-motif">✦</div>
                    <h3 class="empty-state-heading">No Artworks in Portfolio</h3>
                    <p class="empty-state-desc">This creator hasn't published any portfolio pieces yet.</p>
                </div>
            `;
            return;
        }

        const previewItems = items.slice(0, 6);
        profilePortfolioGrid.innerHTML = previewItems.map(item => {
            const portfolioUrl = `/pages/portfolio.html?id=${artistId}`;
            return `
                <div class="col-4 col-md-6 col-sm-12">
                    <article class="artwork-preview-card" onclick="window.location.href='${portfolioUrl}'">
                        <div class="artwork-thumb-wrap">
                            <img src="${item.imageUrl || '/images/card_img_music.png'}" alt="${escapeHtml(item.title)}" class="artwork-thumb-img" onerror="this.src='/images/card_img_music.png'">
                        </div>
                        <div class="artwork-card-info">
                            <h4 class="artwork-card-title">${escapeHtml(item.title)}</h4>
                            <div class="artwork-card-meta">
                                <span>${escapeHtml(item.category || 'Digital Painting')}</span>
                                <span>✦ ${item.year || '2026'}</span>
                            </div>
                        </div>
                    </article>
                </div>
            `;
        }).join('');
    }

    async function toggleFollow(targetId) {
        isFollowing = !isFollowing;
        updateFollowButtonState();

        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.toggleFollowArtist === 'function') {
                await window.ArtSphereAPI.toggleFollowArtist(targetId);
            }
        } catch (e) {
            console.warn('Follow API failed:', e);
        }

        showToast(isFollowing ? 'You are now following this artist!' : 'Unfollowed artist.');
    }

    function updateFollowButtonState() {
        if (!btnFollow) return;
        if (isFollowing) {
            btnFollow.innerHTML = '<span>Following ✓</span>';
            btnFollow.style.background = '#0A0A0A';
            btnFollow.style.color = '#FFF49A';
        } else {
            btnFollow.innerHTML = '<span>Follow Creator</span><span>&rarr;</span>';
            btnFollow.style.background = '';
            btnFollow.style.color = '';
        }
    }

    function initSectionTabs() {
        const tabs = document.querySelectorAll('.profile-tab-btn');
        const contentPortfolio = document.getElementById('tabContentPortfolio');
        const contentCollaborations = document.getElementById('tabContentCollaborations');
        const contentStatement = document.getElementById('tabContentStatement');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const target = tab.getAttribute('data-tab');
                if (contentPortfolio) contentPortfolio.style.display = target === 'portfolio' ? 'block' : 'none';
                if (contentCollaborations) contentCollaborations.style.display = target === 'collaborations' ? 'block' : 'none';
                if (contentStatement) contentStatement.style.display = target === 'statement' ? 'block' : 'none';

                if (target === 'collaborations') {
                    loadArtistCollabs();
                }
            });
        });
    }

    function loadArtistCollabs() {
        const grid = document.getElementById('profileCollabsGrid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="col-6 col-md-8 col-sm-4">
                <article class="hub-content-card">
                    <span class="pill-tag accent-yellow" style="margin-bottom: 12px; display: inline-block;">OPEN CALL</span>
                    <h3 class="card-heading" style="margin-bottom: 10px;">Looking for a Digital Artist for a Short Film Project</h3>
                    <p class="dossier-body-text" style="margin-bottom: 16px;">
                        7-minute poetic narrative short film exploring nocturnal mythologies in old Mumbai.
                    </p>
                    <a href="/pages/collaboration-details.html?id=1" class="btn-pill-primary">
                        <span>View Pitch Dossier</span>
                        <span>&rarr;</span>
                    </a>
                </article>
            </div>
        `;
    }

    function getFallbackArtist(id) {
        return {
            id: id,
            fullName: id === 101 ? 'Aanya Deshmukh' : (id === 102 ? 'Devansh Roy' : 'Maya Sen'),
            craft: id === 101 ? 'Visual Artist & Narrative Illustrator' : (id === 102 ? 'Sound Designer & Modular Synthesist' : 'Cinematographer & Architect'),
            category: id === 101 ? 'Visual Arts' : (id === 102 ? 'Music' : 'Film & Dance'),
            location: id === 101 ? 'Mumbai, Maharashtra' : (id === 102 ? 'Bengaluru, Karnataka' : 'Ahmedabad, Gujarat'),
            bio: 'Illustrator and visual researcher exploring everyday architectural memories, monsoon light, and subtle human connection through digital painting and gouache sketchbooks.',
            coverImage: '/images/artist_profile_cover.png',
            avatar: '/images/user_avatar_nav.png',
            artworksCount: 18,
            postsCount: 24,
            followersCount: '1.8K',
            followingCount: 356,
            skills: ['Digital Art', 'Visual Narrative', 'Background Design', 'Gouache', 'Concept Art'],
            isFollowing: false
        };
    }

    function getFallbackArtworks(id) {
        return [
            { id: 1, title: 'Nocturnal Mumbai: Marine Drive Study', category: 'Digital Painting', year: '2026', imageUrl: '/images/card_img_digital.png' },
            { id: 2, title: 'Old Quarter Balconies in Gouache', category: 'Traditional Gouache', year: '2026', imageUrl: '/images/card_img_visual.png' },
            { id: 3, title: 'Monsoon Light over Churchgate', category: 'Concept Art', year: '2025', imageUrl: '/images/card_img_photography.png' },
            { id: 4, title: 'Midnight Tea Stall Character Study', category: 'Character Design', year: '2025', imageUrl: '/images/card_img_music.png' },
            { id: 5, title: 'Shadow Topologies & Stone Arches', category: 'Architectural Sketch', year: '2025', imageUrl: '/images/card_img_dance.png' },
            { id: 6, title: 'Ambient Cityscape Keyframe #4', category: 'Background Design', year: '2024', imageUrl: '/images/card_img_writing.png' }
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
