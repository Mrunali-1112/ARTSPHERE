/**
 * ArtSphere — Community Hub & Details Script
 * Editorial Neo-Brutalist Architecture, Guild Feeds & Interactive Jams
 */

let currentUser = null;
let currentUserId = 101;
let communityId = 401;
let communityData = null;
let loadedEvents = [];
let loadedPosts = [];
let activePostCategory = 'All Posts';
let activeEventType = 'All';
let eventsSearchTerm = '';
let selectedArtworkUrl = '/images/comm_post_sunset_painting.png';

// Fallback Guild Archive
const DEFAULT_GUILD_DATA = {
    401: {
        id: 401,
        name: "Creative Souls Network",
        category: "All",
        artForms: "Multidisciplinary",
        location: "Global",
        description: "A welcoming collective for artists of all forms to share feedback, form collab crews, and host jam sessions.",
        memberCount: 1250,
        createdDate: "12 Mar 2024",
        joined: true,
        coverImage: "/images/comm_creative_souls_cover.png",
        imageUrl: "/images/comm_creative_souls_avatar.png",
        rules: "Be kind, generous, and constructive in all feedback.\nPost only authentic, original creations and cite references.\nEncourage emerging artists and beginners warmly.\nZero tolerance for spam, harassment, or unsolicited sales.\nKeep discussions focused on craft, process, and creative growth."
    },
    402: {
        id: 402,
        name: "Canvas & Ink Guild",
        category: "Painting",
        artForms: "Oil, Acrylic & Gouache",
        location: "Mumbai",
        description: "Traditional and contemporary painters gathering weekly for live critique, texture studies, and gallery group shows.",
        memberCount: 820,
        createdDate: "18 Jan 2024",
        joined: false,
        coverImage: "/images/comm_painting_souls.png",
        imageUrl: "/images/category_visual_arts.png",
        rules: "Original works only.\nProvide constructive materials critique.\nRespect artist copyright and process."
    }
};

const DEFAULT_POSTS = [
    {
        id: 701,
        artistId: 101,
        artistName: "Aanya Deshmukh",
        artistAvatar: "/images/user_avatar_nav.png",
        artistType: "Admin",
        timeAgo: "2 hours ago",
        caption: "Working on layer 4 of this mixed-media canvas. Playing with ochre pigments and heavy textured gesso. What do you think of the tonal balance?",
        mediaUrl: "/images/comm_post_sunset_painting.png",
        category: "Artworks",
        likesCount: 42,
        commentsCount: 9,
        isLiked: false,
        isSaved: false
    },
    {
        id: 702,
        artistId: 102,
        artistName: "Rohan Mehta",
        artistAvatar: "/images/highlight_charcoal_portrait.png",
        artistType: "Member",
        timeAgo: "5 hours ago",
        caption: "Quick charcoal gesture studies from this morning's outdoor session near Marine Drive. Aiming for expressive silhouettes within 90-second poses.",
        mediaUrl: "/images/comm_post_sketchbook.png",
        category: "Artworks",
        likesCount: 31,
        commentsCount: 6,
        isLiked: true,
        isSaved: true
    },
    {
        id: 703,
        artistId: 103,
        artistName: "Meera Shah",
        artistAvatar: "/images/opp_lens_and_life.png",
        artistType: "Member",
        timeAgo: "1 day ago",
        caption: "Discussion: What are your go-to practices for overcoming mid-project creative resistance? For me, switching mediums from sound to sketching helps reset.",
        mediaUrl: "/images/comm_feat_street.png",
        category: "Discussions",
        likesCount: 19,
        commentsCount: 14,
        isLiked: false,
        isSaved: false
    }
];

