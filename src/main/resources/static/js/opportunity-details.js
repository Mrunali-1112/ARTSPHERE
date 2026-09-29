/**
 * ArtSphere – Opportunity Details JavaScript
 * Editorial Neo-brutalism • In-Website Opportunity Application Flow
 * Strictly in-platform: No external email, phone, or redirect.
 */

document.addEventListener('DOMContentLoaded', async () => {
    let currentUserId = 101; // Default demo user
    let currentUser = {
        id: 101,
        fullName: 'Aanya Deshmukh',
        email: 'aanya.deshmukh@artsphere.com',
        artistType: 'Visual Arts',
        portfolioUrl: `${window.location.origin}/pages/artist-profile.html?id=101`
    };

    // Parse URL params (default to 101: Serendipity Arts Residency 2026)
    const urlParams = new URLSearchParams(window.location.search);
    let rawId = urlParams.get('id') ? parseInt(urlParams.get('id'), 10) : 101;
    if (isNaN(rawId) || rawId === 1) {
        rawId = 101;
    }
    const oppId = rawId;

    // Navigation & Dropdown
    initNavigation();

    // DOM Elements - Main Page
    const oppCategoryBadge = document.getElementById('oppCategoryBadge');
    const oppStatusBadge = document.getElementById('oppStatusBadge');
    const oppDeadlineTag = document.getElementById('oppDeadlineTag');
    const oppTitle = document.getElementById('oppTitle');
    const oppOrgName = document.getElementById('oppOrgName');
    const oppLocationText = document.getElementById('oppLocationText');
    const oppCompensation = document.getElementById('oppCompensation');
    const oppDuration = document.getElementById('oppDuration');
    const oppDiscipline = document.getElementById('oppDiscipline');
    const oppCohort = document.getElementById('oppCohort');

    const btnOpenApplyModal = document.getElementById('btnOpenApplyModal');
    const btnShareOpp = document.getElementById('btnShareOpp');
    const btnBookmarkOpp = document.getElementById('btnBookmarkOpp');
    const bookmarkBtnText = document.getElementById('bookmarkBtnText');

    const oppDescription = document.getElementById('oppDescription');
    const oppDeliverablesList = document.getElementById('oppDeliverablesList');
    const oppEligibilityText = document.getElementById('oppEligibilityText');
    const sideOrgName = document.getElementById('sideOrgName');
    const sideOrgBio = document.getElementById('sideOrgBio');
    const timeCloseDate = document.getElementById('timeCloseDate');

    // DOM Elements - Apply Modal
    const applyModal = document.getElementById('applyModal');
    const closeApplyModal = document.getElementById('closeApplyModal');
    const cancelApplyBtn = document.getElementById('cancelApplyBtn');
    const modalHeading = document.getElementById('modalHeading');

    // Modal Compact Summary Card Elements
    const summaryOppTitle = document.getElementById('summaryOppTitle');
    const summaryOppOrg = document.getElementById('summaryOppOrg');
    const summaryOppLocation = document.getElementById('summaryOppLocation');
    const summaryOppDuration = document.getElementById('summaryOppDuration');
    const summaryOppDiscipline = document.getElementById('summaryOppDiscipline');

    // Form Inputs & Validation Elements
    const oppApplyForm = document.getElementById('oppApplyForm');
    const appFullNameInput = document.getElementById('appFullNameInput');
    const nameError = document.getElementById('nameError');
    const appEmailInput = document.getElementById('appEmailInput');
    const emailError = document.getElementById('emailError');
    const appDisciplineSelect = document.getElementById('appDisciplineSelect');
    const disciplineError = document.getElementById('disciplineError');
    const appPortfolioInput = document.getElementById('appPortfolioInput');
    const appStatementInput = document.getElementById('appStatementInput');
    const statementCharCount = document.getElementById('statementCharCount');
    const statementError = document.getElementById('statementError');
    const appExperienceInput = document.getElementById('appExperienceInput');
    const appEligibilityCheck = document.getElementById('appEligibilityCheck');
    const confirmError = document.getElementById('confirmError');
    const submitApplyBtn = document.getElementById('submitApplyBtn');

    // Success Modal Elements
    const applySuccessModal = document.getElementById('applySuccessModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    const successOppTitle = document.getElementById('successOppTitle');
    const btnBackToOpp = document.getElementById('btnBackToOpp');

    // Already Applied Modal Elements
    const alreadyAppliedModal = document.getElementById('alreadyAppliedModal');
    const closeAlreadyAppliedModal = document.getElementById('closeAlreadyAppliedModal');
    const btnCloseAlreadyApplied = document.getElementById('btnCloseAlreadyApplied');

    let currentOpportunity = null;

    // 1. Fetch current authenticated user if available
    try {
        let authUser = null;
        if (window.api && typeof window.api.getCurrentUser === 'function') {
            authUser = await window.api.getCurrentUser();
        }
        if (!authUser) {
            const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || sessionStorage.getItem('artsphere_user');
            if (stored) authUser = JSON.parse(stored);
        }

        if (authUser && authUser.id) {
            currentUserId = authUser.id;
            currentUser = {
                id: authUser.id,
                fullName: authUser.fullName || authUser.username || 'Mrunali',
                email: authUser.email || 'mrunali@artsphere.com',
                artistType: authUser.artistType || authUser.role || 'Visual Arts',
                portfolioUrl: authUser.portfolioUrl || `${window.location.origin}/pages/artist-profile.html?id=${authUser.id}`,
                profilePicture: authUser.profilePicture || '/images/avatar_creator_mrunali.png'
            };

            const name = currentUser.fullName;
            const role = currentUser.artistType;
            const avatar = currentUser.profilePicture;

            const sidebarUserName = document.getElementById('sidebarUserName');
            const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
            const sidebarProfileCard = document.getElementById('sidebarProfileCard');
            const dropdownUserName = document.getElementById('dropdownUserName');
            const dropdownUserBio = document.getElementById('dropdownUserBio');
            const headerUserAvatar = document.getElementById('headerUserAvatar');
            const dropdownProfileLink = document.getElementById('dropdownProfileLink');
            const footerProfileLink = document.getElementById('footerProfileLink');

            if (sidebarUserName) sidebarUserName.textContent = name.split(' ')[0] || name;
            if (sidebarUserAvatar) sidebarUserAvatar.src = avatar;
            if (sidebarProfileCard) sidebarProfileCard.href = `/pages/artist-profile.html?id=${currentUserId}`;
            if (dropdownUserName) dropdownUserName.textContent = name;
            if (dropdownUserBio) dropdownUserBio.textContent = role;
            if (headerUserAvatar) headerUserAvatar.src = avatar;
            if (dropdownProfileLink) dropdownProfileLink.href = `/pages/artist-profile.html?id=${currentUserId}`;
            if (footerProfileLink) footerProfileLink.href = `/pages/artist-profile.html?id=${currentUserId}`;
        }
    } catch (e) {
        console.info('Using default user context for application flow:', e);
    }

    // 2. Load Opportunity Dossier
    await loadOpportunityDossier();

    // Check URL hash for direct apply link (#apply)
    if (window.location.hash === '#apply' && currentOpportunity) {
        if (currentOpportunity.hasApplied) {
            openAlreadyAppliedModal();
        } else {
            openApplyModal();
        }
    }

    async function loadOpportunityDossier() {
        try {
            if (window.api && typeof window.api.getOpportunityDetails === 'function') {
                const data = await window.api.getOpportunityDetails(oppId, currentUserId);
                if (data && data.title) {
                    currentOpportunity = data;
                    renderDossier(data);
                    return;
                }
            }
        } catch (err) {
            console.warn('API error, falling back to curated dossier dataset:', err);
        }

        currentOpportunity = getFallbackDossier(oppId);
        renderDossier(currentOpportunity);
    }

    function renderDossier(opp) {
        if (!opp) return;

        const oppTitleStr = opp.title || 'Serendipity Arts Residency 2026';
        const oppOrgStr = opp.organization || opp.organizer || 'Arts Foundation';
        const oppLocStr = opp.location || 'Goa, India';
        const oppDurStr = opp.duration || '6 Weeks';
        const oppDiscStr = opp.discipline || opp.artCategory || 'Multidisciplinary';

        // Badges & Hero Info
        if (oppCategoryBadge) oppCategoryBadge.textContent = (opp.category || 'RESIDENCY').toUpperCase();
        if (oppDeadlineTag) oppDeadlineTag.textContent = `⏰ Deadline: ${opp.deadline || 'Oct 30, 2026'}`;
        if (oppTitle) oppTitle.textContent = oppTitleStr;
        if (oppOrgName) oppOrgName.textContent = oppOrgStr;
        if (oppLocationText) oppLocationText.textContent = `${oppLocStr} • ${opp.mode || 'In-Person Studio'}`;

        if (oppCompensation) oppCompensation.textContent = opp.compensation || opp.stipend || 'Funded Production';
        if (oppDuration) oppDuration.textContent = oppDurStr;
        if (oppDiscipline) oppDiscipline.textContent = oppDiscStr;
        if (oppCohort) oppCohort.textContent = opp.cohort || 'Selected Cohort';

        if (oppDescription) oppDescription.textContent = opp.description || 'Full call description.';
        if (sideOrgName) sideOrgName.textContent = oppOrgStr;
        if (sideOrgBio) sideOrgBio.textContent = opp.organizationBio || 'Dedicated to supporting emerging and established artistic practices through production grants and residencies.';
        if (timeCloseDate) timeCloseDate.textContent = opp.deadline || 'Oct 30, 2026';

        // Modal Header & Compact Summary Card
        if (modalHeading) modalHeading.textContent = `Apply for ${oppTitleStr}`;
        if (summaryOppTitle) summaryOppTitle.textContent = oppTitleStr;
        if (summaryOppOrg) summaryOppOrg.textContent = oppOrgStr;
        if (summaryOppLocation) summaryOppLocation.textContent = oppLocStr;
        if (summaryOppDuration) summaryOppDuration.textContent = oppDurStr;
        if (summaryOppDiscipline) summaryOppDiscipline.textContent = oppDiscStr;

        // Success Modal Reference
        if (successOppTitle) successOppTitle.textContent = oppTitleStr;

        // Deliverables List
        if (oppDeliverablesList) {
            let items = opp.deliverables;
            if (!items || items.length === 0) {
                if (opp.whatYouGet && opp.whatYouGet.length > 0) {
                    items = opp.whatYouGet.flatMap(g => g.split('\n'));
                } else {
                    items = [
                        'Private 400 sq.ft individual studio workspace with high-speed internet and natural lighting.',
                        '₹1,50,000 living stipend distributed across two milestones.',
                        'Up to ₹75,000 material and fabrication budget reimbursed upon approved receipts.',
                        'Featured showcase during the Serendipity Arts Festival open week.'
                    ];
                }
            }
            oppDeliverablesList.innerHTML = items.map(d => `<li>${escapeHtml(d.trim())}</li>`).join('');
        }

        // Eligibility text
        if (oppEligibilityText) {
            if (opp.eligibility) {
                oppEligibilityText.textContent = opp.eligibility;
            } else if (opp.whoCanApply && opp.whoCanApply.length > 0) {
                oppEligibilityText.textContent = opp.whoCanApply.join('. ');
            } else {
                oppEligibilityText.textContent = 'Open to practitioners of visual arts, animation, contemporary dance, sound design, and experimental writing with at least 2 years of active practice.';
            }
        }

        // Bookmark State
        updateBookmarkUI(opp.bookmarked);

        // Apply Button state & Duplicate Application Protection
        updateApplyButtonState(opp.hasApplied);
    }

    /**
     * Updates primary action button state:
     * - If already applied: displays "✓ Application Submitted (Pending Review)" and clicking opens status modal.
     * - If not applied: displays "Apply for Opportunity →" and clicking opens application modal.
     */
    function updateApplyButtonState(hasApplied) {
        const btnSideApplyModal = document.getElementById('btnSideApplyModal');

        if (hasApplied) {
            if (btnOpenApplyModal) {
                btnOpenApplyModal.innerHTML = `<span>✓ Application Submitted (Pending Review)</span>`;
                btnOpenApplyModal.classList.add('already-applied');
                btnOpenApplyModal.title = 'Click to view application status';
                btnOpenApplyModal.onclick = (e) => {
                    e.preventDefault();
                    openAlreadyAppliedModal();
                };
            }
            if (btnSideApplyModal) {
                btnSideApplyModal.innerHTML = `<span>✓ Application Submitted</span>`;
                btnSideApplyModal.classList.add('already-applied');
                btnSideApplyModal.title = 'Click to view application status';
                btnSideApplyModal.onclick = (e) => {
                    e.preventDefault();
                    openAlreadyAppliedModal();
                };
            }
        } else {
            if (btnOpenApplyModal) {
                btnOpenApplyModal.innerHTML = `<span>Apply for Opportunity &rarr;</span>`;
                btnOpenApplyModal.classList.remove('already-applied');
                btnOpenApplyModal.title = 'Apply for this opportunity';
                btnOpenApplyModal.onclick = (e) => {
                    e.preventDefault();
                    openApplyModal();
                };
            }
            if (btnSideApplyModal) {
                btnSideApplyModal.innerHTML = `<span>Apply for Opportunity &rarr;</span>`;
                btnSideApplyModal.classList.remove('already-applied');
                btnSideApplyModal.title = 'Apply for this opportunity';
                btnSideApplyModal.onclick = (e) => {
                    e.preventDefault();
                    openApplyModal();
                };
            }
        }
    }

    function updateBookmarkUI(isBookmarked) {
        if (!btnBookmarkOpp) return;
        const svg = btnBookmarkOpp.querySelector('svg');
        if (isBookmarked) {
            btnBookmarkOpp.classList.add('active');
            if (svg) svg.setAttribute('fill', 'currentColor');
            if (bookmarkBtnText) bookmarkBtnText.textContent = 'Saved in Bookmarks';
        } else {
            btnBookmarkOpp.classList.remove('active');
            if (svg) svg.setAttribute('fill', 'none');
            if (bookmarkBtnText) bookmarkBtnText.textContent = 'Save Opportunity';
        }
    }

    // =========================================================================
    // Short Application Modal Logic
    // =========================================================================

    function openApplyModal() {
        if (currentOpportunity && currentOpportunity.hasApplied) {
            openAlreadyAppliedModal();
            return;
        }

        if (!applyModal) return;

        // Clear all previous errors
        clearFormErrors();

        // 1. Full Name pre-fill
        if (appFullNameInput) {
            appFullNameInput.value = currentUser.fullName || 'Aanya Deshmukh';
            appFullNameInput.classList.remove('input-invalid');
        }

        // 2. Email pre-fill
        if (appEmailInput) {
            appEmailInput.value = currentUser.email || 'aanya.deshmukh@artsphere.com';
            appEmailInput.classList.remove('input-invalid');
        }

        // 3. Artistic Discipline pre-fill / match
        if (appDisciplineSelect) {
            const userType = (currentUser.artistType || '').toLowerCase();
            const oppDisc = (currentOpportunity?.discipline || currentOpportunity?.artCategory || '').toLowerCase();
            
            let matchedValue = 'Visual Arts';
            const options = ['Visual Arts', 'Music', 'Dance', 'Photography', 'Writing', 'Film', 'Illustration', 'Design'];
            
            for (const opt of options) {
                const optLower = opt.toLowerCase();
                if (userType.includes(optLower) || oppDisc.includes(optLower)) {
                    matchedValue = opt;
                    break;
                }
            }
            appDisciplineSelect.value = matchedValue;
            appDisciplineSelect.classList.remove('input-invalid');
        }

        // 4. Portfolio Link pre-fill (optional)
        if (appPortfolioInput) {
            appPortfolioInput.value = currentUser.portfolioUrl || `${window.location.origin}/pages/artist-profile.html?id=${currentUser.id || 101}`;
        }

        // 5. Short Statement
        if (appStatementInput) {
            appStatementInput.value = '';
            appStatementInput.classList.remove('input-invalid');
            if (statementCharCount) {
                statementCharCount.textContent = '0 / 500';
                statementCharCount.style.color = '#877E9C';
            }
        }

        // 6. Relevant Experience
        if (appExperienceInput) {
            appExperienceInput.value = '';
        }

        // 7. Eligibility Confirmation
        if (appEligibilityCheck) {
            appEligibilityCheck.checked = false;
        }

        // Display Modal
        applyModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (appStatementInput) appStatementInput.focus();
        }, 100);
    }

    function closeApply() {
        if (applyModal) {
            applyModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        clearFormErrors();
    }

    function clearFormErrors() {
        if (nameError) nameError.classList.remove('visible');
        if (emailError) emailError.classList.remove('visible');
        if (disciplineError) disciplineError.classList.remove('visible');
        if (statementError) statementError.classList.remove('visible');
        if (confirmError) confirmError.classList.remove('visible');

        if (appFullNameInput) appFullNameInput.classList.remove('input-invalid');
        if (appEmailInput) appEmailInput.classList.remove('input-invalid');
        if (appDisciplineSelect) appDisciplineSelect.classList.remove('input-invalid');
        if (appStatementInput) appStatementInput.classList.remove('input-invalid');
    }

    // Modal Close Buttons
    if (closeApplyModal) closeApplyModal.addEventListener('click', closeApply);
    if (cancelApplyBtn) cancelApplyBtn.addEventListener('click', closeApply);
    if (applyModal) {
        applyModal.addEventListener('click', (e) => {
            if (e.target === applyModal) closeApply();
        });
    }

    // Live Character Counter on Short Statement
    if (appStatementInput && statementCharCount) {
        appStatementInput.addEventListener('input', () => {
            const length = appStatementInput.value.length;
            statementCharCount.textContent = `${length} / 500`;
            if (length > 500) {
                statementCharCount.style.color = '#D32F2F';
            } else {
                statementCharCount.style.color = '#877E9C';
            }

            if (length > 0 && length <= 500 && statementError) {
                statementError.classList.remove('visible');
                appStatementInput.classList.remove('input-invalid');
            }
        });
    }

    // Inline validation clearing on interaction
    if (appFullNameInput) {
        appFullNameInput.addEventListener('input', () => {
            if (appFullNameInput.value.trim().length > 0) {
                if (nameError) nameError.classList.remove('visible');
                appFullNameInput.classList.remove('input-invalid');
            }
        });
    }

    if (appEmailInput) {
        appEmailInput.addEventListener('input', () => {
            if (isValidEmail(appEmailInput.value.trim())) {
                if (emailError) emailError.classList.remove('visible');
                appEmailInput.classList.remove('input-invalid');
            }
        });
    }

    if (appDisciplineSelect) {
        appDisciplineSelect.addEventListener('change', () => {
            if (appDisciplineSelect.value !== '') {
                if (disciplineError) disciplineError.classList.remove('visible');
                appDisciplineSelect.classList.remove('input-invalid');
            }
        });
    }

    if (appEligibilityCheck) {
        appEligibilityCheck.addEventListener('change', () => {
            if (appEligibilityCheck.checked) {
                if (confirmError) confirmError.classList.remove('visible');
            }
        });
    }

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // =========================================================================
    // Form Submission (Reusing existing Opportunity Application API)
    // =========================================================================

    if (oppApplyForm) {
        oppApplyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Extract values
            const fullName = appFullNameInput ? appFullNameInput.value.trim() : '';
            const email = appEmailInput ? appEmailInput.value.trim() : '';
            const discipline = appDisciplineSelect ? appDisciplineSelect.value.trim() : '';
            const portfolio = appPortfolioInput ? appPortfolioInput.value.trim() : '';
            const statement = appStatementInput ? appStatementInput.value.trim() : '';
            const experience = appExperienceInput ? appExperienceInput.value.trim() : '';
            const isConfirmed = appEligibilityCheck ? appEligibilityCheck.checked : false;

            // Validate
            let hasError = false;
            let firstInvalidEl = null;

            // 1. Full Name
            if (!fullName) {
                hasError = true;
                if (nameError) nameError.classList.add('visible');
                if (appFullNameInput) appFullNameInput.classList.add('input-invalid');
                if (!firstInvalidEl) firstInvalidEl = appFullNameInput;
            } else {
                if (nameError) nameError.classList.remove('visible');
                if (appFullNameInput) appFullNameInput.classList.remove('input-invalid');
            }

            // 2. Email
            if (!email || !isValidEmail(email)) {
                hasError = true;
                if (emailError) emailError.classList.add('visible');
                if (appEmailInput) appEmailInput.classList.add('input-invalid');
                if (!firstInvalidEl) firstInvalidEl = appEmailInput;
            } else {
                if (emailError) emailError.classList.remove('visible');
                if (appEmailInput) appEmailInput.classList.remove('input-invalid');
            }

            // 3. Discipline
            if (!discipline) {
                hasError = true;
                if (disciplineError) disciplineError.classList.add('visible');
                if (appDisciplineSelect) appDisciplineSelect.classList.add('input-invalid');
                if (!firstInvalidEl) firstInvalidEl = appDisciplineSelect;
            } else {
                if (disciplineError) disciplineError.classList.remove('visible');
                if (appDisciplineSelect) appDisciplineSelect.classList.remove('input-invalid');
            }

            // 4. Statement
            if (!statement || statement.length > 500) {
                hasError = true;
                if (statementError) statementError.classList.add('visible');
                if (appStatementInput) appStatementInput.classList.add('input-invalid');
                if (!firstInvalidEl) firstInvalidEl = appStatementInput;
            } else {
                if (statementError) statementError.classList.remove('visible');
                if (appStatementInput) appStatementInput.classList.remove('input-invalid');
            }

            // 5. Eligibility Confirmation
            if (!isConfirmed) {
                hasError = true;
                if (confirmError) confirmError.classList.add('visible');
                if (!firstInvalidEl) firstInvalidEl = appEligibilityCheck;
            } else {
                if (confirmError) confirmError.classList.remove('visible');
            }

            if (hasError) {
                if (firstInvalidEl && typeof firstInvalidEl.focus === 'function') {
                    firstInvalidEl.focus();
                }
                return;
            }

            // Prepare structured notes payload for existing backend
            const notesParts = [
                `Applicant: ${fullName}`,
                `Email: ${email}`,
                `Discipline: ${discipline}`,
                `Statement: ${statement}`
            ];
            if (experience) {
                notesParts.push(`Experience: ${experience}`);
            }
            if (portfolio) {
                notesParts.push(`Portfolio: ${portfolio}`);
            }
            const formattedNotes = notesParts.join(' | ');

            // Button loading state
            if (submitApplyBtn) {
                submitApplyBtn.disabled = true;
                submitApplyBtn.innerHTML = '<span>Submitting Application...</span>';
            }

            try {
                if (window.api && typeof window.api.applyToOpportunity === 'function') {
                    await window.api.applyToOpportunity(oppId, currentUserId, formattedNotes);
                }
            } catch (err) {
                console.warn('API submission response:', err);
                const errMsg = err.message || '';
                if (errMsg.toLowerCase().includes('already applied')) {
                    closeApply();
                    if (currentOpportunity) currentOpportunity.hasApplied = true;
                    updateApplyButtonState(true);
                    openAlreadyAppliedModal();
                    if (submitApplyBtn) {
                        submitApplyBtn.disabled = false;
                        submitApplyBtn.innerHTML = '<span>Submit Application</span> <span>&rarr;</span>';
                    }
                    return;
                }
            }

            // Successful Submission
            closeApply();

            if (submitApplyBtn) {
                submitApplyBtn.disabled = false;
                submitApplyBtn.innerHTML = '<span>Submit Application</span> <span>&rarr;</span>';
            }

            if (currentOpportunity) {
                currentOpportunity.hasApplied = true;
            }
            updateApplyButtonState(true);

            // Open in-website Success Modal
            openSuccessModal();

            // In-App Notification Toast
            showToast(`Your application for ${currentOpportunity?.title || 'Serendipity Arts Residency 2026'} was submitted.`);

            // Trigger unread notification update on nav bell if present
            const navNotifDot = document.querySelector('.notification-dot, #navNotificationDot');
            if (navNotifDot) {
                navNotifDot.style.display = 'block';
                navNotifDot.classList.add('active');
            }
        });
    }

    // =========================================================================
    // Success & Already Applied Modals
    // =========================================================================

    function openSuccessModal() {
        if (applySuccessModal) {
            applySuccessModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSuccess() {
        if (applySuccessModal) {
            applySuccessModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    if (closeSuccessModal) closeSuccessModal.addEventListener('click', closeSuccess);
    if (btnBackToOpp) btnBackToOpp.addEventListener('click', closeSuccess);
    if (applySuccessModal) {
        applySuccessModal.addEventListener('click', (e) => {
            if (e.target === applySuccessModal) closeSuccess();
        });
    }

    function openAlreadyAppliedModal() {
        if (alreadyAppliedModal) {
            alreadyAppliedModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeAlreadyApplied() {
        if (alreadyAppliedModal) {
            alreadyAppliedModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    if (closeAlreadyAppliedModal) closeAlreadyAppliedModal.addEventListener('click', closeAlreadyApplied);
    if (btnCloseAlreadyApplied) btnCloseAlreadyApplied.addEventListener('click', closeAlreadyApplied);
    if (alreadyAppliedModal) {
        alreadyAppliedModal.addEventListener('click', (e) => {
            if (e.target === alreadyAppliedModal) closeAlreadyApplied();
        });
    }

    // ESC key closes any open modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeApply();
            closeSuccess();
            closeAlreadyApplied();
        }
    });

    // =========================================================================
    // Bookmark Toggle & Share
    // =========================================================================

    if (btnBookmarkOpp) {
        btnBookmarkOpp.addEventListener('click', async () => {
            if (!currentOpportunity) return;
            const newState = !currentOpportunity.bookmarked;
            currentOpportunity.bookmarked = newState;
            updateBookmarkUI(newState);

            try {
                if (window.api && typeof window.api.toggleOpportunityBookmark === 'function') {
                    await window.api.toggleOpportunityBookmark(oppId, currentUserId);
                }
            } catch (err) {
                console.warn('Bookmark error:', err);
            }

            showToast(newState ? 'Opportunity bookmarked!' : 'Bookmark removed.');
        });
    }

    if (btnShareOpp) {
        btnShareOpp.addEventListener('click', () => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showToast('Opportunity link copied to clipboard!');
            } else {
                showToast('Link: ' + window.location.href);
            }
        });
    }

    // Fallback Opportunity Dataset
    function getFallbackDossier(id) {
        const directory = {
            101: {
                id: 101,
                title: 'Serendipity Arts Residency 2026',
                category: 'Residencies',
                organization: 'Serendipity Arts Foundation',
                organizationBio: 'One of South Asia\'s largest multidisciplinary cultural foundations, promoting artistic experimentation, critical inquiry, and community-engaged public art.',
                location: 'Panaji, Goa',
                mode: 'In-Person Studio Residency',
                compensation: '₹1,50,000 Stipend + Studio',
                duration: '6 Weeks',
                discipline: 'Multidisciplinary',
                cohort: 'Selected Cohort',
                deadline: 'Oct 30, 2026',
                description: 'A 6-week intensive multidisciplinary residency in Goa for visual artists, choreographers, and experimental soundmakers exploring coastal ecosystems, indigenous folklore, and community memory.',
                deliverables: [
                    'Private 400 sq.ft individual studio workspace with high-speed internet and natural lighting.',
                    '₹1,50,000 living stipend distributed across two milestones.',
                    'Up to ₹75,000 material and fabrication budget reimbursed upon approved receipts.',
                    'Featured showcase during the Serendipity Arts Festival open week.'
                ],
                eligibility: 'Open to practitioners of visual arts, animation, contemporary dance, sound design, and experimental writing with at least 2 years of active practice. Students currently enrolled in degree programs are not eligible.',
                bookmarked: false,
                hasApplied: false
            },
            102: {
                id: 102,
                title: 'Background Dancers & Movement Artists for Music Video',
                category: 'Auditions',
                organization: 'Pulse Productions',
                organizationBio: 'Leading indie production house casting 4 contemporary dancers for a narrative music video shoot.',
                location: 'Mumbai, Maharashtra',
                mode: 'On-Site Shoot',
                compensation: '₹36,000 Total Stipend',
                duration: '3 Days Shoot',
                discipline: 'Dance',
                cohort: '4 Dancers Selected',
                deadline: 'Nov 10, 2026',
                description: 'Leading indie production house casting 4 contemporary dancers for a narrative music video shoot. Choreography blends Indian contemporary with street movement.',
                deliverables: [
                    '₹12,000 per shoot day (Total ₹36,000)',
                    'Full styling, wardrobe & meals provided',
                    'Featured dancer credits on streaming channels'
                ],
                eligibility: 'Strong foundation in contemporary or hip-hop. Available for rehearsals in Andheri West.',
                bookmarked: false,
                hasApplied: false
            }
        };

        return directory[id] || directory[101];
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
        const topAvatarBtn = document.getElementById('topAvatarBtn') || document.getElementById('userAvatarBtn');
        const userDropdownPanel = document.getElementById('userDropdownPanel');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const dashboardSidebar = document.getElementById('dashboardSidebar');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
        const topSearchInput = document.getElementById('topSearchInput');

        // Avatar Dropdown
        if (topAvatarBtn && userDropdownPanel) {
            topAvatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdownPanel.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!userDropdownPanel.contains(e.target) && !topAvatarBtn.contains(e.target)) {
                    userDropdownPanel.classList.remove('active');
                }
            });
        }

        // Mobile Drawer Controls
        if (mobileMenuBtn && dashboardSidebar && sidebarBackdrop) {
            mobileMenuBtn.addEventListener('click', () => {
                dashboardSidebar.classList.add('drawer-open');
                sidebarBackdrop.classList.add('show');
            });
        }

        const closeSidebar = () => {
            if (dashboardSidebar) dashboardSidebar.classList.remove('drawer-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('show');
        };

        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
        if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

        // Top Search Bar
        if (topSearchInput) {
            topSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const q = topSearchInput.value.trim();
                    if (q) window.location.href = `/pages/discover.html?q=${encodeURIComponent(q)}`;
                }
            });
        }

        // Logout
        const handleLogout = async () => {
            if (confirm('Are you sure you want to log out of ArtSphere?')) {
                try {
                    if (window.api && typeof window.api.logout === 'function') {
                        await window.api.logout();
                    } else {
                        await fetch('/api/auth/logout', { method: 'POST' });
                    }
                } catch (_) {}
                sessionStorage.clear();
                localStorage.removeItem('currentUser');
                window.location.href = '/pages/login.html';
            }
        };

        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
        if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);

        // Gallery Thumbnail Switching
        const thumbBoxes = document.querySelectorAll('.thumb-box');
        const mainHeroImg = document.getElementById('oppMainHeroImage');
        thumbBoxes.forEach(box => {
            box.addEventListener('click', () => {
                const newImg = box.getAttribute('data-img');
                if (newImg && mainHeroImg) {
                    mainHeroImg.src = newImg;
                    thumbBoxes.forEach(b => b.classList.remove('active'));
                    box.classList.add('active');
                }
            });
        });
    }
});
