/**
 * ArtSphere Account Setup Wizard Interactions
 */
document.addEventListener('DOMContentLoaded', async () => {
    let currentStep = 1;
    const totalSteps = 5;

    // Elements
    const stepItems = document.querySelectorAll('.step-item');
    const wizardPanes = document.querySelectorAll('.wizard-step-pane');
    const wizardBackBtn = document.getElementById('wizardBackBtn');
    const bioTextarea = document.getElementById('setupBio');
    const bioCounter = document.getElementById('bioCounter');
    const setupFullName = document.getElementById('setupFullName');
    const setupLocation = document.getElementById('setupLocation');

    // Load initial user data from session or backend
    let currentUser = null;
    try {
        const stored = sessionStorage.getItem('artsphere_user');
        if (stored) {
            currentUser = JSON.parse(stored);
        } else if (window.ArtSphereAPI) {
            currentUser = await window.ArtSphereAPI.getCurrentUser();
        }
    } catch (e) {
        console.warn('Could not load user profile', e);
    }

    if (currentUser) {
        if (setupFullName && currentUser.fullName) {
            setupFullName.value = currentUser.fullName;
        }
    }

    // Bio Counter
    if (bioTextarea && bioCounter) {
        bioTextarea.addEventListener('input', () => {
            const count = bioTextarea.value.length;
            bioCounter.textContent = `${count} / 150`;
        });
    }

    // Artist Type Tiles (Step 1)
    const artistTiles = document.querySelectorAll('.artist-tile');
    let selectedArtistType = 'Musician';
    artistTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            artistTiles.forEach(t => t.classList.remove('selected'));
            tile.classList.add('selected');
            selectedArtistType = tile.getAttribute('data-type');
        });
    });

    // Skills selection (Step 2)
    const skillCards = document.querySelectorAll('.skill-pill-card');
    skillCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
        });
    });

    // Experience Pills (Step 2)
    const expPills = document.querySelectorAll('.exp-pill');
    expPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const parent = pill.parentElement;
            if (parent && parent.classList.contains('experience-pills-row') && !parent.closest('#paneStep4')) {
                parent.querySelectorAll('.exp-pill').forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
            } else {
                pill.classList.toggle('selected');
            }
        });
    });

    // Step navigation buttons
    document.getElementById('btnContinueStep1')?.addEventListener('click', () => goToStep(2));
    document.getElementById('btnBackToStep1')?.addEventListener('click', () => goToStep(1));

    document.getElementById('btnContinueStep2')?.addEventListener('click', () => goToStep(3));
    document.getElementById('btnBackToStep2')?.addEventListener('click', () => goToStep(2));

    document.getElementById('btnContinueStep3')?.addEventListener('click', () => goToStep(4));
    document.getElementById('btnBackToStep3')?.addEventListener('click', () => goToStep(3));

    document.getElementById('btnContinueStep4')?.addEventListener('click', () => {
        updateStep5Summary();
        goToStep(5);
    });

    document.getElementById('btnFinishExplore')?.addEventListener('click', () => {
        window.location.href = '/pages/landing.html';
    });

    // Top-left Back button
    wizardBackBtn?.addEventListener('click', () => {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        } else {
            window.location.href = '/pages/login.html';
        }
    });

    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;
        currentStep = step;

        // Update Stepper circles
        stepItems.forEach(item => {
            const s = parseInt(item.getAttribute('data-step'), 10);
            item.classList.remove('active', 'completed');
            if (s === currentStep) {
                item.classList.add('active');
            } else if (s < currentStep) {
                item.classList.add('completed');
                item.querySelector('.step-circle').innerHTML = '&#10003;';
            } else {
                item.querySelector('.step-circle').textContent = s;
            }
        });

        // Show corresponding pane
        wizardPanes.forEach((pane, idx) => {
            pane.classList.toggle('active', idx + 1 === currentStep);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateStep5Summary() {
        const name = setupFullName?.value.trim() || (currentUser ? currentUser.fullName : 'Artist');
        const loc = setupLocation?.value.trim() || 'Mumbai, Maharashtra';
        const username = currentUser ? currentUser.username : 'artist';

        const summaryName = document.getElementById('summaryName');
        const summaryRole = document.getElementById('summaryRole');
        const summaryLoc = document.getElementById('summaryLoc');

        if (summaryName) summaryName.textContent = name;
        if (summaryRole) summaryRole.textContent = `Artist &bull; ${selectedArtistType}`;
        if (summaryLoc) summaryLoc.innerHTML = `📍 ${loc} &nbsp;|&nbsp; 🔗 @${username}`;
    }
});
