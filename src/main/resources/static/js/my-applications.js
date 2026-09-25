/**
 * ArtSphere – My Applications Module
 * Source of Truth: Approved page_34.jpg reference
 * Loads and filters applications across Events, Collaborations, and Opportunities
 */

document.addEventListener('DOMContentLoaded', () => {
    initMyApplications();
});

let currentUserId = 101;
let currentCategory = 'ALL';
let currentStatus = 'ALL';
let allApplications = [];
let summaryMetrics = null;

async function initMyApplications() {
    // 1. Read query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paramUserId = urlParams.get('userId');
    if (paramUserId && !isNaN(paramUserId)) {
        currentUserId = parseInt(paramUserId, 10);
    }

    const paramCat = urlParams.get('category');
    if (paramCat) {
        currentCategory = paramCat.toUpperCase();
    }

    const paramStatus = urlParams.get('status');
    if (paramStatus) {
        currentStatus = paramStatus.toUpperCase();
    }

    // 2. Set active tab and status pill in UI based on initial parameters
    syncUIWithFilters();

    // 3. Bind UI interactions
    bindEvents();

    // 4. Fetch initial data from unified backend endpoint
    await loadApplications();
}

function syncUIWithFilters() {
    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        const cat = tab.getAttribute('data-category');
        if (cat === currentCategory) {
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
        } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        }
    });

    // Status pills
    const statusPills = document.querySelectorAll('.status-pill');
    statusPills.forEach(pill => {
        const stat = pill.getAttribute('data-status');
        if (stat === currentStatus) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
}

function bindEvents() {
    // Back button
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

    // Category Tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            currentCategory = tab.getAttribute('data-category');
            renderFilteredList();
        });
    });

    // Status Filter Pills
    const statusPills = document.querySelectorAll('.status-pill');
    statusPills.forEach(pill => {
        pill.addEventListener('click', () => {
            statusPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            currentStatus = pill.getAttribute('data-status');
            renderFilteredList();
        });
    });
}

async function loadApplications() {
    const loadingState = document.getElementById('loadingState');
    const applicationsList = document.getElementById('applicationsList');
    const emptyState = document.getElementById('emptyState');

    if (loadingState) loadingState.style.display = 'flex';
    if (applicationsList) applicationsList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';

    try {
        // Query backend for user applications
        const data = await window.ArtSphereAPI.getMyApplications(currentUserId, 'ALL', 'ALL');
        allApplications = (data && data.applications) ? data.applications : [];
        summaryMetrics = (data && data.summary) ? data.summary : null;

        renderFilteredList();
    } catch (err) {
        console.error('Failed to load applications:', err);
        allApplications = [];
        renderFilteredList();
    } finally {
        if (loadingState) loadingState.style.display = 'none';
    }
}

