/**
   ArtSphere — Notifications Center Script
   Pastel-Purple Creative Community Dashboard
   Real Data, REST API synchronization, filtering, and interactive state
 */

let currentUserId = 101;
let currentCategory = 'ALL';
let channelPreferences = {
    collab: true,
    opencall: true,
    guild: true
};

document.addEventListener('DOMContentLoaded', () => {
    initNotificationsPage();
});

async function initNotificationsPage() {
    // 1. Resolve User ID from URL or Session
    const urlParams = new URLSearchParams(window.location.search);
    const paramUserId = urlParams.get('userId');
    if (paramUserId && !isNaN(paramUserId)) {
        currentUserId = parseInt(paramUserId, 10);
    } else {
        try {
            if (window.api && typeof window.api.getCurrentUser === 'function') {
                const currentUser = await window.api.getCurrentUser();
                if (currentUser && currentUser.id) {
                    currentUserId = currentUser.id;
                    updateUserUI(currentUser);
                }
            }
        } catch (ignored) {}
    }

    // 2. Setup Navigation Controls
    setupNavControls();

    // 3. Setup Filter Tabs
    setupFilterTabs();

    // 4. Setup Channel Toggles
    setupChannelToggles();

    // 5. Setup Action Buttons (Mark all, Retry)
    setupActionButtons();

    // 6. Fetch & Load Live Notifications from Backend
    await loadNotifications();
}

function updateUserUI(user) {
    const avatarEls = [
        document.getElementById('headerUserAvatar'),
        document.getElementById('sidebarUserAvatar')
    ];
    const nameEls = [
        document.getElementById('dropdownUserName'),
        document.getElementById('sidebarUserName')
    ];
    const roleEls = [
        document.getElementById('dropdownUserBio'),
        document.getElementById('sidebarUserRole')
    ];

    const avatarUrl = user.profilePicture || user.avatarUrl || '/images/user_avatar_nav.png';
    const name = user.fullName || user.username || 'Aanya Deshmukh';
    const role = user.artistType || user.bio || 'Visual Artist';

    avatarEls.forEach(el => { if (el) el.src = avatarUrl; });
    nameEls.forEach(el => { if (el) el.textContent = name; });
    roleEls.forEach(el => { if (el) el.textContent = role; });
}

function setupNavControls() {
    // Profile Dropdown
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');

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

    // Mobile Sidebar Toggle
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const dashboardSidebar = document.getElementById('dashboardSidebar');
    if (mobileNavToggle && dashboardSidebar) {
        mobileNavToggle.addEventListener('click', () => {
            dashboardSidebar.classList.toggle('mobile-open');
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    const handleLogout = async () => {
        try {
            if (window.api && typeof window.api.logout === 'function') {
                await window.api.logout();
            } else {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/pages/login.html';
            }
        } catch {
            window.location.href = '/pages/login.html';
        }
    };
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);

    // Search bar filter in real time
    const searchInput = document.getElementById('dashSearchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                filterCurrentCards(searchInput.value.trim().toLowerCase());
            }, 250);
        });
    }
}

function setupFilterTabs() {
    const tabs = document.querySelectorAll('.notif-filter-pill');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            currentCategory = tab.getAttribute('data-category') || 'ALL';
            loadNotifications();
        });
    });
}

function setupChannelToggles() {
    const toggleCollab = document.getElementById('toggleCollabInquiries');
    const toggleOpenCalls = document.getElementById('toggleOpenCalls');
    const toggleGuild = document.getElementById('toggleGuildMessages');

    const updateFilterFromToggles = () => {
        channelPreferences.collab = toggleCollab ? toggleCollab.checked : true;
        channelPreferences.opencall = toggleOpenCalls ? toggleOpenCalls.checked : true;
        channelPreferences.guild = toggleGuild ? toggleGuild.checked : true;
        applyChannelFilters();
    };

    if (toggleCollab) toggleCollab.addEventListener('change', updateFilterFromToggles);
    if (toggleOpenCalls) toggleOpenCalls.addEventListener('change', updateFilterFromToggles);
    if (toggleGuild) toggleGuild.addEventListener('change', updateFilterFromToggles);
}