const DEFAULT_EVENTS = [
    {
        id: 801,
        title: "Watercolor & Pigment Study Workshop",
        description: "Hands-on session exploring granulating watercolors, negative painting techniques, and paper stretching for fine art compositions.",
        eventType: "Workshop",
        eventDate: "15 Mar 2026",
        eventTime: "4:00 PM – 6:30 PM (IST)",
        location: "Art Studio, Bandra West, Mumbai",
        imageUrl: "/images/comm_event_watercolor.png",
        attendeesCount: 34,
        registered: false
    },
    {
        id: 802,
        title: "Spring Vernissage: Independent Collective Showcase",
        description: "Curated open studio exhibition showcasing works from 20 guild creators across illustration, analog photography, and sound art.",
        eventType: "Exhibition",
        eventDate: "28 Mar 2026",
        eventTime: "6:00 PM – 10:00 PM (IST)",
        location: "The Black Box Gallery, Bengaluru",
        imageUrl: "/images/comm_event_detail_cover.png",
        attendeesCount: 78,
        registered: true
    },
    {
        id: 803,
        title: "Ambient Modular Listening & Tape Swap",
        description: "Intimate audio salon where producers share cassette tapes, ambient textures, and soundscape field recordings.",
        eventType: "Live Session",
        eventDate: "05 Apr 2026",
        eventTime: "7:00 PM – 9:00 PM (IST)",
        location: "Studio 4B & Discord Audio Stage",
        imageUrl: "/images/comm_indie_musicians.png",
        attendeesCount: 29,
        registered: false
    }
];

const DEFAULT_MEMBERS = [
    {
        userId: 101,
        fullName: "Aanya Deshmukh",
        role: "ADMIN",
        profilePicture: "/images/user_avatar_nav.png",
        joinedAt: "Jan 2024"
    },
    {
        userId: 102,
        fullName: "Rohan Mehta",
        role: "Visual Arts Lead",
        profilePicture: "/images/highlight_charcoal_portrait.png",
        joinedAt: "Feb 2024"
    },
    {
        userId: 103,
        fullName: "Meera Shah",
        role: "Audio Resident",
        profilePicture: "/images/opp_lens_and_life.png",
        joinedAt: "Feb 2024"
    },
    {
        userId: 104,
        fullName: "Devika Rao",
        role: "Member",
        profilePicture: "/images/artist_profile_avatar.png",
        joinedAt: "Mar 2024"
    },
    {
        userId: 105,
        fullName: "Kabir Sen",
        role: "Member",
        profilePicture: "/images/category_crafts.png",
        joinedAt: "Apr 2024"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Parse URL Params
    const urlParams = new URLSearchParams(window.location.search);
    const parsedId = parseInt(urlParams.get('id'), 10);
    if (!isNaN(parsedId)) communityId = parsedId;
    const initialTab = (urlParams.get('tab') || 'overview').toLowerCase();

    initNavigationDrawer();
    initUserMenu();
    setupTabs(initialTab);
    setupEventListeners();
    loadCommunityDetails();
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
function initUserMenu() {
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserBio = document.getElementById('dropdownUserBio');
    const headerUserAvatar = document.getElementById('headerUserAvatar');

    try {
        const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (stored) {
            currentUser = JSON.parse(stored);
            if (currentUser.id) currentUserId = currentUser.id;
            if (currentUser.name && dropdownUserName) dropdownUserName.textContent = currentUser.name;
            if (currentUser.bio && dropdownUserBio) dropdownUserBio.textContent = currentUser.bio;
            if (currentUser.avatarUrl && headerUserAvatar) headerUserAvatar.src = currentUser.avatarUrl;
        }
    } catch (e) {
        console.warn('Could not read user session', e);
    }

    if (userAvatarBtn && userDropdownPanel) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userDropdownPanel.classList.toggle('show');
            userAvatarBtn.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (userDropdownPanel.classList.contains('show') && !userDropdownPanel.contains(e.target)) {
                userDropdownPanel.classList.remove('show');
                userAvatarBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/landing.html';
        });
    }
}

/**
 * 3. Neo-Brutalist Pill Tabs Setup
 */
function setupTabs(initialTab) {
    const tabButtons = document.querySelectorAll('.hub-tab-btn');
    const tabPanes = {
        overview: document.getElementById('paneOverview'),
        posts: document.getElementById('panePosts'),
        events: document.getElementById('paneEvents'),
        members: document.getElementById('paneMembers')
    };

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Handle "See All" inline buttons from overview
    document.querySelectorAll('[data-switch-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-switch-tab');
            switchTab(target);
        });
    });

    if (['overview', 'posts', 'events', 'members'].includes(initialTab)) {
        switchTab(initialTab);
    } else {
        switchTab('overview');
    }

    function switchTab(tabName) {
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        Object.keys(tabPanes).forEach(paneKey => {
            if (tabPanes[paneKey]) {
                tabPanes[paneKey].classList.toggle('active', paneKey === tabName);
            }
        });

        if (tabName === 'posts') {
            loadCommunityPosts();
        } else if (tabName === 'events') {
            loadCommunityEvents();
        } else if (tabName === 'members') {
            loadCommunityMembers();
        }

        const newUrl = new URL(window.location);
        newUrl.searchParams.set('tab', tabName);
        window.history.replaceState({}, '', newUrl);
    }
}

