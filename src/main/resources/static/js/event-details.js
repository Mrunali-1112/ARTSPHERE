/**
 * ArtSphere — Event Details Script
 * Editorial Neo-Brutalist Architecture & Interactive Masterclasses
 */

let currentUserId = 101;
let currentUser = null;
let eventId = '801';
let currentEvent = null;

const DEFAULT_EVENT_DETAILS = {
    801: {
        id: 801,
        title: "Watercolor Basics & Granulation Masterclass",
        eventType: "Workshop",
        artForm: "Painting",
        subtitle: "Learn the fundamentals of watercolor mixing, granulation physics, wet-on-wet glazing, and negative space painting with step-by-step guidance.",
        eventDate: "15 Mar 2026",
        eventTime: "4:00 PM – 6:30 PM (IST)",
        location: "Art Studio, Bandra West, Mumbai",
        venueName: "The Bandra Art Loft",
        venueAddress: "4th Floor, Pali Hill Studios, Bandra West, Mumbai, Maharashtra 400050",
        coverImage: "/images/event_detail_banner_watercolor.png",
        organizerName: "Creative Souls Network",
        organizerId: 401,
        organizerAvatar: "/images/comm_creative_souls_avatar.png",
        organizerTagline: "A multidisciplinary community of 1,250+ artists.",
        attendeesCount: 34,
        registered: false,
        about: "This immersive, hands-on workshop introduces artists to the nuanced world of watercolor pigments and granulation chemistry. We will cover paper preparation, water-to-pigment ratios, dry brush textures, and color value hierarchies. Ideal for visual artists wanting to deepen their craft with tactile community critique.",
        learn: [
            "Introduction to professional cold-pressed and rough 300gsm watercolor sheets.",
            "Wet-on-wet glazing techniques and controlled edge softening.",
            "Mixing chromatic blacks and rich luminous shadows without muddiness.",
            "Creating expressive textured landscapes with salt, dry brush, and masking fluid."
        ],
        bring: [
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
        quote: "Art is better when shared, practiced, and explored in community."
    },
    802: {
        id: 802,
        title: "Analog 35mm Darkroom Printing & Chemistry",
        eventType: "Workshop",
        artForm: "Photography",
        subtitle: "Hands-on darkroom development. Expose silver gelatin prints from your negatives and master contrast filtration and toning baths.",
        eventDate: "22 Mar 2026",
        eventTime: "11:00 AM – 3:00 PM (IST)",
        location: "Kala Ghoda Darkroom Collective, Mumbai",
        venueName: "Kala Ghoda Print Lab",
        venueAddress: "Heritage Wing, Ropewalk Lane, Kala Ghoda, Mumbai 400001",
        coverImage: "/images/comm_photography_circle.png",
        organizerName: "Analog Frames Collective",
        organizerId: 403,
        organizerAvatar: "/images/category_photography.png",
        organizerTagline: "Darkroom chemistry and slow 35mm documentary photography.",
        attendeesCount: 22,
        registered: false,
        about: "A deep dive into black and white darkroom chemistry. Learn enlarger alignment, split-grade contrast filtration, fiber-base washing, and archival selenium toning.",
        learn: [
            "Enlarger optics and test strip contrast analysis.",
            "Stop bath, fixer dilution ratios, and archival washing.",
            "Dodging and burning techniques with custom card cutouts.",
            "Flattening and spotting fiber prints."
        ],
        bring: [
            "Developed 35mm or 120 black & white negative strips.",
            "Notebook and pencil for exposure notes.",
            "Aprons and chemical-safe nitrile gloves provided."
        ],
        whoCanJoin: "Photographers with basic negative handling experience or beginners eager to learn traditional silver gelatin printing.",
        guidelines: [
            "No red light leaks or mobile phones in the darkroom area.",
            "Wear closed-toe shoes and studio apron.",
            "Label all chemical trays clearly."
        ],
        quote: "The darkroom is where light remembers what it saw."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Parse URL param
    const urlParams = new URLSearchParams(window.location.search);
    const parsedId = urlParams.get('id');
    if (parsedId) eventId = parsedId;

    initNavigationDrawer();
    initUserMenu();
    setupEventListeners();
    loadEventDetails();
});

/**
 * 1. Mobile Navigation Drawer Toggle
 */
function initNavigationDrawer() {
    const navWrapper = document.getElementById('navWrapper');
    const navMobileToggle = document.getElementById('navMobileToggle');

    if (navMobileToggle && navWrapper) {
        navMobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navWrapper.classList.toggle('menu-open');
            const isOpen = navWrapper.classList.contains('menu-open');
            navMobileToggle.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (navWrapper.classList.contains('menu-open') && !navWrapper.contains(e.target)) {
                navWrapper.classList.remove('menu-open');
            }
        });
    }
}

