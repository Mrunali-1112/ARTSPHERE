/**
 * ArtSphere — Post Details Script (Editorial Neo-Brutalist)
 * Handles post loading, interactive likes, bookmarks, comments submission, and creator following
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Primary active user

    // Universal Nav dropdown & Mobile toggle
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');
    const navMobileToggle = document.getElementById('navMobileToggle');
    const navLinks = document.getElementById('navLinks');

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
        });
    }

    // Get post ID from URL params (?id=201)
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id') || '4';

    const postContentContainer = document.getElementById('postDetailsContent');

    loadPostDetails();

    async function loadPostDetails() {
        if (!postContentContainer) return;

        postContentContainer.innerHTML = `
            <div class="post-loading-spinner">
                <div class="spinner"></div>
                <p>Loading artwork and discussion...</p>
            </div>
        `;

        try {
            const apiObj = window.api || window.ArtSphereAPI;
            const post = await apiObj.getPostDetails(postId, currentUserId);
            renderPostDetails(post);
        } catch (error) {
            console.error('Failed to load post details:', error);
            postContentContainer.innerHTML = `
                <div class="detail-info-card" style="text-align: center; padding: 48px 24px;">
                    <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 10px;">Post Not Found</h3>
                    <p style="color: var(--color-ink-muted); font-size: 1rem; margin-bottom: 20px;">
                        ${error.message || 'The post could not be retrieved from the studio feed.'}
                    </p>
                    <a href="/pages/feed.html" class="btn-pill-primary" style="display: inline-flex;">
                        <span>&larr; Back to Studio Feed</span>
                    </a>
                </div>
            `;
        }
    }

    function renderPostDetails(post) {
        const isLiked = !!post.liked;
        const isSaved = !!post.saved;
        const tags = Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',') : []);
        const tagsHtml = tags.map(t => {
            const cleanTag = t.trim().replace(/^#/, '');
            return `<span class="detail-tag-item" onclick="window.location.href='/pages/feed.html?search=${encodeURIComponent(cleanTag)}'">#${escapeHtml(cleanTag)}</span>`;
        }).join('');

        // Comments HTML
        const comments = post.comments || [];
        const commentsListHtml = comments.length > 0 ? comments.map(c => `
            <div class="comment-item" id="comment-${c.id}">
                <img src="${c.authorAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(c.authorName || 'Artist')}" class="comment-avatar">
                <div class="comment-body">
                    <div class="comment-header-line">
                        <span class="comment-author-name">${escapeHtml(c.authorName || 'Studio Artist')}</span>
                        <span class="comment-time">${c.timeAgo || 'Just now'}</span>
                    </div>
                    <p class="comment-text">${escapeHtml(c.content || '')}</p>
                    <div class="comment-footer-actions">
                        <span class="comment-like-icon" onclick="toggleCommentLike(this)">&hearts;</span>
                        <span class="comment-likes-count">${c.likesCount || 0}</span>
                    </div>
                </div>
            </div>
        `).join('') : `<p style="color: var(--color-ink-muted); font-size: 0.95rem; font-style: italic;">No comments yet. Be the first to share your critique or impressions!</p>`;

        // More from Artist HTML
        const moreList = post.moreFromArtist || [];
        const moreListHtml = moreList.length > 0 ? moreList.map(m => `
            <div class="more-thumb-card" onclick="window.location.href='/pages/post-details.html?id=${m.id}'">
                <img src="${m.imageUrl || '/images/card_img_digital.png'}" alt="${escapeHtml(m.title || 'Artwork')}" class="more-thumb-img">
                <div class="more-thumb-likes">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>${formatCount(m.likesCount || 0)}</span>
                </div>
            </div>
        `).join('') : `<p style="color: var(--color-ink-muted); font-size: 0.9rem;">No other works posted yet.</p>`;

        postContentContainer.innerHTML = `
            <div class="grid-12 post-details-layout">
                <!-- Left 8 Columns: Main Artwork, Narrative & Discussion -->
                <div class="col-8 col-md-8 col-sm-4 post-main-column">
                    
                    <!-- 1. Media Presentation Card -->
                    <div class="detail-media-card">
                        <img src="${post.mediaUrl || post.imageUrl || '/images/card_img_digital.png'}" alt="${escapeHtml(post.title || 'Artwork')}" class="detail-media-img">
                        <span class="detail-media-counter">✦ Studio Original</span>
                    </div>

                    <!-- 2. Artist Header Card -->
                    <div class="detail-artist-card">
                        <a href="/pages/artist-profile.html?id=${post.artistId || 101}" class="detail-artist-link">
                            <img src="${post.artistAvatar || '/images/artist_profile_avatar.png'}" alt="${escapeHtml(post.artistName || 'Artist')}" class="detail-artist-avatar">
                            <div>
                                <h3 class="detail-artist-name">${escapeHtml(post.artistName || 'Aanya Verma')}</h3>
                                <p class="detail-artist-handle">${escapeHtml(post.artForm || 'Visual Arts')} &bull; @${escapeHtml(post.artistUsername || 'creator')}</p>
                            </div>
                        </a>
                        <button class="btn-detail-follow ${post.following ? 'following' : ''}" id="btnDetailFollow">
                            ${post.following ? 'Following' : 'Follow'}
                        </button>
                    </div>

                    <!-- 3. Post Info Card (Title, Narrative, Meta, Tags) -->
                    <div class="detail-info-card">
                        <h1 class="detail-post-title text-display">${escapeHtml(post.title || 'Studio Reflection')}</h1>
                        <p class="detail-post-caption">${escapeHtml(post.caption || '')}</p>

                        <div class="detail-meta-row">
                            <div class="detail-meta-item">
                                <span class="art-form-badge">${escapeHtml(post.artForm || 'Visual Arts')}</span>
                            </div>
                            ${post.location ? `
                            <div class="detail-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>${escapeHtml(post.location)}</span>
                            </div>` : ''}
                            <div class="detail-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span>${escapeHtml(post.formattedDate || 'Recent')}</span>
                            </div>
                        </div>

                        ${tagsHtml ? `<div class="detail-tags-row">${tagsHtml}</div>` : ''}
                    </div>

                    <!-- 4. Action Bar -->
                    <div class="detail-action-bar">
                        <div class="detail-actions-left">
                            <!-- Like Button -->
                            <button class="detail-action-btn like-btn ${isLiked ? 'liked' : ''}" id="detailLikeBtn" aria-label="Like Post">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span id="detailLikesCountText">${formatCount(post.likesCount || 0)} Likes</span>
                            </button>

                            <!-- Comments Count -->
                            <button class="detail-action-btn" id="btnJumpToComments" aria-label="View Comments">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                                <span id="detailCommentsCountText">${post.commentsCount || comments.length} Comments</span>
                            </button>

                            <!-- Share Button -->
                            <button class="detail-action-btn" id="detailShareBtn" aria-label="Share Post">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                </svg>
                                <span>Share</span>
                            </button>
                        </div>

                        <!-- Save / Bookmark Button -->
                        <button class="detail-action-btn save-btn ${isSaved ? 'saved' : ''}" id="detailSaveBtn" aria-label="Save Post">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span id="detailSavesCountText">${formatCount(post.savesCount || 0)}</span>
                        </button>
                    </div>

                    <!-- 5. Comments Section -->
                    <div class="detail-comments-section" id="commentsSection">
                        <div class="comments-header-row">
                            <h3 class="comments-title">Critique &amp; Reflections (${post.commentsCount || comments.length})</h3>
                            <span class="comments-sort-text">Community Discussion</span>
                        </div>

                        <!-- Add Comment Input Box -->
                        <div class="comment-input-row">
                            <img src="/images/user_avatar_nav.png" alt="You" class="current-user-comment-avatar">
                            <input type="text" id="commentInput" class="comment-text-input" placeholder="Offer constructive feedback or ask about the technique..." maxlength="300">
                            <button type="button" class="btn-send-comment" id="btnSendComment" aria-label="Send comment">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>

                        <!-- Comments Stream -->
                        <div class="comments-list" id="commentsList">
                            ${commentsListHtml}
                        </div>
                    </div>
                </div>

                <!-- Right 4 Columns: Spotlight & Recommendations -->
                <div class="col-4 col-md-8 col-sm-4 post-sidebar-column">
                    <!-- Creator Spotlight -->
                    <div class="sidebar-post-card">
                        <div class="card-heading-row">
                            <h3 class="card-heading-title">
                                <span>✦</span>
                                <span>About Creator</span>
                            </h3>
                            <a href="/pages/artist-profile.html?id=${post.artistId || 101}" class="card-heading-link">Profile</a>
                        </div>
                        <div class="sidebar-artist-profile">
                            <img src="${post.artistAvatar || '/images/artist_profile_avatar.png'}" alt="${escapeHtml(post.artistName || 'Artist')}" class="spotlight-avatar">
                            <h4 class="spotlight-name">${escapeHtml(post.artistName || 'Aanya Verma')}</h4>
                            <span class="spotlight-discipline">${escapeHtml(post.artForm || 'Visual Arts')}</span>
                            <p class="spotlight-bio">${escapeHtml(post.artistBio || 'Exploring contemporary narratives, texture, and multidisciplinary dialogues.')}</p>
                            <div class="spotlight-actions">
                                <a href="/pages/artist-profile.html?id=${post.artistId || 101}" class="btn-pill-secondary">View Profile</a>
                                <a href="/pages/portfolio.html?id=${post.artistId || 101}" class="btn-pill-primary">Portfolio</a>
                            </div>
                        </div>
                    </div>

                    <!-- More from this Artist -->
                    <div class="sidebar-post-card">
                        <div class="card-heading-row">
                            <h3 class="card-heading-title">
                                <span>✦</span>
                                <span>More from Artist</span>
                            </h3>
                            <a href="/pages/portfolio.html?id=${post.artistId || 101}" class="card-heading-link">All Works</a>
                        </div>
                        <div class="more-thumbs-grid">
                            ${moreListHtml}
                        </div>
                    </div>

                    <!-- Studio Principles -->
                    <div class="sidebar-post-card highlight">
                        <div class="card-heading-row">
                            <h3 class="card-heading-title">
                                <span>✦</span>
                                <span>Studio Feed Etiquette</span>
                            </h3>
                        </div>
                        <ul class="principles-list">
                            <li><strong>Encourage Growth:</strong> Offer thoughtful, constructive observations on technique and mood.</li>
                            <li><strong>Respect Ownership:</strong> Always credit collaborating makers, poets, and musicians.</li>
                            <li><strong>Spam-Free Zone:</strong> Discussions are reserved for honest creative inquiry.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        bindDetailInteractions(post);
    }

    function bindDetailInteractions(post) {
        const apiObj = window.api || window.ArtSphereAPI;

        // Like button
        const likeBtn = document.getElementById('detailLikeBtn');
        const likesText = document.getElementById('detailLikesCountText');
        if (likeBtn) {
            likeBtn.addEventListener('click', async () => {
                try {
                    const res = await apiObj.togglePostLike(post.id, currentUserId);
                    if (res && res.liked !== undefined) {
                        likeBtn.classList.toggle('liked', res.liked);
                        const svg = likeBtn.querySelector('svg');
                        if (svg) svg.setAttribute('fill', res.liked ? 'currentColor' : 'none');
                        if (likesText) likesText.textContent = `${formatCount(res.likesCount || 0)} Likes`;
                    }
                } catch (err) {
                    console.error('Error toggling like:', err);
                    showToast('Could not update like status', 'error');
                }
            });
        }

        // Save button
        const saveBtn = document.getElementById('detailSaveBtn');
        const savesText = document.getElementById('detailSavesCountText');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                try {
                    const res = await apiObj.togglePostSave(post.id, currentUserId);
                    if (res && res.saved !== undefined) {
                        saveBtn.classList.toggle('saved', res.saved);
                        const svg = saveBtn.querySelector('svg');
                        if (svg) svg.setAttribute('fill', res.saved ? 'currentColor' : 'none');
                        if (savesText) savesText.textContent = formatCount(res.savesCount || 0);
                        showToast(res.saved ? 'Saved to bookmarks' : 'Removed from bookmarks');
                    }
                } catch (err) {
                    console.error('Error toggling save:', err);
                    showToast('Could not update bookmark', 'error');
                }
            });
        }

        // Share button
        const shareBtn = document.getElementById('detailShareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                const url = window.location.href;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                        showToast('Post link copied to clipboard!');
                    }).catch(() => {
                        showToast('Post URL: ' + url);
                    });
                } else {
                    showToast('Post URL: ' + url);
                }
            });
        }

        // Jump to comments
        const btnJump = document.getElementById('btnJumpToComments');
        if (btnJump) {
            btnJump.addEventListener('click', () => {
                const commentInput = document.getElementById('commentInput');
                if (commentInput) {
                    commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    commentInput.focus();
                }
            });
        }

        // Follow artist button
        const btnFollow = document.getElementById('btnDetailFollow');
        if (btnFollow && post.artistId) {
            btnFollow.addEventListener('click', async () => {
                try {
                    const res = await apiObj.toggleFollowArtist(post.artistId);
                    const isFollowing = res.following !== undefined ? res.following : !btnFollow.classList.contains('following');
                    btnFollow.classList.toggle('following', isFollowing);
                    btnFollow.textContent = isFollowing ? 'Following' : 'Follow';
                    showToast(isFollowing ? `Now following ${post.artistName || 'artist'}` : 'Unfollowed');
                } catch (err) {
                    console.error('Error following artist:', err);
                    showToast('Could not update follow status', 'error');
                }
            });
        }

        // Send Comment
        const commentInput = document.getElementById('commentInput');
        const btnSend = document.getElementById('btnSendComment');
        const commentsList = document.getElementById('commentsList');
        const commentsCountText = document.getElementById('detailCommentsCountText');

        async function submitComment() {
            if (!commentInput) return;
            const text = commentInput.value.trim();
            if (!text) return;

            btnSend.disabled = true;
            try {
                const newComment = await apiObj.addPostComment(post.id, { content: text }, currentUserId);
                
                // Append comment dynamically
                const commentEl = document.createElement('div');
                commentEl.className = 'comment-item';
                commentEl.id = `comment-${newComment.id || Date.now()}`;
                commentEl.innerHTML = `
                    <img src="${newComment.authorAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(newComment.authorName || 'You')}" class="comment-avatar">
                    <div class="comment-body">
                        <div class="comment-header-line">
                            <span class="comment-author-name">${escapeHtml(newComment.authorName || 'You')}</span>
                            <span class="comment-time">Just now</span>
                        </div>
                        <p class="comment-text">${escapeHtml(newComment.content || text)}</p>
                        <div class="comment-footer-actions">
                            <span class="comment-like-icon" onclick="toggleCommentLike(this)">&hearts;</span>
                            <span class="comment-likes-count">0</span>
                        </div>
                    </div>
                `;
                commentsList.prepend(commentEl);
                commentInput.value = '';

                // Update comments count
                post.commentsCount = (post.commentsCount || 0) + 1;
                if (commentsCountText) {
                    commentsCountText.textContent = `${post.commentsCount} Comments`;
                }
                const headerTitle = document.querySelector('.comments-title');
                if (headerTitle) {
                    headerTitle.textContent = `Critique & Reflections (${post.commentsCount})`;
                }

                showToast('Reflection posted!');
            } catch (err) {
                console.error('Failed to post comment:', err);
                showToast(err.message || 'Error posting comment. Please try again.', 'error');
            } finally {
                btnSend.disabled = false;
            }
        }

        if (btnSend) {
            btnSend.addEventListener('click', submitComment);
        }

        if (commentInput) {
            commentInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submitComment();
                }
            });
        }
    }

    window.toggleCommentLike = function(icon) {
        if (!icon) return;
        const countSpan = icon.parentElement.querySelector('.comment-likes-count');
        let count = parseInt(countSpan.textContent || '0', 10);
        if (icon.classList.contains('liked')) {
            icon.classList.remove('liked');
            icon.style.color = '';
            countSpan.textContent = Math.max(0, count - 1);
        } else {
            icon.classList.add('liked');
            icon.style.color = 'var(--color-orange)';
            countSpan.textContent = count + 1;
        }
    };

    function formatCount(num) {
        if (!num || num === 0) return '0';
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace('.0', '') + 'k';
        }
        return num.toString();
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showToast(message, type = 'success') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-pill ${type}`;
        toast.innerHTML = `<span>✦</span><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 2600);
    }
});