/**
 * 4. General Event Listeners
 */
function setupEventListeners() {
    const btnHeaderJoin = document.getElementById('btnHeaderJoin');
    const btnInviteFriends = document.getElementById('btnInviteFriends');
    const btnSubmitCommPost = document.getElementById('btnSubmitCommPost');
    const btnAddArtworkBtn = document.getElementById('btnAddArtworkBtn');
    const postsCategoryFilterGroup = document.getElementById('postsCategoryFilterGroup');
    const eventsFilterPillsRow = document.getElementById('eventsFilterPillsRow');
    const eventsSearchInput = document.getElementById('eventsSearchInput');
    const closeEventModalBtn = document.getElementById('closeEventModalBtn');
    const eventDetailModal = document.getElementById('eventDetailModal');
    const registrationSuccessModal = document.getElementById('registrationSuccessModal');
    const closeRegSuccessBtn = document.getElementById('closeRegSuccessBtn');
    const btnRegGreat = document.getElementById('btnRegGreat');

    if (btnHeaderJoin) {
        btnHeaderJoin.addEventListener('click', handleHeaderJoinToggle);
    }

    if (btnInviteFriends) {
        btnInviteFriends.addEventListener('click', () => {
            const url = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    showToast('Guild invite link copied to clipboard!');
                }).catch(() => {
                    showToast('Guild URL: ' + url);
                });
            } else {
                showToast('Guild URL: ' + url);
            }
        });
    }

    if (btnSubmitCommPost) {
        btnSubmitCommPost.addEventListener('click', handleCreatePostSubmit);
    }

    if (btnAddArtworkBtn) {
        btnAddArtworkBtn.addEventListener('click', () => {
            const choices = [
                '/images/comm_post_sunset_painting.png',
                '/images/comm_post_sketchbook.png',
                '/images/comm_feat_daisies.png',
                '/images/comm_feat_street.png'
            ];
            const currentIndex = choices.indexOf(selectedArtworkUrl);
            selectedArtworkUrl = choices[(currentIndex + 1) % choices.length];
            showToast('Artwork attached: ' + selectedArtworkUrl.split('/').pop());
        });
    }

    if (postsCategoryFilterGroup) {
        postsCategoryFilterGroup.addEventListener('change', (e) => {
            activePostCategory = e.target.value;
            filterAndRenderPosts();
        });
    }

    // Tag pills in posts sidebar
    document.querySelectorAll('.tag-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const tag = pill.getAttribute('data-tag');
            const textarea = document.getElementById('commPostCaptionInput');
            if (textarea) {
                textarea.value = `${textarea.value} #${tag}`.trim();
                textarea.focus();
            }
        });
    });

    if (eventsFilterPillsRow) {
        eventsFilterPillsRow.addEventListener('click', (e) => {
            const pill = e.target.closest('.filter-pill-btn');
            if (!pill) return;
            eventsFilterPillsRow.querySelectorAll('.filter-pill-btn').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeEventType = pill.getAttribute('data-type') || 'All';
            filterAndRenderEvents();
        });
    }

    if (eventsSearchInput) {
        eventsSearchInput.addEventListener('input', (e) => {
            eventsSearchTerm = e.target.value.toLowerCase().trim();
            filterAndRenderEvents();
        });
    }

    if (closeEventModalBtn && eventDetailModal) {
        closeEventModalBtn.addEventListener('click', () => {
            eventDetailModal.style.display = 'none';
        });
        eventDetailModal.addEventListener('click', (e) => {
            if (e.target === eventDetailModal) eventDetailModal.style.display = 'none';
        });
    }

    if (closeRegSuccessBtn && registrationSuccessModal) {
        closeRegSuccessBtn.addEventListener('click', () => {
            registrationSuccessModal.style.display = 'none';
        });
    }
    if (btnRegGreat && registrationSuccessModal) {
        btnRegGreat.addEventListener('click', () => {
            registrationSuccessModal.style.display = 'none';
        });
    }
    if (registrationSuccessModal) {
        registrationSuccessModal.addEventListener('click', (e) => {
            if (e.target === registrationSuccessModal) registrationSuccessModal.style.display = 'none';
        });
    }
}

