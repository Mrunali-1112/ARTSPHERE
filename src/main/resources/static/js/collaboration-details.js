/**
 * ArtSphere — Collaboration Details Controller
 * Handles Real Database Integration, Dynamic User Session Resolution,
 * Skeleton Loading, Error/Invalid ID Handling, Request Inquiries, and Share.
 */

document.addEventListener('DOMContentLoaded', async () => {
    let currentUserId = 101;
    let currentUser = null;
    let currentCollaboration = null;

    const urlParams = new URLSearchParams(window.location.search);
    const collabIdParam = urlParams.get('id');
    const collabId = collabIdParam ? parseInt(collabIdParam, 10) : 501;

    // Initialize Navigation & UI Controls
    initSidebarControls();
    initUserDropdown();
    initModalControls();
    initShareButton();

    // Authenticate & Resolve Current User
    await resolveCurrentUser();

    // Load Collaboration Data
    await loadCollaborationDetails(collabId);

    // Load Related Collaborations for Right Sidebar
    loadRelatedCollaborations(collabId);

    /**
     * 1. Authenticate & Resolve Current User Session
     */
    async function resolveCurrentUser() {
        try {
            let user = null;
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCurrentUser === 'function') {
                user = await window.ArtSphereAPI.getCurrentUser();
            } else if (window.api && typeof window.api.getCurrentUser === 'function') {
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

                // Update Sidebar Profile Card
                const sidebarUserName = document.getElementById('sidebarUserName');
                const sidebarUserRole = document.getElementById('sidebarUserRole');
                const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
                const sidebarProfileCard = document.getElementById('sidebarProfileCard');

                if (sidebarUserName) sidebarUserName.textContent = displayName;
                if (sidebarUserRole) sidebarUserRole.textContent = displayRole;
                if (sidebarUserAvatar) sidebarUserAvatar.src = displayAvatar;
                if (sidebarProfileCard) sidebarProfileCard.href = `/pages/artist-profile.html?id=${user.id || 101}`;

                // Update Top Header Avatar & Dropdown
                const dropdownUserName = document.getElementById('dropdownUserName');
                const dropdownUserBio = document.getElementById('dropdownUserBio');
                const headerUserAvatar = document.getElementById('headerUserAvatar');

                if (dropdownUserName) dropdownUserName.textContent = displayName;
                if (dropdownUserBio) dropdownUserBio.textContent = displayRole;
                if (headerUserAvatar) headerUserAvatar.src = displayAvatar;
            }
        } catch (err) {
            console.warn('Session check finished with fallback user:', err);
        }
    }

    /**
     * 2. Load Collaboration Details from API
     */
    async function loadCollaborationDetails(id) {
        const skeleton = document.getElementById('loadingSkeleton');
        const mainContent = document.getElementById('collabMainContent');
        const errorCard = document.getElementById('errorStateCard');
        const retryBtn = document.getElementById('retryLoadBtn');

        // Show loading state
        if (skeleton) skeleton.style.display = 'flex';
        if (mainContent) mainContent.style.display = 'none';
        if (errorCard) errorCard.style.display = 'none';

        if (isNaN(id) || id <= 0) {
            showErrorState('Collaboration not found', 'The collaboration ID is invalid or not specified.', false);
            return;
        }

        try {
            let data = null;

            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCollaborationDetails === 'function') {
                data = await window.ArtSphereAPI.getCollaborationDetails(id, currentUserId);
            } else if (window.api && typeof window.api.getCollaborationDetails === 'function') {
                data = await window.api.getCollaborationDetails(id, currentUserId);
            } else {
                const response = await fetch(`/api/collaborations/${id}?userId=${encodeURIComponent(currentUserId)}`);
                const json = await response.json();
                if (!response.ok || !json.success) {
                    throw new Error(json.message || `Collaboration not found with id: ${id}`);
                }
                data = json.data;
            }

            if (data && data.title) {
                currentCollaboration = data;
                renderCollaboration(data);

                // Hide skeleton, show content
                if (skeleton) skeleton.style.display = 'none';
                if (mainContent) mainContent.style.display = 'grid';
            } else {
                showErrorState('Collaboration not found', 'The collaboration may have been removed or is no longer available.', false);
            }

        } catch (err) {
            console.error('Failed to load collaboration details:', err);
            const isNotFound = err.message && (err.message.includes('404') || err.message.toLowerCase().includes('not found'));
            if (isNotFound) {
                showErrorState('Collaboration not found', 'The collaboration may have been removed or is no longer available.', false);
            } else {
                showErrorState('Unable to load this collaboration.', err.message || 'Please check your connection and try again.', true);
            }
        }
    }

    function showErrorState(title, description, canRetry) {
        const skeleton = document.getElementById('loadingSkeleton');
        const mainContent = document.getElementById('collabMainContent');
        const errorCard = document.getElementById('errorStateCard');
        const errorTitle = document.getElementById('errorTitle');
        const errorDesc = document.getElementById('errorDesc');
        const retryBtn = document.getElementById('retryLoadBtn');

        if (skeleton) skeleton.style.display = 'none';
        if (mainContent) mainContent.style.display = 'none';
        if (errorCard) errorCard.style.display = 'block';

        if (errorTitle) errorTitle.textContent = title;
        if (errorDesc) errorDesc.textContent = description;
        if (retryBtn) {
            retryBtn.style.display = canRetry ? 'inline-flex' : 'none';
            retryBtn.onclick = () => loadCollaborationDetails(collabId);
        }
    }

    /**
     * 3. Render Collaboration Data into DOM
     */
    function renderCollaboration(c) {
        if (!c) return;

        // 1. Creator Header Card
        const creatorId = c.creatorId || 101;
        const profileUrl = `/pages/artist-profile.html?id=${creatorId}`;
        const portfolioUrl = `/pages/portfolio.html?id=${creatorId}`;

        const creatorProfileLink = document.getElementById('creatorProfileLink');
        const viewArtistProfileBtn = document.getElementById('viewArtistProfileBtn');
        const creatorAvatar = document.getElementById('creatorAvatar');
        const creatorName = document.getElementById('creatorName');
        const creatorRole = document.getElementById('creatorRole');
        const creatorLocation = document.getElementById('creatorLocation');

        if (creatorProfileLink) creatorProfileLink.href = profileUrl;
        if (viewArtistProfileBtn) viewArtistProfileBtn.href = profileUrl;
        if (creatorAvatar) creatorAvatar.src = c.creatorAvatar || '/images/user_avatar_nav.png';
        if (creatorName) creatorName.textContent = c.creatorName || 'Artist';
        if (creatorRole) creatorRole.textContent = c.creatorArtistType || 'Creative Professional';
        if (creatorLocation) creatorLocation.textContent = c.creatorLocation || c.location || 'Mumbai, MH';

        // 2. Primary Collaboration Card
        const collabTitle = document.getElementById('collabTitle');
        const collabStatusBadge = document.getElementById('collabStatusBadge');
        const collabTimeAgo = document.getElementById('collabTimeAgo');
        const collabIntro = document.getElementById('collabIntro');

        if (collabTitle) collabTitle.textContent = c.title || 'Untitled Collaboration Pitch';
        document.title = `ArtSphere — ${c.title || 'Collaboration Details'}`;

        if (collabStatusBadge) {
            if (c.status === 'CLOSED') {
                collabStatusBadge.textContent = 'CLOSED';
                collabStatusBadge.style.backgroundColor = '#7E7588';
            } else {
                collabStatusBadge.textContent = 'OPEN CALL';
                collabStatusBadge.style.backgroundColor = 'var(--color-plum-badge)';
            }
        }

        if (collabTimeAgo) {
            collabTimeAgo.textContent = c.timeAgo ? `Posted ${c.timeAgo}` : 'Posted recently';
        }

        // Excerpt for pitch intro
        if (collabIntro) {
            if (c.description) {
                // First 1-2 sentences
                const sentences = c.description.split(/(?<=[.?!])\s+/);
                collabIntro.textContent = sentences.slice(0, 2).join(' ');
            } else {
                collabIntro.textContent = 'Explore this multidisciplinary artistic co-creation opportunity.';
            }
        }

        // Ledger quick facts
        const infoPurpose = document.getElementById('infoPurpose');
        const infoType = document.getElementById('infoType');
        const infoTimeline = document.getElementById('infoTimeline');
        const infoTeamNeeded = document.getElementById('infoTeamNeeded');
        const infoLocation = document.getElementById('infoLocation');

        if (infoPurpose) infoPurpose.textContent = c.purpose || 'Work on a Project';
        if (infoType) infoType.textContent = c.collaborationType || 'Creative Project';
        if (infoTimeline) infoTimeline.textContent = c.availability || 'Flexible';
        if (infoTeamNeeded) infoTeamNeeded.textContent = c.peopleNeeded || '1-2 collaborators';
        if (infoLocation) infoLocation.textContent = c.location || 'Mumbai, MH';

        // 3. Project Vision & Narrative
        const collabDescription = document.getElementById('collabDescription');
        if (collabDescription) {
            collabDescription.textContent = c.description || 'No detailed description provided.';
        }

        // 4. Skills & Disciplines Chips
        const skillsChipsRow = document.getElementById('skillsChipsRow');
        if (skillsChipsRow) {
            skillsChipsRow.innerHTML = '';
            const skillsList = Array.isArray(c.skills) ? c.skills : (c.skills ? c.skills.split(',').map(s => s.trim()) : []);
            if (skillsList.length > 0) {
                skillsList.forEach(skill => {
                    if (skill) {
                        const chip = document.createElement('span');
                        chip.className = 'skill-tag-chip';
                        chip.textContent = skill;
                        skillsChipsRow.appendChild(chip);
                    }
                });
            } else {
                const emptyChip = document.createElement('span');
                emptyChip.className = 'skill-tag-chip';
                emptyChip.textContent = 'All Disciplines Welcome';
                skillsChipsRow.appendChild(emptyChip);
            }
        }

        // 5. Reference Moodboard & Visual Notes
        const referenceUrlBox = document.getElementById('referenceUrlBox');
        const referenceUrlText = document.getElementById('referenceUrlText');
        const referenceEmptyState = document.getElementById('referenceEmptyState');

        if (c.referenceUrl && c.referenceUrl.trim()) {
            if (referenceUrlBox) {
                referenceUrlBox.style.display = 'flex';
                referenceUrlBox.href = c.referenceUrl.trim();
            }
            if (referenceUrlText) referenceUrlText.textContent = c.referenceUrl.trim();
            if (referenceEmptyState) referenceEmptyState.style.display = 'none';
        } else {
            if (referenceUrlBox) referenceUrlBox.style.display = 'none';
            if (referenceEmptyState) referenceEmptyState.style.display = 'block';
        }

        // 6. Right Sidebar — Project Lead Card
        const leadStudioTitle = document.getElementById('leadStudioTitle');
        const leadStudioBio = document.getElementById('leadStudioBio');
        const browsePortfolioBtn = document.getElementById('browsePortfolioBtn');

        if (leadStudioTitle) {
            leadStudioTitle.textContent = `${c.creatorName || 'Artist'}'s Studio`;
        }
        if (leadStudioBio) {
            leadStudioBio.textContent = c.creatorBio || 'Independent multidisciplinary creator collaborating on experimental and narrative artistic projects.';
        }
        if (browsePortfolioBtn) {
            browsePortfolioBtn.href = portfolioUrl;
        }

        // Setup Request / Action Buttons State
        setupActionButtons(c);
    }

    /**
     * 4. Setup Request to Collaborate Button State
     */
    function setupActionButtons(c) {
        const requestBtn = document.getElementById('requestCollabBtn');
        if (!requestBtn) return;

        const isOwn = (c.creatorId === currentUserId) || c.ownPost;

        if (isOwn) {
            requestBtn.innerHTML = `
                <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
                <span class="btn-text">Manage Inquiries (${c.requestsCount || 0})</span>
                <span class="arrow">&rarr;</span>
            `;
            requestBtn.disabled = false;
            requestBtn.onclick = () => {
                window.location.href = '/pages/collaboration-requests.html';
            };
        } else if (c.userHasRequested) {
            requestBtn.innerHTML = `
                <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="btn-text">Request Sent (Pending)</span>
            `;
            requestBtn.disabled = true;
            requestBtn.onclick = null;
        } else if (c.status === 'CLOSED') {
            requestBtn.innerHTML = `
                <span class="btn-text">Call Closed</span>
            `;
            requestBtn.disabled = true;
            requestBtn.onclick = null;
        } else {
            requestBtn.innerHTML = `
                <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                <span class="btn-text">Request to Collaborate</span>
                <span class="arrow">&rarr;</span>
            `;
            requestBtn.disabled = false;
            requestBtn.onclick = () => openRequestModal();
        }
    }

    /**
     * 5. Load Related Collaborations
     */
    async function loadRelatedCollaborations(excludeId) {
        const listEl = document.getElementById('relatedCollabsList');
        if (!listEl) return;

        try {
            let collabs = [];
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCollaborations === 'function') {
                collabs = await window.ArtSphereAPI.getCollaborations();
            } else if (window.api && typeof window.api.getCollaborations === 'function') {
                collabs = await window.api.getCollaborations();
            } else {
                const res = await fetch('/api/collaborations');
                if (res.ok) {
                    const json = await res.json();
                    collabs = json.data || [];
                }
            }

            // Filter out current post
            const related = collabs.filter(c => c.id !== excludeId).slice(0, 2);

            if (related.length > 0) {
                listEl.innerHTML = related.map(c => `
                    <a href="/pages/collaboration-details.html?id=${c.id}" class="related-collab-item">
                        <img src="${c.creatorAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(c.title)}" class="related-thumb">
                        <div class="related-meta">
                            <strong class="related-title">${escapeHtml(c.title)}</strong>
                            <span class="related-sub">📍 ${escapeHtml(c.location || 'Mumbai, MH')} &bull; ${escapeHtml(c.timeAgo || 'Recently')}</span>
                        </div>
                    </a>
                `).join('');
            } else {
                listEl.innerHTML = `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">No other open calls at this moment.</span>`;
            }

        } catch (err) {
            console.warn('Could not load related collaborations:', err);
            listEl.innerHTML = `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">No related collaborations found.</span>`;
        }
    }

    /**
     * 6. Modal & Collaboration Request Form Flow
     */
    function initModalControls() {
        const modal = document.getElementById('requestModal');
        const closeBtn = document.getElementById('closeRequestModal');
        const cancelBtn = document.getElementById('cancelRequestBtn');
        const form = document.getElementById('collabRequestForm');
        const msgInput = document.getElementById('requestMessageInput');
        const portfolioInput = document.getElementById('requestPortfolioInput');
        const submitBtn = document.getElementById('submitRequestBtn');

        const successModal = document.getElementById('requestSuccessModal');
        const closeSuccessBtn = document.getElementById('closeSuccessModal');

        window.openRequestModal = () => {
            if (modal) {
                modal.style.display = 'flex';
                if (msgInput) {
                    msgInput.value = '';
                    msgInput.focus();
                }
            }
        };

        const closeModal = () => {
            if (modal) modal.style.display = 'none';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        if (closeSuccessBtn && successModal) {
            closeSuccessBtn.addEventListener('click', () => {
                successModal.style.display = 'none';
            });
        }
        if (successModal) {
            successModal.addEventListener('click', (e) => {
                if (e.target === successModal) successModal.style.display = 'none';
            });
        }

        // Submit Collaboration Request Form
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const message = msgInput ? msgInput.value.trim() : '';
                const portfolioLink = portfolioInput ? portfolioInput.value.trim() : '';

                if (!message) {
                    showToast('Please include a short message with your inquiry.', 'error');
                    if (msgInput) msgInput.focus();
                    return;
                }

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<span>Sending...</span>`;
                }

                const requestPayload = {
                    collaborationId: currentCollaboration ? currentCollaboration.id : collabId,
                    receiverId: currentCollaboration ? currentCollaboration.creatorId : 101,
                    message: message,
                    portfolioLink: portfolioLink
                };

                try {
                    if (window.ArtSphereAPI && typeof window.ArtSphereAPI.sendCollaborationRequest === 'function') {
                        await window.ArtSphereAPI.sendCollaborationRequest(requestPayload.collaborationId, requestPayload, currentUserId);
                    } else if (window.api && typeof window.api.sendCollaborationRequest === 'function') {
                        await window.api.sendCollaborationRequest(requestPayload.collaborationId, requestPayload, currentUserId);
                    } else {
                        const resp = await fetch(`/api/collaborations/${requestPayload.collaborationId}/requests?userId=${encodeURIComponent(currentUserId)}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(requestPayload)
                        });
                        const resJson = await resp.json();
                        if (!resp.ok) {
                            throw new Error(resJson.message || 'Failed to submit request');
                        }
                    }

                    // Success
                    closeModal();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = `<span>Send Inquiry</span> <span class="arrow">&rarr;</span>`;
                    }

                    if (successModal) {
                        successModal.style.display = 'flex';
                    }

                    // Update UI state
                    if (currentCollaboration) {
                        currentCollaboration.userHasRequested = true;
                        setupActionButtons(currentCollaboration);
                    }

                    showToast('Collaboration request sent successfully!', 'success');

                } catch (err) {
                    console.error('Error sending collaboration request:', err);
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = `<span>Send Inquiry</span> <span class="arrow">&rarr;</span>`;
                    }
                    showToast(err.message || 'Failed to send collaboration request. Please try again.', 'error');
                }
            });
        }
    }

    /**
     * 7. Share Button Flow
     */
    function initShareButton() {
        const shareBtn = document.getElementById('shareCollabBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                const url = window.location.href;
                const title = currentCollaboration ? currentCollaboration.title : document.title;

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: title,
                            text: `Check out this creative collaboration pitch on ArtSphere: ${title}`,
                            url: url
                        });
                        showToast('Pitch shared successfully!', 'success');
                        return;
                    } catch (_) {}
                }

                if (navigator.clipboard) {
                    try {
                        await navigator.clipboard.writeText(url);
                        showToast('Pitch link copied to clipboard!', 'success');
                        return;
                    } catch (_) {}
                }

                showToast(`Share URL: ${url}`, 'info');
            });
        }
    }

    /**
     * 8. Navigation & Mobile Drawer
     */
    function initUserDropdown() {
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const userDropdownPanel = document.getElementById('userDropdownPanel');
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');

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

        const handleLogout = async () => {
            if (confirm('Are you sure you want to log out of ArtSphere?')) {
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } catch (_) {}
                sessionStorage.clear();
                localStorage.removeItem('currentUser');
                window.location.href = '/pages/login.html';
            }
        };

        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
        if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);
    }

    function initSidebarControls() {
        const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
        const sidebar = document.getElementById('dashboardSidebar');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');

        if (mobileMenuTrigger && sidebar) {
            mobileMenuTrigger.addEventListener('click', () => {
                sidebar.classList.add('sidebar-open');
                if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
            });
        }

        const closeSidebar = () => {
            if (sidebar) sidebar.classList.remove('sidebar-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        };

        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
        if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);
    }

    /**
     * 9. Toast Notifications
     */
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer') || document.body;
        const toast = document.createElement('div');
        toast.className = `custom-toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 20);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
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
});
