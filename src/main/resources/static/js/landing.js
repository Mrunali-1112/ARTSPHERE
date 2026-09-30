/**
 * ArtSphere Landing Page Interactions & Navigation
 * Editorial Neo-Brutalist Architecture
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Universal Capsule Nav Mobile Drawer Toggle
    const navWrapper = document.getElementById('navWrapper');
    const navMobileToggle = document.getElementById('navMobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (navMobileToggle && navWrapper) {
        navMobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navWrapper.classList.toggle('menu-open');
            const isOpen = navWrapper.classList.contains('menu-open');
            navMobileToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close on document click outside
        document.addEventListener('click', (e) => {
            if (navWrapper.classList.contains('menu-open') && !navWrapper.contains(e.target)) {
                navWrapper.classList.remove('menu-open');
            }
        });
    }

    // 2. Discipline Card Keyboard Accessibility & Analytics
    const disciplineCards = document.querySelectorAll('.art-discipline-card');
    disciplineCards.forEach(card => {
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
});