/**
 * 5. Load Community Details
 */
async function loadCommunityDetails() {
    let fallback = DEFAULT_GUILD_DATA[communityId] || DEFAULT_GUILD_DATA[401];

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCommunityDetails === 'function') {
            const res = await window.ArtSphereAPI.getCommunityDetails(communityId, currentUserId);
            if (res) {
                communityData = { ...fallback, ...res };
            } else {
                communityData = { ...fallback };
            }
        } else {
            communityData = { ...fallback };
        }
    } catch (err) {
        console.warn('API error, using curated fallback guild:', err);
        communityData = { ...fallback };
    }

    renderCommunityHeader(communityData);
    renderOverviewTab(communityData);
}

/**
 * 6. Render Community Header
 */
function renderCommunityHeader(data) {
    if (!data) return;

    document.title = `${data.name || 'Creative Guild'} | ArtSphere`;

    const commName = document.getElementById('commName');
    const commDesc = document.getElementById('commDesc');
    const commCoverImg = document.getElementById('commCoverImg');
    const commAvatarImg = document.getElementById('commAvatarImg');
    const commCategoryPill = document.getElementById('commCategoryPill');
    const commMetaMembers = document.getElementById('commMetaMembers');
    const commMetaArtForms = document.getElementById('commMetaArtForms');
    const commMetaLocation = document.getElementById('commMetaLocation');
    const btnHeaderJoin = document.getElementById('btnHeaderJoin');

    if (commName) commName.textContent = data.name || 'Creative Souls Network';
    if (commDesc) commDesc.textContent = data.description || '';
    if (commCoverImg && data.coverImage) commCoverImg.src = data.coverImage;
    if (commAvatarImg && (data.imageUrl || data.coverImage)) commAvatarImg.src = data.imageUrl || data.coverImage;
    if (commCategoryPill) commCategoryPill.textContent = (data.category || 'COLLECTIVE').toUpperCase();

    if (commMetaMembers) {
        commMetaMembers.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            ${formatCount(data.memberCount || 1250)} members
        `;
    }

    if (commMetaArtForms) {
        commMetaArtForms.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            ${escapeHtml(data.artForms || 'Multidisciplinary')}
        `;
    }

    if (commMetaLocation) {
        commMetaLocation.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${escapeHtml(data.location || 'Global')}
        `;
    }

    if (btnHeaderJoin) {
        if (data.joined) {
            btnHeaderJoin.classList.add('joined');
            btnHeaderJoin.innerHTML = `<span class="btn-text">Joined ✦</span>`;
        } else {
            btnHeaderJoin.classList.remove('joined');
            btnHeaderJoin.innerHTML = `<span class="btn-text">Join Guild &rarr;</span>`;
        }
    }
}

/**
 * 7. Render Overview Tab
 */
function renderOverviewTab(data) {
    if (!data) return;

    const overviewAboutText = document.getElementById('overviewAboutText');
    const statMembersCount = document.getElementById('statMembersCount');
    const statCreatedDate = document.getElementById('statCreatedDate');
    const overviewRulesList = document.getElementById('overviewRulesList');

    if (overviewAboutText && data.description) {
        overviewAboutText.textContent = data.description;
    }

    if (statMembersCount) {
        statMembersCount.textContent = formatCount(data.memberCount || 1250);
    }

    if (statCreatedDate && data.createdDate) {
        statCreatedDate.textContent = data.createdDate;
    }

    if (overviewRulesList && data.rules) {
        const rulesArray = data.rules.split('\n').filter(r => r.trim());
        if (rulesArray.length > 0) {
            overviewRulesList.innerHTML = rulesArray.map(r => `<li>${escapeHtml(r.trim())}</li>`).join('');
        }
    }

    const overviewJoinBtn = document.querySelector('.btn-overview-event-join');
    if (overviewJoinBtn) {
        overviewJoinBtn.addEventListener('click', () => {
            const evId = overviewJoinBtn.getAttribute('data-event-id') || 801;
            handleEventRegistration(evId, 'Monthly Multidisciplinary Showcase & Jam');
        });
    }
}

/**
 * 8. Handle Header Join / Leave Toggle
 */
async function handleHeaderJoinToggle() {
    const btnHeaderJoin = document.getElementById('btnHeaderJoin');
    if (!btnHeaderJoin || !communityData) return;

    const isJoined = btnHeaderJoin.classList.contains('joined');
    btnHeaderJoin.disabled = true;

    try {
        if (window.ArtSphereAPI) {
            if (isJoined) {
                if (typeof window.ArtSphereAPI.leaveCommunity === 'function') {
                    await window.ArtSphereAPI.leaveCommunity(communityId, currentUserId);
                }
            } else {
                if (typeof window.ArtSphereAPI.joinCommunity === 'function') {
                    await window.ArtSphereAPI.joinCommunity(communityId, currentUserId);
                }
            }
        }

        communityData.joined = !isJoined;
        communityData.memberCount = (communityData.memberCount || 1250) + (communityData.joined ? 1 : -1);

        renderCommunityHeader(communityData);
        const statMembersCount = document.getElementById('statMembersCount');
        if (statMembersCount) statMembersCount.textContent = formatCount(communityData.memberCount);

        showToast(communityData.joined ? 'Welcome to the guild!' : 'Left community guild');
    } catch (err) {
        console.error('Error toggling join status:', err);
        showToast('Action failed. Please try again.');
    } finally {
        btnHeaderJoin.disabled = false;
    }
}

/**
 * 9. Posts Tab: Load and Render
 */
async function loadCommunityPosts() {
    const stream = document.getElementById('commPostsStream');
    if (!stream) return;

    stream.innerHTML = `
        <div class="loading-state-wrapper">
            <div class="loading-spinner"></div>
            <p>Loading guild studio stream...</p>
        </div>
    `;

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCommunityPosts === 'function') {
            const posts = await window.ArtSphereAPI.getCommunityPosts(communityId, null, currentUserId);
            if (posts && posts.length > 0) {
                loadedPosts = posts;
            } else {
                loadedPosts = [...DEFAULT_POSTS];
            }
        } else {
            loadedPosts = [...DEFAULT_POSTS];
        }
    } catch (err) {
        console.warn('API error, using curated editorial posts:', err);
        loadedPosts = [...DEFAULT_POSTS];
    }

    filterAndRenderPosts();
}

function filterAndRenderPosts() {
    const stream = document.getElementById('commPostsStream');
    if (!stream) return;

    let filtered = [...loadedPosts];
    if (activePostCategory && activePostCategory !== 'All Posts') {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === activePostCategory.toLowerCase());
    }

    if (filtered.length === 0) {
        stream.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-icon">✦</div>
                <h3>No posts in this category</h3>
                <p>Be the first artist in the guild to share a work in progress or start a discussion!</p>
            </div>
        `;
        return;
    }

    stream.innerHTML = filtered.map(post => createPostCardHtml(post)).join('');

    // Attach Like Handlers
    stream.querySelectorAll('.btn-post-like').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const postId = btn.getAttribute('data-id');
            const isLiked = btn.classList.contains('liked');
            const countSpan = btn.querySelector('.like-count');
            let count = parseInt(countSpan.textContent, 10) || 0;

            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.toggleLike === 'function') {
                    await window.ArtSphereAPI.toggleLike(postId);
                }
                btn.classList.toggle('liked', !isLiked);
                countSpan.textContent = isLiked ? Math.max(0, count - 1) : count + 1;
            } catch (err) {
                console.error('Like toggle error:', err);
            }
        });
    });

    // Attach Save Handlers
    stream.querySelectorAll('.btn-post-save').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const postId = btn.getAttribute('data-id');
            const isSaved = btn.classList.contains('saved');

            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.toggleSave === 'function') {
                    await window.ArtSphereAPI.toggleSave(postId);
                }
                btn.classList.toggle('saved', !isSaved);
                showToast(!isSaved ? 'Artwork saved to your studio board' : 'Removed from saved');
            } catch (err) {
                console.error('Save toggle error:', err);
            }
        });
    });

    // Card Click Navigation
    stream.querySelectorAll('.comm-post-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('a')) return;
            const postId = card.getAttribute('data-id');
            window.location.href = `/pages/post-details.html?id=${postId}`;
        });
    });
}