function applyChannelFilters() {
    const cards = document.querySelectorAll('.notif-card');
    cards.forEach(card => {
        const type = (card.getAttribute('data-type') || '').toUpperCase();
        let visible = true;
        if (!channelPreferences.collab && type === 'COLLABORATION') visible = false;
        if (!channelPreferences.opencall && type === 'OPPORTUNITY') visible = false;
        if (!channelPreferences.guild && (type === 'COMMUNITY' || type === 'EVENT')) visible = false;
        card.style.display = visible ? 'flex' : 'none';
    });

    // Check if any cards visible in each group
    const groups = document.querySelectorAll('.notif-time-group');
    let totalVisible = 0;
    groups.forEach(group => {
        const groupCards = group.querySelectorAll('.notif-card');
        let groupHasVisible = false;
        groupCards.forEach(c => {
            if (c.style.display !== 'none') {
                groupHasVisible = true;
                totalVisible++;
            }
        });
        group.style.display = groupHasVisible ? 'flex' : 'none';
    });

    const emptyState = document.getElementById('notificationsEmptyState');
    if (emptyState) {
        emptyState.style.display = totalVisible === 0 ? 'flex' : 'none';
    }
}

function filterCurrentCards(term) {
    const cards = document.querySelectorAll('.notif-card');
    if (!term) {
        cards.forEach(c => c.style.display = 'flex');
        applyChannelFilters();
        return;
    }

    let visibleCount = 0;
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matches = text.includes(term);
        card.style.display = matches ? 'flex' : 'none';
        if (matches) visibleCount++;
    });

    const emptyState = document.getElementById('notificationsEmptyState');
    if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
    }
}

function setupActionButtons() {
    // Mark All as Read
    const btnMarkAll = document.getElementById('btnMarkAllRead');
    if (btnMarkAll) {
        btnMarkAll.addEventListener('click', async () => {
            try {
                if (window.api && typeof window.api.markAllNotificationsRead === 'function') {
                    await window.api.markAllNotificationsRead(currentUserId);
                } else {
                    const res = await fetch(`/api/notifications/read-all?userId=${currentUserId}`, { method: 'POST' });
                    if (!res.ok) throw new Error('API failed');
                }

                // Update UI immediately
                document.querySelectorAll('.notif-card.unread').forEach(card => {
                    card.classList.remove('unread');
                });
                updateUnreadIndicators(0);
                showToast('All notifications marked as read');
            } catch (err) {
                console.error('Failed to mark all notifications read:', err);
                showToast('Unable to mark all as read. Please try again.', 'error');
            }
        });
    }

    // Retry Button
    const btnRetry = document.getElementById('btnRetryLoad');
    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            loadNotifications();
        });
    }
}

