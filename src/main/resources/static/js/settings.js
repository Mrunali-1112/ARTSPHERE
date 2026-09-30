/**
 * ArtSphere — Studio Settings Script
 * Pastel Purple / Lavender Creative Dashboard Visual Language
 * Handles authenticated user data binding, settings toggles persistence,
 * terms modal, mobile sidebar drawer, and session sign out.
 */

document.addEventListener('DOMContentLoaded', () => {
    initSettingsPage();
});

async function initSettingsPage() {
    // 1. Mobile Sidebar Navigation Drawer & Backdrop
    initSidebarDrawer();

    // 2. User Avatar Dropdown Menu
    initAvatarDropdown();

    // 3. Search Bar Interaction
    initSearchBar();

    // 4. Load & Bind Current Authenticated User Profile
    await loadUserProfile();

    // 5. Studio Settings Toggles (Persistence & Feedback)
    initSettingsToggles();

    // 6. Terms of Fellowship Modal
    initTermsModal();

    // 7. Sign Out / Session Handling
    initLogoutHandlers();
}

/**
 * Mobile Sidebar Drawer Controls
 */
function initSidebarDrawer() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebar = document.getElementById('dashboardSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    const openDrawer = () => {
        if (sidebar) sidebar.classList.add('drawer-open');
        if (backdrop) backdrop.classList.add('show');
    };

    const closeDrawer = () => {
        if (sidebar) sidebar.classList.remove('drawer-open');
        if (backdrop) backdrop.classList.remove('show');
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
}

/**
 * Header Profile Avatar Dropdown Menu
 */
function initAvatarDropdown() {
    const topAvatarBtn = document.getElementById('topAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');

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

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && userDropdownPanel.classList.contains('active')) {
                userDropdownPanel.classList.remove('active');
            }
        });
    }
}

/**
 * Top Search Bar
 */