function createPostCardHtml(post) {
    const authorName = post.artistName || 'Artist';
    const authorAvatar = post.artistAvatar || '/images/user_avatar_nav.png';
    const roleText = post.artistType === 'Admin' ? 'Guild Admin' : 'Member';
    const timeAgo = post.timeAgo || 'Recently';
    const mediaUrl = post.mediaUrl || '/images/comm_post_sunset_painting.png';
    const likedClass = post.isLiked ? 'liked' : '';
    const savedClass = post.isSaved ? 'saved' : '';

    return `
        <div class="comm-post-card" data-id="${post.id}">
            <div class="post-card-header">
                <div class="author-info-group">
                    <img src="${escapeHtml(authorAvatar)}" alt="${escapeHtml(authorName)}" class="post-author-avatar" onerror="this.src='/images/user_avatar_nav.png'">
                    <div>
                        <div class="author-name-row">
                            <h4 class="post-author-name">${escapeHtml(authorName)}</h4>
                            ${post.artistType === 'Admin' ? '<span class="guild-status-badge">✦ Admin</span>' : ''}
                        </div>
                        <span class="post-author-meta">${roleText} &bull; ${escapeHtml(timeAgo)}</span>
                    </div>
                </div>
            </div>

            <div class="post-caption-text">${escapeHtml(post.caption || '')}</div>

            <div class="post-media-container">
                <img src="${escapeHtml(mediaUrl)}" alt="Guild Artwork" class="post-media-img" onerror="this.src='/images/comm_post_sunset_painting.png'">
            </div>

            <div class="post-action-bar">
                <div class="post-actions-left">
                    <button class="post-act-btn btn-post-like ${likedClass}" data-id="${post.id}">
                        <span>&hearts;</span>
                        <span class="like-count">${post.likesCount || 0}</span>
                    </button>
                    <button class="post-act-btn btn-post-comment" data-id="${post.id}">
                        <span>💬</span>
                        <span class="comment-count">${post.commentsCount || 0}</span>
                    </button>
                </div>
                <button class="post-act-btn btn-post-save ${savedClass}" data-id="${post.id}">
                    <span>✦ Save</span>
                </button>
            </div>
        </div>
    `;
}

