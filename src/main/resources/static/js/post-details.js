/**
 * ArtSphere – Post Details JavaScript (Matches page_27.jpg)
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Primary active user

    // Get post ID from URL params (?id=201)
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id') || '201';

    const postContentContainer = document.getElementById('postDetailsContent');

    loadPostDetails();

    async function loadPostDetails() {
        if (!postContentContainer) return;

        postContentContainer.innerHTML = `
            <div class="post-loading-spinner">
                <div class="spinner"></div>
                <p>Loading post details...</p>
            </div>
        `;

        try {
            const post = await window.ArtSphereAPI.getPostDetails(postId, currentUserId);
            renderPostDetails(post);
        } catch (error) {
            console.error('Failed to load post details:', error);
            postContentContainer.innerHTML = `
                <div class="detail-info-card" style="text-align: center; padding: 40px 20px;">
                    <h3 style="font-size: 18px; margin-bottom: 8px;">Post Not Found</h3>
                    <p style="color: var(--text-muted); font-size: 13.5px; margin-bottom: 16px;">${error.message || 'The post could not be loaded.'}</p>
                    <a href="/pages/feed.html" class="btn-detail-follow" style="text-decoration: none; display: inline-block;">Back to Creative Feed</a>
                </div>
            `;
        }
    }

    function renderPostDetails(post) {
        const isLiked = !!post.liked;
        const isSaved = !!post.saved;
        const tagsHtml = (post.tags || []).map(t => `<span class="detail-tag-item" onclick="window.location.href='/pages/feed.html'">${t}</span>`).join(' ');

        // Comments HTML
        const commentsListHtml = (post.comments || []).map(c => `
            <div class="comment-item" id="comment-${c.id}">
                <img src="${c.authorAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(c.authorName || 'User')}" class="comment-avatar">
                <div class="comment-body">
                    <div class="comment-header-line">
                        <span class="comment-author-name">${escapeHtml(c.authorName || 'Artist Member')}</span>
                        <span class="comment-time">${c.timeAgo || 'Just now'}</span>
                    </div>
                    <p class="comment-text">${escapeHtml(c.content || '')}</p>
                    <div class="comment-footer-actions">
                        <span class="comment-like-icon" onclick="toggleCommentLike(this)">&hearts;</span>
                        <span class="comment-likes-count">${c.likesCount || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // More from Artist HTML
        const moreListHtml = (post.moreFromArtist || []).map(m => `
            <div class="more-thumb-card" onclick="window.location.href='/pages/post-details.html?id=${m.id}'">
                <img src="${m.imageUrl || '/images/post_thumb_bloom_again.png'}" alt="${escapeHtml(m.title || 'Artwork')}" class="more-thumb-img">
                <div class="more-thumb-likes">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>${formatCount(m.likesCount || 0)}</span>
                </div>
            </div>
        `).join('');

        postContentContainer.innerHTML = `
            <!-- 1. Media Card (With 1/4 Counter Badge) -->
            <div class="detail-media-card">
                <img src="${post.mediaUrl || '/images/post_a_brighter_day.png'}" alt="${escapeHtml(post.title || 'Artwork')}" class="detail-media-img">
                <span class="detail-media-counter">1/4</span>
            </div>

            <!-- 2. Artist Profile Row -->
            <div class="detail-artist-card">
                <a href="/pages/artist-profile.html?id=${post.artistId || 101}" class="detail-artist-link">
                    <img src="${post.artistAvatar || '/images/artist_profile_avatar.png'}" alt="${escapeHtml(post.artistName || 'Artist')}" class="detail-artist-avatar">
                    <div>
                        <h3 class="detail-artist-name">${escapeHtml(post.artistName || 'Aanya Verma')}</h3>
                        <p class="detail-artist-handle">@${escapeHtml(post.artistUsername || 'aanyaart')}</p>
                    </div>
                </a>
                <button class="btn-detail-follow ${post.following ? 'following' : ''}" id="btnDetailFollow" onclick="toggleAuthorFollow(this, ${post.artistId})">
                    ${post.following ? 'Following' : 'Follow'}
                </button>
            </div>

            <!-- 3. Post Info Card (Title, Caption, Metadata, Tags) -->
            <div class="detail-info-card">
                <h2 class="detail-post-title">${escapeHtml(post.title || 'A Brighter Day')}</h2>
                <p class="detail-post-caption">"${escapeHtml(post.caption || '')}"</p>

                <div class="detail-meta-row">
                    <div class="detail-meta-item">
                        <span class="art-form-badge">${escapeHtml(post.artForm || 'Painting')}</span>
                    </div>
                    <div class="detail-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${escapeHtml(post.location || 'Pune, Maharashtra')}</span>
                    </div>
                    <div class="detail-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>${escapeHtml(post.formattedDate || '12 Sept 2024')}</span>
                    </div>
                    <div class="detail-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                        </svg>
                        <span>${escapeHtml(post.visibility || 'Public Post')}</span>
                    </div>
                </div>

                ${tagsHtml ? `<div class="detail-tags-row">${tagsHtml}</div>` : ''}
            </div>

            <!-- 4. Action Bar (Matches page_27.jpg) -->
            <div class="detail-action-bar">
                <div class="detail-actions-left">
                    <!-- Like Button -->
                    <button class="detail-action-btn like-btn ${isLiked ? 'liked' : ''}" id="detailLikeBtn" aria-label="Like Post">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span id="detailLikesCountText">${formatCount(post.likesCount || 1200)} Likes</span>
                    </button>

                    <!-- Comments Count -->
                    <button class="detail-action-btn" onclick="document.getElementById('commentInput').focus()" aria-label="View Comments">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        <span id="detailCommentsCountText">Comments (${post.commentsCount || 86})</span>
                    </button>

                    <!-- Share Button -->
                    <button class="detail-action-btn" id="detailShareBtn" aria-label="Share Post">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span id="detailSavesCountText">${formatCount(post.savesCount || 639)}</span>
                </button>
            </div>

            <!-- 5. Comments Section (Matches page_27.jpg) -->
            <div class="detail-comments-section" id="comments">
                <div class="comments-header-row">
                    <h3 class="comments-title">Comments (${post.commentsCount || 86})</h3>
                    <span class="comments-sort-text">Sort: Latest ▾</span>
                </div>

                <div class="comments-list" id="commentsList">
                    ${commentsListHtml}
                </div>

                <!-- Add Comment Input Box -->
                <div class="comment-input-row">
                    <img src="/images/user_avatar_nav.png" alt="You" class="current-user-comment-avatar">
                    <input type="text" id="commentInput" class="comment-text-input" placeholder="Add a comment..." maxlength="300">
                    <button type="button" class="btn-send-comment" id="btnSendComment" aria-label="Send comment">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- 6. More from Artist Section (Matches page_27.jpg) -->
            <div class="more-from-artist-section">
                <div class="more-header-row">
                    <h3 class="more-title">More from ${escapeHtml(post.artistName || 'Aanya Verma')}</h3>
                    <a href="/pages/artist-profile.html?id=${post.artistId || 101}" class="more-see-all">See All</a>
                </div>

                <div class="more-thumbs-grid">
                    ${moreListHtml}
                </div>
            </div>
        `;

        bindDetailInteractions(post);
    }

    function bindDetailInteractions(post) {
        // Like button
        const likeBtn = document.getElementById('detailLikeBtn');
        const likesText = document.getElementById('detailLikesCountText');
        if (likeBtn) {
            likeBtn.addEventListener('click', async () => {
                try {
                    const res = await window.ArtSphereAPI.togglePostLike(post.id, currentUserId);
                    if (res && res.liked !== undefined) {
                        likeBtn.classList.toggle('liked', res.liked);
                        const svg = likeBtn.querySelector('svg');
                        if (svg) svg.setAttribute('fill', res.liked ? 'currentColor' : 'none');
                        if (likesText) likesText.textContent = `${formatCount(res.likesCount || 0)} Likes`;
                    }
                } catch (err) {
                    console.error('Error toggling like:', err);
                }
            });
        }

        // Save button
        const saveBtn = document.getElementById('detailSaveBtn');
        const savesText = document.getElementById('detailSavesCountText');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                try {
                    const res = await window.ArtSphereAPI.togglePostSave(post.id, currentUserId);
                    if (res && res.saved !== undefined) {
                        saveBtn.classList.toggle('saved', res.saved);
                        const svg = saveBtn.querySelector('svg');
                        if (svg) svg.setAttribute('fill', res.saved ? 'currentColor' : 'none');
                        if (savesText) savesText.textContent = formatCount(res.savesCount || 0);
                        showToast(res.saved ? 'Saved to bookmarks' : 'Removed from bookmarks');
                    }
                } catch (err) {
                    console.error('Error toggling save:', err);
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
                        showToast('Link copied to clipboard!');
                    }).catch(() => {
                        showToast('Post link: ' + url);
                    });
                } else {
                    showToast('Post link: ' + url);
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
                const newComment = await window.ArtSphereAPI.addPostComment(post.id, { content: text }, currentUserId);
                
                // Append comment dynamically
                const commentEl = document.createElement('div');
                commentEl.className = 'comment-item';
                commentEl.id = `comment-${newComment.id}`;
                commentEl.innerHTML = `
                    <img src="${newComment.authorAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(newComment.authorName || 'You')}" class="comment-avatar">
                    <div class="comment-body">
                        <div class="comment-header-line">
                            <span class="comment-author-name">${escapeHtml(newComment.authorName || 'You')}</span>
                            <span class="comment-time">Just now</span>
                        </div>
                        <p class="comment-text">${escapeHtml(newComment.content)}</p>
                        <div class="comment-footer-actions">
                            <span class="comment-like-icon" onclick="toggleCommentLike(this)">&hearts;</span>
                            <span class="comment-likes-count">0</span>
                        </div>
                    </div>
                `;
                commentsList.appendChild(commentEl);
                commentInput.value = '';

                // Update comments count
                post.commentsCount = (post.commentsCount || 0) + 1;
                if (commentsCountText) {
                    commentsCountText.textContent = `Comments (${post.commentsCount})`;
                }
                const headerTitle = document.querySelector('.comments-title');
                if (headerTitle) {
                    headerTitle.textContent = `Comments (${post.commentsCount})`;
                }

                showToast('Comment posted!');
            } catch (err) {
                console.error('Failed to post comment:', err);
                alert('Error posting comment: ' + (err.message || 'Please try again.'));
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

    window.toggleAuthorFollow = function(btn, artistId) {
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

    window.toggleCommentLike = function(icon) {
        if (!icon) return;
        const countSpan = icon.parentElement.querySelector('.comment-likes-count');
        let count = parseInt(countSpan.textContent || '0', 10);
        if (icon.classList.contains('liked')) {
            icon.classList.remove('liked');
            icon.style.color = 'var(--text-muted)';
            countSpan.textContent = Math.max(0, count - 1);
        } else {
            icon.classList.add('liked');
            icon.style.color = 'var(--like-color)';
            countSpan.textContent = count + 1;
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
        let toast = document.getElementById('detailToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'detailToast';
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