async function loadNotifications() {
    const stream = document.getElementById('notificationsStream');
    const emptyState = document.getElementById('notificationsEmptyState');
    const errorState = document.getElementById('notificationsErrorState');

    if (errorState) errorState.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';

    if (stream) {
        stream.innerHTML = `
            <div class="notif-state-card" id="notifLoadingBox">
                <div class="notif-spinner"></div>
                <p class="notif-state-desc">Loading activity dispatches...</p>
            </div>
        `;
    }

    try {
        let resData = null;
        if (window.api && typeof window.api.getNotifications === 'function') {
            resData = await window.api.getNotifications(currentUserId, currentCategory);
        } else {
            const params = new URLSearchParams();
            if (currentUserId) params.append('userId', currentUserId);
            if (currentCategory && currentCategory !== 'ALL') params.append('category', currentCategory);
            const res = await fetch(`/api/notifications?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to load notifications from server');
            const json = await res.json();
            resData = json.data;
        }

        const notifications = resData ? (resData.notifications || []) : [];
        const unreadCount = resData ? (resData.unreadCount || 0) : 0;

        // Update Unread indicator badge & header dot
        updateUnreadIndicators(unreadCount);

        if (!notifications || notifications.length === 0) {
            if (stream) stream.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        renderNotificationGroups(notifications);
        applyChannelFilters();

    } catch (err) {
        console.error('Failed to load notifications from API:', err);
        if (stream) stream.innerHTML = '';
        if (emptyState) emptyState.style.display = 'none';
        if (errorState) errorState.style.display = 'flex';
    }
}

function updateUnreadIndicators(unreadCount) {
    const bellDot = document.getElementById('headerBellDot');
    if (bellDot) {
        bellDot.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

function renderNotificationGroups(notifications) {
    const stream = document.getElementById('notificationsStream');
    if (!stream) return;

    // Group items into Today, This Week, Earlier
    const groups = {
        'Today': [],
        'This Week': [],
        'Earlier': []
    };

    notifications.forEach(n => {
        const group = n.timeGroup || 'Earlier';
        if (groups[group]) {
            groups[group].push(n);
        } else {
            groups['Earlier'].push(n);
        }
    });

    let html = '';

    ['Today', 'This Week', 'Earlier'].forEach(groupName => {
        const items = groups[groupName];
        if (items && items.length > 0) {
            html += `
                <section class="notif-time-group" data-group-name="${groupName}">
                    <div class="notif-group-heading">
                        <span class="heading-bullet">•</span>
                        <span>${groupName}</span>
                    </div>
                    <div class="notif-cards-list">
                        ${items.map(item => createNotificationCardHtml(item)).join('')}
                    </div>
                </section>
            `;
        }
    });

    stream.innerHTML = html;
    bindCardInteractions();
}

function createNotificationCardHtml(n) {
    const isUnread = !n.read;
    const title = escapeHtml(n.title || '');
    const message = escapeHtml(n.message || '');
    const timeAgo = escapeHtml(n.timeAgo || 'Recently');
    const type = (n.type || 'STUDIO').toUpperCase();
    const badgeClass = getBadgeClass(type);

    const isCollabPending = (type === 'COLLABORATION' && (n.entityType === 'COLLABORATION_REQUEST' || title.toLowerCase().includes('request')));

    const avatarHtml = n.senderAvatar ? `
        <img src="${escapeHtml(n.senderAvatar)}" alt="${escapeHtml(n.senderName || 'Artist')}" class="notif-avatar" onerror="this.src='/images/artist_profile_avatar.png'">
    ` : `
        <div class="notif-avatar-fallback">${getInitialLetter(n.senderName || n.type)}</div>
    `;

    return `
        <article class="notif-card ${isUnread ? 'unread' : ''}"
                 data-id="${n.id}"
                 data-action-url="${escapeHtml(n.actionUrl || '')}"
                 data-type="${escapeHtml(type)}">
            
            <div class="notif-card-main">
                ${avatarHtml}
                <div class="notif-texts">
                    <div class="notif-title-row">
                        <h4 class="notif-title-text">${title}</h4>
                        <span class="notif-badge ${badgeClass}">${escapeHtml(type)}</span>
                    </div>
                    ${message ? `<p class="notif-message-preview">${message}</p>` : ''}
                    <span class="notif-time-text">${timeAgo}</span>
                </div>
            </div>

            <div class="notif-card-actions">
                ${isCollabPending ? `
                    <button type="button" class="btn-card-action btn-card-accept" data-btn-action="accept" data-notif-id="${n.id}" data-entity-id="${n.entityId || ''}">Accept</button>
                    <button type="button" class="btn-card-action btn-card-decline" data-btn-action="decline" data-notif-id="${n.id}" data-entity-id="${n.entityId || ''}">Decline</button>
                ` : `
                    <a href="${escapeHtml(n.actionUrl || '/pages/home.html')}" class="btn-card-action btn-card-view">View &rarr;</a>
                `}
                <button type="button" class="btn-card-dots" aria-label="Notification options" title="More options">⋮</button>
            </div>
        </article>
    `;
}

function getBadgeClass(type) {
    switch (type) {
        case 'COLLABORATION': return 'badge-collaboration';
        case 'PORTFOLIO': return 'badge-portfolio';
        case 'ARTWORK': return 'badge-artwork';
        case 'EVENT': return 'badge-event';
        case 'OPPORTUNITY': return 'badge-opportunity';
        case 'COMMUNITY': return 'badge-community';
        case 'MESSAGE': return 'badge-message';
        case 'SOCIAL': return 'badge-social';
        default: return 'badge-collaboration';
    }
}

function getInitialLetter(name) {
    if (!name) return '✦';
    return name.trim().charAt(0).toUpperCase();
}

function bindCardInteractions() {
    const cards = document.querySelectorAll('.notif-card');

    cards.forEach(card => {
        card.addEventListener('click', async (e) => {
            // Ignore if Accept/Decline action button or dots menu was clicked
            if (e.target.closest('[data-btn-action]') || e.target.closest('.btn-card-dots')) {
                return;
            }

            const id = parseInt(card.getAttribute('data-id'), 10);
            const actionUrl = card.getAttribute('data-action-url');

            // Optimistically update card read state in UI
            card.classList.remove('unread');

            // Call backend mark read
            try {
                if (window.api && typeof window.api.markNotificationRead === 'function') {
                    await window.api.markNotificationRead(id, currentUserId);
                } else {
                    await fetch(`/api/notifications/${id}/read?userId=${currentUserId}`, { method: 'POST' });
                }
            } catch (err) {
                console.warn('Failed to mark notification as read:', err);
            }

            // Navigate to action URL
            if (actionUrl && actionUrl.trim() !== '') {
                window.location.href = actionUrl;
            }
        });
    });

    // Accept / Decline Buttons on Collaboration Requests
    const actionBtns = document.querySelectorAll('[data-btn-action]');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-btn-action');
            const notifId = parseInt(btn.getAttribute('data-notif-id'), 10);
            const entityId = btn.getAttribute('data-entity-id');

            // Mark notification read
            try {
                if (window.api && typeof window.api.markNotificationRead === 'function') {
                    await window.api.markNotificationRead(notifId, currentUserId);
                }
            } catch {}

            // If entityId refers to a collaboration request, respond on the backend
            if (entityId && !isNaN(entityId)) {
                try {
                    const status = action === 'accept' ? 'APPROVED' : 'REJECTED';
                    await fetch(`/api/collaborations/requests/${entityId}/respond?status=${status}&userId=${currentUserId}`, { method: 'POST' });
                } catch (ignored) {}
            }

            showToast(action === 'accept' ? 'Collaboration accepted! Connecting in studio...' : 'Collaboration declined.');
            
            // Remove buttons and replace with status tag or navigate
            const actionsContainer = btn.closest('.notif-card-actions');
            if (actionsContainer) {
                actionsContainer.innerHTML = `
                    <span style="font-size: 0.8rem; font-weight: 700; color: ${action === 'accept' ? '#178358' : '#877E9C'};">
                        ${action === 'accept' ? 'Accepted' : 'Declined'}
                    </span>
                    <a href="/pages/collaborators.html" class="btn-card-action btn-card-view">View &rarr;</a>
                `;
            }

            const card = btn.closest('.notif-card');
            if (card) card.classList.remove('unread');
        });
    });
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
        container.style.cssText = 'position: fixed; bottom: 28px; right: 28px; display: flex; flex-direction: column; gap: 8px; z-index: 9999;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'error' ? '#D32F2F' : '#341D6F'};
        color: #FFFFFF;
        padding: 10px 20px;
        border-radius: 9999px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        font-size: 0.88rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    toast.innerHTML = `<span>✦</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(6px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}
