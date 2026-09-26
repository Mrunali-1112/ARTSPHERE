/**
 * ArtSphere – Notifications Module JS
 * Source of Truth: Approved page_36.jpg reference
 * Backed by Spring Boot REST API (/api/notifications/**)
 */

document.addEventListener('DOMContentLoaded', () => {
    initNotificationsPage();
});

let currentUserId = 101;
let currentCategory = 'ALL';

async function initNotificationsPage() {
    // 1. Resolve user ID
    const urlParams = new URLSearchParams(window.location.search);
    const paramUserId = urlParams.get('userId');
    if (paramUserId && !isNaN(paramUserId)) {
        currentUserId = parseInt(paramUserId, 10);
    } else {
        const stored = sessionStorage.getItem('currentUserId');
        if (stored && !isNaN(stored)) {
            currentUserId = parseInt(stored, 10);
        }
    }

    // 2. Bind actions
    bindEvents();

    // 3. Load notifications
    await loadNotifications();
}

function bindEvents() {
    // Back navigation
    const btnBack = document.getElementById('btnBack');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/pages/home.html';
            }
        });
    }

    // Mark all as read
    const btnMarkAll = document.getElementById('btnMarkAllRead');
    if (btnMarkAll) {
        btnMarkAll.addEventListener('click', async () => {
            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.markAllNotificationsRead === 'function') {
                    await window.ArtSphereAPI.markAllNotificationsRead(currentUserId);
                } else {
                    await fetch(`/api/notifications/read-all?userId=${currentUserId}`, { method: 'POST' });
                }
                await loadNotifications();
            } catch (err) {
                console.error('Failed to mark all as read:', err);
            }
        });
    }

    // Category tabs
    const tabs = document.querySelectorAll('.category-tab');
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

async function loadNotifications() {
    const stream = document.getElementById('notificationsStream');
    const emptyState = document.getElementById('notificationsEmptyState');
    const unreadPill = document.getElementById('unreadCountPill');
    const bellDot = document.getElementById('headerBellDot');

    try {
        let resData = null;
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getNotifications === 'function') {
            resData = await window.ArtSphereAPI.getNotifications(currentUserId, currentCategory);
        } else {
            const params = new URLSearchParams();
            if (currentUserId) params.append('userId', currentUserId);
            if (currentCategory && currentCategory !== 'ALL') params.append('category', currentCategory);
            const res = await fetch(`/api/notifications?${params.toString()}`);
            const json = await res.json();
            resData = json.data;
        }

        const notifications = resData ? (resData.notifications || []) : [];
        const unreadCount = resData ? (resData.unreadCount || 0) : 0;

        // Update Unread Badges
        if (unreadPill) {
            if (unreadCount > 0) {
                unreadPill.textContent = `${unreadCount} new`;
                unreadPill.style.display = 'inline-block';
            } else {
                unreadPill.style.display = 'none';
            }
        }

        if (bellDot) {
            bellDot.style.display = unreadCount > 0 ? 'block' : 'none';
        }

        if (!notifications || notifications.length === 0) {
            if (stream) stream.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        renderNotificationGroups(notifications);

    } catch (err) {
        console.error('Failed to load notifications:', err);
        if (emptyState) emptyState.style.display = 'flex';
    }
}

