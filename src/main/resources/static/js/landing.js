/**
 * ArtSphere Landing Page Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            window.location.href = '/pages/login.html';
        });
    }

    // Category card click redirects to signup/explore
    const cards = document.querySelectorAll('.art-card');
    cards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            window.location.href = '/pages/signup.html';
        });
    });
});
