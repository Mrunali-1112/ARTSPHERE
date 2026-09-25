/**
 * ArtSphere – Creative Feed JavaScript (Matches page_25.jpg)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Current User state
    const currentUserId = 101; // Primary active demo user

    // Feed Filter State
    let activeCategory = 'All';
    let activeTab = 'foryou';
    let searchQuery = '';
    let sortMode = 'latest';
    let postsData = [];
    let searchDebounceTimer = null;

    // Elements
    const postsFeedContainer = document.getElementById('postsFeedContainer');
    const categoryPills = document.querySelectorAll('.cat-pill');
    const tabButtons = document.querySelectorAll('.feed-tab-btn');
    const sortSelect = document.getElementById('feedSortSelect');
    const searchDrawer = document.getElementById('searchDrawer');
    const searchInput = document.getElementById('feedSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const userAvatarBtn = document.getElementById('headerUserAvatarBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    // 1. Initial Load
    loadFeedPosts();

    // 2. Category Filter Click
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.getAttribute('data-cat') || 'All';
            loadFeedPosts();
        });
    });

    // 3. Feed Tab Click (Following vs For You)
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.getAttribute('data-tab') || 'foryou';
            loadFeedPosts();
        });
    });

    // 4. Sort Dropdown Change
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortMode = e.target.value;
            applyClientSortAndRender();
        });
    }

    // 5. Search Bar Toggle & Debounce
    window.toggleSearchBar = function() {
        if (!searchDrawer) return;
        if (searchDrawer.style.display === 'none' || searchDrawer.style.display === '') {
            searchDrawer.style.display = 'block';
            if (searchInput) searchInput.focus();
        } else {
            searchDrawer.style.display = 'none';
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                searchQuery = e.target.value.trim();
                loadFeedPosts();
            }, 300);
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            loadFeedPosts();
        });
    }

    // 6. User Profile Menu Dropdown
    if (userAvatarBtn && userDropdownMenu) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!userDropdownMenu.contains(e.target) && !userAvatarBtn.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                if (window.ArtSphereAPI && window.ArtSphereAPI.logout) {
                    await window.ArtSphereAPI.logout();
                }
            } catch (err) {
                console.warn('Logout fallback:', err);
            }
            window.location.href = '/pages/login.html';
        });
    }

    // ==========================================================
    // Core Functions
    // ==========================================================
    async function loadFeedPosts() {
        if (!postsFeedContainer) return;
        postsFeedContainer.innerHTML = `
            <div class="feed-loading-spinner">
                <div class="spinner"></div>
                <p>Loading creative feed...</p>
            </div>
        `;

        try {
            const data = await window.ArtSphereAPI.getPosts(activeCategory, activeTab, searchQuery, currentUserId);
            postsData = Array.isArray(data) ? data : [];
            applyClientSortAndRender();
        } catch (error) {
            console.error('Failed to load posts:', error);
            postsFeedContainer.innerHTML = `
                <div class="feed-empty-state">
                    <h3 class="feed-empty-title">Couldn't load feed</h3>
                    <p class="feed-empty-desc">${error.message || 'Please check your connection and try again.'}</p>
                    <button class="btn-empty-create" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    function applyClientSortAndRender() {
        if (!postsFeedContainer) return;

        let filtered = [...postsData];

        if (sortMode === 'popular') {
            filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        } else if (sortMode === 'comments') {
            filtered.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
        }

        if (filtered.length === 0) {
            postsFeedContainer.innerHTML = `
                <div class="feed-empty-state">
                    <h3 class="feed-empty-title">No posts found</h3>
                    <p class="feed-empty-desc">Be the first to share an artwork or creative story in this category!</p>
                    <button class="btn-empty-create" onclick="window.location.href='/pages/create-post.html'">Create Post</button>
                </div>
            `;
            return;
        }

        postsFeedContainer.innerHTML = filtered.map(post => createPostCardHtml(post)).join('');
        bindPostCardInteractions();
    }

    function createPostCardHtml(post) {
        const isLiked = !!post.liked;
        const isSaved = !!post.saved;
        const tagsHtml = (post.tags || []).map(t => `<span class="post-tag-item" onclick="event.stopPropagation(); filterByTag('${t.replace('#', '')}')">${t}</span>`).join(' ');

        return `
            <article class="feed-post-card" data-post-id="${post.id}">
                <!-- Header: Author info -->
                <div class="post-header-row">
                    <a href="/pages/artist-profile.html?id=${post.artistId || 101}" class="post-author-link">
                        <img src="${post.artistAvatar || '/images/artist_profile_avatar.png'}" alt="${post.artistName || 'Artist'}" class="post-author-avatar">
                        <div class="post-author-text">
                            <h4 class="post-author-name">${escapeHtml(post.artistName || 'Artist')}</h4>
                            <span class="post-meta-sub">@${escapeHtml(post.artistUsername || 'artist')} &bull; ${post.timeAgo || 'Just now'}</span>
                        </div>
                    </a>

                    <div class="post-header-actions">
                        <button class="btn-follow-pill" data-artist-id="${post.artistId}" onclick="event.stopPropagation(); toggleFollow(this, ${post.artistId})">Follow</button>
                    </div>
                </div>

                <!-- Caption -->
                <p class="post-caption-text" onclick="window.location.href='/pages/post-details.html?id=${post.id}'">
                    ${escapeHtml(post.caption || '')}
                </p>

                <!-- Media -->
                ${post.mediaUrl ? `
                <div class="post-media-wrapper" onclick="window.location.href='/pages/post-details.html?id=${post.id}'">
                    <img src="${post.mediaUrl}" alt="${escapeHtml(post.title || 'Artwork')}" class="post-media-img" loading="lazy">
                    <span class="post-badge-overlay">${escapeHtml(post.artForm || 'Art')}</span>
                </div>
                ` : ''}

                <!-- Tags -->
                ${tagsHtml ? `<div class="post-tags-row">${tagsHtml}</div>` : ''}

                <!-- Action Bar (Matches page_25: Heart count, Bubble count, Plane count, Bookmark) -->
                <div class="post-action-bar">
                    <div class="post-actions-left">
                        <!-- Like Button -->
                        <button class="post-action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}" aria-label="Like Post">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span class="action-count likes-count">${formatCount(post.likesCount || 0)}</span>
                        </button>

                        <!-- Comments Button -->
                        <button class="post-action-btn comment-btn" onclick="window.location.href='/pages/post-details.html?id=${post.id}#comments'" aria-label="Comments">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            <span class="action-count">${formatCount(post.commentsCount || 0)}</span>
                        </button>

                        <!-- Share Button -->
                        <button class="post-action-btn share-btn" data-post-id="${post.id}" aria-label="Share Post">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                            <span class="action-count">${formatCount(post.sharesCount || 12)}</span>
                        </button>
                    </div>

                    <!-- Bookmark / Save Button -->
                    <button class="post-action-btn save-btn ${isSaved ? 'saved' : ''}" data-post-id="${post.id}" aria-label="Save Post">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                </div>
            </article>
        `;
    }

    function bindPostCardInteractions() {
        // Like buttons
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const postId = btn.getAttribute('data-post-id');
                const countSpan = btn.querySelector('.likes-count');

                try {
                    const res = await window.ArtSphereAPI.togglePostLike(postId, currentUserId);
                    if (res && res.liked !== undefined) {
                        btn.classList.toggle('liked', res.liked);
                        const svg = btn.querySelector('svg');
                        if (svg) svg.setAttribute('fill', res.liked ? 'currentColor' : 'none');
                        if (countSpan) countSpan.textContent = formatCount(res.likesCount || 0);
                    }
                } catch (err) {
                    console.error('Error toggling like:', err);
                }
            });
        });

        // Save / Bookmark buttons
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const postId = btn.getAttribute('data-post-id');

                try {
                    const res = await window.ArtSphereAPI.togglePostSave(postId, currentUserId);
                    if (res && res.saved !== undefined) {
                        btn.classList.toggle('saved', res.saved);
                        const svg = btn.querySelector('svg');
                        if (svg) svg.setAttribute('fill', res.saved ? 'currentColor' : 'none');
                        showToast(res.saved ? 'Post saved to bookmarks' : 'Post removed from bookmarks');
                    }
                } catch (err) {
                    console.error('Error toggling save:', err);
                }
            });
        });

        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = btn.getAttribute('data-post-id');
                const shareUrl = `${window.location.origin}/pages/post-details.html?id=${postId}`;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        showToast('Link copied to clipboard!');
                    }).catch(() => {
                        showToast('Post link: ' + shareUrl);
                    });
                } else {
                    showToast('Post link: ' + shareUrl);
                }
            });
        });
    }

    window.filterByTag = function(tag) {
        if (searchInput) searchInput.value = tag;
        searchQuery = tag;
        loadFeedPosts();
    };

    window.toggleFollow = function(btn, artistId) {
        if (!btn) return;
        const isFollowing = btn.classList.contains('following');
        if (isFollowing) {
            btn.classList.remove('following');
            btn.textContent = 'Follow';
        } else {
            btn.classList.add('following');
            btn.textContent = 'Following';
        }
    };

    function formatCount(num) {
        if (!num || num === 0) return '0';
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace('.0', '') + 'K';
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

    function showToast(msg) {
        let toast = document.getElementById('feedToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'feedToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(28, 16, 44, 0.92);
                color: #FFFFFF;
                padding: 9px 18px;
                border-radius: 9999px;
                font-size: 13px;
                font-weight: 600;
                z-index: 1000;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 2200);
    }
});
