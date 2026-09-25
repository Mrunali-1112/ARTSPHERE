/**
 * ArtSphere – Collaboration Details JavaScript
 * Handles dynamic rendering for both "Collaboration Details" and "Your Collaboration Post" views.
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Aanya / Mrunali)
    const urlParams = new URLSearchParams(window.location.search);
    const collabId = urlParams.get('id') ? parseInt(urlParams.get('id')) : 501;

    const loadingContainer = document.getElementById('loadingContainer');
    const detailsContent = document.getElementById('detailsContent');
    const pageHeaderTitle = document.getElementById('pageHeaderTitle');
    const ownPostBanner = document.getElementById('ownPostBanner');
    const ownRequestsCount = document.getElementById('ownRequestsCount');

    // Creator elements
    const creatorProfileLink = document.getElementById('creatorProfileLink');
    const creatorAvatar = document.getElementById('creatorAvatar');
    const creatorName = document.getElementById('creatorName');
    const creatorRole = document.getElementById('creatorRole');
    const creatorLocationText = document.getElementById('creatorLocationText');
    const viewProfileBtn = document.getElementById('viewProfileBtn');

    // Post details elements
    const collabStatusBadge = document.getElementById('collabStatusBadge');
    const collabTimeAgo = document.getElementById('collabTimeAgo');
    const collabTitle = document.getElementById('collabTitle');
    const overviewPurpose = document.getElementById('overviewPurpose');
    const overviewType = document.getElementById('overviewType');
    const overviewAvailability = document.getElementById('overviewAvailability');
    const overviewPeopleNeeded = document.getElementById('overviewPeopleNeeded');
    const overviewLocation = document.getElementById('overviewLocation');
    const collabDescription = document.getElementById('collabDescription');
    const skillsPillsWrap = document.getElementById('skillsPillsWrap');
    const tagsWrap = document.getElementById('tagsWrap');
    const referenceUrlBlock = document.getElementById('referenceUrlBlock');
    const referenceUrlLink = document.getElementById('referenceUrlLink');
    const bottomActionBar = document.getElementById('bottomActionBar');

    // Modal elements
    const requestModal = document.getElementById('requestModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const detailsCollabRequestForm = document.getElementById('detailsCollabRequestForm');
    const modalCollabTargetInfo = document.getElementById('modalCollabTargetInfo');
    const detailsRequestMessage = document.getElementById('detailsRequestMessage');
    const submitRequestBtn = document.getElementById('submitRequestBtn');
    const toastNotification = document.getElementById('toastNotification');

    let currentCollaboration = null;

    loadCollaborationDetails();

    async function loadCollaborationDetails() {
        try {
            const data = await window.ArtSphereAPI.getCollaborationDetails(collabId, currentUserId);
            currentCollaboration = data;
            renderDetails(data);
        } catch (err) {
            console.error('Failed to load collaboration details:', err);
            loadingContainer.innerHTML = `
                <div class="empty-state">
                    <p>Failed to load collaboration details.</p>
                    <a href="/pages/collaborators.html" style="color:#6C5CE7; font-weight:700; text-decoration:none; margin-top:10px; display:inline-block;">Back to Collaborations</a>
                </div>
            `;
        }
    }

    function renderDetails(c) {
        loadingContainer.style.display = 'none';
        detailsContent.style.display = 'block';

        const isOwn = c.ownPost;

        if (isOwn) {
            pageHeaderTitle.textContent = 'Your Collaboration Post';
            ownPostBanner.style.display = 'flex';
            const count = c.requestsCount || 0;
            ownRequestsCount.textContent = `${count} Request${count !== 1 ? 's' : ''} Received`;
        } else {
            pageHeaderTitle.textContent = 'Collaboration Details';
            ownPostBanner.style.display = 'none';
        }

        // Creator Profile
        creatorAvatar.src = c.creatorAvatar || '/images/avatar_creator_mrunali.png';
        creatorAvatar.alt = c.creatorName || 'Creator';
        creatorName.textContent = c.creatorName || 'Mrunali S.';
        creatorRole.textContent = c.creatorArtistType || 'Digital Artist & Animator';
        creatorLocationText.textContent = c.creatorLocation || c.location || 'Mumbai, Maharashtra';
        
        const profileUrl = `/pages/artist-profile.html?id=${c.creatorId}`;
        creatorProfileLink.href = profileUrl;
        viewProfileBtn.href = profileUrl;

        // Post header
        collabTitle.textContent = c.title;
        collabTimeAgo.textContent = `Posted ${c.timeAgo || 'recently'}`;
        
        if (c.status === 'CLOSED') {
            collabStatusBadge.textContent = 'CLOSED';
            collabStatusBadge.className = 'badge-status-closed';
        } else {
            collabStatusBadge.textContent = 'OPEN';
            collabStatusBadge.className = 'badge-status-open';
        }

        // Overview Facts
        overviewPurpose.textContent = c.purpose || 'Work on a Project';
        overviewType.textContent = c.collaborationType || 'Short Film';
        overviewAvailability.textContent = c.availability || 'Flexible';
        overviewPeopleNeeded.textContent = c.peopleNeeded || '1-2 collaborators';
        overviewLocation.textContent = c.location || 'Mumbai, MH';

        // Description
        collabDescription.textContent = c.description;

        // Skills
        if (c.skills && c.skills.length > 0) {
            skillsPillsWrap.innerHTML = c.skills.map(s => `<span class="skill-pill">${escapeHtml(s)}</span>`).join('');
        } else {
            skillsPillsWrap.innerHTML = '<span class="skill-pill">Open to all creatives</span>';
        }

        // Tags
        if (c.tags && c.tags.length > 0) {
            tagsWrap.innerHTML = c.tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('');
        } else {
            tagsWrap.innerHTML = '<span class="tag-pill">#collaborate</span>';
        }

        // Reference link
        if (c.referenceUrl && c.referenceUrl.trim()) {
            referenceUrlBlock.style.display = 'block';
            referenceUrlLink.href = c.referenceUrl;
        } else {
            referenceUrlBlock.style.display = 'none';
        }

        // Bottom Action Bar
        renderBottomBar(c);
    }

    function renderBottomBar(c) {
        const isOwn = c.ownPost;

        if (isOwn) {
            // Page 18 View
            const count = c.requestsCount || 0;
            const isClosed = c.status === 'CLOSED';

            bottomActionBar.innerHTML = `
                <a href="/pages/collaboration-requests.html" class="btn-bottom-primary">
                    View Requests (${count})
                </a>
                <button type="button" class="btn-bottom-secondary" id="toggleStatusBtn">
                    ${isClosed ? 'Reopen Post' : 'Close Post'}
                </button>
            `;

            const toggleStatusBtn = document.getElementById('toggleStatusBtn');
            if (toggleStatusBtn) {
                toggleStatusBtn.addEventListener('click', async () => {
                    const newStatus = isClosed ? 'OPEN' : 'CLOSED';
                    try {
                        await window.ArtSphereAPI.updateCollaborationStatus(c.id, newStatus, currentUserId);
                        showToast(`Collaboration post marked as ${newStatus}`);
                        loadCollaborationDetails();
                    } catch (err) {
                        console.error(err);
                        alert('Failed to update status.');
                    }
                });
            }

        } else {
            // Page 17 View
            if (c.userHasRequested) {
                bottomActionBar.innerHTML = `
                    <button type="button" class="btn-bottom-disabled" disabled>
                        ✓ Request Sent (Pending)
                    </button>
                `;
            } else if (c.status === 'CLOSED') {
                bottomActionBar.innerHTML = `
                    <button type="button" class="btn-bottom-disabled" disabled>
                        This Collaboration is Closed
                    </button>
                `;
            } else {
                bottomActionBar.innerHTML = `
                    <button type="button" class="btn-bottom-primary" id="openSendRequestBtn">
                        Send Collaboration Request
                    </button>
                `;

                const openSendRequestBtn = document.getElementById('openSendRequestBtn');
                if (openSendRequestBtn) {
                    openSendRequestBtn.addEventListener('click', () => {
                        openRequestModal();
                    });
                }
            }
        }
    }

    // Modal Handlers
    function openRequestModal() {
        if (!requestModal || !currentCollaboration) return;
        modalCollabTargetInfo.innerHTML = `Collaborate with <strong>${escapeHtml(currentCollaboration.creatorName)}</strong> on <strong>${escapeHtml(currentCollaboration.title)}</strong>`;
        detailsRequestMessage.value = '';
        requestModal.style.display = 'flex';
        detailsRequestMessage.focus();
    }

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

    // Submit Request from Details Page
    if (detailsCollabRequestForm) {
        detailsCollabRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = detailsRequestMessage.value.trim();

            if (!message) {
                alert('Please enter a pitch or introduction.');
                return;
            }

            try {
                if (submitRequestBtn) {
                    submitRequestBtn.disabled = true;
                    submitRequestBtn.textContent = 'Sending...';
                }

                await window.ArtSphereAPI.sendCollaborationRequest(collabId, {
                    collaborationId: collabId,
                    receiverId: currentCollaboration.creatorId,
                    message: message
                }, currentUserId);

                closeModal();
                showToast('Collaboration request sent successfully!');
                loadCollaborationDetails();

            } catch (err) {
                console.error(err);
                alert('Failed to send request. Please try again.');
                if (submitRequestBtn) {
                    submitRequestBtn.disabled = false;
                    submitRequestBtn.textContent = 'Send Request';
                }
            }
        });
    }

    // Share button
    const shareBtn = document.getElementById('shareCollabBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!');
            } else {
                alert('Link: ' + window.location.href);
            }
        });
    }

    function showToast(msg) {
        if (!toastNotification) return;
        toastNotification.textContent = msg;
        toastNotification.style.display = 'block';
        setTimeout(() => {
            toastNotification.style.display = 'none';
        }, 3000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
