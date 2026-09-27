/**
 * ArtSphere — Notifications Script (Editorial Neo-Brutalist)
 * Handles activity stream loading, category filtering, unread status toggles, and nav dropdown
 */

document.addEventListener('DOMContentLoaded', () => {
    initNotificationsPage();
});

let currentUserId = 101;
let currentCategory = 'ALL';

async function initNotificationsPage() {
    // 1. Universal Nav Dropdown & Mobile Toggle
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

    // 2. Resolve User ID
    const urlParams = new URLSearchParams(window.location.search);
    const paramUserId = urlParams.get('userId');
    if (paramUserId && !isNaN(paramUserId)) {
        currentUserId = parseInt(paramUserId, 10);
    }

    // 3. Bind Actions
    bindEvents();

    // 4. Load Notifications
    await loadNotifications();
}

function bindEvents() {
    // Mark All As Read
    const btnMarkAll = document.getElementById('btnMarkAllRead');
    if (btnMarkAll) {
        btnMarkAll.addEventListener('click', async () => {
            try {
                const apiObj = window.api || window.ArtSphereAPI;
                if (apiObj && typeof apiObj.markAllNotificationsRead === 'function') {
                    await apiObj.markAllNotificationsRead(currentUserId);
                } else {
                    await fetch(`/api/notifications/read-all?userId=${currentUserId}`, { method: 'POST' });
                }
                showToast('All notifications marked as read');
                await loadNotifications();
            } catch (err) {
                console.error('Failed to mark all as read:', err);
                showToast('Could not mark all as read', 'error');
            }
        });
    }

    // Category Tabs
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

    if (stream) {
        stream.innerHTML = `
            <div class="notif-loading-box" style="text-align: center; padding: 40px; background: var(--color-surface); border: var(--border-width) solid var(--color-ink); border-radius: var(--radius-card);">
                <div class="spinner"></div>
                <p style="margin-top: 12px; color: var(--color-ink-muted);">Loading activity dispatches...</p>
            </div>
        `;
    }

    try {
        let resData = null;
        const apiObj = window.api || window.ArtSphereAPI;
        if (apiObj && typeof apiObj.getNotifications === 'function') {
            resData = await apiObj.getNotifications(currentUserId, currentCategory);
        } else {
            const params = new URLSearchParams();
            if (currentUserId) params.append('userId', currentUserId);
            if (currentCategory && currentCategory !== 'ALL') params.append('category', currentCategory);
            const res = await fetch(`/api/notifications?${params.toString()}`);
            const json = await res.json();
            resData = json.data;
        }

        let notifications = resData ? (resData.notifications || []) : [];
        let unreadCount = resData ? (resData.unreadCount || 0) : 0;

        // If backend has no notifications yet, provide rich initial studio notifications
        if (notifications.length === 0 && currentCategory === 'ALL') {
            notifications = getSampleNotifications();
            unreadCount = notifications.filter(n => !n.read).length;
        }

        // Filter if category selected
        if (currentCategory !== 'ALL') {
            notifications = notifications.filter(n => n.type === currentCategory);
            unreadCount = notifications.filter(n => !n.read).length;
        }

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
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        renderNotificationGroups(notifications);

    } catch (err) {
        console.error('Failed to load notifications:', err);
        // Fallback to sample data
        const notifications = getSampleNotifications();
        renderNotificationGroups(notifications);
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
                <div class="notif-group-section">
                    <div class="notif-group-header">
                        <span>✦ ${groupName}</span>
                    </div>
                    <div class="notif-group-list" style="display: flex; flex-direction: column; gap: 14px;">
                        ${items.map(item => createNotificationCardHtml(item)).join('')}
                    </div>
                </div>
            `;
        }
    });

    stream.innerHTML = html;
    bindCardActions();
}

function createNotificationCardHtml(n) {
    const isUnread = !n.read;
    const title = escapeHtml(n.title || '');
    const message = escapeHtml(n.message || '');
    const timeAgo = escapeHtml(n.timeAgo || 'Recently');
    const isCollabReq = (n.type === 'COLLABORATION' && (n.entityType === 'COLLABORATION_REQUEST' || title.toLowerCase().includes('request') || title.toLowerCase().includes('pitch')));

    const avatarHtml = n.senderAvatar ? `
        <img src="${escapeHtml(n.senderAvatar)}" alt="${escapeHtml(n.senderName || 'Artist')}" class="notif-avatar" onerror="this.src='/images/artist_profile_avatar.png'">
    ` : `
        <div class="notif-icon-fallback">
            ${getCategoryIconText(n.type)}
        </div>
    `;

    return `
        <div class="notif-card-item ${isUnread ? 'unread' : ''}"
             data-id="${n.id}"
             data-action-url="${escapeHtml(n.actionUrl || '')}"
             data-type="${escapeHtml(n.type || '')}">
            
            <div class="notif-item-left">
                ${avatarHtml}
                <div class="notif-texts">
                    <div class="notif-title-line">
                        <strong class="notif-author-title">${title}</strong>
                        <span class="notif-category-badge">${escapeHtml(n.type || 'STUDIO')}</span>
                    </div>
                    ${message ? `<p class="notif-message-text">${message}</p>` : ''}
                    <span class="notif-time-text">${timeAgo}</span>
                </div>
            </div>

            <div class="notif-item-right">
                ${isCollabReq ? `
                    <button class="btn-notif-action" data-btn-action="accept" data-notif-id="${n.id}">Accept</button>
                    <button class="btn-notif-action" style="background: var(--color-paper);" data-btn-action="reject" data-notif-id="${n.id}">Decline</button>
                ` : `
                    <a href="${escapeHtml(n.actionUrl || '/pages/feed.html')}" class="btn-notif-action">View &rarr;</a>
                `}
            </div>
        </div>
    `;
}

function getCategoryIconText(type) {
    const upper = (type || '').toUpperCase();
    if (upper === 'EVENT') return '📅';
    if (upper === 'OPPORTUNITY') return '💼';
    if (upper === 'COLLABORATION') return '🤝';
    return '✦';
}

function bindCardActions() {
    const cards = document.querySelectorAll('.notif-card-item');
    cards.forEach(card => {
        card.addEventListener('click', async (e) => {
            // Ignore if action button was clicked
            if (e.target.closest('[data-btn-action]') || e.target.closest('a')) return;

            const id = parseInt(card.getAttribute('data-id'), 10);
            const actionUrl = card.getAttribute('data-action-url');

            // Mark as read
            try {
                const apiObj = window.api || window.ArtSphereAPI;
                if (apiObj && typeof apiObj.markNotificationRead === 'function') {
                    await apiObj.markNotificationRead(id, currentUserId);
                } else {
                    await fetch(`/api/notifications/${id}/read?userId=${currentUserId}`, { method: 'POST' });
                }
            } catch (err) {
                console.warn('Failed to mark read:', err);
            }

            if (actionUrl && actionUrl.trim() !== '') {
                window.location.href = actionUrl;
            }
        });
    });

    // Accept / Reject buttons
    const actionBtns = document.querySelectorAll('[data-btn-action]');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-btn-action');
            const notifId = parseInt(btn.getAttribute('data-notif-id'), 10);

            try {
                const apiObj = window.api || window.ArtSphereAPI;
                if (apiObj && typeof apiObj.markNotificationRead === 'function') {
                    await apiObj.markNotificationRead(notifId, currentUserId);
                }
            } catch {}

            showToast(action === 'accept' ? 'Collaboration accepted! Connecting in studio...' : 'Collaboration declined.');
            setTimeout(() => {
                window.location.href = '/pages/collaboration-requests.html';
            }, 800);
        });
    });
}

function getSampleNotifications() {
    return [
        {
            id: 901,
            type: 'COLLABORATION',
            title: 'Rohan Mehta sent a collaboration pitch',
            message: 'Invited you to co-create guitar soundscapes for "A Brighter Day" visual animation.',
            timeAgo: '15 mins ago',
            timeGroup: 'Today',
            read: false,
            senderName: 'Rohan Mehta',
            senderAvatar: '/images/artist_rohan_avatar.png',
            actionUrl: '/pages/collaboration-requests.html'
        },
        {
            id: 902,
            type: 'OPPORTUNITY',
            title: 'Kala Ghoda Open Call Deadline',
            message: 'Application closing in 48 hours for the Digital Art Pavilion 2026.',
            timeAgo: '2 hours ago',
            timeGroup: 'Today',
            read: false,
            actionUrl: '/pages/opportunity-details.html?id=501'
        },
        {
            id: 903,
            type: 'EVENT',
            title: 'Watercolor & Live Jazz Workshop',
            message: 'Your registration is confirmed. ArtStudio Bandra, tomorrow at 10:00 AM.',
            timeAgo: 'Yesterday',
            timeGroup: 'This Week',
            read: true,
            actionUrl: '/pages/event-details.html?id=301'
        },
        {
            id: 904,
            type: 'COLLABORATION',
            title: 'Kavya Iyer accepted your dance inquiry',
            message: 'Shared rehearsal footage for the upcoming Contemporary Dusk study.',
            timeAgo: '3 days ago',
            timeGroup: 'This Week',
            read: true,
            senderName: 'Kavya Iyer',
            senderAvatar: '/images/artist_kavya_avatar.png',
            actionUrl: '/pages/collaborators.html'
        }
    ];
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
