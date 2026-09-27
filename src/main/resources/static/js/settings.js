/**
 * ArtSphere — Settings Script (Editorial Neo-Brutalist)
 * Handles account settings, public profile toggles, terms modal, and logout
 */

document.addEventListener('DOMContentLoaded', () => {
    initSettingsPage();
});

async function initSettingsPage() {
    // 1. Universal Nav Dropdown & Mobile Toggle
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');
    const navMobileToggle = document.getElementById('navMobileToggle');
    const navLinks = document.getElementById('navLinks');

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
        });
    }

    // 2. Load User Profile for Plaque
    try {
        const apiObj = window.api || window.ArtSphereAPI;
        if (apiObj && typeof apiObj.getArtistProfile === 'function') {
            const profile = await apiObj.getArtistProfile(101);
            if (profile) {
                const nameEl = document.getElementById('settingsUserName');
                const roleEl = document.getElementById('settingsUserRole');
                const bioEl = document.getElementById('settingsUserBio');
                const avatarEl = document.getElementById('settingsUserAvatar');

                if (nameEl && profile.fullName) nameEl.textContent = profile.fullName;
                if (roleEl && profile.artistType) roleEl.textContent = profile.artistType;
                if (bioEl && profile.bio) bioEl.textContent = profile.bio;
                if (avatarEl && profile.profilePicture) avatarEl.src = profile.profilePicture;
            }
        }
    } catch (err) {
        console.warn('Could not load profile for plaque:', err);
    }

    // 3. Public profile toggle persistence
    const togglePublic = document.getElementById('togglePublicProfile');
    if (togglePublic) {
        const savedPref = localStorage.getItem('artsphere_public_profile');
        if (savedPref !== null) {
            togglePublic.checked = (savedPref === 'true');
        }
        togglePublic.addEventListener('change', () => {
            localStorage.setItem('artsphere_public_profile', togglePublic.checked);
            showToast(togglePublic.checked ? 'Studio profile is now publicly discoverable' : 'Studio profile is now private to members');
        });
    }

    // 4. Terms modal
    const rowTerms = document.getElementById('rowTermsPolicies');
    const termsModal = document.getElementById('termsModal');
    const btnCloseTerms = document.getElementById('btnCloseTermsModal');
    const btnUnderstandTerms = document.getElementById('btnUnderstandTerms');

    if (rowTerms && termsModal) {
        rowTerms.addEventListener('click', () => {
            termsModal.style.display = 'flex';
        });
    }

    const closeTermsModal = () => {
        if (termsModal) termsModal.style.display = 'none';
    };

    if (btnCloseTerms) btnCloseTerms.addEventListener('click', closeTermsModal);
    if (btnUnderstandTerms) btnUnderstandTerms.addEventListener('click', closeTermsModal);
    if (termsModal) {
        termsModal.addEventListener('click', (e) => {
            if (e.target === termsModal) closeTermsModal();
        });
    }

    // 5. Logout flow
    const rowLogOut = document.getElementById('rowLogOut');
    const logoutBtn = document.getElementById('logoutBtn');

    const handleLogout = async () => {
        const confirmed = confirm('Are you sure you want to log out of ArtSphere?');
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
            sessionStorage.clear();
            window.location.href = '/pages/login.html';
        }
    };

    if (rowLogOut) rowLogOut.addEventListener('click', handleLogout);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-pill ${type}`;
    toast.innerHTML = `<span>✦</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 2600);
}