async function handleCreatePostSubmit() {
    const textarea = document.getElementById('commPostCaptionInput');
    const submitBtn = document.getElementById('btnSubmitCommPost');
    const caption = textarea ? textarea.value.trim() : '';

    if (!caption) {
        showToast('Please type your thought or work update before posting');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing...';

    const newPost = {
        id: Date.now(),
        artistId: currentUserId,
        artistName: (currentUser && currentUser.name) ? currentUser.name : "Aanya Deshmukh",
        artistAvatar: (currentUser && currentUser.avatarUrl) ? currentUser.avatarUrl : "/images/user_avatar_nav.png",
        artistType: "Member",
        timeAgo: "Just now",
        caption: caption,
        mediaUrl: selectedArtworkUrl,
        category: activePostCategory === 'All Posts' ? 'Artworks' : activePostCategory,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        isSaved: false
    };

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.createCommunityPost === 'function') {
            await window.ArtSphereAPI.createCommunityPost(communityId, {
                caption,
                mediaUrl: selectedArtworkUrl,
                category: newPost.category
            }, currentUserId);
        }
    } catch (err) {
        console.warn('API error during post, saving locally:', err);
    }

    loadedPosts.unshift(newPost);
    textarea.value = '';
    showToast('Post shared with the guild!');
    filterAndRenderPosts();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Publish to Guild →';
}

/**
 * 10. Events Tab: Load and Render
 */
