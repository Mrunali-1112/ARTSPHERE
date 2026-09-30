/**
 * ArtSphere — Event Details Application Controller
 * Live REST API Integration, Registration Handlers, Bookmark/Share State,
 * Responsive Drawer & Accordion Interactions.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Current State
    let currentUserId = 101;
    let currentUser = null;
    let eventId = '801';
    let currentEvent = null;
    let isRegistered = false;
    let isSaved = false;

    // Parse URL Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const parsedId = urlParams.get('id');
    if (parsedId && parsedId.trim() !== '') {
        eventId = parsedId.trim();
    }

    // Curated Editorial Fallback (in case backend is offline or event not found in database)
    const DEFAULT_EVENT_DETAILS = {
        801: {
            id: 801,
            title: "Watercolor Workshop",
            eventType: "Workshop",
            artForm: "Painting",
            description: "Learn the fundamentals of watercolor mixing, granulation physics, wet-on-wet glazing, and negative space painting with step-by-step guidance.",
            eventDate: "25 SEP",
            eventTime: "10:00 AM – 1:00 PM",
            location: "ArtHouse, Mumbai",
            venue: "The Bandra Art Loft",
            venueAddress: "4th Floor, Pali Hill Studios, Bandra West, Mumbai, Maharashtra 400050",
            coverImage: "/images/event_detail_banner_watercolor.png",
            organizer: "Creative Souls Network",
            organizerRole: "A multidisciplinary community of 1,250+ artists.",
            organizerAvatar: "/images/comm_creative_souls_avatar.png",
            communityId: 601,
            attendeesCount: 24,
            registered: true,
            whatYoullLearn: [
                "Introduction to professional cold-pressed and rough 300gsm watercolor sheets.",
                "Wet-on-wet glazing techniques and controlled edge softening.",
                "Mixing chromatic blacks and rich luminous shadows without muddiness.",
                "Creating expressive textured landscapes with salt, dry brush, and masking fluid."
            ],
            thingsToBring: [
                "A basic set of artist-grade watercolor tubes or half-pans.",
                "Round watercolor brushes (sizes 4, 8, and 12 recommended).",
                "Studio sketchpad for quick thumbnail studies.",
                "All paper stretching boards, water jars, and palettes will be provided on site."
            ],
            whoCanJoin: "Open to all skill levels! Whether you picked up a paintbrush yesterday or have years of sketchbook experience, this masterclass is structured to give every creator practical tools and community critique.",
            guidelines: [
                "Please arrive 10 minutes before the scheduled start time for setup.",
                "Respect peer artwork during group critique and review.",
                "Clean your brushes and workstation after the session concludes.",
                "Take photos freely, but ask permission before photographing works in progress."
            ],
            quote: "Creativity takes courage.",
            quoteAuthor: "— CREATIVE SOULS GUILD MANIFESTO"
        },
        802: {
            id: 802,
            title: "Local Artists Exhibition",
            eventType: "Exhibition",
            artForm: "Painting",
            description: "Explore stunning works from emerging and master artists in our vibrant regional community. Meet creators, understand their storytelling, and immerse yourself in diverse canvas pieces.",
            eventDate: "22 Mar 2026",
            eventTime: "10:00 AM – 5:00 PM (IST)",
            location: "Kala Ghoda, Mumbai",
            venue: "Community Art Gallery",
            venueAddress: "Heritage Block, Ropewalk Lane, Kala Ghoda, Mumbai 400001",
            coverImage: "/images/comm_event_detail_cover.png",
            organizer: "ArtHouse Collective",
            organizerRole: "Curated contemporary gallery and artist showcase.",
            organizerAvatar: "/images/artist_profile_avatar.png",
            communityId: 601,
            attendeesCount: 48,
            registered: false,
            whatYoullLearn: [
                "Curatorial walkthrough with exhibiting painters.",
                "Insights into composition, scale, and color palettes.",
                "Networking with collectors, art patrons, and gallery curators."
            ],
            thingsToBring: [
                "Notebook or digital sketchbook for reflections.",
                "Comfortable walking shoes."
            ],
            whoCanJoin: "Artists, collectors, art enthusiasts, and anyone who appreciates contemporary Indian visual arts.",
            guidelines: [
                "Do not touch framed artworks.",
                "Photography without flash is permitted.",
                "Be mindful of quiet gallery zones."
            ],
            quote: "Every canvas has a heartbeat.",
            quoteAuthor: "— ARTHOUSE COLLECTIVE CURATORS"
        }
    };

    // Initialize Navigation & Session
    initNavigationControls();
    await resolveCurrentUser();

    // Check Saved Events State from Local Storage
    checkSavedStatus();

    // Load Event Details from Backend
    await loadEventDetails();

    // Setup Action Listeners
    setupActionListeners();

    /**
     * =========================================================================
     * 1. RESOLVE AUTHENTICATED USER
     * =========================================================================
     */
    async function resolveCurrentUser() {
        try {
            let user = null;
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCurrentUser === 'function') {
                user = await window.ArtSphereAPI.getCurrentUser();
            } else {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const json = await res.json();
                    user = json.data;
                }
            }

            if (!user) {
                const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
                if (stored) user = JSON.parse(stored);
            }

            if (user) {
                currentUser = user;
                if (user.id) currentUserId = user.id;

                const displayName = user.fullName || user.username || 'Mrunali S.';
                const displayRole = user.artistType || user.bio || 'Digital Artist';
                const avatarSrc = user.profilePicture || '/images/user_avatar_nav.png';

                // Update Sidebar
                const sidebarUserName = document.getElementById('sidebarUserName');
                const sidebarUserRole = document.getElementById('sidebarUserRole');
                const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
                const sidebarProfileCard = document.getElementById('sidebarProfileCard');

                if (sidebarUserName) sidebarUserName.textContent = displayName;
                if (sidebarUserRole) sidebarUserRole.textContent = displayRole;
                if (sidebarUserAvatar) sidebarUserAvatar.src = avatarSrc;
                if (sidebarProfileCard) sidebarProfileCard.href = `/pages/artist-profile.html?id=${user.id || 101}`;

                // Update Header
                const headerUserAvatar = document.getElementById('headerUserAvatar');
                const dropdownUserName = document.getElementById('dropdownUserName');
                const dropdownUserBio = document.getElementById('dropdownUserBio');
                const dropdownProfileLink = document.getElementById('dropdownProfileLink');
                const dropdownPortfolioLink = document.getElementById('dropdownPortfolioLink');

                if (headerUserAvatar) headerUserAvatar.src = avatarSrc;
                if (dropdownUserName) dropdownUserName.textContent = displayName;
                if (dropdownUserBio) dropdownUserBio.textContent = displayRole;
                if (dropdownProfileLink) dropdownProfileLink.href = `/pages/artist-profile.html?id=${user.id || 101}`;
                if (dropdownPortfolioLink) dropdownPortfolioLink.href = `/pages/portfolio.html?id=${user.id || 101}`;

                // Mobile Profile Nav
                const mobileProfileNavBtn = document.getElementById('mobileProfileNavBtn');
                if (mobileProfileNavBtn) {
                    mobileProfileNavBtn.href = `/pages/artist-profile.html?id=${user.id || 101}`;
                }
            }
        } catch (e) {
            console.warn('Could not resolve authenticated user:', e);
        }
    }

    /**
     * =========================================================================
     * 2. NAVIGATION & DRAWER CONTROLS
     * =========================================================================
     */
    function initNavigationControls() {
        const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
        const dashboardSidebar = document.getElementById('dashboardSidebar');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        const userMenuTrigger = document.getElementById('userMenuTrigger');
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        const globalSearchInput = document.getElementById('globalSearchInput');

        if (mobileMenuTrigger && dashboardSidebar) {
            mobileMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dashboardSidebar.classList.add('drawer-open');
                if (sidebarBackdrop) sidebarBackdrop.classList.add('drawer-open');
            });
        }

        function closeSidebarDrawer() {
            if (dashboardSidebar) dashboardSidebar.classList.remove('drawer-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('drawer-open');
        }

        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebarDrawer);
        if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebarDrawer);

        // Header User Avatar Dropdown
        if (userMenuTrigger && userDropdownMenu) {
            userMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = userDropdownMenu.classList.toggle('show');
                userMenuTrigger.setAttribute('aria-expanded', isOpen);
            });

            document.addEventListener('click', (e) => {
                if (userDropdownMenu.classList.contains('show') && !userDropdownMenu.contains(e.target)) {
                    userDropdownMenu.classList.remove('show');
                    userMenuTrigger.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Logout
        function handleLogout() {
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
            fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
            window.location.href = '/pages/landing.html';
        }

        if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);
        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);

        // Search redirection
        if (globalSearchInput) {
            globalSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && globalSearchInput.value.trim()) {
                    window.location.href = `/pages/discover.html?q=${encodeURIComponent(globalSearchInput.value.trim())}`;
                }
            });
        }
    }

    /**
     * =========================================================================
     * 3. CHECK SAVED EVENTS STATE
     * =========================================================================
     */
    function checkSavedStatus() {
        try {
            const savedList = JSON.parse(localStorage.getItem('artsphere_saved_events') || '[]');
            isSaved = savedList.includes(String(eventId));
            updateSavedUI();
        } catch (e) {
            isSaved = false;
        }
    }

    function updateSavedUI() {
        const btnSaveEvent = document.getElementById('btnSaveEvent');
        const btnHeaderFavorite = document.getElementById('btnHeaderFavorite');
        const saveBtnText = document.getElementById('saveBtnText');

        if (btnSaveEvent) {
            btnSaveEvent.classList.toggle('saved', isSaved);
            if (saveBtnText) saveBtnText.textContent = isSaved ? 'Saved' : 'Save Event';
        }

        if (btnHeaderFavorite) {
            btnHeaderFavorite.classList.toggle('active', isSaved);
        }
    }

    /**
     * =========================================================================
     * 4. LOAD EVENT DETAILS FROM BACKEND API
     * =========================================================================
     */
    async function loadEventDetails() {
        const fallback = DEFAULT_EVENT_DETAILS[eventId] || DEFAULT_EVENT_DETAILS[801];

        try {
            const resp = await fetch(`/api/events/${eventId}?userId=${currentUserId}`);
            if (resp.ok) {
                const json = await resp.json();
                if (json && json.data) {
                    currentEvent = { ...fallback, ...json.data };
                } else {
                    currentEvent = { ...fallback };
                }
            } else {
                currentEvent = { ...fallback };
            }
        } catch (err) {
            console.warn('API error fetching event details, using curated fallback:', err);
            currentEvent = { ...fallback };
        }

        // Fetch Live Registration Status
        try {
            const regResp = await fetch(`/api/events/${eventId}/registration-status?userId=${currentUserId}`);
            if (regResp.ok) {
                const regJson = await regResp.json();
                if (regJson && regJson.data) {
                    isRegistered = !!regJson.data.registered;
                    if (regJson.data.attendeesCount !== undefined) {
                        currentEvent.attendeesCount = regJson.data.attendeesCount;
                    }
                }
            }
        } catch (e) {
            // Keep default registered flag if API call is silent
            isRegistered = !!currentEvent.registered;
        }

        renderEventDetails(currentEvent);
    }

    /**
     * =========================================================================
     * 5. RENDER EVENT DETAILS INTO DOM
     * =========================================================================
     */
    function renderEventDetails(ev) {
        if (!ev) return;

        // Page title
        document.title = `${ev.title || 'Event Details'} — ArtSphere`;

        // Hero Banner
        const eventCoverImg = document.getElementById('eventCoverImg');
        if (eventCoverImg) {
            eventCoverImg.src = ev.coverImage || ev.imageUrl || '/images/event_detail_banner_watercolor.png';
        }

        // Badges & Title
        const eventBadge = document.getElementById('eventBadge');
        const eventTitle = document.getElementById('eventTitle');
        const eventSubtitle = document.getElementById('eventSubtitle');
        const popupEventName = document.getElementById('popupEventName');

        if (eventBadge) eventBadge.textContent = (ev.eventType || 'Workshop').toUpperCase();
        if (eventTitle) eventTitle.textContent = ev.title || 'Watercolor Workshop';
        if (eventSubtitle) eventSubtitle.textContent = ev.description || ev.subtitle || '';
        if (popupEventName) popupEventName.textContent = ev.title || 'Watercolor Workshop';

        // Metadata Pills
        const eventDateText = document.getElementById('eventDateText');
        const eventTimeText = document.getElementById('eventTimeText');
        const eventVenueText = document.getElementById('eventVenueText');
        const eventAttendeesText = document.getElementById('eventAttendeesText');

        if (eventDateText) eventDateText.textContent = ev.eventDate || '25 SEP';
        if (eventTimeText) eventTimeText.textContent = ev.eventTime || '10:00 AM – 1:00 PM';
        if (eventVenueText) eventVenueText.textContent = ev.location || 'ArtHouse, Mumbai';
        if (eventAttendeesText) eventAttendeesText.textContent = `${ev.attendeesCount || 24} artists going`;

        // Registration Button State
        updateRegistrationButtonUI();

        // 4. About This Session
        const aboutEventText = document.getElementById('aboutEventText');
        if (aboutEventText && (ev.about || ev.description)) {
            aboutEventText.textContent = ev.about || ev.description;
        }

        // 5. What You Will Learn
        const learnBulletList = document.getElementById('learnBulletList');
        if (learnBulletList && ev.whatYoullLearn && Array.isArray(ev.whatYoullLearn) && ev.whatYoullLearn.length > 0) {
            learnBulletList.innerHTML = ev.whatYoullLearn.map(item => `
                <li>
                    <span class="checklist-bullet-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span>${escapeHtml(item)}</span>
                </li>
            `).join('');
        }

        // 6. What to Bring / Materials
        const bringBulletList = document.getElementById('bringBulletList');
        const materials = ev.thingsToBring || ev.bring;
        if (bringBulletList && materials && Array.isArray(materials) && materials.length > 0) {
            bringBulletList.innerHTML = materials.map(item => `
                <li>
                    <span class="checklist-bullet-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span>${escapeHtml(item)}</span>
                </li>
            `).join('');
        }

        // 7. Who Can Join
        const whoCanJoinText = document.getElementById('whoCanJoinText');
        if (whoCanJoinText && ev.whoCanJoin) {
            whoCanJoinText.textContent = ev.whoCanJoin;
        }

        // 8. Studio Guidelines & Etiquette
        const guidelinesBulletList = document.getElementById('guidelinesBulletList');
        if (guidelinesBulletList && ev.guidelines && Array.isArray(ev.guidelines) && ev.guidelines.length > 0) {
            guidelinesBulletList.innerHTML = ev.guidelines.map(item => `
                <li>
                    <span class="checklist-bullet-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span>${escapeHtml(item)}</span>
                </li>
            `).join('');
        }

        // 9. Host Collective Card
        const orgAvatar = document.getElementById('orgAvatar');
        const orgNameText = document.getElementById('orgNameText');
        const orgTaglineText = document.getElementById('orgTaglineText');
        const organizerCardLink = document.getElementById('organizerCardLink');
        const btnVisitGuildHub = document.getElementById('btnVisitGuildHub');

        if (orgAvatar && (ev.organizerAvatar || ev.orgAvatar)) {
            orgAvatar.src = ev.organizerAvatar || ev.orgAvatar;
        }
        if (orgNameText && (ev.organizer || ev.organizerName)) {
            orgNameText.textContent = ev.organizer || ev.organizerName;
        }
        if (orgTaglineText && (ev.organizerRole || ev.organizerTagline)) {
            orgTaglineText.textContent = ev.organizerRole || ev.organizerTagline;
        }
        const communityTarget = `/pages/community-details.html?id=${ev.communityId || ev.organizerId || 601}`;
        if (organizerCardLink) organizerCardLink.href = communityTarget;
        if (btnVisitGuildHub) btnVisitGuildHub.href = communityTarget;

        // 10. Venue & Location
        const venueNameText = document.getElementById('venueNameText');
        const venueAddressText = document.getElementById('venueAddressText');
        const venueTypeBadge = document.getElementById('venueTypeBadge');

        if (venueNameText) venueNameText.textContent = ev.venue || ev.venueName || 'The Bandra Art Loft';
        if (venueAddressText) venueAddressText.textContent = ev.venueAddress || ev.venue || ev.location || '4th Floor, Pali Hill Studios, Bandra West, Mumbai, Maharashtra 400050';
        if (venueTypeBadge) {
            venueTypeBadge.textContent = ev.location && ev.location.toLowerCase().includes('online') ? 'VIRTUAL SESSION' : 'IN-PERSON STUDIO';
        }

        // 11. Confirmed Artists Card
        const attendeesCountBadge = document.getElementById('attendeesCountBadge');
        if (attendeesCountBadge) {
            attendeesCountBadge.textContent = `${ev.attendeesCount || 34} RSVP`;
        }

        const attendeesAvatarsRow = document.getElementById('attendeesAvatarsRow');
        if (attendeesAvatarsRow) {
            const safeAvatars = [
                '/images/user_avatar_nav.png',
                '/images/artist_profile_avatar.png',
                '/images/artist_ishita_thumb.png',
                '/images/artist_arjun_thumb.png'
            ];
            const count = ev.attendeesCount || 34;
            const extra = Math.max(1, count - safeAvatars.length);
            attendeesAvatarsRow.innerHTML = safeAvatars.map(src => `
                <img src="${src}" alt="Attendee" class="attendee-avatar-thumb" onerror="this.src='/images/user_avatar_nav.png'">
            `).join('') + `<div class="attendee-count-bubble" id="attendeeMoreCount">+${extra}</div>`;
        }

        // 12. Creative Quote
        const quoteText = document.getElementById('quoteText');
        const quoteAuthor = document.getElementById('quoteAuthor');
        if (quoteText && ev.quote) quoteText.textContent = ev.quote;
        if (quoteAuthor && ev.quoteAuthor) quoteAuthor.textContent = ev.quoteAuthor;
    }

    /**
     * Update Registration Button Display
     */
    function updateRegistrationButtonUI() {
        const btnRegisterNow = document.getElementById('btnRegisterNow');
        const registerBtnText = document.getElementById('registerBtnText');
        if (!btnRegisterNow) return;

        if (isRegistered) {
            btnRegisterNow.classList.add('registered');
            if (registerBtnText) registerBtnText.textContent = 'Registered ✓';
        } else {
            btnRegisterNow.classList.remove('registered');
            if (registerBtnText) registerBtnText.textContent = 'Register Now';
        }
    }

    /**
     * =========================================================================
     * 6. ACTION EVENT LISTENERS (Register, Save, Share, Accordions, Modal)
     * =========================================================================
     */
    function setupActionListeners() {
        // Register Button Click -> Opens Registration Form or Already Registered Modal
        const btnRegisterNow = document.getElementById('btnRegisterNow');
        if (btnRegisterNow) {
            btnRegisterNow.addEventListener('click', handleRegisterButtonClick);
        }

        // Save Event Buttons (Main & Header)
        const btnSaveEvent = document.getElementById('btnSaveEvent');
        const btnHeaderFavorite = document.getElementById('btnHeaderFavorite');

        if (btnSaveEvent) {
            btnSaveEvent.addEventListener('click', toggleSaveEvent);
        }
        if (btnHeaderFavorite) {
            btnHeaderFavorite.addEventListener('click', toggleSaveEvent);
        }

        // Share Buttons (Main & Header)
        const btnShareEvent = document.getElementById('btnShareEvent');
        const btnHeaderShare = document.getElementById('btnHeaderShare');

        if (btnShareEvent) {
            btnShareEvent.addEventListener('click', handleShareEvent);
        }
        if (btnHeaderShare) {
            btnHeaderShare.addEventListener('click', handleShareEvent);
        }

        // View on Map Button
        const btnViewOnMap = document.getElementById('btnViewOnMap');
        if (btnViewOnMap) {
            btnViewOnMap.addEventListener('click', () => {
                const venue = document.getElementById('venueNameText') ? document.getElementById('venueNameText').textContent : 'Bandra Art Loft';
                const addr = document.getElementById('venueAddressText') ? document.getElementById('venueAddressText').textContent : 'Bandra West, Mumbai';
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue}, ${addr}`)}`;
                window.open(mapsUrl, '_blank');
            });
        }

        // Registration Modal Controls & Stepper
        initRegistrationModalControls();

        // Accordion Controls
        setupAccordion('accordionWhoCanJoin');
        setupAccordion('accordionGuidelines');
    }

    function setupAccordion(accordionId) {
        const accordion = document.getElementById(accordionId);
        if (!accordion) return;
        const trigger = accordion.querySelector('.accordion-trigger-bar');
        if (!trigger) return;

        trigger.addEventListener('click', () => {
            const isOpen = accordion.classList.toggle('open');
            trigger.setAttribute('aria-expanded', isOpen);
        });
    }

    /**
     * =========================================================================
     * 7. REGISTRATION MODAL FLOW & ENGINE
     * =========================================================================
     */
    function handleRegisterButtonClick() {
        if (!currentEvent) return;

        // Duplicate registration check
        if (isRegistered) {
            openAlreadyRegisteredModal();
            return;
        }

        openEventRegistrationModal();
    }

    function openAlreadyRegisteredModal() {
        const alreadyModal = document.getElementById('eventAlreadyRegModal');
        const titleEl = document.getElementById('alreadyRegEventTitle');
        if (titleEl && currentEvent) {
            titleEl.textContent = currentEvent.title || 'Event';
        }
        if (alreadyModal) {
            alreadyModal.style.display = 'flex';
        }
    }

    function openEventRegistrationModal() {
        const modal = document.getElementById('eventRegModal');
        if (!modal || !currentEvent) return;

        // Header & Compact Event Summary
        const headerEventName = document.getElementById('regModalEventName');
        const summaryTitle = document.getElementById('regSummaryTitle');
        const summaryDate = document.getElementById('regSummaryDate');
        const summaryTime = document.getElementById('regSummaryTime');
        const summaryLocation = document.getElementById('regSummaryLocation');
        const summaryHost = document.getElementById('regSummaryHost');
        const summaryType = document.getElementById('regSummaryType');

        if (headerEventName) headerEventName.textContent = currentEvent.title || 'Event';
        if (summaryTitle) summaryTitle.textContent = currentEvent.title || 'Event';
        if (summaryDate) summaryDate.textContent = currentEvent.eventDate || 'Upcoming';
        if (summaryTime) summaryTime.textContent = currentEvent.eventTime || '10:00 AM – 1:00 PM';
        if (summaryLocation) summaryLocation.textContent = currentEvent.venue || currentEvent.location || 'ArtHouse, Mumbai';
        if (summaryHost) summaryHost.textContent = currentEvent.organizer || currentEvent.organizerName || 'ArtSphere Host';
        if (summaryType) summaryType.textContent = (currentEvent.eventType || 'Workshop').toUpperCase();

        // Pre-fill inputs from authenticated user
        const nameInput = document.getElementById('regNameInput');
        const emailInput = document.getElementById('regEmailInput');
        const disciplineSelect = document.getElementById('regDisciplineSelect');
        const attendeesInput = document.getElementById('regAttendeesInput');
        const noteInput = document.getElementById('regNoteInput');
        const confirmCheck = document.getElementById('regConfirmCheck');

        if (nameInput) {
            nameInput.value = (currentUser && (currentUser.fullName || currentUser.username || currentUser.name)) || '';
        }
        if (emailInput) {
            emailInput.value = (currentUser && currentUser.email) || '';
        }
        if (disciplineSelect) {
            const userDiscipline = (currentUser && (currentUser.artistType || currentUser.artForm || currentUser.discipline)) || '';
            let matched = false;
            for (let i = 0; i < disciplineSelect.options.length; i++) {
                if (disciplineSelect.options[i].value && userDiscipline.toLowerCase().includes(disciplineSelect.options[i].value.toLowerCase())) {
                    disciplineSelect.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched) disciplineSelect.value = '';
        }
        if (attendeesInput) attendeesInput.value = '1';
        if (noteInput) noteInput.value = '';
        if (confirmCheck) confirmCheck.checked = false;

        // Clear previous errors
        clearFormErrors();

        modal.style.display = 'flex';
    }

    function clearFormErrors() {
        document.querySelectorAll('#eventRegModal .reg-inline-error').forEach(el => el.classList.remove('show-error'));
        document.querySelectorAll('#eventRegModal .reg-form-input, #eventRegModal .reg-form-select').forEach(el => el.classList.remove('input-invalid'));
    }

    function closeAllEventModals() {
        const regModal = document.getElementById('eventRegModal');
        const successModal = document.getElementById('eventSuccessModal');
        const alreadyModal = document.getElementById('eventAlreadyRegModal');

        if (regModal) regModal.style.display = 'none';
        if (successModal) successModal.style.display = 'none';
        if (alreadyModal) alreadyModal.style.display = 'none';
        clearFormErrors();
    }

    function initRegistrationModalControls() {
        const regModal = document.getElementById('eventRegModal');
        const successModal = document.getElementById('eventSuccessModal');
        const alreadyModal = document.getElementById('eventAlreadyRegModal');

        // Close buttons
        const closeRegBtn = document.getElementById('closeEventRegModal');
        const cancelRegBtn = document.getElementById('btnCancelReg');
        const closeSuccessBtn = document.getElementById('closeEventSuccessModal');
        const backToEventsBtn = document.getElementById('btnBackToEvents');
        const closeAlreadyBtn = document.getElementById('closeAlreadyRegModal');
        const backAlreadyBtn = document.getElementById('btnCloseAlreadyReg');

        if (closeRegBtn) closeRegBtn.addEventListener('click', closeAllEventModals);
        if (cancelRegBtn) cancelRegBtn.addEventListener('click', closeAllEventModals);
        if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeAllEventModals);
        if (backToEventsBtn) backToEventsBtn.addEventListener('click', closeAllEventModals);
        if (closeAlreadyBtn) closeAlreadyBtn.addEventListener('click', closeAllEventModals);
        if (backAlreadyBtn) backAlreadyBtn.addEventListener('click', closeAllEventModals);

        // Backdrop click handlers
        [regModal, successModal, alreadyModal].forEach(m => {
            if (m) {
                m.addEventListener('click', (e) => {
                    if (e.target === m) closeAllEventModals();
                });
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAllEventModals();
        });

        // Stepper buttons
        const minusBtn = document.getElementById('btnAttendeeMinus');
        const plusBtn = document.getElementById('btnAttendeePlus');
        const attendeesInput = document.getElementById('regAttendeesInput');

        if (minusBtn && attendeesInput) {
            minusBtn.addEventListener('click', () => {
                let val = parseInt(attendeesInput.value, 10) || 1;
                if (val > 1) {
                    attendeesInput.value = val - 1;
                    document.getElementById('regAttendeesError')?.classList.remove('show-error');
                    attendeesInput.classList.remove('input-invalid');
                }
            });
        }

        if (plusBtn && attendeesInput) {
            plusBtn.addEventListener('click', () => {
                let val = parseInt(attendeesInput.value, 10) || 1;
                if (val < 5) {
                    attendeesInput.value = val + 1;
                    document.getElementById('regAttendeesError')?.classList.remove('show-error');
                    attendeesInput.classList.remove('input-invalid');
                }
            });
        }

        if (attendeesInput) {
            attendeesInput.addEventListener('change', () => {
                let val = parseInt(attendeesInput.value, 10);
                if (isNaN(val) || val < 1) attendeesInput.value = 1;
                else if (val > 5) attendeesInput.value = 5;
            });
        }

        // Real-time error dismissal
        const nameInput = document.getElementById('regNameInput');
        const emailInput = document.getElementById('regEmailInput');
        const disciplineSelect = document.getElementById('regDisciplineSelect');
        const confirmCheck = document.getElementById('regConfirmCheck');

        if (nameInput) {
            nameInput.addEventListener('input', () => {
                if (nameInput.value.trim()) {
                    document.getElementById('regNameError')?.classList.remove('show-error');
                    nameInput.classList.remove('input-invalid');
                }
            });
        }
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(emailInput.value.trim())) {
                    document.getElementById('regEmailError')?.classList.remove('show-error');
                    emailInput.classList.remove('input-invalid');
                }
            });
        }
        if (disciplineSelect) {
            disciplineSelect.addEventListener('change', () => {
                if (disciplineSelect.value) {
                    document.getElementById('regDisciplineError')?.classList.remove('show-error');
                    disciplineSelect.classList.remove('input-invalid');
                }
            });
        }
        if (confirmCheck) {
            confirmCheck.addEventListener('change', () => {
                if (confirmCheck.checked) {
                    document.getElementById('regConfirmError')?.classList.remove('show-error');
                }
            });
        }

        // Form submit listener
        const regForm = document.getElementById('eventRegistrationForm');
        if (regForm) {
            regForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!currentEvent) return;

                let isValid = true;
                let firstInvalidEl = null;

                // 1. Full Name
                const nameVal = nameInput ? nameInput.value.trim() : '';
                const nameErr = document.getElementById('regNameError');
                if (!nameVal) {
                    isValid = false;
                    nameErr?.classList.add('show-error');
                    nameInput?.classList.add('input-invalid');
                    if (!firstInvalidEl) firstInvalidEl = nameInput;
                } else {
                    nameErr?.classList.remove('show-error');
                    nameInput?.classList.remove('input-invalid');
                }

                // 2. Email
                const emailVal = emailInput ? emailInput.value.trim() : '';
                const emailErr = document.getElementById('regEmailError');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailVal || !emailRegex.test(emailVal)) {
                    isValid = false;
                    emailErr?.classList.add('show-error');
                    emailInput?.classList.add('input-invalid');
                    if (!firstInvalidEl) firstInvalidEl = emailInput;
                } else {
                    emailErr?.classList.remove('show-error');
                    emailInput?.classList.remove('input-invalid');
                }

                // 3. Discipline
                const discVal = disciplineSelect ? disciplineSelect.value.trim() : '';
                const discErr = document.getElementById('regDisciplineError');
                if (!discVal) {
                    isValid = false;
                    discErr?.classList.add('show-error');
                    disciplineSelect?.classList.add('input-invalid');
                    if (!firstInvalidEl) firstInvalidEl = disciplineSelect;
                } else {
                    discErr?.classList.remove('show-error');
                    disciplineSelect?.classList.remove('input-invalid');
                }

                // 4. Attendees
                const attVal = attendeesInput ? parseInt(attendeesInput.value, 10) : 1;
                const attErr = document.getElementById('regAttendeesError');
                if (isNaN(attVal) || attVal < 1 || attVal > 5) {
                    isValid = false;
                    attErr?.classList.add('show-error');
                    attendeesInput?.classList.add('input-invalid');
                    if (!firstInvalidEl) firstInvalidEl = attendeesInput;
                } else {
                    attErr?.classList.remove('show-error');
                    attendeesInput?.classList.remove('input-invalid');
                }

                // 5. Confirmation Checkbox
                const checkVal = confirmCheck ? confirmCheck.checked : false;
                const checkErr = document.getElementById('regConfirmError');
                if (!checkVal) {
                    isValid = false;
                    checkErr?.classList.add('show-error');
                    if (!firstInvalidEl) firstInvalidEl = confirmCheck;
                } else {
                    checkErr?.classList.remove('show-error');
                }

                if (!isValid) {
                    if (firstInvalidEl) firstInvalidEl.focus();
                    return;
                }

                // Submit Registration via API
                const submitBtn = document.getElementById('btnConfirmReg');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<span>Confirming...</span>`;
                }

                try {
                    let result = null;
                    if (window.ArtSphereAPI && typeof window.ArtSphereAPI.registerForEvent === 'function') {
                        result = await window.ArtSphereAPI.registerForEvent(eventId, currentUserId);
                    } else {
                        const res = await fetch(`/api/events/${eventId}/register?userId=${currentUserId}`, { method: 'POST' });
                        if (!res.ok) {
                            const errJson = await res.json().catch(() => ({}));
                            throw new Error(errJson.message || 'Registration failed');
                        }
                        const resJson = await res.json();
                        result = resJson.data;
                    }

                    // Update local state
                    isRegistered = true;
                    if (result && result.attendeesCount !== undefined) {
                        currentEvent.attendeesCount = result.attendeesCount;
                    } else {
                        currentEvent.attendeesCount = (currentEvent.attendeesCount || 24) + attVal;
                    }

                    // Update UI text and counts
                    updateRegistrationButtonUI();
                    const eventAttendeesText = document.getElementById('eventAttendeesText');
                    const attendeesCountBadge = document.getElementById('attendeesCountBadge');
                    if (eventAttendeesText) eventAttendeesText.textContent = `${currentEvent.attendeesCount} artists going`;
                    if (attendeesCountBadge) attendeesCountBadge.textContent = `${currentEvent.attendeesCount} RSVP`;

                    // Close form modal
                    if (regModal) regModal.style.display = 'none';

                    // Populate and open success modal
                    const successTitle = document.getElementById('successEventTitle');
                    const ledgerEvent = document.getElementById('successLedgerEvent');
                    const ledgerDate = document.getElementById('successLedgerDate');
                    const ledgerTime = document.getElementById('successLedgerTime');
                    const ledgerLocation = document.getElementById('successLedgerLocation');

                    if (successTitle) successTitle.textContent = currentEvent.title;
                    if (ledgerEvent) ledgerEvent.textContent = currentEvent.title;
                    if (ledgerDate) ledgerDate.textContent = currentEvent.eventDate || 'Confirmed';
                    if (ledgerTime) ledgerTime.textContent = currentEvent.eventTime || '10:00 AM – 1:00 PM';
                    if (ledgerLocation) ledgerLocation.textContent = currentEvent.venue || currentEvent.location || 'ArtHouse, Mumbai';

                    if (successModal) successModal.style.display = 'flex';

                    showToast(`You're registered for ${currentEvent.title}!`);

                } catch (err) {
                    console.error('Registration submission error:', err);
                    showToast(err.message || 'Registration could not be completed. Please try again.');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = `<span>Confirm Registration</span><span>&rarr;</span>`;
                    }
                }
            });
        }
    }

    /**
     * =========================================================================
     * 8. HANDLE SAVE EVENT (BOOKMARK)
     * =========================================================================
     */
    function toggleSaveEvent() {
        try {
            let savedList = JSON.parse(localStorage.getItem('artsphere_saved_events') || '[]');
            const evIdStr = String(eventId);

            if (savedList.includes(evIdStr)) {
                savedList = savedList.filter(id => id !== evIdStr);
                isSaved = false;
                showToast('Event removed from your saved items');
            } else {
                savedList.push(evIdStr);
                isSaved = true;
                showToast('Event saved to your studio schedule!');
            }

            localStorage.setItem('artsphere_saved_events', JSON.stringify(savedList));
            updateSavedUI();
        } catch (e) {
            isSaved = !isSaved;
            updateSavedUI();
            showToast(isSaved ? 'Event saved to your studio schedule!' : 'Event removed');
        }
    }

    /**
     * =========================================================================
     * 9. HANDLE SHARE EVENT
     * =========================================================================
     */
    function handleShareEvent() {
        const shareUrl = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl)
                .then(() => showToast('Event link copied to clipboard!'))
                .catch(() => showToast('Event link: ' + shareUrl));
        } else {
            showToast('Event link: ' + shareUrl);
        }
    }

    /**
     * Helpers
     */
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showToast(message) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 320);
        }, 2500);
    }
});
