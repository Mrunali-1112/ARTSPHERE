/**
 * ArtSphere – Opportunity Details Page Logic
 * Source of Truth: Approved page_14.jpg UI Reference
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get opportunity ID from URL (e.g. ?id=101)
    const urlParams = new URLSearchParams(window.location.search);
    const oppId = urlParams.get('id') || '101';

    // DOM Elements
    const contentContainer = document.getElementById('detailsContentContainer');
    const userMenuWrapper = document.getElementById('userMenuWrapper');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    // Modal elements
    const applyModalBackdrop = document.getElementById('applyModalBackdrop');
    const modalOrganizerName = document.getElementById('modalOrganizerName');
    const modalOppTitle = document.getElementById('modalOppTitle');
    const applyNotesInput = document.getElementById('applyNotesInput');
    const cancelApplyBtn = document.getElementById('cancelApplyBtn');
    const closeApplyModalBtn = document.getElementById('closeApplyModalBtn');
    const confirmApplyBtn = document.getElementById('confirmApplyBtn');

    let currentOpportunity = null;
    let currentUser = null;

    // Initialize user and menu
    initUserMenu();

    try {
        currentUser = await ArtSphereAPI.getCurrentUser();
    } catch (e) {
        currentUser = null;
    }

    const currentUserId = currentUser ? currentUser.id : 101; // Fallback demo user ID

    // Load Opportunity Data
    await loadOpportunityDetails(oppId, currentUserId);

    // -------------------------------------------------------------
    // Fetch and Render Opportunity Details
    // -------------------------------------------------------------
    async function loadOpportunityDetails(id, userId) {
        try {
            const opp = await ArtSphereAPI.getOpportunityDetails(id, userId);
            currentOpportunity = opp;
            renderDetails(opp);
        } catch (error) {
            console.error('Failed to load opportunity details:', error);
            contentContainer.innerHTML = `
                <div style="background: #FFFFFF; border-radius: 20px; padding: 40px 20px; text-align: center; border: 1px dashed var(--opp-border);">
                    <h3 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #1C102C; margin-bottom: 8px;">Opportunity Not Found</h3>
                    <p style="color: #716B84; font-size: 0.92rem; margin-bottom: 20px;">The requested opportunity may have been removed or does not exist.</p>
                    <a href="/pages/opportunities.html" style="display: inline-block; background: #6C47FF; color: #FFFFFF; padding: 10px 22px; border-radius: 20px; text-decoration: none; font-weight: 600; font-size: 0.88rem;">&larr; Back to Opportunities</a>
                </div>
            `;
        }
    }

    function renderDetails(opp) {
        const categoryBadge = (opp.category || 'EXHIBITION').toUpperCase();
        const duration = opp.duration || '1 Day';
        const typeLabel = opp.category || 'Exhibition';
        const organizerType = opp.organizerType || 'Organization';
        const organizerAvatar = opp.organizerAvatar || '/images/organizer_mgm.png';

        // What you get cards
        let whatYouGetHtml = '';
        if (opp.whatYouGet && opp.whatYouGet.length > 0) {
            whatYouGetHtml = opp.whatYouGet.map((item, idx) => {
                let iconSvg = '';
                if (idx === 0) {
                    // Star icon
                    iconSvg = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    `;
                } else if (idx === 1) {
                    // Networking icon
                    iconSvg = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    `;
                } else {
                    // Certificate / ribbon icon
                    iconSvg = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="8" r="7"></circle>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                        </svg>
                    `;
                }
                return `
                    <div class="get-card-item">
                        <span class="get-card-icon">${iconSvg}</span>
                        <span>${escapeHtml(item)}</span>
                    </div>
                `;
            }).join('');
        } else {
            whatYouGetHtml = `
                <div class="get-card-item">
                    <span class="get-card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </span>
                    <span>Platform to showcase your work</span>
                </div>
            `;
        }

        // Who can apply pills
        let whoCanApplyHtml = '';
        if (opp.whoCanApply && opp.whoCanApply.length > 0) {
            whoCanApplyHtml = opp.whoCanApply.map(item => `
                <span class="apply-tag-pill">${escapeHtml(item)}</span>
            `).join('');
        }

        // Quote section
        const quoteText = opp.quoteText || "Art connects people. Let's create a brighter campus together.";
        const quoteAuthor = opp.quoteAuthor || (opp.organizer ? opp.organizer.toUpperCase() : "ARTSPHERE");

        const isApplied = opp.hasApplied;

        contentContainer.innerHTML = `
            <!-- 1. Hero Banner Card -->
            <div class="opp-banner-card">
                <img src="${opp.imageUrl}" alt="${escapeHtml(opp.title)}" class="opp-banner-img" onerror="this.src='/images/opp_campus_art_exhibition.png'">
                <span class="opp-banner-badge">${categoryBadge}</span>

                <button class="opp-banner-bookmark-btn ${opp.bookmarked ? 'active' : ''}" id="bannerBookmarkBtn" aria-label="Bookmark Opportunity">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${opp.bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>

                <div class="opp-banner-overlay">
                    <h2 class="opp-banner-title">${escapeHtml(opp.title)}</h2>
                    <p class="opp-banner-subtitle">${escapeHtml(opp.subtitle || '')}</p>
                </div>
            </div>

            <!-- 2. Organizer & Apply Row -->
            <div class="opp-organizer-row">
                <div class="organizer-info-group">
                    <img src="${organizerAvatar}" alt="${escapeHtml(opp.organizer)}" class="organizer-avatar-img" onerror="this.src='/images/organizer_mgm.png'">
                    <div class="organizer-text-wrapper">
                        <div class="organizer-title">${escapeHtml(opp.organizer)}</div>
                        <div class="organizer-type-label">${escapeHtml(organizerType)}</div>
                    </div>
                </div>

                <button class="btn-apply-now ${isApplied ? 'applied' : ''}" id="applyNowBtn" ${isApplied ? 'disabled' : ''}>
                    <span>${isApplied ? 'Applied ✓' : 'Apply Now &rarr;'}</span>
                </button>
            </div>

            <!-- 3. Key Details 4-Column Bar -->
            <div class="opp-key-details-bar">
                <div class="key-detail-col">
                    <span class="detail-col-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </span>
                    <div class="detail-col-text">
                        <span class="detail-label">Deadline</span>
                        <span class="detail-val">${escapeHtml(opp.deadline)}</span>
                    </div>
                </div>

                <div class="key-detail-col">
                    <span class="detail-col-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </span>
                    <div class="detail-col-text">
                        <span class="detail-label">Location</span>
                        <span class="detail-val">${escapeHtml(opp.location)}</span>
                    </div>
                </div>

                <div class="key-detail-col">
                    <span class="detail-col-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </span>
                    <div class="detail-col-text">
                        <span class="detail-label">Type</span>
                        <span class="detail-val">${escapeHtml(typeLabel)}</span>
                    </div>
                </div>

                <div class="key-detail-col">
                    <span class="detail-col-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </span>
                    <div class="detail-col-text">
                        <span class="detail-label">Duration</span>
                        <span class="detail-val">${escapeHtml(duration)}</span>
                    </div>
                </div>
            </div>

            <!-- 4. About the Opportunity -->
            <div class="detail-section-block">
                <h3 class="detail-section-heading">About the Opportunity</h3>
                <p class="detail-paragraph">${escapeHtml(opp.description || '')}</p>
            </div>

            <!-- 5. Who Can Apply? -->
            <div class="detail-section-block">
                <h3 class="detail-section-heading">Who Can Apply?</h3>
                <div class="who-can-apply-tags">
                    ${whoCanApplyHtml}
                </div>
            </div>

            <!-- 6. What You'll Get -->
            <div class="detail-section-block">
                <h3 class="detail-section-heading">What You’ll Get</h3>
                <div class="what-you-get-grid">
                    ${whatYouGetHtml}
                </div>
            </div>

            <!-- 7. Quote / Vision Card -->
            <div class="opp-quote-card">
                <img src="/images/opp_quote_brush.png" alt="Artistic Brushstrokes" class="quote-brush-img" onerror="this.style.display='none'">
                <div class="quote-text-container">
                    <div class="quote-phrase">“${escapeHtml(quoteText)}”</div>
                    <span class="quote-attribution">— ${escapeHtml(quoteAuthor)}</span>
                </div>
            </div>
        `;

        setupInteractions(opp, currentUserId);
    }

    // -------------------------------------------------------------
    // Setup Button Clicks and Apply Flow
    // -------------------------------------------------------------
    function setupInteractions(opp, userId) {
        const applyBtn = document.getElementById('applyNowBtn');
        const bookmarkBtn = document.getElementById('bannerBookmarkBtn');

        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', () => {
                bookmarkBtn.classList.toggle('active');
                const svg = bookmarkBtn.querySelector('svg');
                if (bookmarkBtn.classList.contains('active')) {
                    svg.setAttribute('fill', '#FFD166');
                    svg.setAttribute('stroke', '#FFD166');
                } else {
                    svg.setAttribute('fill', 'none');
                    svg.setAttribute('stroke', 'currentColor');
                }
            });
        }

        if (applyBtn && !applyBtn.disabled) {
            applyBtn.addEventListener('click', () => {
                openApplyModal(opp);
            });
        }
    }

    // -------------------------------------------------------------
    // Apply Modal Operations
    // -------------------------------------------------------------
    function openApplyModal(opp) {
        if (!opp) return;
        modalOrganizerName.textContent = opp.organizer || 'Organization';
        modalOppTitle.textContent = opp.title || 'Opportunity';
        applyNotesInput.value = '';
        applyModalBackdrop.classList.add('show');
    }

    function closeApplyModal() {
        applyModalBackdrop.classList.remove('show');
    }

    if (cancelApplyBtn) cancelApplyBtn.addEventListener('click', closeApplyModal);
    if (closeApplyModalBtn) closeApplyModalBtn.addEventListener('click', closeApplyModal);
    applyModalBackdrop.addEventListener('click', (e) => {
        if (e.target === applyModalBackdrop) closeApplyModal();
    });

    if (confirmApplyBtn) {
        confirmApplyBtn.addEventListener('click', async () => {
            if (!currentOpportunity) return;

            const notes = applyNotesInput.value.trim();
            confirmApplyBtn.disabled = true;
            confirmApplyBtn.textContent = 'Submitting...';

            try {
                const response = await ArtSphereAPI.applyToOpportunity(currentOpportunity.id, currentUserId, notes);
                closeApplyModal();

                // Update Apply Button state in UI
                const applyBtn = document.getElementById('applyNowBtn');
                if (applyBtn) {
                    applyBtn.classList.add('applied');
                    applyBtn.disabled = true;
                    applyBtn.innerHTML = '<span>Applied ✓</span>';
                }

                currentOpportunity.hasApplied = true;
                showToastNotification('Application submitted successfully!');
            } catch (err) {
                console.error('Application submission error:', err);
                alert(err.message || 'Failed to submit application. Please try again.');
            } finally {
                confirmApplyBtn.disabled = false;
                confirmApplyBtn.innerHTML = 'Submit Application &rarr;';
            }
        });
    }

    // -------------------------------------------------------------
    // Toast Notification
    // -------------------------------------------------------------
    function showToastNotification(message) {
        let toast = document.querySelector('.opp-toast-alert');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'opp-toast-alert';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }

    // -------------------------------------------------------------
    // Header User Menu & Logout
    // -------------------------------------------------------------
    function initUserMenu() {
        if (userMenuWrapper && userDropdownMenu) {
            userMenuWrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdownMenu.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                userDropdownMenu.classList.remove('show');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to log out?')) {
                    await ArtSphereAPI.logout();
                }
            });
        }
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