function renderNotificationGroups(notifications) {
    const stream = document.getElementById('notificationsStream');
    if (!stream) return;

    // Group notifications into Today, This Week, Earlier
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
                <div class="notification-group-section">
                    <h2 class="notification-group-title">${groupName}</h2>
                    <div class="notification-group-list">
                        ${items.map(item => createNotificationCardHtml(item)).join('')}
                    </div>
                </div>
            `;
        }
    });

    stream.innerHTML = html;
    bindCardActions(notifications);
}

function createNotificationCardHtml(n) {
    const isUnread = !n.read;
    const title = escapeHtml(n.title || '');
    const message = escapeHtml(n.message || '');
    const timeAgo = escapeHtml(n.timeAgo || 'Recently');
    const isCollabReq = (n.type === 'COLLABORATION' && (n.entityType === 'COLLABORATION_REQUEST' || title.toLowerCase().includes('collaboration request')));

    let avatarHtml = '';
    if (n.senderAvatar) {
        avatarHtml = `
            <div class="notif-avatar-col">
                <img src="${escapeHtml(n.senderAvatar)}" alt="${escapeHtml(n.senderName || 'Sender')}" class="notif-avatar-img" onerror="this.src='/images/artist_profile_avatar.png'">
                ${getSubBadgeHtml(n.type)}
            </div>
        `;
    } else {
        const iconType = (n.type || 'general').toLowerCase();
        avatarHtml = `
            <div class="notif-avatar-col">
                <div class="notif-icon-circle ${iconType}">
                    ${getCategoryIconSvg(n.type)}
                </div>
                ${getSubBadgeHtml(n.type)}
            </div>
        `;
    }

    return `
        <div class="notification-card ${isUnread ? 'unread' : ''}"
             data-id="${n.id}"
             data-action-url="${escapeHtml(n.actionUrl || '')}"
             data-type="${escapeHtml(n.type || '')}"
             data-entity-id="${n.entityId || ''}">
            ${avatarHtml}
            <div class="notif-body-col">
                <h3 class="notif-title">${title}</h3>
                ${message ? `<p class="notif-message">${message}</p>` : ''}
                <span class="notif-time">${timeAgo}</span>
            </div>
            <div class="notif-action-col">
                ${isCollabReq ? `
                    <button class="btn-notif-accept" data-btn-action="accept" data-notif-id="${n.id}">Accept</button>
                    <button class="btn-notif-reject" data-btn-action="reject" data-notif-id="${n.id}">Reject</button>
                ` : `
                    ${isUnread ? '<span class="notif-unread-dot" title="Unread"></span>' : ''}
                    <span class="notif-chevron">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </span>
                `}
            </div>
        </div>
    `;
}

function getSubBadgeHtml(type) {
    if (!type) return '';
    const upper = type.toUpperCase();
    if (upper === 'COLLABORATION') {
        return `<span class="notif-sub-badge collab" title="Collaboration"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></span>`;
    } else if (upper === 'PORTFOLIO' || upper === 'ARTWORK') {
        return `<span class="notif-sub-badge heart" title="Liked"><svg width="11" height="11" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span>`;
    } else if (upper === 'EVENT') {
        return `<span class="notif-sub-badge event" title="Event"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg></span>`;
    } else if (upper === 'OPPORTUNITY') {
        return `<span class="notif-sub-badge opportunity" title="Opportunity"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></span>`;
    }
    return '';
}

function getCategoryIconSvg(type) {
    const upper = (type || '').toUpperCase();
    if (upper === 'EVENT') {
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
    } else if (upper === 'OPPORTUNITY') {
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
    } else if (upper === 'COLLABORATION') {
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
    }
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
}

function bindCardActions() {
    const cards = document.querySelectorAll('.notification-card');
    cards.forEach(card => {
        card.addEventListener('click', async (e) => {
            // Ignore if Accept or Reject was clicked
            if (e.target.closest('[data-btn-action]')) return;

            const id = parseInt(card.getAttribute('data-id'), 10);
            const actionUrl = card.getAttribute('data-action-url');

            // 1. Mark as read
            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.markNotificationRead === 'function') {
                    await window.ArtSphereAPI.markNotificationRead(id, currentUserId);
                } else {
                    await fetch(`/api/notifications/${id}/read?userId=${currentUserId}`, { method: 'POST' });
                }
            } catch (err) {
                console.warn('Failed to mark read:', err);
            }

            // 2. Navigate to related page
            if (actionUrl && actionUrl.trim() !== '') {
                window.location.href = actionUrl;
            } else {
                const type = card.getAttribute('data-type');
                if (type === 'COLLABORATION') {
                    window.location.href = '/pages/collaboration-requests.html';
                } else if (type === 'EVENT') {
                    window.location.href = '/pages/events.html';
                } else if (type === 'OPPORTUNITY') {
                    window.location.href = '/pages/opportunities.html';
                } else {
                    window.location.href = '/pages/discover.html';
                }
            }
        });
    });

    // Accept / Reject buttons inside collaboration request card
    const actionBtns = document.querySelectorAll('[data-btn-action]');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-btn-action');
            const notifId = parseInt(btn.getAttribute('data-notif-id'), 10);

            // Mark notification read
            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.markNotificationRead === 'function') {
                    await window.ArtSphereAPI.markNotificationRead(notifId, currentUserId);
                } else {
                    await fetch(`/api/notifications/${notifId}/read?userId=${currentUserId}`, { method: 'POST' });
                }
            } catch {}

            if (action === 'accept') {
                alert('Collaboration request accepted! Redirecting to Collaboration Requests...');
            } else {
                alert('Collaboration request rejected.');
            }
            window.location.href = '/pages/collaboration-requests.html';
        });
    });
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
