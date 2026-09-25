/**
 * ArtSphere — Community Hub & Details JavaScript (Module 8 - pages 29, 30, 31, 32, 33)
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

    // Parse URL Params
    const urlParams = new URLSearchParams(window.location.search);
    const communityId = parseInt(urlParams.get('id'), 10) || 601;
    const initialTab = (urlParams.get('tab') || 'overview').toLowerCase();

    // DOM Elements - Hub Header
    const commCoverImg = document.getElementById('commCoverImg');
    const commAvatarImg = document.getElementById('commAvatarImg');
    const commName = document.getElementById('commName');
    const commDesc = document.getElementById('commDesc');
    const commMetaMembers = document.getElementById('commMetaMembers');
    const commMetaArtForms = document.getElementById('commMetaArtForms');
    const commMetaLocation = document.getElementById('commMetaLocation');
    const btnHeaderJoin = document.getElementById('btnHeaderJoin');

    // DOM Elements - Tabs
    const tabButtons = document.querySelectorAll('.hub-tab-btn');
    const tabPanes = {
        overview: document.getElementById('paneOverview'),
        posts: document.getElementById('panePosts'),
        events: document.getElementById('paneEvents'),
        members: document.getElementById('paneMembers')
    };

    // DOM Elements - Overview
    const overviewAboutText = document.getElementById('overviewAboutText');
    const statMembersCount = document.getElementById('statMembersCount');
    const statCreatedDate = document.getElementById('statCreatedDate');
    const overviewRulesList = document.getElementById('overviewRulesList');
    const btnInviteFriends = document.getElementById('btnInviteFriends');

    // DOM Elements - Posts
    const commPostCaptionInput = document.getElementById('commPostCaptionInput');
    const btnAddArtworkBtn = document.getElementById('btnAddArtworkBtn');
    const btnSubmitCommPost = document.getElementById('btnSubmitCommPost');
    const commPostsStream = document.getElementById('commPostsStream');
    const postsCategoryFilterGroup = document.getElementById('postsCategoryFilterGroup');

    // DOM Elements - Events
    const eventsSearchInput = document.getElementById('eventsSearchInput');
    const eventsFilterPillsRow = document.getElementById('eventsFilterPillsRow');
    const eventsListContainer = document.getElementById('eventsListContainer');

    // DOM Elements - Members
    const allMembersBadgeCount = document.getElementById('allMembersBadgeCount');
    const allMembersGridContainer = document.getElementById('allMembersGridContainer');

    // DOM Elements - Modals
    const eventDetailModal = document.getElementById('eventDetailModal');
    const closeEventModalBtn = document.getElementById('closeEventModalBtn');
    const eventModalContent = document.getElementById('eventModalContent');

    const registrationSuccessModal = document.getElementById('registrationSuccessModal');
    const closeRegSuccessBtn = document.getElementById('closeRegSuccessBtn');
    const regSuccessEventName = document.getElementById('regSuccessEventName');
    const btnRegGreat = document.getElementById('btnRegGreat');

    // Central Plus Menu
    const centralPlusBtn = document.getElementById('centralPlusBtn');
    const plusMenuBackdrop = document.getElementById('plusMenuBackdrop');
    const btnClosePlusMenu = document.getElementById('btnClosePlusMenu');

    // State Variables
    let communityData = null;
    let loadedEvents = [];
    let activePostCategory = 'All Posts';
    let activeEventType = 'All';
    let eventsSearchTerm = '';
    let selectedArtworkUrl = '/images/comm_post_sunset_painting.png';

    // Initialize
    initHub();

    async function initHub() {
        setupTabs();
        setupEventListeners();
        await loadCommunityDetails();

        // Switch to initial tab if specified (e.g. ?tab=posts or ?tab=events)
        if (['overview', 'posts', 'events', 'members'].includes(initialTab)) {
            switchTab(initialTab);
        } else {
            switchTab('overview');
        }
    }

    function setupTabs() {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });

        // "See All" tab switcher links in overview
        document.querySelectorAll('[data-switch-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.getAttribute('data-switch-tab');
                switchTab(tab);
            });
        });
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

        // Trigger tab-specific loading if necessary
        if (tabName === 'posts') {
            loadCommunityPosts();
        } else if (tabName === 'events') {
            loadCommunityEvents();
        } else if (tabName === 'members') {
            loadCommunityMembers();
        }

        // Update URL query state without full reload
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('tab', tabName);
        window.history.replaceState({}, '', newUrl);
    }

    function setupEventListeners() {
        // Header Join / Leave Button
        if (btnHeaderJoin) {
            btnHeaderJoin.addEventListener('click', handleHeaderJoinToggle);
        }

        // Invite Friends Button
        if (btnInviteFriends) {
            btnInviteFriends.addEventListener('click', () => {
                const shareUrl = window.location.href;
                navigator.clipboard?.writeText(shareUrl).then(() => {
                    showToast('Invite link copied to clipboard!');
                }).catch(() => {
                    showToast('Share: ' + shareUrl);
                });
            });
        }

        // Posts: Submit Post
        if (btnSubmitCommPost) {
            btnSubmitCommPost.addEventListener('click', handleCreatePostSubmit);
        }

        if (btnAddArtworkBtn) {
            btnAddArtworkBtn.addEventListener('click', () => {
                // Cycle through pre-seeded artistic image choices
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

        // Posts: Filter by Category Radios
        if (postsCategoryFilterGroup) {
            postsCategoryFilterGroup.addEventListener('change', (e) => {
                activePostCategory = e.target.value;
                loadCommunityPosts();
            });
        }

        // Posts: Popular Tags Click
        document.querySelectorAll('.tag-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const tag = pill.getAttribute('data-tag');
                if (commPostCaptionInput) {
                    commPostCaptionInput.value = `${commPostCaptionInput.value} #${tag}`.trim();
                    commPostCaptionInput.focus();
                }
            });
        });

        // Events: Filter Pills
        if (eventsFilterPillsRow) {
            eventsFilterPillsRow.addEventListener('click', (e) => {
                const pill = e.target.closest('.event-filter-pill');
                if (!pill) return;
                document.querySelectorAll('.event-filter-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activeEventType = pill.getAttribute('data-type');
                filterAndRenderEvents();
            });
        }

        // Events: Search Bar
        if (eventsSearchInput) {
            eventsSearchInput.addEventListener('input', (e) => {
                eventsSearchTerm = e.target.value.toLowerCase().trim();
                filterAndRenderEvents();
            });
        }

        // Event Modal Close
        if (closeEventModalBtn && eventDetailModal) {
            closeEventModalBtn.addEventListener('click', () => {
                eventDetailModal.style.display = 'none';
            });
            eventDetailModal.addEventListener('click', (e) => {
                if (e.target === eventDetailModal) eventDetailModal.style.display = 'none';
            });
        }

        // Registration Success Modal Close
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
    }

    // =========================================================================
    // COMMUNITY DETAILS & OVERVIEW
    // =========================================================================
    async function loadCommunityDetails() {
        try {
            const data = await ArtSphereAPI.getCommunityDetails(communityId, currentUserId);
            communityData = data;
            renderCommunityHeader(data);
            renderOverviewTab(data);
        } catch (err) {
            console.error('Failed to load community details:', err);
            showToast(err.message || 'Error loading community');
        }
    }

    function renderCommunityHeader(data) {
        if (!data) return;

        document.title = `${data.name || 'Community'} | ArtSphere`;
        if (commName) commName.textContent = data.name || 'Creative Souls';
        if (commDesc) commDesc.textContent = data.description || '';

        if (commCoverImg && data.coverImage) {
            commCoverImg.src = data.coverImage;
        }
        if (commAvatarImg && (data.imageUrl || data.coverImage)) {
            commAvatarImg.src = data.imageUrl || data.coverImage;
        }

        const memCount = data.memberCount || 1200;
        if (commMetaMembers) {
            commMetaMembers.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                ${formatCount(memCount)} members
            `;
        }

        if (commMetaArtForms) {
            commMetaArtForms.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                ${data.artForms || 'All art forms'}
            `;
        }

        if (commMetaLocation) {
            commMetaLocation.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${data.location || 'Global'}
            `;
        }

        updateHeaderJoinButton(data.joined);
    }

    function updateHeaderJoinButton(isJoined) {
        if (!btnHeaderJoin) return;
        if (isJoined) {
            btnHeaderJoin.className = 'btn-hub-join joined';
            btnHeaderJoin.innerHTML = `
                <span class="btn-text">Joined</span>
                <svg class="btn-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            `;
        } else {
            btnHeaderJoin.className = 'btn-hub-join not-joined';
            btnHeaderJoin.innerHTML = `<span class="btn-text">Join</span>`;
        }
    }

    async function handleHeaderJoinToggle() {
        if (!communityData) return;
        btnHeaderJoin.disabled = true;

        try {
            if (communityData.joined) {
                const res = await ArtSphereAPI.leaveCommunity(communityId, currentUserId);
                communityData.joined = false;
                communityData.memberCount = res.memberCount;
                updateHeaderJoinButton(false);
                if (commMetaMembers) {
                    commMetaMembers.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        ${formatCount(res.memberCount)} members
                    `;
                }
                showToast('Left community');
            } else {
                const res = await ArtSphereAPI.joinCommunity(communityId, currentUserId);
                communityData.joined = true;
                communityData.memberCount = res.memberCount;
                updateHeaderJoinButton(true);
                if (commMetaMembers) {
                    commMetaMembers.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        ${formatCount(res.memberCount)} members
                    `;
                }
                showToast('Joined community successfully!');
            }
        } catch (err) {
            console.error('Error toggling join status:', err);
            showToast(err.message || 'Action failed');
        } finally {
            btnHeaderJoin.disabled = false;
        }
    }

    function renderOverviewTab(data) {
        if (!data) return;

        if (overviewAboutText && data.description) {
            overviewAboutText.textContent = data.description;
        }

        if (statMembersCount) {
            statMembersCount.textContent = formatCount(data.memberCount || 1200);
        }

        if (statCreatedDate && data.createdDate) {
            statCreatedDate.textContent = data.createdDate;
        }

        // Rules list
        if (overviewRulesList && data.rules) {
            const rulesArray = data.rules.split('\n').filter(r => r.trim());
            if (rulesArray.length > 0) {
                overviewRulesList.innerHTML = rulesArray.map(r => `<li>${escapeHtml(r.trim())}</li>`).join('');
            }
        }

        // Attach join button on overview event card
        const overviewJoinBtn = document.querySelector('.btn-overview-event-join');
        if (overviewJoinBtn) {
            overviewJoinBtn.addEventListener('click', () => {
                const evId = overviewJoinBtn.getAttribute('data-event-id') || 801;
                handleEventRegistration(evId, 'Monthly Art Showcase');
            });
        }
    }

    // =========================================================================
    // POSTS TAB (page_30.jpg)
    // =========================================================================
    async function loadCommunityPosts() {
        if (!commPostsStream) return;
        commPostsStream.innerHTML = `
            <div class="loading-state-wrapper">
                <p>Loading posts...</p>
            </div>
        `;

        try {
            const posts = await ArtSphereAPI.getCommunityPosts(communityId, activePostCategory, currentUserId);
            renderPosts(posts);
        } catch (err) {
            console.error('Failed to load posts:', err);
            commPostsStream.innerHTML = `<p class="error-text">Failed to load posts: ${escapeHtml(err.message)}</p>`;
        }
    }

    function renderPosts(posts) {
        if (!posts || posts.length === 0) {
            commPostsStream.innerHTML = `
                <div class="empty-state-card">
                    <p>No posts in this category yet. Be the first to share your artwork!</p>
                </div>
            `;
            return;
        }

        commPostsStream.innerHTML = posts.map(p => createPostCardHtml(p)).join('');

        // Attach Like handlers
        commPostsStream.querySelectorAll('.btn-post-like').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const postId = btn.getAttribute('data-id');
                const isLiked = btn.classList.contains('liked');
                const countSpan = btn.querySelector('.like-count');
                let count = parseInt(countSpan.textContent, 10) || 0;

                try {
                    await ArtSphereAPI.toggleLike(postId);
                    if (isLiked) {
                        btn.classList.remove('liked');
                        countSpan.textContent = Math.max(0, count - 1);
                    } else {
                        btn.classList.add('liked');
                        countSpan.textContent = count + 1;
                    }
                } catch (err) {
                    console.error('Like toggle error:', err);
                }
            });
        });

        // Attach Bookmark / Save handlers
        commPostsStream.querySelectorAll('.btn-post-save').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const postId = btn.getAttribute('data-id');
                const isSaved = btn.classList.contains('saved');

                try {
                    await ArtSphereAPI.toggleSave(postId);
                    btn.classList.toggle('saved', !isSaved);
                    showToast(!isSaved ? 'Post saved to collection' : 'Post removed from saved');
                } catch (err) {
                    console.error('Save toggle error:', err);
                }
            });
        });

        // Navigate to post details
        commPostsStream.querySelectorAll('.comm-post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.closest('a')) return;
                const postId = card.getAttribute('data-id');
                window.location.href = `/pages/post-details.html?id=${postId}`;
            });
        });
    }

    function createPostCardHtml(post) {
        const authorName = post.artistName || 'Artist';
        const authorAvatar = post.artistAvatar || '/images/artist_profile_avatar.png';
        const roleText = post.artistType === 'Admin' ? 'Community Admin' : 'Active Member';
        const isAdmin = post.artistType === 'Admin' || post.artistId === 101;
        const timeAgo = post.timeAgo || '2h ago';
        const mediaUrl = post.mediaUrl || '/images/comm_post_sunset_painting.png';
        const likedClass = post.isLiked ? 'liked' : '';
        const savedClass = post.isSaved ? 'saved' : '';

        return `
            <div class="comm-post-card" data-id="${post.id}">
                <div class="post-card-header">
                    <div class="author-info-group">
                        <img src="${escapeHtml(authorAvatar)}" alt="${escapeHtml(authorName)}" class="post-author-avatar">
                        <div class="author-text-col">
                            <div class="author-name-row">
                                <h4 class="post-author-name">${escapeHtml(authorName)}</h4>
                                ${isAdmin ? '<span class="crown-badge">&crown;</span>' : ''}
                            </div>
                            <span class="post-author-meta">${roleText} &bull; ${escapeHtml(timeAgo)}</span>
                        </div>
                    </div>
                    <button class="post-menu-btn">&vellip;</button>
                </div>

                <div class="post-caption-text">${escapeHtml(post.caption || '')}</div>

                <div class="post-media-container">
                    <img src="${escapeHtml(mediaUrl)}" alt="Post Artwork" class="post-media-img" onerror="this.src='/images/comm_post_sunset_painting.png'">
                </div>

                <div class="post-action-bar">
                    <div class="post-actions-left">
                        <button class="post-act-btn btn-post-like ${likedClass}" data-id="${post.id}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            <span class="like-count">${post.likesCount || 0}</span>
                        </button>
                        <button class="post-act-btn btn-post-comment" data-id="${post.id}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <span class="comment-count">${post.commentsCount || 0}</span>
                        </button>
                    </div>
                    <button class="post-act-btn btn-post-save ${savedClass}" data-id="${post.id}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                </div>
            </div>
        `;
    }

    async function handleCreatePostSubmit() {
        const caption = commPostCaptionInput ? commPostCaptionInput.value.trim() : '';
        if (!caption) {
            showToast('Please type something to share');
            return;
        }

        btnSubmitCommPost.disabled = true;
        btnSubmitCommPost.textContent = 'Posting...';

        try {
            await ArtSphereAPI.createCommunityPost(communityId, {
                caption,
                title: 'Community Artwork',
                mediaUrl: selectedArtworkUrl,
                mediaType: 'image',
                category: activePostCategory === 'All Posts' ? 'Artworks' : activePostCategory,
                tags: '#creativesouls,#art'
            }, currentUserId);

            commPostCaptionInput.value = '';
            showToast('Post shared with community!');
            loadCommunityPosts();
        } catch (err) {
            console.error('Create post failed:', err);
            showToast(err.message || 'Failed to post');
        } finally {
            btnSubmitCommPost.disabled = false;
            btnSubmitCommPost.textContent = 'Post';
        }
    }

    // =========================================================================
    // EVENTS TAB (page_31.jpg)
    // =========================================================================
    async function loadCommunityEvents() {
        if (!eventsListContainer) return;
        eventsListContainer.innerHTML = `
            <div class="loading-state-wrapper">
                <p>Loading events...</p>
            </div>
        `;

        try {
            const events = await ArtSphereAPI.getCommunityEvents(communityId, activeEventType, currentUserId);
            loadedEvents = events || [];
            filterAndRenderEvents();
        } catch (err) {
            console.error('Failed to load events:', err);
            eventsListContainer.innerHTML = `<p class="error-text">Failed to load events: ${escapeHtml(err.message)}</p>`;
        }
    }

    function filterAndRenderEvents() {
        let filtered = loadedEvents;

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
            eventsListContainer.innerHTML = `
                <div class="empty-state-card">
                    <p>No events found matching your criteria.</p>
                </div>
            `;
            return;
        }

        eventsListContainer.innerHTML = filtered.map(ev => createEventCardHtml(ev)).join('');

        // Attach action button handlers
        eventsListContainer.querySelectorAll('.btn-event-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-action');
                const evObj = loadedEvents.find(x => String(x.id) === String(eventId));

                if (action === 'register') {
                    handleEventRegistration(eventId, evObj ? evObj.title : 'Event');
                } else if (action === 'view') {
                    openEventDetailModal(evObj);
                } else if (action === 'join') {
                    handleEventRegistration(eventId, evObj ? evObj.title : 'Meetup');
                } else if (action === 'save') {
                    showToast('Event saved to your calendar!');
                }
            });
        });

        // Clicking event card opens details modal
        eventsListContainer.querySelectorAll('.hub-event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const eventId = card.getAttribute('data-id');
                const evObj = loadedEvents.find(x => String(x.id) === String(eventId));
                if (evObj) openEventDetailModal(evObj);
            });
        });
    }

    function createEventCardHtml(ev) {
        const typeClass = (ev.eventType || 'workshop').toLowerCase().replace(/\s+/g, '-');
        const isRegistered = ev.registered;

        let btnAction = 'register';
        let btnText = 'Register';
        let btnClass = 'primary';

        if (isRegistered) {
            btnText = 'Registered &check;';
            btnClass = 'joined';
        } else if (ev.eventType === 'Exhibition') {
            btnAction = 'view';
            btnText = 'View Details';
            btnClass = 'outline';
        } else if (ev.eventType === 'Meetup') {
            btnAction = 'join';
            btnText = 'Join';
            btnClass = 'outline';
        } else if (ev.eventType === 'Live Session') {
            btnAction = 'register';
            btnText = 'Register';
            btnClass = 'primary';
        }

        return `
            <div class="hub-event-card" data-id="${ev.id}">
                <div class="event-card-media">
                    <img src="${escapeHtml(ev.imageUrl || '/images/comm_event_watercolor.png')}" alt="${escapeHtml(ev.title)}" class="event-thumbnail-img" onerror="this.src='/images/comm_event_watercolor.png'">
                    <span class="event-type-badge ${typeClass}">${escapeHtml(ev.eventType || 'Workshop')}</span>
                </div>

                <div class="event-card-body">
                    <h3 class="event-card-title">${escapeHtml(ev.title)}</h3>
                    <p class="event-card-desc">${escapeHtml(ev.description || '')}</p>
                    <div class="event-card-meta-list">
                        <div class="event-meta-line">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <span>${escapeHtml(ev.eventDate || '15 Mar 2024')}</span>
                        </div>
                        <div class="event-meta-line">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>${escapeHtml(ev.eventTime || '4:00 PM - 6:00 PM')}</span>
                        </div>
                        <div class="event-meta-line">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>${escapeHtml(ev.location || 'Art Studio, Downtown')}</span>
                        </div>
                    </div>
                </div>

                <div class="event-card-actions">
                    <div class="attendees-counter-box">
                        <span class="going-text">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                            ${ev.attendeesCount || 24} going
                        </span>
                        <div class="avatar-stack-row">
                            <img src="/images/artist_profile_avatar.png" class="avatar-stack-item" alt="Attendee">
                            <img src="/images/highlight_charcoal_portrait.png" class="avatar-stack-item" alt="Attendee">
                            <img src="/images/opp_lens_and_life.png" class="avatar-stack-item" alt="Attendee">
                            <span class="avatar-stack-more">+${Math.max(1, (ev.attendeesCount || 24) - 3)}</span>
                        </div>
                    </div>
                    <button class="btn-event-action ${btnClass}" data-id="${ev.id}" data-action="${btnAction}">
                        ${btnText}
                    </button>
                </div>
            </div>
        `;
    }

    async function handleEventRegistration(eventId, eventTitle) {
        try {
            const res = await ArtSphereAPI.registerCommunityEvent(eventId, currentUserId);
            // Open Registration Success Modal (page_33.jpg)
            if (regSuccessEventName) {
                regSuccessEventName.textContent = `Hooray! You're all set for the ${eventTitle || 'Workshop'}.`;
            }
            if (registrationSuccessModal) {
                registrationSuccessModal.style.display = 'flex';
            }
            // Update local event state
            const ev = loadedEvents.find(x => String(x.id) === String(eventId));
            if (ev) {
                ev.registered = true;
                if (res.attendeesCount !== undefined) ev.attendeesCount = res.attendeesCount;
                filterAndRenderEvents();
            }
        } catch (err) {
            console.error('Registration failed:', err);
            showToast(err.message || 'Registration failed');
        }
    }

    // =========================================================================
    // EVENT DETAILS MODAL (page_32.jpg)
    // =========================================================================
    function openEventDetailModal(ev) {
        if (!ev || !eventModalContent) return;

        const cover = ev.imageUrl || '/images/comm_event_detail_cover.png';
        const isReg = ev.registered;

        eventModalContent.innerHTML = `
            <div class="event-modal-cover-wrap">
                <img src="${escapeHtml(cover)}" alt="${escapeHtml(ev.title)}" class="event-modal-cover-img" onerror="this.src='/images/comm_event_detail_cover.png'">
            </div>
            <div class="event-modal-body">
                <span class="event-modal-badge">${escapeHtml(ev.eventType || 'Workshop')}</span>
                <h2 class="event-modal-title">${escapeHtml(ev.title)}</h2>
                <p class="event-modal-subtitle">
                    ${escapeHtml(ev.description || 'Learn the fundamentals with easy techniques and step-by-step guidance. Perfect for beginners and art enthusiasts!')}
                </p>

                <div class="event-modal-meta-row">
                    <span class="meta-detail">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${escapeHtml(ev.eventDate || '15 Mar 2024')}
                    </span>
                    <span class="meta-detail">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${escapeHtml(ev.eventTime || '4:00 PM - 6:00 PM (IST)')}
                    </span>
                    <span class="meta-detail">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                        ${ev.attendeesCount || 32} going
                    </span>
                </div>

                <div class="event-modal-btn-row">
                    <button class="btn-modal-reg-now" id="btnModalRegNow" ${isReg ? 'disabled' : ''}>
                        ${isReg ? 'Already Registered &check;' : 'Register Now'}
                    </button>
                    <button class="btn-modal-save-event" id="btnModalSaveEvent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                        Save
                    </button>
                    <button class="btn-modal-share-event" id="btnModalShareEvent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        Share
                    </button>
                </div>

                <div class="event-modal-grid">
                    <div class="modal-info-box">
                        <h4 class="modal-info-title">About This Event</h4>
                        <p class="modal-info-text">
                            This hands-on workshop will introduce you to the world of art. You will learn basic tools, color mixing, different brush techniques, and create your own small artwork by the end of the session.
                        </p>
                    </div>

                    <div class="modal-info-box">
                        <h4 class="modal-info-title">Event Venue</h4>
                        <p class="modal-info-text">
                            <strong>${escapeHtml(ev.location || 'Art Studio')}</strong><br>
                            123 Creative Street, Bandra West, Mumbai, Maharashtra 400050
                        </p>
                    </div>

                    <div class="modal-info-box">
                        <h4 class="modal-info-title">What You'll Learn</h4>
                        <ul>
                            <li>Introduction to watercolor materials</li>
                            <li>Color mixing and blending techniques</li>
                            <li>Brush control and texture creation</li>
                            <li>Step-by-step guided painting</li>
                        </ul>
                    </div>

                    <div class="modal-info-box">
                        <h4 class="modal-info-title">Event Guidelines</h4>
                        <ul>
                            <li>Be respectful and supportive</li>
                            <li>Follow the venue rules</li>
                            <li>Keep the space clean</li>
                            <li>Have fun and be creative!</li>
                        </ul>
                    </div>

                    <div class="modal-quote-box">
                        <span>"Art is better when shared."</span>
                        <span style="font-size: 20px;">&hearts;</span>
                    </div>
                </div>
            </div>
        `;

        if (eventDetailModal) {
            eventDetailModal.style.display = 'flex';
        }

        const modalRegBtn = document.getElementById('btnModalRegNow');
        if (modalRegBtn && !isReg) {
            modalRegBtn.addEventListener('click', () => {
                eventDetailModal.style.display = 'none';
                handleEventRegistration(ev.id, ev.title);
            });
        }

        const modalSaveBtn = document.getElementById('btnModalSaveEvent');
        if (modalSaveBtn) {
            modalSaveBtn.addEventListener('click', () => {
                showToast('Event saved to your calendar!');
            });
        }

        const modalShareBtn = document.getElementById('btnModalShareEvent');
        if (modalShareBtn) {
            modalShareBtn.addEventListener('click', () => {
                showToast('Event link copied!');
            });
        }
    }

    // =========================================================================
    // MEMBERS TAB
    // =========================================================================
    async function loadCommunityMembers() {
        if (!allMembersGridContainer) return;
        allMembersGridContainer.innerHTML = `
            <div class="loading-state-wrapper">
                <p>Loading members...</p>
            </div>
        `;

        try {
            const members = await ArtSphereAPI.getCommunityMembers(communityId);
            renderMembers(members);
        } catch (err) {
            console.error('Failed to load members:', err);
            allMembersGridContainer.innerHTML = `<p class="error-text">Failed to load members: ${escapeHtml(err.message)}</p>`;
        }
    }

    function renderMembers(members) {
        if (!members || members.length === 0) {
            allMembersGridContainer.innerHTML = `<p class="empty-text">No members in this community yet.</p>`;
            return;
        }

        if (allMembersBadgeCount) {
            allMembersBadgeCount.textContent = `${members.length} members`;
        }

        allMembersGridContainer.innerHTML = members.map(m => {
            const name = m.fullName || m.username || 'Artist';
            const avatar = m.profilePicture || '/images/artist_profile_avatar.png';
            const role = m.role || 'Member';
            const isAdm = role === 'ADMIN';

            return `
                <div class="member-card-item">
                    <div class="member-left-wrap">
                        <img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" class="member-list-avatar" onerror="this.src='/images/artist_profile_avatar.png'">
                        <div class="member-meta-box">
                            <a href="/pages/artist-profile.html?id=${m.userId}" class="member-full-name">
                                ${escapeHtml(name)} ${isAdm ? '<span class="crown-badge">&crown;</span>' : ''}
                            </a>
                            <span class="member-subline">${escapeHtml(role)} &bull; Joined ${escapeHtml(m.joinedAt || 'Recently')}</span>
                        </div>
                    </div>
                    <a href="/pages/artist-profile.html?id=${m.userId}" class="btn-member-connect">Profile</a>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // UTILITIES
    // =========================================================================
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
