/**
 * ArtSphere – Collaborators Page JavaScript
 * Handles search, skill filter chips, active posts rendering, artist connection, and request modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    let currentSkill = 'All';
    let currentSearch = '';
    const currentUserId = 101; // Demo User (Aanya / Mrunali)

    const collabCardsList = document.getElementById('collabCardsList');
    const activePostsCount = document.getElementById('activePostsCount');
    const artistsCollabGrid = document.getElementById('artistsCollabGrid');
    const searchInput = document.getElementById('collabSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const skillsFilterList = document.getElementById('skillsFilterList');
    const requestsBadge = document.getElementById('requestsBadge');

    // Modal elements
    const requestModal = document.getElementById('requestModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const collabRequestForm = document.getElementById('collabRequestForm');
    const modalCollabId = document.getElementById('modalCollabId');
    const modalReceiverId = document.getElementById('modalReceiverId');
    const modalTargetInfo = document.getElementById('modalTargetInfo');
    const requestMessageInput = document.getElementById('requestMessageInput');
    const toastNotification = document.getElementById('toastNotification');

    // Header User Menu
    const userMenuWrapper = document.getElementById('userMenuWrapper');
    const headerUserAvatarBtn = document.getElementById('headerUserAvatarBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    if (headerUserAvatarBtn && userDropdownMenu) {
        headerUserAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!userMenuWrapper.contains(e.target)) {
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
                console.error(err);
            }
            window.location.href = '/pages/login.html';
        });
    }

    // Load initial data
    loadCollaborations();
    loadCollaborativeArtists();
    updateRequestsBadgeCount();

    // Skill filter pill clicks
    if (skillsFilterList) {
        skillsFilterList.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-pill');
            if (!btn) return;

            skillsFilterList.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');

            currentSkill = btn.getAttribute('data-skill') || 'All';
            loadCollaborations();
        });
    }

    // Search bar with debounce
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const val = searchInput.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = val ? 'block' : 'none';
            }

            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = val;
                loadCollaborations();
            }, 300);
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            currentSearch = '';
            loadCollaborations();
        });
    }

    // Fetch and render collaborations
    async function loadCollaborations() {
        if (!collabCardsList) return;

        collabCardsList.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading collaboration posts...</p>
            </div>
        `;

        try {
            const posts = await window.ArtSphereAPI.getCollaborations(currentSkill, null, currentSearch, currentUserId);
            renderCollaborations(posts);
        } catch (err) {
            console.error('Failed to load collaborations:', err);
            collabCardsList.innerHTML = `
                <div class="empty-state">
                    <p>Unable to load collaboration posts at this moment.</p>
                </div>
            `;
        }
    }

    function renderCollaborations(posts) {
        if (!posts || posts.length === 0) {
            collabCardsList.innerHTML = `
                <div class="empty-state">
                    <p>No active collaboration posts found matching your criteria.</p>
                </div>
            `;
            if (activePostsCount) activePostsCount.textContent = '0 Posts';
            return;
        }

        if (activePostsCount) {
            activePostsCount.textContent = `${posts.length} Post${posts.length > 1 ? 's' : ''}`;
        }

        collabCardsList.innerHTML = posts.map(post => {
            const tagsHtml = (post.tags || []).map(t => `<span class="collab-tag">${escapeHtml(t)}</span>`).join('');
            const isOwn = post.ownPost;

            return `
                <article class="collab-card" data-collab-id="${post.id}">
                    <div class="card-top-row">
                        <a href="/pages/artist-profile.html?id=${post.creatorId}" class="creator-info-group">
                            <img src="${post.creatorAvatar || '/images/avatar_creator_mrunali.png'}" alt="${escapeHtml(post.creatorName)}" class="creator-avatar">
                            <div class="creator-text">
                                <span class="creator-name">${escapeHtml(post.creatorName)}</span>
                                <span class="creator-meta">${escapeHtml(post.location || 'Mumbai, MH')} • ${post.timeAgo || 'Recently'}</span>
                            </div>
                        </a>
                        <span class="badge-open">${escapeHtml(post.status || 'OPEN')}</span>
                    </div>

                    <h3 class="collab-title">
                        <a href="/pages/collaboration-details.html?id=${post.id}">${escapeHtml(post.title)}</a>
                    </h3>

                    <p class="collab-desc">${escapeHtml(post.description)}</p>

                    <div class="collab-tags-row">
                        ${tagsHtml}
                    </div>

                    <div class="collab-meta-row">
                        <div class="meta-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                            <span>${escapeHtml(post.collaborationType || 'Project')}</span>
                        </div>
                        <div class="meta-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>${escapeHtml(post.availability || 'Flexible')}</span>
                        </div>
                        <div class="meta-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                            <span>${escapeHtml(post.peopleNeeded || '1-2 collaborators')}</span>
                        </div>
                    </div>

                    <div class="card-actions-row">
                        <a href="/pages/collaboration-details.html?id=${post.id}" class="btn-card-outline">View Details</a>
                        ${!isOwn ? `
                            <button class="btn-card-primary" onclick="openRequestModal(${post.id}, ${post.creatorId}, '${escapeJs(post.title)}', '${escapeJs(post.creatorName)}')">
                                Collaborate
                            </button>
                        ` : `
                            <a href="/pages/collaboration-details.html?id=${post.id}" class="btn-card-primary" style="background:#5A4AD1;">
                                Your Post
                            </a>
                        `}
                    </div>
                </article>
            `;
        }).join('');
    }

    // Load Artists Looking to Collaborate (Matching Page 15)
    async function loadCollaborativeArtists() {
        if (!artistsCollabGrid) return;

        const defaultCollabArtists = [
            {
                id: 107,
                name: 'Riya Deshmukh',
                artistType: 'Illustrator',
                location: 'Mumbai, MH',
                avatar: '/images/avatar_riya.png',
                skills: 'Character Art, Digital Art'
            },
            {
                id: 102,
                name: 'Arjun Mehta',
                artistType: 'Music Producer',
                location: 'Pune, MH',
                avatar: '/images/avatar_arjun_collab.png',
                skills: 'Soundtrack, Acoustic Indie'
            },
            {
                id: 108,
                name: 'Sneha Patil',
                artistType: 'Painter',
                location: 'Navi Mumbai, MH',
                avatar: '/images/avatar_sneha.png',
                skills: 'Acrylic, Contemporary Art'
            },
            {
                id: 109,
                name: 'Karan Shah',
                artistType: 'Graphic Designer',
                location: 'Mumbai, MH',
                avatar: '/images/avatar_karan.png',
                skills: 'Visual Identity, Poster Art'
            }
        ];

        artistsCollabGrid.innerHTML = defaultCollabArtists.map(artist => `
            <div class="artist-collab-card">
                <a href="/pages/artist-profile.html?id=${artist.id}" class="artist-info-col">
                    <img src="${artist.avatar}" alt="${escapeHtml(artist.name)}" class="artist-collab-avatar">
                    <div class="artist-collab-details">
                        <div class="artist-collab-name">${escapeHtml(artist.name)}</div>
                        <div class="artist-collab-role">${escapeHtml(artist.artistType)}</div>
                        <div class="artist-collab-location">${escapeHtml(artist.location)}</div>
                    </div>
                </a>
                <button class="btn-connect-artist" onclick="openRequestModal(null, ${artist.id}, 'Collaboration Connection', '${escapeJs(artist.name)}')">
                    Connect
                </button>
            </div>
        `).join('');
    }

    // Badge count for collaboration requests
    async function updateRequestsBadgeCount() {
        if (!requestsBadge) return;
        try {
            const requests = await window.ArtSphereAPI.getCollaborationRequests('received', currentUserId);
            const count = requests.length;
            if (count > 0) {
                requestsBadge.textContent = count;
                requestsBadge.style.display = 'flex';
            } else {
                requestsBadge.style.display = 'none';
            }
        } catch (err) {
            console.error('Failed to fetch requests count:', err);
        }
    }

    // Open Request Modal
    window.openRequestModal = function(collabId, receiverId, title, name) {
        if (!requestModal) return;
        modalCollabId.value = collabId || '';
        modalReceiverId.value = receiverId || '';
        modalTargetInfo.innerHTML = collabId 
            ? `Collaborate on: <strong>${escapeHtml(title)}</strong> with <strong>${escapeHtml(name)}</strong>`
            : `Connect to collaborate with <strong>${escapeHtml(name)}</strong>`;
        requestMessageInput.value = '';
        requestModal.style.display = 'flex';
        requestMessageInput.focus();
    };

    function closeModal() {
        if (requestModal) {
            requestModal.style.display = 'none';
        }
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (requestModal) {
        requestModal.addEventListener('click', (e) => {
            if (e.target === requestModal) closeModal();
        });
    }

    // Submit Request
    if (collabRequestForm) {
        collabRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const collabId = modalCollabId.value ? parseInt(modalCollabId.value) : null;
            const receiverId = modalReceiverId.value ? parseInt(modalReceiverId.value) : 101;
            const message = requestMessageInput.value.trim();

            if (!message) {
                alert('Please enter a short message for your collaboration request.');
                return;
            }

            try {
                const submitBtn = document.getElementById('sendRequestSubmitBtn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                }

                await window.ArtSphereAPI.sendCollaborationRequest(collabId, {
                    collaborationId: collabId,
                    receiverId: receiverId,
                    message: message
                }, currentUserId);

                closeModal();
                showToast('Collaboration request sent successfully!');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Request';
                }
            } catch (err) {
                console.error(err);
                alert('Failed to send collaboration request. Please try again.');
                const submitBtn = document.getElementById('sendRequestSubmitBtn');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Request';
                }
            }
        });
    }

    function showToast(msg) {
        if (!toastNotification) return;
        toastNotification.textContent = msg;
        toastNotification.style.display = 'block';
        setTimeout(() => {
            toastNotification.style.display = 'none';
        }, 3500);
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeJs(str) {
        if (!str) return '';
        return str.replace(/['"\\]/g, '\\$&').replace(/\n/g, ' ');
    }
});