function renderFilteredList() {
    const applicationsList = document.getElementById('applicationsList');
    const emptyState = document.getElementById('emptyState');

    if (!applicationsList) return;

    // 1. Filter by category
    let categoryFiltered = allApplications;
    if (currentCategory && currentCategory !== 'ALL') {
        const catUpper = currentCategory.toUpperCase();
        if (catUpper.startsWith('EVENT')) {
            categoryFiltered = allApplications.filter(a => a.type === 'EVENT');
        } else if (catUpper.startsWith('COLLAB')) {
            categoryFiltered = allApplications.filter(a => a.type === 'COLLABORATION');
        } else if (catUpper.startsWith('OPP')) {
            categoryFiltered = allApplications.filter(a => a.type === 'OPPORTUNITY');
        }
    }

    // 2. Update status counts based on categoryFiltered
    updateStatusCounts(categoryFiltered);

    // 3. Filter by status
    let finalFiltered = categoryFiltered;
    if (currentStatus && currentStatus !== 'ALL') {
        const statUpper = currentStatus.toUpperCase();
        finalFiltered = categoryFiltered.filter(item => {
            return (item.statusGroup && item.statusGroup.toUpperCase() === statUpper)
                || (item.status && item.status.toUpperCase() === statUpper);
        });
    }

    // 4. Render or show empty state
    if (finalFiltered.length === 0) {
        applicationsList.innerHTML = '';
        applicationsList.style.display = 'none';
        showEmptyState();
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    applicationsList.style.display = 'flex';

    applicationsList.innerHTML = finalFiltered.map(item => createApplicationCardHTML(item)).join('');
}

function updateStatusCounts(items) {
    const countAllEl = document.getElementById('countAll');
    const countUpcomingEl = document.getElementById('countUpcoming');
    const countAcceptedEl = document.getElementById('countAccepted');
    const countPendingEl = document.getElementById('countPending');
    const countRejectedEl = document.getElementById('countRejected');

    let total = items.length;
    let upcoming = 0;
    let accepted = 0;
    let pending = 0;
    let rejected = 0;

    items.forEach(item => {
        const group = (item.statusGroup || '').toUpperCase();
        if (group === 'UPCOMING') upcoming++;
        else if (group === 'ACCEPTED') accepted++;
        else if (group === 'PENDING') pending++;
        else if (group === 'REJECTED') rejected++;
    });

    if (countAllEl) countAllEl.textContent = `(${total})`;
    if (countUpcomingEl) countUpcomingEl.textContent = `(${upcoming})`;
    if (countAcceptedEl) countAcceptedEl.textContent = `(${accepted})`;
    if (countPendingEl) countPendingEl.textContent = `(${pending})`;
    if (countRejectedEl) countRejectedEl.textContent = `(${rejected})`;
}

function createApplicationCardHTML(item) {
    const fallbackThumb = item.type === 'EVENT'
        ? '/images/comm_event_watercolor.png'
        : item.type === 'COLLABORATION'
            ? '/images/opp_dance_performance.png'
            : '/images/opp_campus_art_exhibition.png';

    const thumbSrc = item.imageUrl || fallbackThumb;
    const tag = item.tag || (item.type === 'EVENT' ? 'Workshop' : item.type === 'COLLABORATION' ? 'Collaboration' : 'Opportunity');
    const title = item.title || 'Untitled Application';
    const date = item.date || 'Flexible Date';
    const time = item.time || 'All Day';
    const location = item.location || 'Online / Remote';
    const status = item.status || 'Registered';
    const statusGroup = (item.statusGroup || 'PENDING').toLowerCase();
    const statusClass = getStatusCSSClass(status, statusGroup);
    const statusIcon = getStatusIconSVG(status, statusGroup);
    const statusMessage = item.statusMessage || '';
    const detailUrl = item.detailUrl || '#';

    return `
        <article class="app-card" data-id="${item.id}" data-type="${item.type}">
            <!-- Left Thumbnail -->
            <div class="card-thumb-wrap">
                <img src="${escapeHtml(thumbSrc)}" alt="${escapeHtml(title)}" class="card-thumb-img" onerror="this.src='${fallbackThumb}'">
            </div>

            <!-- Middle Details -->
            <div class="card-details-col">
                <span class="card-tag-pill">${escapeHtml(tag)}</span>
                <h2 class="card-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h2>

                <div class="card-meta-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span class="card-meta-text">${escapeHtml(date)}</span>
                </div>

                <div class="card-meta-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span class="card-meta-text">${escapeHtml(time)}</span>
                </div>

                <div class="card-meta-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span class="card-meta-text">${escapeHtml(location)}</span>
                </div>
            </div>

            <!-- Right Status & Action -->
            <div class="card-action-col">
                <span class="status-badge ${statusClass}">
                    ${statusIcon}
                    <span>${escapeHtml(status)}</span>
                </span>
                ${statusMessage ? `<span class="status-subcaption">${escapeHtml(statusMessage)}</span>` : ''}
                <a href="${escapeHtml(detailUrl)}" class="btn-card-details">
                    <span>View Details</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            </div>
        </article>
    `;
}

function getStatusCSSClass(status, statusGroup) {
    const s = (status || '').toLowerCase();
    if (s.includes('register')) return 'registered';
    if (s.includes('accept') || s.includes('approved')) return 'accepted';
    if (s.includes('shortlist')) return 'shortlisted';
    if (s.includes('review')) return 'under-review';
    if (s.includes('pending')) return 'pending';
    if (s.includes('upcom')) return 'upcoming';
    if (s.includes('reject')) return 'rejected';

    if (statusGroup === 'accepted') return 'accepted';
    if (statusGroup === 'upcoming') return 'upcoming';
    if (statusGroup === 'pending') return 'pending';
    if (statusGroup === 'rejected') return 'rejected';
    return 'pending';
}

function getStatusIconSVG(status, statusGroup) {
    const s = (status || '').toLowerCase();
    if (s.includes('register') || s.includes('accept') || s.includes('approved') || statusGroup === 'accepted') {
        return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }
    if (s.includes('shortlist')) {
        return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
    }
    if (s.includes('review')) {
        return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>`;
    }
    if (s.includes('upcom') || statusGroup === 'upcoming') {
        return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
    }
    if (s.includes('reject') || statusGroup === 'rejected') {
        return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    }
    // Pending clock default
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
}

function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const emptyTitle = document.getElementById('emptyTitle');
    const emptyDesc = document.getElementById('emptyDesc');
    const emptyActionBtn = document.getElementById('emptyActionBtn');

    if (!emptyState) return;
    emptyState.style.display = 'flex';

    if (currentCategory === 'EVENTS') {
        if (emptyTitle) emptyTitle.textContent = 'No event registrations';
        if (emptyDesc) emptyDesc.textContent = 'You haven\'t registered for any workshops, meetups, or live events yet.';
        if (emptyActionBtn) {
            emptyActionBtn.href = '/pages/events.html';
            emptyActionBtn.querySelector('span').textContent = 'Browse Events';
        }
    } else if (currentCategory === 'COLLABORATIONS') {
        if (emptyTitle) emptyTitle.textContent = 'No collaboration requests';
        if (emptyDesc) emptyDesc.textContent = 'You haven\'t sent any collaboration proposals to fellow creators yet.';
        if (emptyActionBtn) {
            emptyActionBtn.href = '/pages/collaborators.html';
            emptyActionBtn.querySelector('span').textContent = 'Find Collaborators';
        }
    } else if (currentCategory === 'OPPORTUNITIES') {
        if (emptyTitle) emptyTitle.textContent = 'No opportunity applications';
        if (emptyDesc) emptyDesc.textContent = 'You haven\'t applied for any auditions, internships, or exhibitions yet.';
        if (emptyActionBtn) {
            emptyActionBtn.href = '/pages/opportunities.html';
            emptyActionBtn.querySelector('span').textContent = 'Explore Opportunities';
        }
    } else {
        if (emptyTitle) emptyTitle.textContent = 'No applications found';
        if (emptyDesc) emptyDesc.textContent = 'You don\'t have any applications under this filter status.';
        if (emptyActionBtn) {
            emptyActionBtn.href = '/pages/discover.html';
            emptyActionBtn.querySelector('span').textContent = 'Explore ArtSphere';
        }
    }
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