async function loadCommunityEvents() {
    const container = document.getElementById('eventsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="loading-state-wrapper">
            <div class="loading-spinner"></div>
            <p>Gathering guild session schedule...</p>
        </div>
    `;

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCommunityEvents === 'function') {
            const events = await window.ArtSphereAPI.getCommunityEvents(communityId, null, currentUserId);
            if (events && events.length > 0) {
                loadedEvents = events;
            } else {
                loadedEvents = [...DEFAULT_EVENTS];
            }
        } else {
            loadedEvents = [...DEFAULT_EVENTS];
        }
    } catch (err) {
        console.warn('API error, using curated editorial events:', err);
        loadedEvents = [...DEFAULT_EVENTS];
    }

    filterAndRenderEvents();
}

function filterAndRenderEvents() {
    const container = document.getElementById('eventsListContainer');
    if (!container) return;

    let filtered = [...loadedEvents];

    if (activeEventType && activeEventType !== 'All') {
        filtered = filtered.filter(e => (e.eventType || '').toLowerCase() === activeEventType.toLowerCase());
    }

    if (eventsSearchTerm) {
        filtered = filtered.filter(e =>
            (e.title && e.title.toLowerCase().includes(eventsSearchTerm)) ||
            (e.description && e.description.toLowerCase().includes(eventsSearchTerm)) ||
            (e.location && e.location.toLowerCase().includes(eventsSearchTerm))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-icon">✦</div>
                <h3>No sessions found</h3>
                <p>No events match your current filter. Check back soon or host a community jam!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(ev => createEventCardHtml(ev)).join('');

    // Attach RSVP Handlers
    container.querySelectorAll('.btn-event-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');
            const ev = loadedEvents.find(x => String(x.id) === String(eventId));

            if (action === 'register' || action === 'join') {
                handleEventRegistration(eventId, ev ? ev.title : 'Guild Event');
            } else if (action === 'view') {
                if (ev) openEventDetailModal(ev);
            }
        });
    });

    // Card click opens modal
    container.querySelectorAll('.hub-event-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const eventId = card.getAttribute('data-id');
            const ev = loadedEvents.find(x => String(x.id) === String(eventId));
            if (ev) openEventDetailModal(ev);
        });
    });
}

function createEventCardHtml(ev) {
    const isReg = Boolean(ev.registered);
    const btnText = isReg ? 'Registered ✦' : 'RSVP Now';
    const btnAction = isReg ? 'view' : 'register';
    const btnClass = isReg ? 'btn-pill-secondary' : 'btn-pill-primary';

    return `
        <div class="hub-event-card" data-id="${ev.id}">
            <div class="event-card-media">
                <img src="${escapeHtml(ev.imageUrl || '/images/comm_event_watercolor.png')}" alt="${escapeHtml(ev.title)}" class="event-thumbnail-img" onerror="this.src='/images/comm_event_watercolor.png'">
                <span class="event-type-badge">${escapeHtml(ev.eventType || 'Session')}</span>
            </div>

            <div class="event-card-body">
                <h3 class="event-card-title">${escapeHtml(ev.title)}</h3>
                <p class="event-card-desc">${escapeHtml(ev.description || '')}</p>
                <div class="event-card-meta-list">
                    <span class="event-meta-line">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${escapeHtml(ev.eventDate || 'Upcoming')}
                    </span>
                    <span class="event-meta-line">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${escapeHtml(ev.eventTime || 'TBA')}
                    </span>
                    <span class="event-meta-line">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${escapeHtml(ev.location || 'Online')}
                    </span>
                </div>
            </div>

            <div class="event-card-actions">
                <div class="attendees-counter-box">
                    <span>✦ ${ev.attendeesCount || 24} artists attending</span>
                </div>
                <button class="${btnClass} btn-event-action" data-id="${ev.id}" data-action="${btnAction}">
                    ${btnText}
                </button>
            </div>
        </div>
    `;
}

async function handleEventRegistration(eventId, eventTitle) {
    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.registerCommunityEvent === 'function') {
            await window.ArtSphereAPI.registerCommunityEvent(eventId, currentUserId);
        }
    } catch (err) {
        console.warn('API event registration fallback:', err);
    }

    const modal = document.getElementById('registrationSuccessModal');
    const titleEl = document.getElementById('regSuccessEventName');
    if (titleEl) titleEl.textContent = `You're confirmed for: ${eventTitle}`;
    if (modal) modal.style.display = 'flex';

    const ev = loadedEvents.find(x => String(x.id) === String(eventId));
    if (ev) {
        ev.registered = true;
        ev.attendeesCount = (ev.attendeesCount || 20) + 1;
        filterAndRenderEvents();
    }
}

function openEventDetailModal(ev) {
    const modal = document.getElementById('eventDetailModal');
    const content = document.getElementById('eventModalContent');
    if (!modal || !content) return;

    content.innerHTML = `
        <div class="event-modal-cover-wrap">
            <img src="${escapeHtml(ev.imageUrl || '/images/comm_event_detail_cover.png')}" alt="${escapeHtml(ev.title)}" class="event-modal-cover-img" onerror="this.src='/images/comm_event_detail_cover.png'">
        </div>
        <span class="event-modal-badge">${escapeHtml(ev.eventType || 'Session')}</span>
        <h2 class="event-modal-title">${escapeHtml(ev.title)}</h2>
        <p class="event-modal-subtitle">${escapeHtml(ev.description || '')}</p>

        <div class="event-modal-meta-row">
            <span>📅 ${escapeHtml(ev.eventDate || 'Date TBA')}</span>
            <span>⏰ ${escapeHtml(ev.eventTime || 'Time TBA')}</span>
            <span>📍 ${escapeHtml(ev.location || 'Studio')}</span>
            <span>✦ ${ev.attendeesCount || 24} going</span>
        </div>

        <div class="event-modal-btn-row">
            <button class="btn-modal-reg-now" id="btnModalRegNow" ${ev.registered ? 'disabled' : ''}>
                ${ev.registered ? 'Already Registered ✦' : 'Confirm RSVP →'}
            </button>
            <button class="btn-modal-save-event" id="btnModalSaveEvent">
                ✦ Add to Calendar
            </button>
        </div>
    `;

    modal.style.display = 'flex';

    const regBtn = document.getElementById('btnModalRegNow');
    if (regBtn && !ev.registered) {
        regBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            handleEventRegistration(ev.id, ev.title);
        });
    }

    const saveBtn = document.getElementById('btnModalSaveEvent');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            showToast('Event added to your studio schedule!');
        });
    }
}

