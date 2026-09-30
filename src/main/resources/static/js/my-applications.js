/**
 * ArtSphere — My Applications & Submissions Dashboard
 * Pastel Purple / Lavender Visual Language & Live Applicant Tracker
 * Directly binds to GET /api/my-applications?userId=...
 */

document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentUserId = 101; // Default demo user
    let applicationsData = [];
    let summaryData = null;

    let currentCategory = 'ALL';
    let currentStatus = 'ALL';
    let searchQuery = '';
    let sortOrder = 'newest';
    let dateFilter = 'all';

    // DOM Elements
    const applicationsContainer = document.getElementById('applicationsFeedContainer');
    const totalSubmissionsBadge = document.getElementById('totalSubmissionsBadge');

    const statTotalApplied = document.getElementById('statTotalApplied');
    const statPending = document.getElementById('statPending');
    const statAccepted = document.getElementById('statAccepted');
    const statDeclined = document.getElementById('statDeclined');

    const badgeCountAll = document.getElementById('badgeCountAll');
    const badgeCountPending = document.getElementById('badgeCountPending');
    const badgeCountAccepted = document.getElementById('badgeCountAccepted');
    const badgeCountDeclined = document.getElementById('badgeCountDeclined');

    const categoryTabsBar = document.getElementById('categoryTabsBar');
    const filterTypeSelect = document.getElementById('filterTypeSelect');
    const statusCheckboxGroup = document.getElementById('statusCheckboxGroup');
    const filterDateSelect = document.getElementById('filterDateSelect');

    const subSearchInput = document.getElementById('subSearchInput');
    const subSortSelect = document.getElementById('subSortSelect');
    const topSearchInput = document.getElementById('topSearchInput');

    // Initialize Page
    initNavigationAndUI();
    initCurrentUserAndLoad();

    /**
     * Resolve the logged-in user and initiate data fetching
     */
    async function initCurrentUserAndLoad() {
        const urlParams = new URLSearchParams(window.location.search);
        const queryUserId = urlParams.get('userId');

        if (queryUserId && !isNaN(parseInt(queryUserId, 10))) {
            currentUserId = parseInt(queryUserId, 10);
        } else {
            try {
                const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && parsed.id) {
                        currentUserId = parsed.id;
                        updateUserIdentity(parsed);
                    }
                }
            } catch (e) {
                console.warn('Could not parse stored user:', e);
            }

            // Try backend session identity
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const json = await res.json();
                    if (json.data && json.data.id) {
                        currentUserId = json.data.id;
                        updateUserIdentity(json.data);
                    }
                }
            } catch (e) {
                // Keep default 101
            }
        }

        // Fetch Real Applications & Summary from Backend
        await fetchApplications();
    }

    /**
     * Update user profile displays in sidebar, top nav, and footer
     */
    function updateUserIdentity(user) {
        if (!user) return;
        const name = user.fullName || user.username || user.name || 'Mrunali';
        const role = user.artistType || user.bio || 'Visual Artist';
        const avatar = user.profilePicture || user.avatarUrl || '/images/user_avatar_nav.png';
        const profileUrl = `/pages/artist-profile.html?id=${user.id || 101}`;

        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserRole = document.getElementById('sidebarUserRole');
        const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
        const sidebarProfileCard = document.getElementById('sidebarProfileCard');

        if (sidebarUserName) sidebarUserName.textContent = name;
        if (sidebarUserRole) sidebarUserRole.textContent = role;
        if (sidebarUserAvatar) sidebarUserAvatar.src = avatar;
        if (sidebarProfileCard) sidebarProfileCard.href = profileUrl;

        const headerUserAvatar = document.getElementById('headerUserAvatar');
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserBio = document.getElementById('dropdownUserBio');
        const dropdownProfileLink = document.getElementById('dropdownProfileLink');
        const footerProfileLink = document.getElementById('footerProfileLink');

        if (headerUserAvatar) headerUserAvatar.src = avatar;
        if (dropdownUserName) dropdownUserName.textContent = name;
        if (dropdownUserBio) dropdownUserBio.textContent = role;
        if (dropdownProfileLink) dropdownProfileLink.href = profileUrl;
        if (footerProfileLink) footerProfileLink.href = profileUrl;
    }

    /**
     * Fetch submissions and stats from Spring Boot API
     */
    async function fetchApplications() {
        showLoadingState();

        try {
            let apiData = null;

            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getMyApplications === 'function') {
                apiData = await window.ArtSphereAPI.getMyApplications(currentUserId);
            } else {
                const response = await fetch(`/api/my-applications?userId=${currentUserId}`);
                if (response.ok) {
                    const result = await response.json();
                    apiData = result.data;
                }
            }

            if (apiData) {
                // API contract returns { summary: {...}, applications: [...] }
                summaryData = apiData.summary || null;
                applicationsData = Array.isArray(apiData.applications)
                    ? apiData.applications
                    : (Array.isArray(apiData) ? apiData : []);
            } else {
                applicationsData = [];
            }

            // Bind real counts to header & statistics cards
            updateSummaryMetrics();

            // Render current view with filters applied
            applyFiltersAndRender();

        } catch (error) {
            console.error('Error fetching applications from backend:', error);
            // Fallback gracefully without breaking UI
            applicationsData = [];
            updateSummaryMetrics();
            applyFiltersAndRender();
        }
    }

    /**
     * Update the real numeric counts in badges, stats cards, and filter checkboxes
     */
    function updateSummaryMetrics() {
        const total = summaryData ? summaryData.totalCount : applicationsData.length;
        const pending = summaryData ? summaryData.pendingCount : applicationsData.filter(a => isPending(a)).length;
        const accepted = summaryData ? summaryData.acceptedCount : applicationsData.filter(a => isAccepted(a)).length;
        const declined = summaryData ? summaryData.rejectedCount : applicationsData.filter(a => isDeclined(a)).length;

        // Header total badge
        if (totalSubmissionsBadge) {
            totalSubmissionsBadge.textContent = `${total} TOTAL SUBMISSIONS`;
        }

        // 4 Pastel Stat Cards
        if (statTotalApplied) statTotalApplied.textContent = total;
        if (statPending) statPending.textContent = pending;
        if (statAccepted) statAccepted.textContent = accepted;
        if (statDeclined) statDeclined.textContent = declined;

        // Filter Sidebar Status Badges
        if (badgeCountAll) badgeCountAll.textContent = total;
        if (badgeCountPending) badgeCountPending.textContent = pending;
        if (badgeCountAccepted) badgeCountAccepted.textContent = accepted;
        if (badgeCountDeclined) badgeCountDeclined.textContent = declined;
    }

    /**
     * Status classification helpers matching backend model
     */
    function isPending(item) {
        const grp = (item.statusGroup || '').toUpperCase();
        const stat = (item.status || '').toUpperCase();
        return grp === 'PENDING' || stat.includes('PENDING') || stat.includes('REVIEW');
    }

    function isAccepted(item) {
        const grp = (item.statusGroup || '').toUpperCase();
        const stat = (item.status || '').toUpperCase();
        return grp === 'ACCEPTED' || stat.includes('ACCEPTED') || stat.includes('SHORTLISTED');
    }

    function isDeclined(item) {
        const grp = (item.statusGroup || '').toUpperCase();
        const stat = (item.status || '').toUpperCase();
        return grp === 'REJECTED' || stat.includes('REJECT') || stat.includes('DECLIN');
    }

    /**
     * Filter & Sort current application dataset
     */
    function applyFiltersAndRender() {
        if (!applicationsContainer) return;

        let filtered = [...applicationsData];

        // 1. Category Filter
        if (currentCategory && currentCategory !== 'ALL') {
            const catUpper = currentCategory.toUpperCase();
            filtered = filtered.filter(item => {
                const itemType = (item.type || '').toUpperCase();
                if (catUpper.startsWith('EVENT')) return itemType === 'EVENT';
                if (catUpper.startsWith('COLLAB')) return itemType === 'COLLABORATION';
                if (catUpper.startsWith('OPP')) return itemType === 'OPPORTUNITY';
                return true;
            });
        }

        // 2. Status Filter
        if (currentStatus && currentStatus !== 'ALL') {
            const statusUpper = currentStatus.toUpperCase();
            if (statusUpper === 'PENDING') {
                filtered = filtered.filter(item => isPending(item));
            } else if (statusUpper === 'ACCEPTED') {
                filtered = filtered.filter(item => isAccepted(item));
            } else if (statusUpper === 'REJECTED' || statusUpper === 'DECLINED') {
                filtered = filtered.filter(item => isDeclined(item));
            }
        }

        // 3. Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(item => {
                const title = (item.title || '').toLowerCase();
                const org = (item.organizer || item.host || '').toLowerCase();
                const loc = (item.location || '').toLowerCase();
                const tag = (item.tag || '').toLowerCase();
                const notes = (item.notes || '').toLowerCase();
                return title.includes(query) || org.includes(query) || loc.includes(query) || tag.includes(query) || notes.includes(query);
            });
        }

        // 4. Date Range Filter
        if (dateFilter && dateFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(item => {
                const dateStr = item.appliedAt || item.date;
                if (!dateStr) return true;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return true; // Keep if unparseable relative date

                const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
                if (dateFilter === '7d') return diffDays <= 7;
                if (dateFilter === '30d') return diffDays <= 30;
                if (dateFilter === 'year') return itemDate.getFullYear() === now.getFullYear();
                return true;
            });
        }

        // 5. Sort Order
        filtered.sort((a, b) => {
            if (sortOrder === 'az') {
                return (a.title || '').localeCompare(b.title || '');
            } else if (sortOrder === 'oldest') {
                return (a.id || 0) - (b.id || 0);
            } else {
                // newest first
                return (b.id || 0) - (a.id || 0);
            }
        });

        // Render Cards
        renderCards(filtered);
    }

    /**
     * Render the cards into the feed container
     */
    function renderCards(items) {
        if (!applicationsContainer) return;

        if (!items || items.length === 0) {
            applicationsContainer.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-motif">✦</div>
                    <h3 class="empty-state-heading">No applications yet</h3>
                    <p class="empty-state-desc">
                        Start exploring opportunities, events, and collaborations to submit your first application.
                    </p>
                    <a href="/pages/opportunities.html" class="btn-empty-action">
                        <span>Explore Opportunities</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                </div>
            `;
            return;
        }

        applicationsContainer.innerHTML = items.map(item => {
            // Category Type Badge
            let typeBadgeClass = 'type-opp';
            let typeBadgeText = 'GRANT APPLICATION';
            let defaultThumb = '/images/opp_content_writer.png';
            let targetDetailUrl = `/pages/opportunity-details.html?id=${item.referenceId || item.id || 1}`;

            const itemType = (item.type || '').toUpperCase();
            if (itemType === 'EVENT') {
                typeBadgeClass = 'type-event';
                typeBadgeText = 'WORKSHOP / EVENT PASS';
                defaultThumb = '/images/comm_event_exhibition.png';
                targetDetailUrl = `/pages/event-details.html?id=${item.referenceId || item.id || 1}`;
            } else if (itemType === 'COLLABORATION') {
                typeBadgeClass = 'type-collab';
                typeBadgeText = 'CO-CREATION PITCH';
                defaultThumb = '/images/artist_rohan_avatar.png';
                targetDetailUrl = `/pages/collaboration-details.html?id=${item.referenceId || item.id || 1}`;
            }

            // If backend already provided detailUrl, use it
            if (item.detailUrl && item.detailUrl.trim()) {
                targetDetailUrl = item.detailUrl;
            }

            // Thumbnail Image
            const thumbUrl = item.imageUrl || defaultThumb;

            // Status Badge
            let statusBadgeHtml = '';
            if (isAccepted(item) || itemType === 'EVENT') {
                statusBadgeHtml = `
                    <span class="app-status-pill status-accepted">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>ACCEPTED &amp; CONFIRMED</span>
                    </span>
                `;
            } else if (isDeclined(item)) {
                statusBadgeHtml = `
                    <span class="app-status-pill status-rejected">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>DECLINED</span>
                    </span>
                `;
            } else {
                // Pending Review
                statusBadgeHtml = `
                    <span class="app-status-pill status-pending">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>PENDING REVIEW</span>
                    </span>
                `;
            }

            // Relative or Display Date
            const dateDisplay = formatRelativeTime(item.appliedAt || item.date);

            // Host and Location
            const hostDisplay = item.organizer || item.host || 'ArtSphere Host';
            const locationDisplay = item.location ? ` • ${item.location}` : '';

            // Statement / Notes Box
            const noteText = item.notes && item.notes.trim()
                ? item.notes.trim()
                : 'Direct application submitted via ArtSphere Applicant Hub.';

            return `
                <article class="app-card-item" data-app-id="${item.id}">
                    <div class="app-card-thumb-wrap">
                        <img src="${escapeHtml(thumbUrl)}" 
                             alt="${escapeHtml(item.title || 'Application Thumbnail')}" 
                             class="app-card-thumbnail"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='${defaultThumb}';">
                    </div>

                    <div class="app-card-body">
                        <div class="app-card-meta-top">
                            <span class="app-type-pill ${typeBadgeClass}">${typeBadgeText}</span>
                            ${statusBadgeHtml}
                        </div>

                        <h3 class="app-card-title">
                            <a href="${escapeHtml(targetDetailUrl)}" title="${escapeHtml(item.title)}">
                                ${escapeHtml(item.title || 'Untitled Application')}
                            </a>
                        </h3>

                        <div class="app-card-meta-line">
                            <span>${escapeHtml(hostDisplay)}${escapeHtml(locationDisplay)}</span>
                        </div>

                        <div class="app-card-date-line">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>Submitted ${escapeHtml(dateDisplay)}</span>
                        </div>

                        <div class="app-statement-box">
                            <div class="app-statement-content">
                                <span class="statement-tagline">YOUR SUBMITTED NOTE / STATEMENT:</span>
                                <p class="statement-text">${escapeHtml(noteText)}</p>
                            </div>
                            <a href="${escapeHtml(targetDetailUrl)}" class="btn-view-details" aria-label="View original listing for ${escapeHtml(item.title)}">
                                <span>View Original Listing &rarr;</span>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    /**
     * Format date nicely as "yesterday", "N days ago", or "29 Sep 2026"
     */
    function formatRelativeTime(dateString) {
        if (!dateString) return 'recently';
        const str = dateString.trim().toLowerCase();
        if (str.includes('yesterday') || str.includes('ago') || str.includes('today')) {
            return dateString;
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
        if (diffDays >= 7 && diffDays < 14) return '1 week ago';
        if (diffDays >= 14 && diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

        return dateString;
    }

    /**
     * Show loading spinner
     */
    function showLoadingState() {
        if (!applicationsContainer) return;
        applicationsContainer.innerHTML = `
            <div class="loading-state-card">
                <div class="dashboard-spinner"></div>
                <p>Loading your applications &amp; submissions...</p>
            </div>
        `;
    }

    /**
     * Initialize navigation events and filter listeners
     */
    function initNavigationAndUI() {
        // 1. Category Tabs Bar
        if (categoryTabsBar) {
            categoryTabsBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.tab-pill-btn');
                if (!btn) return;

                categoryTabsBar.querySelectorAll('.tab-pill-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                currentCategory = btn.getAttribute('data-category') || 'ALL';

                // Synchronize right filter panel dropdown
                if (filterTypeSelect) {
                    filterTypeSelect.value = currentCategory;
                }

                applyFiltersAndRender();
            });
        }

        // 2. Submission Type Dropdown Sync
        if (filterTypeSelect) {
            filterTypeSelect.addEventListener('change', () => {
                currentCategory = filterTypeSelect.value;

                if (categoryTabsBar) {
                    categoryTabsBar.querySelectorAll('.tab-pill-btn').forEach(btn => {
                        const match = btn.getAttribute('data-category') === currentCategory;
                        btn.classList.toggle('active', match);
                        btn.setAttribute('aria-selected', match ? 'true' : 'false');
                    });
                }

                applyFiltersAndRender();
            });
        }

        // 3. Status Radio List
        if (statusCheckboxGroup) {
            statusCheckboxGroup.addEventListener('change', (e) => {
                const radio = e.target.closest('input[name="statusFilter"]');
                if (!radio) return;
                currentStatus = radio.value;
                applyFiltersAndRender();
            });
        }

        // 4. Date Range Filter
        if (filterDateSelect) {
            filterDateSelect.addEventListener('change', () => {
                dateFilter = filterDateSelect.value;
                applyFiltersAndRender();
            });
        }

        // 5. Search Input Filter
        if (subSearchInput) {
            subSearchInput.addEventListener('input', () => {
                searchQuery = subSearchInput.value;
                applyFiltersAndRender();
            });
        }

        // 6. Sort Select Filter
        if (subSortSelect) {
            subSortSelect.addEventListener('change', () => {
                sortOrder = subSortSelect.value;
                applyFiltersAndRender();
            });
        }

        // 7. Top Search Bar: Search redirect or local filter
        if (topSearchInput) {
            topSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const q = topSearchInput.value.trim();
                    if (q) {
                        window.location.href = `/pages/discover.html?q=${encodeURIComponent(q)}`;
                    }
                }
            });
        }

        // 8. User Dropdown in Top Bar
        const topAvatarBtn = document.getElementById('topAvatarBtn');
        const userDropdownPanel = document.getElementById('userDropdownPanel');
        if (topAvatarBtn && userDropdownPanel) {
            topAvatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdownPanel.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!userDropdownPanel.contains(e.target) && !topAvatarBtn.contains(e.target)) {
                    userDropdownPanel.classList.remove('show');
                }
            });
        }

        // 9. Mobile Sidebar Drawer
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const dashboardSidebar = document.getElementById('dashboardSidebar');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');

        function toggleSidebar(open) {
            if (!dashboardSidebar) return;
            if (open) {
                dashboardSidebar.classList.add('drawer-open');
                if (sidebarBackdrop) sidebarBackdrop.classList.add('show');
            } else {
                dashboardSidebar.classList.remove('drawer-open');
                if (sidebarBackdrop) sidebarBackdrop.classList.remove('show');
            }
        }

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => toggleSidebar(true));
        }
        if (sidebarCloseBtn) {
            sidebarCloseBtn.addEventListener('click', () => toggleSidebar(false));
        }
        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));
        }

        // 10. Logout Action Handlers
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');

        function handleLogout() {
            if (confirm('Are you sure you want to log out of ArtSphere?')) {
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('currentUser');
                window.location.href = '/pages/login.html';
            }
        }

        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
        if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);
    }

    /**
     * Escape HTML string for safe rendering
     */
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