function initSearchBar() {
    const topSearchInput = document.getElementById('topSearchInput');
    if (topSearchInput) {
        topSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = topSearchInput.value.trim();
                if (query) {
                    window.location.href = `/pages/discover.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
}

/**
 * Load and bind authenticated user data to page elements
 */
async function loadUserProfile() {
    let currentUser = null;

    // A. Check localStorage & sessionStorage
    try {
        const stored = localStorage.getItem('currentUser') || 
                       sessionStorage.getItem('currentUser') || 
                       sessionStorage.getItem('artsphere_user');
        if (stored) {
            currentUser = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Could not parse stored session:', e);
    }

    // B. Query backend /api/auth/me if not cached
    const apiObj = window.api || window.ArtSphereAPI;
    if ((!currentUser || !currentUser.id) && apiObj && typeof apiObj.getCurrentUser === 'function') {
        try {
            const authUser = await apiObj.getCurrentUser();
            if (authUser) {
                currentUser = authUser;
            }
        } catch (e) {
            console.warn('Could not fetch /api/auth/me:', e);
        }
    }

    // C. If user has an ID, fetch their rich artist profile
    const userId = currentUser?.id || 101;
    let artistProfile = null;
    if (apiObj && typeof apiObj.getArtistProfile === 'function') {
        try {
            artistProfile = await apiObj.getArtistProfile(userId);
        } catch (e) {
            console.warn('Could not fetch artist profile for ID:', userId, e);
        }
    }

    // Merge available data (prioritizing full profile info)
    const user = Object.assign({}, currentUser || {}, artistProfile || {});

    const fullName = user.fullName || user.username || 'Aanya Deshmukh';
    const roleOrDiscipline = (user.artistType || user.role || 'Visual Artist').toUpperCase();
    const bioText = user.bio || 'Illustrator and digital artist exploring everyday moments through art.';
    const avatarUrl = user.profilePicture || '/images/user_avatar_nav.png';
    const locationName = (user.location || 'Mumbai').toUpperCase();
    
    let memberYear = '2024';
    if (user.createdAt) {
        try {
            memberYear = new Date(user.createdAt).getFullYear() || '2024';
        } catch (_) {}
    }

    // 1. Right Column Profile Plaque
    const plaqueName = document.getElementById('settingsUserName');
    const plaqueRole = document.getElementById('settingsUserRole');
    const plaqueBio = document.getElementById('settingsUserBio');
    const plaqueAvatar = document.getElementById('settingsUserAvatar');
    const plaqueMeta = document.getElementById('settingsUserMeta');
    const btnViewProfile = document.getElementById('btnViewPublicProfile');

    if (plaqueName) plaqueName.textContent = fullName;
    if (plaqueRole) plaqueRole.textContent = roleOrDiscipline;
    if (plaqueBio) plaqueBio.textContent = bioText;
    if (plaqueAvatar && avatarUrl) plaqueAvatar.src = avatarUrl;
    if (plaqueMeta) plaqueMeta.innerHTML = `${locationName} &bull; SINCE ${memberYear}`;
    if (btnViewProfile) btnViewProfile.href = `/pages/artist-profile.html?id=${userId}`;

    // 2. Left Column Settings Items Links
    const linkManagePortfolio = document.getElementById('linkManagePortfolio');
    if (linkManagePortfolio) {
        linkManagePortfolio.href = `/pages/portfolio.html?id=${userId}`;
    }

    // 3. Left Sidebar Profile Mini-Card
    const sidebarAvatar = document.getElementById('sidebarUserAvatar');
    const sidebarName = document.getElementById('sidebarUserName');
    const sidebarRole = document.getElementById('sidebarUserRole');
    const sidebarCard = document.getElementById('sidebarProfileCard');

    if (sidebarAvatar && avatarUrl) sidebarAvatar.src = avatarUrl;
    if (sidebarName) sidebarName.textContent = fullName.split(' ')[0] || fullName;
    if (sidebarRole) sidebarRole.textContent = user.artistType || user.role || 'Visual Artist';
    if (sidebarCard) sidebarCard.href = `/pages/artist-profile.html?id=${userId}`;

    // 4. Header Avatar & Dropdown Elements
    const headerAvatar = document.getElementById('headerUserAvatar');
    const dropdownName = document.getElementById('dropdownUserName');
    const dropdownBio = document.getElementById('dropdownUserBio');
    const dropdownProfile = document.getElementById('dropdownProfileLink');
    const dropdownPortfolio = document.getElementById('dropdownPortfolioLink');

    if (headerAvatar && avatarUrl) headerAvatar.src = avatarUrl;
    if (dropdownName) dropdownName.textContent = fullName;
    if (dropdownBio) dropdownBio.textContent = user.artistType || user.bio || 'Creative Studio';
    if (dropdownProfile) dropdownProfile.href = `/pages/artist-profile.html?id=${userId}`;
    if (dropdownPortfolio) dropdownPortfolio.href = `/pages/portfolio.html?id=${userId}`;

    // 5. Universal Footer Profile Link
    const footerProfileLink = document.getElementById('footerProfileLink');
    if (footerProfileLink) {
        footerProfileLink.href = `/pages/artist-profile.html?id=${userId}`;
    }
}

/**
 * Privacy & Studio Reach Toggles with Persistence and Toast Feedback
 */
function initSettingsToggles() {
    // Toggle 1: Public Studio Profile
    const togglePublic = document.getElementById('togglePublicProfile');
    if (togglePublic) {
        const savedPublic = localStorage.getItem('artsphere_public_profile');
        if (savedPublic !== null) {
            togglePublic.checked = (savedPublic === 'true');
        }
        togglePublic.addEventListener('change', () => {
            localStorage.setItem('artsphere_public_profile', togglePublic.checked);
            showToast(
                togglePublic.checked 
                    ? 'Studio profile is now publicly discoverable in artist directories' 
                    : 'Studio profile is now private to verified network members'
            );
        });
    }

    // Toggle 2: Open to Direct Collaboration Inquiries
    const toggleCollab = document.getElementById('toggleCollabInquiries');
    if (toggleCollab) {
        const savedCollab = localStorage.getItem('artsphere_collab_inquiries');
        if (savedCollab !== null) {
            toggleCollab.checked = (savedCollab === 'true');
        }
        toggleCollab.addEventListener('change', () => {
            localStorage.setItem('artsphere_collab_inquiries', toggleCollab.checked);
            showToast(
                toggleCollab.checked 
                    ? 'Direct collaboration pitches are now accepted' 
                    : 'Direct collaboration pitches are temporarily paused'
            );
        });
    }

    // Toggle 3: Display Location on Studio Works
    const toggleLocation = document.getElementById('toggleLocationBadge');
    if (toggleLocation) {
        const savedLoc = localStorage.getItem('artsphere_location_badge');
        if (savedLoc !== null) {
            toggleLocation.checked = (savedLoc === 'true');
        }
        toggleLocation.addEventListener('change', () => {
            localStorage.setItem('artsphere_location_badge', toggleLocation.checked);
            showToast(
                toggleLocation.checked 
                    ? 'City badge is displayed on your works, events, and postings' 
                    : 'City badge is hidden on public studio works'
            );
        });
    }
}

/**
 * Terms of Fellowship & Creator Rights Modal
 */
function initTermsModal() {
    const rowTerms = document.getElementById('rowTermsPolicies');
    const termsModal = document.getElementById('termsModal');
    const btnClose = document.getElementById('btnCloseTermsModal');
    const btnAgree = document.getElementById('btnUnderstandTerms');

    const openModal = () => {
        if (termsModal) {
            termsModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    const closeModal = () => {
        if (termsModal) {
            termsModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    if (rowTerms) {
        rowTerms.addEventListener('click', openModal);
        rowTerms.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal();
            }
        });
    }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnAgree) {
        btnAgree.addEventListener('click', () => {
            closeModal();
            showToast('Creator bill of rights acknowledged');
        });
    }

    if (termsModal) {
        termsModal.addEventListener('click', (e) => {
            if (e.target === termsModal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && termsModal.style.display === 'flex') {
                closeModal();
            }
        });
    }
}

/**
 * Sign Out / Logout Flow
 */
function initLogoutHandlers() {
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    const rowLogOut = document.getElementById('rowLogOut');
    const btnSignOutStudio = document.getElementById('btnSignOutStudio');

    const handleLogout = async (e) => {
        if (e) e.stopPropagation();
        const confirmed = confirm('Are you sure you want to end your ArtSphere studio session?');
        if (!confirmed) return;

        try {
            const apiObj = window.api || window.ArtSphereAPI;
            if (apiObj && typeof apiObj.logout === 'function') {
                await apiObj.logout();
            } else {
                await fetch('/api/auth/logout', { method: 'POST' });
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear all local session tokens
            sessionStorage.clear();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('artsphere_user');
            window.location.href = '/pages/login.html';
        }
    };

    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
    if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);
    if (rowLogOut) rowLogOut.addEventListener('click', handleLogout);
    if (btnSignOutStudio) btnSignOutStudio.addEventListener('click', handleLogout);
}

/**
 * Show a sleek toast feedback notification
 */
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'dashboard-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-pill ${type}`;
    toast.innerHTML = `<span>✦</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}
