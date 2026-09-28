/**
 * ArtSphere – My Applications Tracker Logic
 * Editorial Neo-brutalism • Dual-Level Filtering & Unified Applicant Tracker
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Mrunali / Aanya)
    let currentCategory = 'ALL';
    let currentStatus = 'ALL';

    // Navigation & Dropdown
    initNavigation();

    // Elements
    const categoryTabs = document.getElementById('categoryTabs');
    const statusPillsGroup = document.getElementById('statusPillsGroup');
    const applicationsContainer = document.getElementById('applicationsContainer');

    const totalAppsPill = document.getElementById('totalAppsPill');
    const statTotal = document.getElementById('statTotal');
    const statPending = document.getElementById('statPending');
    const statAccepted = document.getElementById('statAccepted');
    const statDeclined = document.getElementById('statDeclined');

    // Category Tabs Events
    if (categoryTabs) {
        categoryTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-tab-btn');
            if (!btn) return;

            categoryTabs.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.getAttribute('data-category') || 'ALL';
            loadApplications();
        });
    }

    // Status Pills Events
    if (statusPillsGroup) {
        statusPillsGroup.addEventListener('click', (e) => {
            const chip = e.target.closest('.status-chip');
            if (!chip) return;

            statusPillsGroup.querySelectorAll('.status-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            currentStatus = chip.getAttribute('data-status') || 'ALL';
            loadApplications();
        });
    }

    // Initial Load
    loadSummaryStats();
    loadApplications();

    async function loadSummaryStats() {
        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getMyApplicationsSummary === 'function') {
                const summary = await window.ArtSphereAPI.getMyApplicationsSummary(currentUserId);
                if (summary) {
                    if (statTotal) statTotal.textContent = summary.totalCount || 4;
                    if (statPending) statPending.textContent = summary.pendingCount || 2;
                    if (statAccepted) statAccepted.textContent = summary.acceptedCount || 2;
                    if (statDeclined) statDeclined.textContent = summary.rejectedCount || 0;
                    if (totalAppsPill) totalAppsPill.textContent = `${summary.totalCount || 4} Total Submissions`;
                    return;
                }
            }
        } catch (e) {
            console.warn('API error when loading summary stats:', e);
        }

        // Fallback Stats
        if (statTotal) statTotal.textContent = '4';
        if (statPending) statPending.textContent = '2';
        if (statAccepted) statAccepted.textContent = '2';
        if (statDeclined) statDeclined.textContent = '0';
        if (totalAppsPill) totalAppsPill.textContent = '4 Total Submissions';
    }

    async function loadApplications() {
        if (!applicationsContainer) return;

        applicationsContainer.innerHTML = `
            <div class="loading-state-card">
                <div class="spinner"></div>
                <p>Loading your applications...</p>
            </div>
        `;

        try {
            let items = null;
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getMyApplications === 'function') {
                const results = await window.ArtSphereAPI.getMyApplications(currentUserId, currentCategory, currentStatus);
                if (Array.isArray(results) && results.length > 0) {
                    items = results;
                }
            }

            if (!items || items.length === 0) {
                items = getFallbackApplications(currentCategory, currentStatus);
            }

            renderApplications(items);

        } catch (err) {
            console.warn('API error loading applications, using fallback dataset:', err);
            const fallback = getFallbackApplications(currentCategory, currentStatus);
            renderApplications(fallback);
        }
    }

    function renderApplications(items) {
        if (!items || items.length === 0) {
            applicationsContainer.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-motif">✦</div>
                    <h3 class="empty-state-heading">No Applications Found</h3>
                    <p class="empty-state-desc">You do not have any applications matching the selected category and status filters.</p>
                </div>
            `;
            return;
        }

        applicationsContainer.innerHTML = items.map(item => {
            let typeBadgeClass = 'type-opp';
            let typeBadgeText = 'GRANT APPLICATION';
            let targetUrl = `/pages/opportunity-details.html?id=${item.referenceId || 1}`;

            if (item.type === 'EVENT') {
                typeBadgeClass = 'type-event';
                typeBadgeText = 'WORKSHOP / EVENT PASS';
                targetUrl = `/pages/event-details.html?id=${item.referenceId || 1}`;
            } else if (item.type === 'COLLABORATION') {
                typeBadgeClass = 'type-collab';
                typeBadgeText = 'CO-CREATION PITCH';
                targetUrl = `/pages/collaboration-details.html?id=${item.referenceId || 1}`;
            }

            let statusClass = 'status-pending';
            let statusLabel = 'PENDING REVIEW';
            if (item.status === 'ACCEPTED' || item.status === 'APPROVED' || item.status === 'CONFIRMED') {
                statusClass = 'status-accepted';
                statusLabel = '✓ ACCEPTED &amp; CONFIRMED';
            } else if (item.status === 'REJECTED' || item.status === 'DECLINED') {
                statusClass = 'status-rejected';
                statusLabel = 'DECLINED';
            }

            return `
                <article class="app-tracker-card">
                    <div class="app-header-row">
                        <span class="app-type-badge ${typeBadgeClass}">${typeBadgeText}</span>
                        <span class="app-status-badge ${statusClass}">${statusLabel}</span>
                    </div>

                    <div>
                        <h3 class="app-main-title">
                            <a href="${targetUrl}">${escapeHtml(item.title || 'Untitled Application')}</a>
                        </h3>
                        <div class="app-meta-line">
                            ${escapeHtml(item.organization || item.host || 'ArtSphere Host')} • ${escapeHtml(item.location || 'India')}
                        </div>
                    </div>

                    ${item.notes ? `
                        <div class="app-notes-box">
                            <span class="app-notes-label">Your Submitted Note / Statement:</span>
                            ${escapeHtml(item.notes)}
                        </div>
                    ` : ''}

                    <div class="app-actions-row">
                        <span class="app-date-stamp">Submitted ${escapeHtml(item.appliedDate || item.timeAgo || 'Recently')}</span>
                        <a href="${targetUrl}" class="app-target-link">View Original Listing &rarr;</a>
                    </div>
                </article>
            `;
        }).join('');
    }

    function getFallbackApplications(category, status) {
        const dataset = [
            {
                id: 901,
                referenceId: 1,
                type: 'OPPORTUNITY',
                title: 'Serendipity Arts Residency 2026',
                organization: 'Serendipity Arts Foundation',
                location: 'Panaji, Goa',
                status: 'PENDING',
                appliedDate: 'Yesterday',
                notes: 'Submitted proposal for a 6-week site-specific nocturnal projection installation exploring coastal mythology.'
            },
            {
                id: 902,
                referenceId: 1,
                type: 'EVENT',
                title: 'Modular Synthesis & Analog Signal Flow Workshop',
                organization: 'Kala Ghoda Media Lab',
                location: 'Mumbai, Maharashtra',
                status: 'ACCEPTED',
                appliedDate: '3 days ago',
                notes: 'Registered for Seat #14. Confirmed workshop attendee.'
            },
            {
                id: 903,
                referenceId: 2,
                type: 'COLLABORATION',
                title: 'Seeking Tabla & Sarangi Player for Ambient Fusion EP',
                organization: 'Devansh Roy',
                location: 'Bengaluru / Remote',
                status: 'PENDING',
                appliedDate: '4 days ago',
                notes: "Pitched to provide harmonium and resonant modular drone tracks for tracks 2 and 3."
            },
            {
                id: 904,
                referenceId: 3,
                type: 'COLLABORATION',
                title: 'Contemporary Dancer needed for Site-Specific Architectural Film',
                organization: 'Maya Sen',
                location: 'Ahmedabad, Gujarat',
                status: 'ACCEPTED',
                appliedDate: '1 week ago',
                notes: 'Production kickoff scheduled for November 12th in Ahmedabad.'
            }
        ];

        let filtered = dataset;
        if (category && category !== 'ALL') {
            filtered = filtered.filter(a => a.type === category);
        }
        if (status && status !== 'ALL') {
            filtered = filtered.filter(a => a.status === status);
        }

        return filtered;
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

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
