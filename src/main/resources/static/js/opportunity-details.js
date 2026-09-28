/**
 * ArtSphere – Opportunity Details JavaScript
 * Editorial Neo-brutalism • Dossier View & Application Submission
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Mrunali / Aanya)
    const urlParams = new URLSearchParams(window.location.search);
    const oppId = urlParams.get('id') ? parseInt(urlParams.get('id')) : 1;

    // Navigation & Dropdown
    initNavigation();

    // Elements
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

    // Modals
    const applyModal = document.getElementById('applyModal');
    const closeApplyModal = document.getElementById('closeApplyModal');
    const cancelApplyBtn = document.getElementById('cancelApplyBtn');
    const modalOppTarget = document.getElementById('modalOppTarget');
    const oppApplyForm = document.getElementById('oppApplyForm');
    const artistStatementInput = document.getElementById('artistStatementInput');
    const portfolioUrlInput = document.getElementById('portfolioUrlInput');
    const submitApplyBtn = document.getElementById('submitApplyBtn');

    const applySuccessModal = document.getElementById('applySuccessModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');

    let currentOpportunity = null;

    // Load initial data
    loadOpportunityDossier();

    async function loadOpportunityDossier() {
        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getOpportunityDetails === 'function') {
                const data = await window.ArtSphereAPI.getOpportunityDetails(oppId, currentUserId);
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

        if (oppCategoryBadge) oppCategoryBadge.textContent = (opp.category || 'RESIDENCY').toUpperCase();
        if (oppDeadlineTag) oppDeadlineTag.textContent = `⏰ Deadline: ${opp.deadline || 'Rolling'}`;
        if (oppTitle) oppTitle.textContent = opp.title || 'Creative Call';
        if (oppOrgName) oppOrgName.textContent = opp.organization || opp.host || 'Arts Foundation';
        if (oppLocationText) oppLocationText.textContent = `${opp.location || 'India'} • ${opp.mode || 'In-Person Studio'}`;
        
        if (oppCompensation) oppCompensation.textContent = opp.compensation || opp.stipend || 'Funded Production';
        if (oppDuration) oppDuration.textContent = opp.duration || '6 Weeks';
        if (oppDiscipline) oppDiscipline.textContent = opp.discipline || 'Multidisciplinary';
        if (oppCohort) oppCohort.textContent = opp.cohort || 'Selected Cohort';

        if (oppDescription) oppDescription.textContent = opp.description || 'Full call description.';
        if (sideOrgName) sideOrgName.textContent = opp.organization || 'Arts Foundation';
        if (sideOrgBio) sideOrgBio.textContent = opp.organizationBio || 'Dedicated to supporting emerging and established artistic practices through production grants and residencies.';
        if (timeCloseDate) timeCloseDate.textContent = opp.deadline || 'Nov 30, 2026';

        if (modalOppTarget) {
            modalOppTarget.innerHTML = `Submitting your application dossier to <strong>${escapeHtml(opp.organization || 'Host Org')}</strong> for <strong>${escapeHtml(opp.title)}</strong>.`;
        }

        // Deliverables list
        if (oppDeliverablesList && opp.deliverables) {
            oppDeliverablesList.innerHTML = opp.deliverables.map(d => `<li>${escapeHtml(d)}</li>`).join('');
        }

        // Eligibility text
        if (oppEligibilityText && opp.eligibility) {
            oppEligibilityText.textContent = opp.eligibility;
        }

        // Bookmark State
        updateBookmarkUI(opp.bookmarked);

        // Apply Button state
        updateApplyButtonState(opp.hasApplied);
    }

    function updateApplyButtonState(hasApplied) {
        if (!btnOpenApplyModal) return;

        if (hasApplied) {
            btnOpenApplyModal.innerHTML = `<span>✓ Application Submitted (Pending Review)</span>`;
            btnOpenApplyModal.disabled = true;
            btnOpenApplyModal.style.opacity = '0.75';
            btnOpenApplyModal.style.cursor = 'default';
        } else {
            btnOpenApplyModal.innerHTML = `<span>Apply for Opportunity</span><span>&rarr;</span>`;
            btnOpenApplyModal.disabled = false;
            btnOpenApplyModal.onclick = () => openApplyModal();
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

    // Modal Handlers
    function openApplyModal() {
        if (applyModal) {
            applyModal.style.display = 'flex';
            if (artistStatementInput) {
                artistStatementInput.value = '';
                artistStatementInput.focus();
            }
        }
    }

    function closeApply() {
        if (applyModal) applyModal.style.display = 'none';
    }

    if (closeApplyModal) closeApplyModal.addEventListener('click', closeApply);
    if (cancelApplyBtn) cancelApplyBtn.addEventListener('click', closeApply);
    if (applyModal) {
        applyModal.addEventListener('click', (e) => {
            if (e.target === applyModal) closeApply();
        });
    }

    // Submit Application
    if (oppApplyForm) {
        oppApplyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statement = artistStatementInput ? artistStatementInput.value.trim() : '';
            const portfolio = portfolioUrlInput ? portfolioUrlInput.value.trim() : '';

            if (!statement) {
                showToast('Please provide an artist statement or pitch summary.');
                return;
            }

            if (submitApplyBtn) {
                submitApplyBtn.disabled = true;
                submitApplyBtn.innerHTML = '<span>Submitting Dossier...</span>';
            }

            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.applyToOpportunity === 'function') {
                    await window.ArtSphereAPI.applyToOpportunity(oppId, currentUserId, statement + (portfolio ? ` | Portfolio: ${portfolio}` : ''));
                }
            } catch (err) {
                console.warn('API submission error, proceeding with simulated confirmation:', err);
            }

            closeApply();
            if (submitApplyBtn) {
                submitApplyBtn.disabled = false;
                submitApplyBtn.innerHTML = '<span>Submit Application</span><span>&rarr;</span>';
            }

            if (applySuccessModal) applySuccessModal.style.display = 'flex';
            if (currentOpportunity) {
                currentOpportunity.hasApplied = true;
                updateApplyButtonState(true);
            }
            showToast('Application successfully registered!');
        });
    }

    // Success Modal Close
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', () => {
            if (applySuccessModal) applySuccessModal.style.display = 'none';
        });
    }
    if (applySuccessModal) {
        applySuccessModal.addEventListener('click', (e) => {
            if (e.target === applySuccessModal) applySuccessModal.style.display = 'none';
        });
    }

    // Bookmark Toggle Button
    if (btnBookmarkOpp) {
        btnBookmarkOpp.addEventListener('click', async () => {
            const newState = !currentOpportunity.bookmarked;
            currentOpportunity.bookmarked = newState;
            updateBookmarkUI(newState);

            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.toggleOpportunityBookmark === 'function') {
                    await window.ArtSphereAPI.toggleOpportunityBookmark(oppId, currentUserId);
                }
            } catch (err) {
                console.warn('Bookmark error:', err);
            }

            showToast(newState ? 'Opportunity bookmarked!' : 'Bookmark removed.');
        });
    }

    // Share Button
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

    function getFallbackDossier(id) {
        const directory = {
            1: {
                id: 1,
                title: 'Serendipity Arts Residency 2026',
                category: 'Residency',
                organization: 'Serendipity Arts Foundation',
                organizationBio: "One of South Asia's largest multidisciplinary cultural foundations, promoting artistic experimentation, critical inquiry, and cultural heritage.",
                location: 'Panaji, Goa',
                mode: 'In-Person Studio Residency',
                compensation: '₹1,50,000 Stipend + Studio',
                duration: '6 Weeks (Nov - Dec 2026)',
                discipline: 'Multidisciplinary',
                cohort: '6 Fellows Selected',
                deadline: 'Oct 30, 2026',
                description: 'The Serendipity Arts Residency invites applications from experimental multidisciplinary practitioners across South Asia. The 6-week residency provides dedicated studio space in Goa, mentorship from internationally acclaimed curators, and a full production budget to realize a site-specific installation.',
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
            2: {
                id: 2,
                title: 'Kiran Nadar Museum of Art Public Art Commission',
                category: 'Grant',
                organization: 'KNMA New Delhi',
                organizationBio: 'Pioneering private museum of modern and contemporary art in India, providing major platforms for large-scale sculptural and architectural commissions.',
                location: 'New Delhi / On-Site',
                mode: 'Installation Commission',
                compensation: '₹4,00,000 Production Grant',
                duration: '3 Months (Dec - Feb)',
                discipline: 'Sculpture & Spatial Art',
                cohort: '2 Artists Selected',
                deadline: 'Nov 15, 2026',
                description: 'Inviting site-specific kinetic and tactile art proposals for the 2026 autumn atrium showcase. All fabrication and material costs covered.',
                deliverables: [
                    '₹4,00,000 production and artist fee.',
                    'Full installation engineering support and heavy machinery access.',
                    'Published exhibition catalog and national press coverage.'
                ],
                eligibility: 'Open to visual artists and sculptors with experience handling large-scale structural installations.',
                bookmarked: false,
                hasApplied: false
            }
        };

        return directory[id] || directory[1];
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