/**
 * 2. User Account Dropdown Menu & Auth State
 */
function initUserMenu() {
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserBio = document.getElementById('dropdownUserBio');
    const headerUserAvatar = document.getElementById('headerUserAvatar');

    try {
        const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (stored) {
            currentUser = JSON.parse(stored);
            if (currentUser.id) currentUserId = currentUser.id;
            if (currentUser.name && dropdownUserName) dropdownUserName.textContent = currentUser.name;
            if (currentUser.bio && dropdownUserBio) dropdownUserBio.textContent = currentUser.bio;
            if (currentUser.avatarUrl && headerUserAvatar) headerUserAvatar.src = currentUser.avatarUrl;
        }
    } catch (e) {
        console.warn('Could not read user session', e);
    }

    if (userAvatarBtn && userDropdownPanel) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userDropdownPanel.classList.toggle('show');
            userAvatarBtn.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (userDropdownPanel.classList.contains('show') && !userDropdownPanel.contains(e.target)) {
                userDropdownPanel.classList.remove('show');
                userAvatarBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/landing.html';
        });
    }
}

/**
 * 3. Setup Action Event Listeners
 */
function setupEventListeners() {
    const btnRegisterNow = document.getElementById('btnRegisterNow');
    const btnSaveEvent = document.getElementById('btnSaveEvent');
    const btnShareEvent = document.getElementById('btnShareEvent');
    const closeRegistrationModal = document.getElementById('closeRegistrationModal');
    const btnPopupGreat = document.getElementById('btnPopupGreat');
    const registrationModal = document.getElementById('registrationModal');

    if (btnRegisterNow) {
        btnRegisterNow.addEventListener('click', handleRegistration);
    }

    if (btnSaveEvent) {
        btnSaveEvent.addEventListener('click', () => {
            showToast('Event saved to your studio schedule!');
        });
    }

    if (btnShareEvent) {
        btnShareEvent.addEventListener('click', () => {
            const url = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url)
                    .then(() => showToast('Event link copied to clipboard!'))
                    .catch(() => showToast('Share: ' + url));
            } else {
                showToast('Share: ' + url);
            }
        });
    }

    if (closeRegistrationModal && registrationModal) {
        closeRegistrationModal.addEventListener('click', () => {
            registrationModal.style.display = 'none';
        });
    }

    if (btnPopupGreat && registrationModal) {
        btnPopupGreat.addEventListener('click', () => {
            registrationModal.style.display = 'none';
        });
    }

    if (registrationModal) {
        registrationModal.addEventListener('click', (e) => {
            if (e.target === registrationModal) registrationModal.style.display = 'none';
        });
    }
}

/**
 * 4. Load Event Details from API with Fallback
 */
async function loadEventDetails() {
    const fallback = DEFAULT_EVENT_DETAILS[eventId] || DEFAULT_EVENT_DETAILS[801];

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getEventDetails === 'function') {
            const res = await window.ArtSphereAPI.getEventDetails(eventId, currentUserId);
            if (res) {
                currentEvent = { ...fallback, ...res };
            } else {
                currentEvent = { ...fallback };
            }
        } else {
            currentEvent = { ...fallback };
        }
    } catch (err) {
        console.warn('API error, using curated editorial event data:', err);
        currentEvent = { ...fallback };
    }

    renderEventDetails(currentEvent);
}

/**
 * 5. Render Event Details
 */
