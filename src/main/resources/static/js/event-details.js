/**
 * ArtSphere — Event Details JavaScript (Module 9 - page_32.jpg & page_33.jpg)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Current User
    let currentUser = null;
    try {
        const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (stored) {
            currentUser = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Could not parse stored user', e);
    }
    const currentUserId = currentUser ? currentUser.id : 101;

    // Get event ID from URL query param
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id') || '801';

    // DOM Elements - Header & Hero
    const eventCoverImg = document.getElementById('eventCoverImg');
    const eventBadge = document.getElementById('eventBadge');
    const eventTitle = document.getElementById('eventTitle');
    const eventSubtitle = document.getElementById('eventSubtitle');
    const eventDateText = document.getElementById('eventDateText');
    const eventTimeText = document.getElementById('eventTimeText');
    const eventAttendeesText = document.getElementById('eventAttendeesText');
    const btnRegisterNow = document.getElementById('btnRegisterNow');
    const btnSaveEvent = document.getElementById('btnSaveEvent');
    const btnShareEvent = document.getElementById('btnShareEvent');

    // DOM Elements - Organizer
    const organizerCardLink = document.getElementById('organizerCardLink');
    const orgAvatar = document.getElementById('orgAvatar');
    const orgNameText = document.getElementById('orgNameText');
    const orgTaglineText = document.getElementById('orgTaglineText');

    // DOM Elements - Content Cards
    const aboutEventText = document.getElementById('aboutEventText');
    const learnBulletList = document.getElementById('learnBulletList');
    const whoCanJoinText = document.getElementById('whoCanJoinText');
    const bringBulletList = document.getElementById('bringBulletList');
    const venueNameText = document.getElementById('venueNameText');
    const venueAddressText = document.getElementById('venueAddressText');
    const attendeesCardHeading = document.getElementById('attendeesCardHeading');
    const attendeesAvatarsRow = document.getElementById('attendeesAvatarsRow');
    const guidelinesBulletList = document.getElementById('guidelinesBulletList');
    const quoteText = document.getElementById('quoteText');

    // DOM Elements - Registration Confirmation Popup Modal
    const registrationModal = document.getElementById('registrationModal');
    const closeRegistrationModal = document.getElementById('closeRegistrationModal');
    const btnPopupGreat = document.getElementById('btnPopupGreat');
    const popupEventName = document.getElementById('popupEventName');

    // Central Plus Menu
    const centralPlusBtn = document.getElementById('centralPlusBtn');
    const plusMenuBackdrop = document.getElementById('plusMenuBackdrop');
    const btnClosePlusMenu = document.getElementById('btnClosePlusMenu');

    // State
    let currentEvent = null;

    // Initialize
    loadEventDetails();
    setupEventListeners();

    function setupEventListeners() {
        // Register Button Click
        if (btnRegisterNow) {
            btnRegisterNow.addEventListener('click', handleRegistration);
        }

        // Save Event
        if (btnSaveEvent) {
            btnSaveEvent.addEventListener('click', () => {
                showToast('Event saved to your calendar!');
            });
        }

        // Share Event
        if (btnShareEvent) {
            btnShareEvent.addEventListener('click', () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href)
                        .then(() => showToast('Event link copied to clipboard!'))
                        .catch(() => showToast('Share link: ' + window.location.href));
                } else {
                    showToast('Share link: ' + window.location.href);
                }
            });
        }

        // Registration Popup Dismiss
        if (closeRegistrationModal) {
            closeRegistrationModal.addEventListener('click', () => {
                if (registrationModal) registrationModal.style.display = 'none';
            });
        }

        if (btnPopupGreat) {
            btnPopupGreat.addEventListener('click', () => {
                if (registrationModal) registrationModal.style.display = 'none';
            });
        }

        if (registrationModal) {
            registrationModal.addEventListener('click', (e) => {
                if (e.target === registrationModal) {
                    registrationModal.style.display = 'none';
                }
            });
        }

        // Central Plus Menu
        if (centralPlusBtn && plusMenuBackdrop) {
            centralPlusBtn.addEventListener('click', () => {
                plusMenuBackdrop.style.display = 'flex';
            });
        }

        if (btnClosePlusMenu && plusMenuBackdrop) {
            btnClosePlusMenu.addEventListener('click', () => {
                plusMenuBackdrop.style.display = 'none';
            });
        }

        if (plusMenuBackdrop) {
            plusMenuBackdrop.addEventListener('click', (e) => {
                if (e.target === plusMenuBackdrop) plusMenuBackdrop.style.display = 'none';
            });
        }
    }

    async function loadEventDetails() {
        try {
            const data = await ArtSphereAPI.getEventDetails(eventId, currentUserId);
            currentEvent = data;
            renderEventDetails(data);
        } catch (err) {
            console.error('Failed to load event details:', err);
            showToast(err.message || 'Failed to load event details');
        }
    }

    function renderEventDetails(ev) {
        if (!ev) return;

        // Cover Banner
        if (eventCoverImg) {
            eventCoverImg.src = ev.coverImage || ev.imageUrl || '/images/event_detail_banner_watercolor.png';
        }

        // Badge & Title
        if (eventBadge) eventBadge.textContent = ev.eventType || 'Workshop';
        if (eventTitle) eventTitle.textContent = ev.title || 'Watercolor Basics Workshop';
        if (eventSubtitle) eventSubtitle.textContent = ev.description || '';

        // Meta info
        if (eventDateText) eventDateText.textContent = ev.eventDate || '15 Mar 2024';
        if (eventTimeText) eventTimeText.textContent = ev.eventTime || '4:00 PM - 6:00 PM (IST)';
        if (eventAttendeesText) eventAttendeesText.textContent = `${ev.attendeesCount || 32} going`;

        // Registered state on primary button
        updateRegisterButtonState(ev.registered);

        // Organizer
        if (orgAvatar) {
            orgAvatar.src = ev.organizerAvatar || '/images/comm_creative_souls_avatar.png';
        }
        if (orgNameText) orgNameText.textContent = ev.organizer || 'Creative Souls';
        if (orgTaglineText) orgTaglineText.textContent = ev.organizerRole || 'A community for all kinds of artists.';
        if (organizerCardLink && ev.communityId) {
            organizerCardLink.href = `/pages/community-details.html?id=${ev.communityId}`;
        }

        // Left Column Cards
        if (aboutEventText) {
            aboutEventText.textContent = ev.description || 'This hands-on workshop will introduce you to the world of watercolors. You will learn basic tools, color mixing, different brush techniques, and create your own small artwork by the end of the session. No prior experience is needed — just bring your creativity!';
        }

        if (learnBulletList) {
            const learnItems = (ev.whatYoullLearn && ev.whatYoullLearn.length > 0)
                ? ev.whatYoullLearn
                : [
                    'Introduction to watercolor materials',
                    'Color mixing and blending techniques',
                    'Brush control and texture creation',
                    'Step-by-step guided painting',
                    'Tips and tricks from an experienced artist'
                ];
            learnBulletList.innerHTML = learnItems.map(item => `<li>${escapeHtml(item)}</li>`).join('');
        }

        if (whoCanJoinText) {
            whoCanJoinText.textContent = ev.whoCanJoin || 'Open to all art lovers, especially beginners! No prior experience is required.';
        }

        if (bringBulletList) {
            const bringItems = (ev.thingsToBring && ev.thingsToBring.length > 0)
                ? ev.thingsToBring
                : [
                    'A positive attitude!',
                    '(Materials will be provided, but you can also bring your own)'
                ];
            bringBulletList.innerHTML = bringItems.map(item => `<li>${escapeHtml(item)}</li>`).join('');
        }

        // Right Column Cards - Venue (NO MAP)
        if (venueNameText) {
            venueNameText.textContent = ev.location || 'Art Studio';
        }
        if (venueAddressText) {
            venueAddressText.textContent = ev.venue || ev.location || '123 Creative Street, Bandra West, Mumbai, Maharashtra 400050';
        }

        // Attendees Card
        const count = ev.attendeesCount || 32;
        if (attendeesCardHeading) {
            attendeesCardHeading.textContent = `Attendees (${count})`;
        }
        if (attendeesAvatarsRow) {
            const avatars = (ev.attendeeAvatars && ev.attendeeAvatars.length > 0)
                ? ev.attendeeAvatars.slice(0, 4)
                : ['/images/artist_profile_avatar.png', '/images/artist_rohan_avatar.png', '/images/avatar_riya.png', '/images/artist_kavya_avatar.png'];
            const extra = (count > 4) ? (count - 4) : 28;

            attendeesAvatarsRow.innerHTML = `
                ${avatars.map(av => `<img src="${escapeHtml(av)}" alt="Attendee" class="attendee-avatar" onerror="this.src='/images/artist_profile_avatar.png'">`).join('')}
                <span class="attendee-more-badge">+${extra}</span>
            `;
        }

        // Guidelines
        if (guidelinesBulletList) {
            const guideItems = (ev.guidelines && ev.guidelines.length > 0)
                ? ev.guidelines
                : [
                    'Be respectful and supportive',
                    'Follow the venue rules',
                    'No plagiarism or misuse of content',
                    'Keep the space clean',
                    'Have fun and be creative!'
                ];
            guidelinesBulletList.innerHTML = guideItems.map(item => `<li>${escapeHtml(item)}</li>`).join('');
        }

        // Quote
        if (quoteText) {
            quoteText.textContent = ev.quote || 'Art is better when shared.';
        }
    }

    async function handleRegistration() {
        if (!currentEvent) return;

        if (currentEvent.registered) {
            showToast('You are already registered for this event!');
            return;
        }

        btnRegisterNow.disabled = true;
        btnRegisterNow.textContent = 'Registering...';

        try {
            const res = await ArtSphereAPI.registerForEvent(eventId, currentUserId);
            currentEvent.registered = true;
            if (res.attendeesCount) {
                currentEvent.attendeesCount = res.attendeesCount;
            }

            // Update UI elements
            updateRegisterButtonState(true);
            if (eventAttendeesText) {
                eventAttendeesText.textContent = `${currentEvent.attendeesCount} going`;
            }
            if (attendeesCardHeading) {
                attendeesCardHeading.textContent = `Attendees (${currentEvent.attendeesCount})`;
            }

            // Trigger In-App Confirmation Modal (page_33.jpg)
            if (popupEventName) {
                popupEventName.textContent = currentEvent.title || 'Event';
            }
            if (registrationModal) {
                registrationModal.style.display = 'flex';
            }
        } catch (err) {
            console.error('Registration failed:', err);
            showToast(err.message || 'Failed to complete registration');
            btnRegisterNow.disabled = false;
            btnRegisterNow.textContent = 'Register Now';
        }
    }

    function updateRegisterButtonState(isRegistered) {
        if (!btnRegisterNow) return;
        if (isRegistered) {
            btnRegisterNow.classList.add('registered');
            btnRegisterNow.innerHTML = 'Registered &check;';
            btnRegisterNow.disabled = false; // allowed to click to see already registered toast
        } else {
            btnRegisterNow.classList.remove('registered');
            btnRegisterNow.textContent = 'Register Now';
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
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }
});
