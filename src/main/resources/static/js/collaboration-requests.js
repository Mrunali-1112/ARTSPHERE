/**
 * ArtSphere – Collaboration Requests JavaScript
 * Manages the 3 tabs on ONE page: Received, Sent, and Approved requests.
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Aanya / Mrunali)
    let currentTab = 'received';

    const tabReceived = document.getElementById('tabReceived');
    const tabSent = document.getElementById('tabSent');
    const tabApproved = document.getElementById('tabApproved');
    const badgeReceived = document.getElementById('badgeReceived');
    const badgeSent = document.getElementById('badgeSent');
    const badgeApproved = document.getElementById('badgeApproved');
    const requestsListContainer = document.getElementById('requestsListContainer');
    const toastNotification = document.getElementById('toastNotification');

    // Tab click handlers
    [tabReceived, tabSent, tabApproved].forEach(tab => {
        if (!tab) return;
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.getAttribute('data-type') || 'received';
            loadRequests();
        });
    });

    // Initial load
    updateAllTabBadges();
    loadRequests();

    async function updateAllTabBadges() {
        try {
            const [received, sent, approved] = await Promise.all([
                window.ArtSphereAPI.getCollaborationRequests('received', currentUserId),
                window.ArtSphereAPI.getCollaborationRequests('sent', currentUserId),
                window.ArtSphereAPI.getCollaborationRequests('approved', currentUserId)
            ]);

            if (badgeReceived) badgeReceived.textContent = received.length;
            if (badgeSent) badgeSent.textContent = sent.length;
            if (badgeApproved) badgeApproved.textContent = approved.length;
        } catch (err) {
            console.error('Failed to update badges:', err);
        }
    }

    async function loadRequests() {
        if (!requestsListContainer) return;

        requestsListContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading ${currentTab} requests...</p>
            </div>
        `;

        try {
            const requests = await window.ArtSphereAPI.getCollaborationRequests(currentTab, currentUserId);
            renderRequests(requests);
        } catch (err) {
            console.error(`Failed to load ${currentTab} requests:`, err);
            requestsListContainer.innerHTML = `
                <div class="empty-state">
                    <p>Failed to load requests. Please try again.</p>
                </div>
            `;
        }
    }

    function renderRequests(items) {
        if (!items || items.length === 0) {
            let emptyMsg = 'No collaboration requests received yet.';
            if (currentTab === 'sent') emptyMsg = 'You have not sent any collaboration requests.';
            if (currentTab === 'approved') emptyMsg = 'No approved collaborations yet.';

            requestsListContainer.innerHTML = `
                <div class="empty-state">
                    <p>${emptyMsg}</p>
                </div>
            `;
            return;
        }

        requestsListContainer.innerHTML = items.map(item => {
            if (currentTab === 'received') {
                return renderReceivedCard(item);
            } else if (currentTab === 'sent') {
                return renderSentCard(item);
            } else {
                return renderApprovedCard(item);
            }
        }).join('');
    }

    function renderReceivedCard(item) {
        const collabContext = item.collaborationTitle ? `
            <div class="project-context-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span class="project-context-title">For: ${escapeHtml(item.collaborationTitle)}</span>
            </div>
        ` : '';

        return `
            <article class="request-card" data-request-id="${item.id}">
                <div class="request-header">
                    <a href="/pages/artist-profile.html?id=${item.senderId}" class="user-snippet">
                        <img src="${item.senderAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(item.senderName)}" class="user-avatar">
                        <div class="user-info">
                            <h3 class="user-name">${escapeHtml(item.senderName)}</h3>
                            <div class="user-meta">${escapeHtml(item.senderArtistType || 'Artist')} • ${escapeHtml(item.senderLocation || 'Mumbai, MH')}</div>
                        </div>
                    </a>
                    <span class="request-time">${escapeHtml(item.timeAgo || 'Recently')}</span>
                </div>

                ${collabContext}

                <div class="request-message-box">
                    "${escapeHtml(item.message)}"
                </div>

                <div class="request-actions-row">
                    <a href="/pages/artist-profile.html?id=${item.senderId}" class="btn-profile-link">View Profile</a>
                    <button type="button" class="btn-action-decline" onclick="handleDeclineRequest(${item.id})">Decline</button>
                    <button type="button" class="btn-action-accept" onclick="handleAcceptRequest(${item.id})">Accept</button>
                </div>
            </article>
        `;
    }

    function renderSentCard(item) {
        const collabContext = item.collaborationTitle ? `
            <div class="project-context-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span class="project-context-title">For: ${escapeHtml(item.collaborationTitle)}</span>
            </div>
        ` : '';

        return `
            <article class="request-card" data-request-id="${item.id}">
                <div class="request-header">
                    <a href="/pages/artist-profile.html?id=${item.receiverId}" class="user-snippet">
                        <img src="${item.receiverAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(item.receiverName)}" class="user-avatar">
                        <div class="user-info">
                            <h3 class="user-name">${escapeHtml(item.receiverName)}</h3>
                            <div class="user-meta">${escapeHtml(item.receiverArtistType || 'Artist')} • ${escapeHtml(item.receiverLocation || 'Mumbai, MH')}</div>
                        </div>
                    </a>
                    <span class="status-badge-pending">PENDING</span>
                </div>

                ${collabContext}

                <div class="request-message-box">
                    "${escapeHtml(item.message)}"
                </div>

                <div class="request-actions-row">
                    <a href="/pages/artist-profile.html?id=${item.receiverId}" class="btn-profile-link">View Profile</a>
                    <span class="request-time">Sent ${escapeHtml(item.timeAgo || 'recently')}</span>
                </div>
            </article>
        `;
    }

    function renderApprovedCard(item) {
        const partnerName = item.senderId === currentUserId ? item.receiverName : item.senderName;
        const partnerAvatar = item.senderId === currentUserId ? item.receiverAvatar : item.senderAvatar;
        const partnerRole = item.senderId === currentUserId ? item.receiverArtistType : item.senderArtistType;
        const partnerLocation = item.senderId === currentUserId ? item.receiverLocation : item.senderLocation;
        const partnerId = item.senderId === currentUserId ? item.receiverId : item.senderId;

        const collabContext = item.collaborationTitle ? `
            <div class="project-context-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span class="project-context-title">Collaboration: ${escapeHtml(item.collaborationTitle)}</span>
            </div>
        ` : '';

        return `
            <article class="request-card" data-request-id="${item.id}">
                <div class="request-header">
                    <a href="/pages/artist-profile.html?id=${partnerId}" class="user-snippet">
                        <img src="${partnerAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(partnerName)}" class="user-avatar">
                        <div class="user-info">
                            <h3 class="user-name">${escapeHtml(partnerName)}</h3>
                            <div class="user-meta">${escapeHtml(partnerRole || 'Artist')} • ${escapeHtml(partnerLocation || 'Mumbai, MH')}</div>
                        </div>
                    </a>
                    <span class="status-badge-approved">APPROVED</span>
                </div>

                ${collabContext}

                <div class="request-message-box">
                    "${escapeHtml(item.message)}"
                </div>

                <div class="request-actions-row">
                    <a href="/pages/artist-profile.html?id=${partnerId}" class="btn-profile-link">View Profile</a>
                    <a href="/pages/artist-profile.html?id=${partnerId}" class="btn-action-accept" style="text-decoration:none;">Message</a>
                </div>
            </article>
        `;
    }

    // Global action handlers
    window.handleAcceptRequest = async function(requestId) {
        try {
            await window.ArtSphereAPI.acceptCollaborationRequest(requestId, currentUserId);
            showToast('Collaboration request accepted! Partner added.');
            updateAllTabBadges();
            loadRequests();
        } catch (err) {
            console.error('Failed to accept request:', err);
            alert('Failed to accept request.');
        }
    };

    window.handleDeclineRequest = async function(requestId) {
        if (!confirm('Are you sure you want to decline this collaboration request?')) return;
        try {
            await window.ArtSphereAPI.rejectCollaborationRequest(requestId, currentUserId);
            showToast('Request declined.');
            updateAllTabBadges();
            loadRequests();
        } catch (err) {
            console.error('Failed to decline request:', err);
            alert('Failed to decline request.');
        }
    };

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