function renderEventDetails(ev) {
    if (!ev) return;

    document.title = `${ev.title || 'Event Details'} | ArtSphere`;

    const eventTitle = document.getElementById('eventTitle');
    const eventSubtitle = document.getElementById('eventSubtitle');
    const eventBadge = document.getElementById('eventBadge');
    const eventCoverImg = document.getElementById('eventCoverImg');
    const eventDateText = document.getElementById('eventDateText');
    const eventTimeText = document.getElementById('eventTimeText');
    const eventVenueText = document.getElementById('eventVenueText');
    const eventAttendeesText = document.getElementById('eventAttendeesText');
    const btnRegisterNow = document.getElementById('btnRegisterNow');
    const popupEventName = document.getElementById('popupEventName');

    if (eventTitle) eventTitle.textContent = ev.title;
    if (eventSubtitle) eventSubtitle.textContent = ev.subtitle || ev.description || '';
    if (eventBadge) eventBadge.textContent = (ev.eventType || 'Workshop').toUpperCase();
    if (eventCoverImg && (ev.coverImage || ev.imageUrl)) eventCoverImg.src = ev.coverImage || ev.imageUrl;
    if (eventDateText) eventDateText.textContent = ev.eventDate || 'Upcoming';
    if (eventTimeText) eventTimeText.textContent = ev.eventTime || 'TBA';
    if (eventVenueText) eventVenueText.textContent = ev.location || 'Art Studio';
    if (eventAttendeesText) eventAttendeesText.textContent = `${ev.attendeesCount || 34} artists going`;
    if (popupEventName) popupEventName.textContent = ev.title;

    if (btnRegisterNow) {
        if (ev.registered) {
            btnRegisterNow.classList.add('registered');
            btnRegisterNow.textContent = 'Registered ✦';
        } else {
            btnRegisterNow.classList.remove('registered');
            btnRegisterNow.textContent = 'Register Now';
        }
    }

    // Left Column Narrative Cards
    const aboutEventText = document.getElementById('aboutEventText');
    const learnBulletList = document.getElementById('learnBulletList');
    const bringBulletList = document.getElementById('bringBulletList');
    const whoCanJoinText = document.getElementById('whoCanJoinText');
    const guidelinesBulletList = document.getElementById('guidelinesBulletList');

    if (aboutEventText && ev.about) aboutEventText.textContent = ev.about;

    if (learnBulletList && ev.learn && Array.isArray(ev.learn)) {
        learnBulletList.innerHTML = ev.learn.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    }

    if (bringBulletList && ev.bring && Array.isArray(ev.bring)) {
        bringBulletList.innerHTML = ev.bring.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    }

    if (whoCanJoinText && ev.whoCanJoin) whoCanJoinText.textContent = ev.whoCanJoin;

    if (guidelinesBulletList && ev.guidelines && Array.isArray(ev.guidelines)) {
        guidelinesBulletList.innerHTML = ev.guidelines.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    }

    // Right Column Host Card
    const organizerCardLink = document.getElementById('organizerCardLink');
    const orgAvatar = document.getElementById('orgAvatar');
    const orgNameText = document.getElementById('orgNameText');
    const orgTaglineText = document.getElementById('orgTaglineText');
    const venueNameText = document.getElementById('venueNameText');
    const venueAddressText = document.getElementById('venueAddressText');
    const quoteText = document.getElementById('quoteText');

    if (organizerCardLink && ev.organizerId) {
        organizerCardLink.href = `/pages/community-details.html?id=${ev.organizerId}`;
    }
    if (orgAvatar && ev.organizerAvatar) orgAvatar.src = ev.organizerAvatar;
    if (orgNameText && ev.organizerName) orgNameText.textContent = ev.organizerName;
    if (orgTaglineText && ev.organizerTagline) orgTaglineText.textContent = ev.organizerTagline;
    if (venueNameText && ev.venueName) venueNameText.textContent = ev.venueName;
    if (venueAddressText && ev.venueAddress) venueAddressText.textContent = ev.venueAddress;
    if (quoteText && ev.quote) quoteText.textContent = ev.quote;
}

/**
 * 6. Handle Registration
 */
async function handleRegistration() {
    const btnRegisterNow = document.getElementById('btnRegisterNow');
    const registrationModal = document.getElementById('registrationModal');
    if (!btnRegisterNow || !currentEvent) return;

    const isRegistered = btnRegisterNow.classList.contains('registered');
    btnRegisterNow.disabled = true;

    try {
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.registerForEvent === 'function') {
            await window.ArtSphereAPI.registerForEvent(eventId, currentUserId);
        }

        currentEvent.registered = !isRegistered;
        currentEvent.attendeesCount = (currentEvent.attendeesCount || 34) + (currentEvent.registered ? 1 : -1);

        const eventAttendeesText = document.getElementById('eventAttendeesText');
        if (eventAttendeesText) {
            eventAttendeesText.textContent = `${currentEvent.attendeesCount} artists going`;
        }

        if (currentEvent.registered) {
            btnRegisterNow.classList.add('registered');
            btnRegisterNow.textContent = 'Registered ✦';
            if (registrationModal) registrationModal.style.display = 'flex';
        } else {
            btnRegisterNow.classList.remove('registered');
            btnRegisterNow.textContent = 'Register Now';
            showToast('Registration cancelled');
        }
    } catch (err) {
        console.error('Registration failed:', err);
        showToast('Registration failed. Please try again.');
    } finally {
        btnRegisterNow.disabled = false;
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
        setTimeout(() => toast.remove(), 350);
    }, 2400);
}
