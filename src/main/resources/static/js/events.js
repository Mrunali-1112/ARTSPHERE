/**
 * ArtSphere — Events Exploration JavaScript (Module 9 - page_31.jpg)
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

    // DOM Elements
    const searchInput = document.getElementById('eventSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const categoriesScrollRow = document.getElementById('categoriesScrollRow');
    const resetCategoryFilter = document.getElementById('resetCategoryFilter');
    const featuredEventSection = document.getElementById('featuredEventSection');
    const featuredBannerCard = document.getElementById('featuredBannerCard');
    const featuredCoverImg = document.getElementById('featuredCoverImg');
    const featuredTypeBadge = document.getElementById('featuredTypeBadge');
    const featuredDateBadge = document.getElementById('featuredDateBadge');
    const featuredTitle = document.getElementById('featuredTitle');
    const featuredDesc = document.getElementById('featuredDesc');
    const featuredTime = document.getElementById('featuredTime');
    const featuredVenue = document.getElementById('featuredVenue');
    const featuredOrgAvatar = document.getElementById('featuredOrgAvatar');
    const featuredOrgName = document.getElementById('featuredOrgName');
    const featuredAttendees = document.getElementById('featuredAttendees');
    const btnFeaturedDetails = document.getElementById('btnFeaturedDetails');
    const btnFeaturedRegister = document.getElementById('btnFeaturedRegister');
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsCountBadge = document.getElementById('eventsCountBadge');
    const upcomingSectionHeading = document.getElementById('upcomingSectionHeading');

    // Central Plus Menu
    const centralPlusBtn = document.getElementById('centralPlusBtn');
    const plusMenuBackdrop = document.getElementById('plusMenuBackdrop');
    const btnClosePlusMenu = document.getElementById('btnClosePlusMenu');

    // State
    let activeCategory = 'All';
    let searchQuery = '';
    let searchDebounceTimeout = null;
    let allEvents = [];

    // Initialize
    loadEvents();
    setupEventListeners();

    function setupEventListeners() {
        // Search Input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim();
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
                }
                clearTimeout(searchDebounceTimeout);
                searchDebounceTimeout = setTimeout(() => {
                    loadEvents();
                }, 300);
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.style.display = 'none';
                loadEvents();
            });
        }

        // Category Pills
        if (categoriesScrollRow) {
            categoriesScrollRow.addEventListener('click', (e) => {
                const pill = e.target.closest('.cat-pill');
                if (!pill) return;
                const cat = pill.getAttribute('data-category');
                if (!cat) return;

                document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activeCategory = cat;
                loadEvents();
            });
        }

        if (resetCategoryFilter) {
            resetCategoryFilter.addEventListener('click', (e) => {
                e.preventDefault();
                activeCategory = 'All';
                document.querySelectorAll('.cat-pill').forEach(p => {
                    p.classList.toggle('active', p.getAttribute('data-category') === 'All');
                });
                loadEvents();
            });
        }

        // Featured Register Button
        if (btnFeaturedRegister) {
            btnFeaturedRegister.addEventListener('click', async (e) => {
                e.stopPropagation();
                const eventId = btnFeaturedRegister.getAttribute('data-id') || 801;
                await handleRegisterEvent(eventId, btnFeaturedRegister);
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

    async function loadEvents() {
        try {
            renderLoadingState();
            const events = await ArtSphereAPI.getEvents(activeCategory, searchQuery, currentUserId);
            allEvents = events || [];
            renderEvents(allEvents);
        } catch (err) {
            console.error('Failed to load events:', err);
            renderErrorState(err.message);
        }
    }

    function renderEvents(list) {
        if (!list || list.length === 0) {
            if (featuredEventSection) {
                featuredEventSection.style.display = 'none';
            }
            if (eventsCountBadge) {
                eventsCountBadge.textContent = '0 events';
            }
            eventsGrid.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-icon">&empty;</div>
                    <h3>No events found</h3>
                    <p>Try searching for different art forms or reset your filters.</p>
                </div>
            `;
            return;
        }

        // Identify featured event
        const featured = list.find(e => e.isFeatured) || list[0];

        // Display featured section only on 'All' tab when not searching
        if (featured && activeCategory === 'All' && !searchQuery) {
            if (featuredEventSection) {
                featuredEventSection.style.display = 'block';
                if (featuredCoverImg) featuredCoverImg.src = featured.coverImage || featured.imageUrl || '/images/event_detail_banner_watercolor.png';
                if (featuredTypeBadge) featuredTypeBadge.textContent = featured.eventType || 'Workshop';
                if (featuredDateBadge) {
                    const parsed = parseDateParts(featured.eventDate);
                    featuredDateBadge.innerHTML = `
                        <span class="date-month">${escapeHtml(parsed.month)}</span>
                        <span class="date-day">${escapeHtml(parsed.day)}</span>
                    `;
                }
                if (featuredTitle) featuredTitle.textContent = featured.title || 'Watercolor Basics Workshop';
                if (featuredDesc) featuredDesc.textContent = featured.description || '';
                if (featuredTime) featuredTime.textContent = featured.eventTime || '4:00 PM - 6:00 PM (IST)';
                if (featuredVenue) featuredVenue.textContent = featured.venue || featured.location || 'Art Studio, Mumbai';
                if (featuredOrgAvatar) featuredOrgAvatar.src = featured.organizerAvatar || '/images/comm_creative_souls_avatar.png';
                if (featuredOrgName) featuredOrgName.textContent = featured.organizer || 'Creative Souls';
                if (featuredAttendees) {
                    featuredAttendees.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>${featured.attendeesCount || 32} going</span>
                    `;
                }
                if (btnFeaturedDetails) {
                    btnFeaturedDetails.href = `/pages/event-details.html?id=${featured.id}`;
                }
                if (btnFeaturedRegister) {
                    btnFeaturedRegister.setAttribute('data-id', featured.id);
                    if (featured.registered) {
                        btnFeaturedRegister.classList.add('registered');
                        btnFeaturedRegister.innerHTML = 'Registered &check;';
                    } else {
                        btnFeaturedRegister.classList.remove('registered');
                        btnFeaturedRegister.textContent = 'Register Now';
                    }
                }
            }
        } else if (featuredEventSection) {
            featuredEventSection.style.display = 'none';
        }

        // Filter list for grid: exclude featured banner event when in 'All' category without search
        const gridItems = (activeCategory === 'All' && !searchQuery && featured)
            ? list.filter(e => e.id !== featured.id)
            : list;

        if (eventsCountBadge) {
            eventsCountBadge.textContent = `${list.length} event${list.length === 1 ? '' : 's'}`;
        }

        if (gridItems.length === 0) {
            eventsGrid.innerHTML = `
                <div class="empty-state-card">
                    <p>All matching events are featured above.</p>
                </div>
            `;
            return;
        }

        eventsGrid.innerHTML = gridItems.map(ev => renderEventCard(ev)).join('');

        // Attach event listeners to card register buttons
        eventsGrid.querySelectorAll('.btn-card-register').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                await handleRegisterEvent(id, btn);
            });
        });
    }

    function renderEventCard(ev) {
        const isReg = ev.registered;
        const regClass = isReg ? 'registered' : '';
        const regText = isReg ? 'Registered &check;' : 'Register';
        const cover = ev.imageUrl || ev.coverImage || '/images/comm_event_watercolor.png';
        const avatars = (ev.attendeeAvatars && ev.attendeeAvatars.length > 0)
            ? ev.attendeeAvatars.slice(0, 4)
            : ['/images/artist_profile_avatar.png', '/images/artist_rohan_avatar.png', '/images/avatar_riya.png'];
        const extraCount = (ev.attendeesCount && ev.attendeesCount > 4) ? (ev.attendeesCount - 4) : 20;

        return `
            <div class="event-card" data-id="${ev.id}">
                <div class="event-card-top">
                    <img src="${escapeHtml(cover)}" alt="${escapeHtml(ev.title)}" class="event-card-img" onerror="this.src='/images/comm_event_watercolor.png'">
                    <span class="card-type-badge">${escapeHtml(ev.eventType || 'Workshop')}</span>
                </div>
                <div class="event-card-body">
                    <div class="card-date-time-row">
                        <span class="card-date-time-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            ${escapeHtml(ev.eventDate || '15 Mar 2024')}
                        </span>
                        <span class="card-date-time-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ${escapeHtml(ev.eventTime || '4:00 PM - 6:00 PM')}
                        </span>
                    </div>

                    <h3 class="card-title">${escapeHtml(ev.title)}</h3>
                    <p class="card-desc">${escapeHtml(ev.description || '')}</p>

                    <div class="card-venue-row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>${escapeHtml(ev.venue || ev.location || 'Art Studio, Mumbai')}</span>
                    </div>

                    <div class="card-attendees-row">
                        <div class="card-organizer-info">
                            <img src="${escapeHtml(ev.organizerAvatar || '/images/comm_creative_souls_avatar.png')}" alt="Organizer" class="card-org-avatar" onerror="this.src='/images/artist_profile_avatar.png'">
                            <span class="card-org-name">${escapeHtml(ev.organizer || 'Creative Souls')}</span>
                        </div>
                        <div class="avatar-stack-wrap">
                            ${avatars.map(av => `<img src="${escapeHtml(av)}" alt="Going" class="stack-avatar" onerror="this.src='/images/artist_profile_avatar.png'">`).join('')}
                            <span class="stack-plus-badge">+${extraCount}</span>
                        </div>
                    </div>

                    <div class="card-action-row">
                        <a href="/pages/event-details.html?id=${ev.id}" class="btn-card-details">View Details</a>
                        <button class="btn-card-register ${regClass}" data-id="${ev.id}">
                            ${regText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async function handleRegisterEvent(eventId, btnElement) {
        if (btnElement.classList.contains('registered')) {
            showToast('You are already registered for this event!');
            return;
        }

        btnElement.disabled = true;
        btnElement.textContent = 'Registering...';

        try {
            const res = await ArtSphereAPI.registerForEvent(eventId, currentUserId);
            btnElement.classList.add('registered');
            btnElement.innerHTML = 'Registered &check;';
            showToast(res.message || "You're registered!");

            // Update item in local list
            const item = allEvents.find(e => String(e.id) === String(eventId));
            if (item) {
                item.registered = true;
                if (res.attendeesCount) item.attendeesCount = res.attendeesCount;
            }
        } catch (err) {
            console.error('Registration error:', err);
            showToast(err.message || 'Failed to register');
            btnElement.disabled = false;
            btnElement.textContent = 'Register';
        }
    }

    function parseDateParts(dateStr) {
        if (!dateStr) return { month: 'MAR', day: '15' };
        const parts = dateStr.trim().split(' ');
        if (parts.length >= 2) {
            return {
                day: parts[0],
                month: parts[1].toUpperCase()
            };
        }
        return { month: 'EVENT', day: '01' };
    }

    function renderLoadingState() {
        eventsGrid.innerHTML = `
            <div class="loading-state-wrapper">
                <div class="loading-spinner"></div>
                <p>Loading events...</p>
            </div>
        `;
    }

    function renderErrorState(message) {
        eventsGrid.innerHTML = `
            <div class="error-state-card">
                <p>Failed to load events: ${escapeHtml(message)}</p>
                <button class="btn-retry" onclick="location.reload()">Retry</button>
            </div>
        `;
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
