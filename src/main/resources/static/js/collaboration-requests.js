/**
 * ArtSphere – Collaboration Requests JavaScript
 * Editorial Neo-brutalism • 3-Tab Request Flow (Received, Sent, Approved)
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Mrunali / Aanya)
    let currentTab = 'received';

    // Navigation & Dropdown
    initNavigation();

    // Elements
    const tabReceived = document.getElementById('tabReceived');
    const tabSent = document.getElementById('tabSent');
    const tabApproved = document.getElementById('tabApproved');
    const badgeReceived = document.getElementById('badgeReceived');
    const badgeSent = document.getElementById('badgeSent');
    const badgeApproved = document.getElementById('badgeApproved');
    const requestsListContainer = document.getElementById('requestsListContainer');

    // Local state stores for robust interactive demo fallback
    let localData = {
        received: [
            {
                id: 801,
                collaborationId: 1,
                collaborationTitle: 'Looking for a Digital Artist for a Short Film Project',
                senderId: 104,
                senderName: 'Kabir Verma',
                senderAvatar: '/images/user_avatar_nav.png',
                senderArtistType: '2D Animator & Character Artist',
                senderLocation: 'Pune, Maharashtra',
                message: "Hey Mrunali! I saw your call for the short film. My style balances traditional charcoal aesthetics with fluid 2D keyframing. I would love to animate 2-3 sequences for this piece. Here's a link to my latest showreel!",
                portfolioLink: 'https://vimeo.com/kabir-animation-reel',
                timeAgo: '4 hours ago',
                status: 'PENDING'
            },
            {
                id: 802,
                collaborationId: 1,
                collaborationTitle: 'Looking for a Digital Artist for a Short Film Project',
                senderId: 105,
                senderName: 'Sanya Mirza',
                senderAvatar: '/images/user_avatar_nav.png',
                senderArtistType: 'Visual Storyteller & Background Painter',
                senderLocation: 'New Delhi, DL',
                message: "Your nocturnal mythology concept sounds magnificent. I specialize in cinematic lighting and layered architectural environments. I have attached my Behance portfolio below.",
                portfolioLink: 'https://behance.net/sanya-backgrounds',
                timeAgo: '1 day ago',
                status: 'PENDING'
            }
        ],
        sent: [
            {
                id: 803,
                collaborationId: 2,
                collaborationTitle: 'Seeking Tabla & Sarangi Player for Ambient Fusion EP',
                receiverId: 102,
                receiverName: 'Devansh Roy',
                receiverAvatar: '/images/user_avatar_nav.png',
                receiverArtistType: 'Sound Designer & Modular Synthesist',
                receiverLocation: 'Bengaluru, Karnataka',
                message: "Hi Devansh! I play classical harmonium and modular filters. I'd love to contribute drone layers and melodic textures to your ambient EP.",
                timeAgo: '2 days ago',
                status: 'PENDING'
            }
        ],
        approved: [
            {
                id: 804,
                collaborationId: 3,
                collaborationTitle: 'Contemporary Dancer needed for Site-Specific Architectural Film',
                partnerId: 103,
                partnerName: 'Maya Sen',
                partnerAvatar: '/images/user_avatar_nav.png',
                partnerArtistType: 'Cinematographer & Architect',
                partnerLocation: 'Ahmedabad, Gujarat',
                message: "Approved! Production starts on November 12th. Let's coordinate moodboards and camera blocking on ArtSphere Studio.",
                timeAgo: 'Approved 3 days ago',
                status: 'APPROVED',
                contactEmail: 'maya.sen@artsphere.design'
            }
        ]
    };

    // Tab switcher
    const tabs = [tabReceived, tabSent, tabApproved];
    tabs.forEach(tab => {
        if (!tab) return;
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                if (t) {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                }
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            currentTab = tab.getAttribute('data-type') || 'received';
            loadRequests();
        });
    });

    // Initial Load
    updateBadges();
    loadRequests();

    async function updateBadges() {
        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCollaborationRequests === 'function') {
                const [r, s, a] = await Promise.all([
                    window.ArtSphereAPI.getCollaborationRequests('received', currentUserId).catch(() => null),
                    window.ArtSphereAPI.getCollaborationRequests('sent', currentUserId).catch(() => null),
                    window.ArtSphereAPI.getCollaborationRequests('approved', currentUserId).catch(() => null)
                ]);

                if (r && Array.isArray(r) && r.length > 0) localData.received = r;
                if (s && Array.isArray(s) && s.length > 0) localData.sent = s;
                if (a && Array.isArray(a) && a.length > 0) localData.approved = a;
            }
        } catch (e) {
            console.warn('API error when updating badges, using local cache:', e);
        }

        if (badgeReceived) badgeReceived.textContent = localData.received.length;
        if (badgeSent) badgeSent.textContent = localData.sent.length;
        if (badgeApproved) badgeApproved.textContent = localData.approved.length;
    }

    async function loadRequests() {
        if (!requestsListContainer) return;

        const items = localData[currentTab] || [];
        renderList(items);
    }

    function renderList(items) {
        if (!items || items.length === 0) {
            let emptyTitle = 'No Received Pitches';
            let emptyDesc = 'You currently have no incoming collaboration pitches. Try publishing a new call or sharing your pitches with fellow artists!';
            let ctaText = '+ Post New Collab Call';
            let ctaHref = '/pages/create-collaboration.html';

            if (currentTab === 'sent') {
                emptyTitle = 'No Sent Inquiries';
                emptyDesc = 'You haven’t applied or pitched to any other open collaboration calls yet.';
                ctaText = 'Explore Collaborations';
                ctaHref = '/pages/collaborators.html';
            } else if (currentTab === 'approved') {
                emptyTitle = 'No Approved Collaborators';
                emptyDesc = 'Approved collaborators will appear here once you accept a pitch or have an application accepted.';
                ctaText = 'Review Inquiries';
                ctaHref = '#';
            }

            requestsListContainer.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-motif">✦</div>
                    <h3 class="empty-state-heading">${emptyTitle}</h3>
                    <p class="empty-state-desc">${emptyDesc}</p>
                    <a href="${ctaHref}" class="btn-pill-primary" style="margin-top: 8px;">
                        <span>${ctaText}</span>
                        <span>&rarr;</span>
                    </a>
                </div>
            `;
            return;
        }

        requestsListContainer.innerHTML = items.map(item => {
            if (currentTab === 'received') return renderReceivedCard(item);
            if (currentTab === 'sent') return renderSentCard(item);
            return renderApprovedCard(item);
        }).join('');

        attachCardEvents();
    }

    function renderReceivedCard(item) {
        const collabLink = `/pages/collaboration-details.html?id=${item.collaborationId || 1}`;
        const profileLink = `/pages/artist-profile.html?id=${item.senderId || 104}`;

        return `
            <article class="inquiry-card" data-id="${item.id}">
                <div class="inquiry-header-row">
                    <div class="sender-identity-wrap">
                        <a href="${profileLink}" class="sender-avatar-link">
                            <img src="${item.senderAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(item.senderName)}" class="sender-avatar-img">
                        </a>
                        <div class="sender-identity-text">
                            <a href="${profileLink}" class="sender-name-link">${escapeHtml(item.senderName)}</a>
                            <span class="sender-meta-line">${escapeHtml(item.senderArtistType || 'Artist')} • ${escapeHtml(item.senderLocation || 'India')}</span>
                        </div>
                    </div>
                    <div class="inquiry-status-col">
                        <span class="pill-tag accent-yellow">NEW PITCH</span>
                        <span class="timestamp-text">${escapeHtml(item.timeAgo || 'Recently')}</span>
                    </div>
                </div>

                <div class="target-project-banner">
                    <span class="target-label">Pitch for Call:</span>
                    <a href="${collabLink}">${escapeHtml(item.collaborationTitle || 'Collaboration Call')}</a>
                </div>

                <div class="inquiry-message-card">
                    ${escapeHtml(item.message)}
                </div>

                ${item.portfolioLink ? `
                    <a href="${escapeHtml(item.portfolioLink)}" target="_blank" rel="noopener noreferrer" class="inquiry-portfolio-link">
                        <span>🔗 View Creator's Work Reel / Portfolio</span>
                        <span>&rarr;</span>
                    </a>
                ` : ''}

                <div class="inquiry-actions-bar">
                    <a href="${profileLink}" class="btn-pill-subtle">
                        <span>View Full Profile</span>
                        <span>&rarr;</span>
                    </a>
                    <div class="inquiry-buttons-group">
                        <button type="button" class="btn-pill-secondary btn-decline" data-id="${item.id}">Decline</button>
                        <button type="button" class="btn-pill-primary btn-accept" data-id="${item.id}">
                            <span>Accept &amp; Connect</span>
                            <span>&rarr;</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    function renderSentCard(item) {
        const collabLink = `/pages/collaboration-details.html?id=${item.collaborationId || 2}`;
        const profileLink = `/pages/artist-profile.html?id=${item.receiverId || 102}`;

        return `
            <article class="inquiry-card" data-id="${item.id}">
                <div class="inquiry-header-row">
                    <div class="sender-identity-wrap">
                        <a href="${profileLink}" class="sender-avatar-link">
                            <img src="${item.receiverAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(item.receiverName)}" class="sender-avatar-img">
                        </a>
                        <div class="sender-identity-text">
                            <a href="${profileLink}" class="sender-name-link">Sent to: ${escapeHtml(item.receiverName)}</a>
                            <span class="sender-meta-line">${escapeHtml(item.receiverArtistType || 'Creator')} • ${escapeHtml(item.receiverLocation || 'India')}</span>
                        </div>
                    </div>
                    <div class="inquiry-status-col">
                        <span class="pill-tag" style="background:#0A0A0A; color:#FFFFFF;">PENDING REVIEW</span>
                        <span class="timestamp-text">${escapeHtml(item.timeAgo || 'Recently')}</span>
                    </div>
                </div>

                <div class="target-project-banner">
                    <span class="target-label">Target Call:</span>
                    <a href="${collabLink}">${escapeHtml(item.collaborationTitle || 'Collaboration Post')}</a>
                </div>

                <div class="inquiry-message-card">
                    ${escapeHtml(item.message)}
                </div>

                <div class="inquiry-actions-bar">
                    <a href="${collabLink}" class="btn-pill-subtle">
                        <span>View Original Pitch Call</span>
                        <span>&rarr;</span>
                    </a>
                    <button type="button" class="btn-pill-secondary btn-withdraw" data-id="${item.id}">Withdraw Application</button>
                </div>
            </article>
        `;
    }

    function renderApprovedCard(item) {
        const collabLink = `/pages/collaboration-details.html?id=${item.collaborationId || 3}`;
        const profileLink = `/pages/artist-profile.html?id=${item.partnerId || 103}`;

        return `
            <article class="inquiry-card" data-id="${item.id}">
                <div class="inquiry-header-row">
                    <div class="sender-identity-wrap">
                        <a href="${profileLink}" class="sender-avatar-link">
                            <img src="${item.partnerAvatar || '/images/user_avatar_nav.png'}" alt="${escapeHtml(item.partnerName)}" class="sender-avatar-img">
                        </a>
                        <div class="sender-identity-text">
                            <a href="${profileLink}" class="sender-name-link">${escapeHtml(item.partnerName)}</a>
                            <span class="sender-meta-line">${escapeHtml(item.partnerArtistType || 'Artist')} • ${escapeHtml(item.partnerLocation || 'India')}</span>
                        </div>
                    </div>
                    <div class="inquiry-status-col">
                        <span class="pill-tag accent-yellow">✓ APPROVED CO-CREATOR</span>
                        <span class="timestamp-text">${escapeHtml(item.timeAgo || 'Recently')}</span>
                    </div>
                </div>

                <div class="target-project-banner">
                    <span class="target-label">Project:</span>
                    <a href="${collabLink}">${escapeHtml(item.collaborationTitle || 'Project Workspace')}</a>
                </div>

                <div class="inquiry-message-card">
                    ${escapeHtml(item.message)}
                </div>

                <div class="inquiry-actions-bar">
                    <a href="${profileLink}" class="btn-pill-subtle">
                        <span>View Artist Profile</span>
                        <span>&rarr;</span>
                    </a>
                    <div class="inquiry-buttons-group">
                        <a href="mailto:${escapeHtml(item.contactEmail || 'artist@artsphere.design')}" class="btn-pill-primary">
                            <span>Open Co-Creation Channel</span>
                            <span>&rarr;</span>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    function attachCardEvents() {
        // Accept button
        document.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const index = localData.received.findIndex(i => i.id === id);
                if (index === -1) return;

                const acceptedItem = localData.received[index];

                try {
                    if (window.ArtSphereAPI && typeof window.ArtSphereAPI.acceptCollaborationRequest === 'function') {
                        await window.ArtSphereAPI.acceptCollaborationRequest(id, currentUserId);
                    }
                } catch (e) {
                    console.warn('API error when accepting, progressing client state:', e);
                }

                // Move from received to approved
                localData.received.splice(index, 1);
                localData.approved.unshift({
                    id: acceptedItem.id,
                    collaborationId: acceptedItem.collaborationId,
                    collaborationTitle: acceptedItem.collaborationTitle,
                    partnerId: acceptedItem.senderId,
                    partnerName: acceptedItem.senderName,
                    partnerAvatar: acceptedItem.senderAvatar,
                    partnerArtistType: acceptedItem.senderArtistType,
                    partnerLocation: acceptedItem.senderLocation,
                    message: "Inquiry accepted! Let's build this together.",
                    timeAgo: 'Just approved',
                    status: 'APPROVED',
                    contactEmail: 'contact@artsphere.design'
                });

                updateBadges();
                showToast(`Accepted pitch from ${acceptedItem.senderName}!`);
                renderList(localData[currentTab]);
            });
        });

        // Decline button
        document.querySelectorAll('.btn-decline').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const index = localData.received.findIndex(i => i.id === id);
                if (index === -1) return;

                const item = localData.received[index];

                try {
                    if (window.ArtSphereAPI && typeof window.ArtSphereAPI.rejectCollaborationRequest === 'function') {
                        await window.ArtSphereAPI.rejectCollaborationRequest(id, currentUserId);
                    }
                } catch (e) {
                    console.warn('API error when declining:', e);
                }

                localData.received.splice(index, 1);
                updateBadges();
                showToast(`Inquiry declined.`);
                renderList(localData[currentTab]);
            });
        });

        // Withdraw button
        document.querySelectorAll('.btn-withdraw').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const index = localData.sent.findIndex(i => i.id === id);
                if (index === -1) return;

                localData.sent.splice(index, 1);
                updateBadges();
                showToast(`Collaboration inquiry withdrawn.`);
                renderList(localData[currentTab]);
            });
        });
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