/**
 * 11. Members Tab: Load and Render
 */
async function loadCommunityMembers() {
    const container = document.getElementById('allMembersGridContainer');
    const badge = document.getElementById('allMembersBadgeCount');
    if (!container) return;

    container.innerHTML = `
        <div class="loading-state-wrapper">
            <div class="loading-spinner"></div>
            <p>Accessing guild member rolls...</p>
        </div>
    `;

    let members = [];
    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCommunityMembers === 'function') {
            const res = await window.ArtSphereAPI.getCommunityMembers(communityId);
            if (res && res.length > 0) members = res;
            else members = [...DEFAULT_MEMBERS];
        } else {
            members = [...DEFAULT_MEMBERS];
        }
    } catch (err) {
        console.warn('API error, using curated editorial members:', err);
        members = [...DEFAULT_MEMBERS];
    }

    if (badge) badge.textContent = `${members.length} members`;

    container.innerHTML = members.map(m => {
        const name = m.fullName || m.username || 'Artist';
        const avatar = m.profilePicture || '/images/user_avatar_nav.png';
        const role = m.role || 'Member';
        const isAdm = role === 'ADMIN';

        return `
            <div class="member-card-item">
                <div class="member-left-wrap">
                    <img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" class="member-list-avatar" onerror="this.src='/images/user_avatar_nav.png'">
                    <div class="member-meta-box">
                        <a href="/pages/artist-profile.html?id=${m.userId}" class="member-full-name">
                            ${escapeHtml(name)} ${isAdm ? '<span class="guild-status-badge">Admin</span>' : ''}
                        </a>
                        <span class="member-subline">${escapeHtml(role)} &bull; Active</span>
                    </div>
                </div>
                <a href="/pages/artist-profile.html?id=${m.userId}" class="btn-member-connect">Portfolio</a>
            </div>
        `;
    }).join('');
}

/**
 * Utilities
 */
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
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 350);
    }, 2400);
}
