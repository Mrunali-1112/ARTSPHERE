/**
 * ArtSphere – Settings Module JS
 * Source of Truth: Approved page_21.jpg and page_23.jpg references
 */

document.addEventListener('DOMContentLoaded', () => {
    initSettingsPage();
});

function initSettingsPage() {
    // 1. Back button
    const btnBack = document.getElementById('btnBack');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/pages/artist-profile.html?id=101';
            }
        });
    }

    // 2. Public profile toggle persistence
    const togglePublic = document.getElementById('togglePublicProfile');
    if (togglePublic) {
        const savedPref = localStorage.getItem('artsphere_public_profile');
        if (savedPref !== null) {
            togglePublic.checked = (savedPref === 'true');
        }
        togglePublic.addEventListener('change', () => {
            localStorage.setItem('artsphere_public_profile', togglePublic.checked);
        });
    }

    // 3. Terms modal
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

    // 4. Logout flow
    const rowLogOut = document.getElementById('rowLogOut');
    if (rowLogOut) {
        rowLogOut.addEventListener('click', async () => {
            const confirmed = confirm('Are you sure you want to log out of ArtSphere?');
            if (!confirmed) return;

            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.logout === 'function') {
                    await window.ArtSphereAPI.logout();
                } else {
                    await fetch('/api/auth/logout', { method: 'POST' });
                }
            } catch (err) {
                console.error('Logout error:', err);
            } finally {
                sessionStorage.clear();
                window.location.href = '/pages/login.html';
            }
        });
    }
}
