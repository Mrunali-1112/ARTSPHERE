/**
 * ArtSphere – Studio Feed JavaScript
 * Editorial Neo-brutalism • Community Stream & Interactive Post Feed
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Mrunali / Aanya)
    let currentCategory = 'All';
    let currentSearch = '';

    // Navigation & Dropdown
    initNavigation();

    // Elements
    const searchInput = document.getElementById('feedSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const categoryPillsList = document.getElementById('categoryPillsList');
    const feedPostsContainer = document.getElementById('feedPostsContainer');
    const feedCountPill = document.getElementById('feedCountPill');

    let allPosts = [];

    // Search events
    let searchDebounce = null;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (clearSearchBtn) clearSearchBtn.style.display = val.length > 0 ? 'block' : 'none';
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                currentSearch = val;
                filterAndRender();
            }, 300);
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            currentSearch = '';
            filterAndRender();
        });
    }

    // Category button events
    if (categoryPillsList) {
        categoryPillsList.addEventListener('click', (e) => {
            const btn = e.target.closest('.discipline-pill-btn');
            if (!btn) return;

            categoryPillsList.querySelectorAll('.discipline-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.getAttribute('data-cat') || 'All';
            filterAndRender();
        });
    }

    // Initial Load
    loadFeed();

    async function loadFeed() {
        if (!feedPostsContainer) return;

        feedPostsContainer.innerHTML = `
            <div class="loading-state-card">
                <div class="spinner"></div>
                <p>Loading studio feed...</p>
            </div>
        `;

        try {
            let posts = null;
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getFeedPosts === 'function') {
                const list = await window.ArtSphereAPI.getFeedPosts();
                if (Array.isArray(list) && list.length > 0) posts = list;
            } else {
                const res = await fetch('/api/posts');
                if (res.ok) {
                    const json = await res.json();
                    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
                        posts = json.data;
                    }
                }
            }

            if (!posts || posts.length === 0) {
                posts = getFallbackFeed();
            }

            allPosts = posts;
            filterAndRender();

        } catch (err) {
            console.warn('API error when loading feed, using fallback dataset:', err);
            allPosts = getFallbackFeed();
            filterAndRender();
        }
    }

    function filterAndRender() {
        let items = allPosts;

        if (currentCategory && currentCategory !== 'All') {
            items = items.filter(p =>
                (p.category && p.category.toLowerCase().includes(currentCategory.toLowerCase())) ||
                (p.artForm && p.artForm.toLowerCase().includes(currentCategory.toLowerCase()))
            );
        }

        if (currentSearch) {
            const q = currentSearch.toLowerCase();
            items = items.filter(p =>
                (p.title && p.title.toLowerCase().includes(q)) ||
                (p.caption && p.caption.toLowerCase().includes(q)) ||
                (p.authorName && p.authorName.toLowerCase().includes(q))
            );
        }

        if (feedCountPill) {
            feedCountPill.textContent = `${items.length} Live Studio Posts`;
        }

        renderPosts(items);
    }

    function renderPosts(items) {
        if (!feedPostsContainer) return;

        if (!items || items.length === 0) {
            feedPostsContainer.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-motif">✦</div>
                    <h3 class="empty-state-heading">No Studio Posts Found</h3>
                    <p class="empty-state-desc">There are no updates matching your search or category filter. Try clearing filters or create a new post.</p>
                </div>
            `;
            return;
        }

        feedPostsContainer.innerHTML = items.map(post => {
            const authorId = post.authorId || post.userId || 101;
            const authorUrl = `/pages/artist-profile.html?id=${authorId}`;
            const detailsUrl = `/pages/post-details.html?id=${post.id}`;
            const isLiked = !!post.liked;
            const likesCount = post.likesCount || post.likes || 18;
            const commentsCount = post.commentsCount || (post.comments ? post.comments.length : 3);

            return `
                <article class="feed-post-card" data-id="${post.id}">
                    <div class="post-author-row">
                        <div class="author-info-wrap">
                            <a href="${authorUrl}" class="author-avatar-link">
                                <img src="${post.authorAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(post.authorName)}" class="author-avatar-img" onerror="this.src='/images/user_avatar_nav.png'">
                            </a>
                            <div class="author-text-col">
                                <a href="${authorUrl}" class="author-name-link">${escapeHtml(post.authorName || 'Creative Artist')}</a>
                                <span class="author-meta-sub">${escapeHtml(post.category || post.artForm || 'Visual Arts')} • ${escapeHtml(post.authorLocation || 'India')}</span>
                            </div>
                        </div>
                        <span class="post-time-badge">${escapeHtml(post.timeAgo || 'Recent')}</span>
                    </div>

                    <p class="post-caption-text">
                        ${escapeHtml(post.caption || post.content || 'Sharing latest studio progress and exploration.')}
                    </p>

                    ${post.imageUrl ? `
                        <div class="post-media-frame" onclick="window.location.href='${detailsUrl}'">
                            <img src="${post.imageUrl}" alt="${escapeHtml(post.title || 'Studio Art')}" class="post-media-img" onerror="this.src='/images/card_img_digital.png'">
                        </div>
                    ` : ''}

                    ${post.tags && post.tags.length > 0 ? `
                        <div class="post-tags-row">
                            ${post.tags.map(t => `<span class="post-tag-pill">${escapeHtml(t.startsWith('#') ? t : '#' + t)}</span>`).join('')}
                        </div>
                    ` : ''}

                    <div class="post-actions-bar">
                        <div class="post-left-actions">
                            <button type="button" class="post-action-btn ${isLiked ? 'liked' : ''}" onclick="togglePostLike(this, ${post.id})">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="${isLiked ? '#FF3B30' : 'none'}" stroke="currentColor" stroke-width="2.2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span class="like-number">${likesCount}</span>
                            </button>

                            <a href="${detailsUrl}" class="post-action-btn">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span>${commentsCount} Thoughts</span>
                            </a>
                        </div>

                        <span class="post-share-link" onclick="sharePost('${detailsUrl}')">Share Post</span>
                    </div>
                </article>
            `;
        }).join('');
    }

    window.togglePostLike = async function(btn, postId) {
        btn.classList.toggle('liked');
        const counter = btn.querySelector('.like-number');
        const isNowLiked = btn.classList.contains('liked');
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', isNowLiked ? '#FF3B30' : 'none');

        if (counter) {
            let val = parseInt(counter.textContent) || 0;
            counter.textContent = isNowLiked ? val + 1 : Math.max(0, val - 1);
        }

        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.togglePostLike === 'function') {
                await window.ArtSphereAPI.togglePostLike(postId, currentUserId);
            }
        } catch (e) {
            console.warn('Like toggle failed:', e);
        }

        showToast(isNowLiked ? 'Liked post!' : 'Unliked post.');
    };

    window.sharePost = function(url) {
        const fullUrl = window.location.origin + url;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullUrl);
            showToast('Post link copied to clipboard!');
        } else {
            showToast('Post link ready: ' + fullUrl);
        }
    };

    function getFallbackFeed() {
        return [
            {
                id: 201,
                authorId: 101,
                authorName: 'Aanya Deshmukh',
                authorAvatar: '/images/user_avatar_nav.png',
                category: 'Visual Arts',
                authorLocation: 'Mumbai, MH',
                caption: 'Early morning gouache and ink sketches in Dadar flower market. The smell of fresh marigolds mixed with humid diesel mist is unlike anything else.',
                imageUrl: '/images/card_img_digital.png',
                tags: ['gouache', 'mumbaiart', 'sketchbook'],
                likesCount: 34,
                commentsCount: 5,
                timeAgo: '2 hours ago',
                liked: false
            },
            {
                id: 202,
                authorId: 102,
                authorName: 'Devansh Roy',
                authorAvatar: '/images/user_avatar_nav.png',
                category: 'Music',
                authorLocation: 'Bengaluru, KA',
                caption: 'Testing tape saturation across an old Roland synthesizer loop. Recording classical sarangi over this tomorrow for the ambient EP.',
                imageUrl: '/images/card_img_music.png',
                tags: ['modularsynth', 'ambient', 'audioproduction'],
                likesCount: 52,
                commentsCount: 9,
                timeAgo: '5 hours ago',
                liked: true
            },
            {
                id: 203,
                authorId: 103,
                authorName: 'Maya Sen',
                authorAvatar: '/images/user_avatar_nav.png',
                category: 'Dance',
                authorLocation: 'Ahmedabad, GJ',
                caption: 'Rehearsing floor transitions inside the brick stepwell courtyard. When architecture dictates body velocity, the rhythm changes completely.',
                imageUrl: '/images/card_img_dance.png',
                tags: ['contemporarydance', 'siteperformance', 'bodygeometry'],
                likesCount: 41,
                commentsCount: 3,
                timeAgo: '1 day ago',
                liked: false
            }
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
