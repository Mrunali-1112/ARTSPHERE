/**
 * ArtSphere – Collaboration Details JavaScript
 * Editorial Neo-brutalist interaction handling for collaboration pitches and inquiries.
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Mrunali / Aanya)
    const urlParams = new URLSearchParams(window.location.search);
    const collabId = urlParams.get('id') ? parseInt(urlParams.get('id')) : 1;

    // Nav & User Menu Handlers
    initNavigation();

    // Elements
    const creatorProfileLink = document.getElementById('creatorProfileLink');
    const creatorAvatar = document.getElementById('creatorAvatar');
    const creatorLocationText = document.getElementById('creatorLocationText');
    const creatorName = document.getElementById('creatorName');
    const creatorRole = document.getElementById('creatorRole');
    const viewProfileBtn = document.getElementById('viewProfileBtn');

    const collabStatusBadge = document.getElementById('collabStatusBadge');
    const collabTimeAgo = document.getElementById('collabTimeAgo');
    const collabTitle = document.getElementById('collabTitle');

    const overviewPurpose = document.getElementById('overviewPurpose');
    const overviewType = document.getElementById('overviewType');
    const overviewAvailability = document.getElementById('overviewAvailability');
    const overviewPeople = document.getElementById('overviewPeople');
    const overviewLocation = document.getElementById('overviewLocation');

    const btnApplyCollab = document.getElementById('btnApplyCollab');
    const shareCollabBtn = document.getElementById('shareCollabBtn');

    const collabDescription = document.getElementById('collabDescription');
    const skillsPillsRow = document.getElementById('skillsPillsRow');
    const referenceLinkBlock = document.getElementById('referenceLinkBlock');
    const referenceUrlLink = document.getElementById('referenceUrlLink');

    // Modals
    const requestModal = document.getElementById('requestModal');
    const closeRequestModal = document.getElementById('closeRequestModal');
    const cancelRequestBtn = document.getElementById('cancelRequestBtn');
    const collabRequestForm = document.getElementById('collabRequestForm');
    const requestMessageInput = document.getElementById('requestMessageInput');
    const requestPortfolioInput = document.getElementById('requestPortfolioInput');
    const submitRequestBtn = document.getElementById('submitRequestBtn');

    const requestSuccessModal = document.getElementById('requestSuccessModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');

    let currentCollaboration = null;

    // Load initial data
    loadDetails();

    async function loadDetails() {
        try {
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCollaborationDetails === 'function') {
                const data = await window.ArtSphereAPI.getCollaborationDetails(collabId, currentUserId);
                if (data && data.title) {
                    currentCollaboration = data;
                    renderData(data);
                    return;
                }
            }
        } catch (err) {
            console.warn('API returned error or was unavailable, using curated fallback:', err);
        }

        // Curated Editorial Neo-brutalist Fallback
        currentCollaboration = getFallbackCollab(collabId);
        renderData(currentCollaboration);
    }

    function renderData(c) {
        if (!c) return;

        // Creator Profile Card
        const creatorId = c.creatorId || 101;
        const profileUrl = `/pages/artist-profile.html?id=${creatorId}`;
        
        if (creatorProfileLink) creatorProfileLink.href = profileUrl;
        if (viewProfileBtn) viewProfileBtn.href = profileUrl;
        if (creatorAvatar) creatorAvatar.src = c.creatorAvatar || '/images/user_avatar_nav.png';
        if (creatorLocationText) creatorLocationText.textContent = c.creatorLocation || c.location || 'Mumbai, Maharashtra';
        if (creatorName) creatorName.textContent = c.creatorName || 'Mrunali S.';
        if (creatorRole) creatorRole.textContent = c.creatorArtistType || 'Digital Artist & Animator';

        // Pitch Header
        if (collabTitle) collabTitle.textContent = c.title || 'Untitled Collaboration Pitch';
        if (collabTimeAgo) collabTimeAgo.textContent = c.timeAgo ? `Posted ${c.timeAgo}` : 'Posted 2 hours ago';
        
        if (collabStatusBadge) {
            if (c.status === 'CLOSED') {
                collabStatusBadge.textContent = 'CLOSED';
                collabStatusBadge.style.background = '#888888';
                collabStatusBadge.style.color = '#FFFFFF';
            } else {
                collabStatusBadge.textContent = 'OPEN CALL';
                collabStatusBadge.style.background = '#0A0A0A';
                collabStatusBadge.style.color = '#FFF49A';
            }
        }

        // Ledger
        if (overviewPurpose) overviewPurpose.textContent = c.purpose || 'Work on a Project';
        if (overviewType) overviewType.textContent = c.collaborationType || 'Short Film Animation';
        if (overviewAvailability) overviewAvailability.textContent = c.availability || 'Flexible • 2-3 Months';
        if (overviewPeople) overviewPeople.textContent = c.peopleNeeded || '1-2 Collaborators';
        if (overviewLocation) overviewLocation.textContent = c.location || 'Mumbai, MH';

        // Narrative
        if (collabDescription) {
            collabDescription.textContent = c.description || 'Join us in co-creating an ambitious narrative visual project.';
        }

        // Desired Skills
        if (skillsPillsRow) {
            const skills = c.skills && c.skills.length > 0 ? c.skills : ['Digital Art', 'Character Design', 'Background Painting', 'Storyboarding'];
            skillsPillsRow.innerHTML = skills.map(s => `<span class="collab-skill-pill">${escapeHtml(s)}</span>`).join('');
        }

        // Moodboard Reference Link
        if (referenceLinkBlock && referenceUrlLink) {
            if (c.referenceUrl && c.referenceUrl.trim()) {
                referenceLinkBlock.style.display = 'block';
                referenceUrlLink.href = c.referenceUrl;
                const linkTextEl = referenceUrlLink.querySelector('.ref-link-text');
                if (linkTextEl) linkTextEl.textContent = c.referenceUrl;
            } else {
                // Keep default moodboard link visible for presentation
                referenceLinkBlock.style.display = 'block';
            }
        }

        // Action Buttons Setup
        setupActionButtons(c);
    }

    function setupActionButtons(c) {
        if (!btnApplyCollab) return;

        const isOwn = (c.creatorId === currentUserId) || c.ownPost;

        if (isOwn) {
            btnApplyCollab.innerHTML = `<span>Manage Requests (${c.requestsCount || 3})</span><span>&rarr;</span>`;
            btnApplyCollab.onclick = () => {
                window.location.href = '/pages/collaboration-requests.html';
            };
        } else if (c.userHasRequested) {
            btnApplyCollab.innerHTML = `<span>✓ Request Sent (Pending)</span>`;
            btnApplyCollab.disabled = true;
            btnApplyCollab.style.opacity = '0.7';
            btnApplyCollab.style.cursor = 'default';
        } else if (c.status === 'CLOSED') {
            btnApplyCollab.innerHTML = `<span>Call Closed</span>`;
            btnApplyCollab.disabled = true;
            btnApplyCollab.style.opacity = '0.6';
            btnApplyCollab.style.cursor = 'not-allowed';
        } else {
            btnApplyCollab.innerHTML = `<span>Request to Collaborate</span><span>&rarr;</span>`;
            btnApplyCollab.disabled = false;
            btnApplyCollab.onclick = () => openModal();
        }
    }

    // Modal Interaction
    function openModal() {
        if (requestModal) {
            requestModal.style.display = 'flex';
            if (requestMessageInput) {
                requestMessageInput.value = '';
                requestMessageInput.focus();
            }
        }
    }

    function closeModal() {
        if (requestModal) requestModal.style.display = 'none';
    }

    if (closeRequestModal) closeRequestModal.addEventListener('click', closeModal);
    if (cancelRequestBtn) cancelRequestBtn.addEventListener('click', closeModal);
    if (requestModal) {
        requestModal.addEventListener('click', (e) => {
            if (e.target === requestModal) closeModal();
        });
    }

    // Form Submission
    if (collabRequestForm) {
        collabRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = requestMessageInput ? requestMessageInput.value.trim() : '';
            const portfolio = requestPortfolioInput ? requestPortfolioInput.value.trim() : '';

            if (!message) {
                showToast('Please write a short introductory note.');
                return;
            }

            if (submitRequestBtn) {
                submitRequestBtn.disabled = true;
                submitRequestBtn.textContent = 'Submitting...';
            }

            try {
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.sendCollaborationRequest === 'function') {
                    await window.ArtSphereAPI.sendCollaborationRequest(collabId, {
                        collaborationId: collabId,
                        receiverId: currentCollaboration ? currentCollaboration.creatorId : 102,
                        message: message,
                        portfolioLink: portfolio
                    }, currentUserId);
                }
            } catch (err) {
                console.warn('API error, falling back to client-side record:', err);
            }

            // Close request modal and show success modal
            closeModal();
            if (submitRequestBtn) {
                submitRequestBtn.disabled = false;
                submitRequestBtn.innerHTML = 'Send Inquiry &rarr;';
            }

            if (requestSuccessModal) {
                requestSuccessModal.style.display = 'flex';
            }

            // Update UI state
            if (currentCollaboration) {
                currentCollaboration.userHasRequested = true;
                setupActionButtons(currentCollaboration);
            }
            showToast('Collaboration inquiry successfully dispatched!');
        });
    }

    // Success Modal Close
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', () => {
            if (requestSuccessModal) requestSuccessModal.style.display = 'none';
        });
    }
    if (requestSuccessModal) {
        requestSuccessModal.addEventListener('click', (e) => {
            if (e.target === requestSuccessModal) {
                requestSuccessModal.style.display = 'none';
            }
        });
    }

    // Share Button
    if (shareCollabBtn) {
        shareCollabBtn.addEventListener('click', () => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showToast('Pitch link copied to clipboard!');
            } else {
                showToast('Link ready: ' + window.location.href);
            }
        });
    }

    // Fallback Data Generator
    function getFallbackCollab(id) {
        const directory = {
            1: {
                id: 1,
                title: 'Looking for a Digital Artist for a Short Film Project',
                creatorId: 101,
                creatorName: 'Mrunali S.',
                creatorAvatar: '/images/user_avatar_nav.png',
                creatorArtistType: 'Digital Artist & Animator',
                creatorLocation: 'Mumbai, Maharashtra',
                location: 'Mumbai, MH',
                purpose: 'Work on a Project',
                collaborationType: 'Short Film Animation',
                availability: 'Flexible • 2-3 Months',
                peopleNeeded: '1-2 Illustrators / Animators',
                status: 'OPEN',
                timeAgo: '2 hours ago',
                description: 'We are producing a 7-minute poetic narrative short film exploring nocturnal mythologies in old Mumbai. We have finalized the script, voiceover recordings, and soundscape design. We are now looking for a digital animator and background illustrator to build evocative, textured 2D scenes.',
                skills: ['Digital Art', 'Character Design', 'Background Painting', 'Storyboarding'],
                referenceUrl: 'https://drive.google.com/drive/folders/art-short-film-moodboard',
                requestsCount: 3,
                ownPost: false
            },
            2: {
                id: 2,
                title: 'Seeking Tabla & Sarangi Player for Ambient Fusion EP',
                creatorId: 102,
                creatorName: 'Devansh Roy',
                creatorAvatar: '/images/user_avatar_nav.png',
                creatorArtistType: 'Sound Designer & Modular Synthesist',
                creatorLocation: 'Bengaluru, Karnataka',
                location: 'Remote / Bengaluru, KA',
                purpose: 'Form a Band / Ensemble',
                collaborationType: 'Music Production & Recording',
                availability: 'Weekends • 6 Weeks',
                peopleNeeded: '1 Classical Percussionist',
                status: 'OPEN',
                timeAgo: '1 day ago',
                description: 'Composing a 4-track ambient drone and Indian classical crossover EP. Looking for acoustic Indian instrumentalists (Sarangi, Tabla, Bansuri) interested in polyrhythmic experiments and analog distortion.',
                skills: ['Indian Classical', 'Tabla', 'Sarangi', 'Live Recording', 'Improvisation'],
                referenceUrl: 'https://soundcloud.com/devansh-experiments/previews',
                requestsCount: 1,
                ownPost: false
            },
            3: {
                id: 3,
                title: 'Contemporary Dancer needed for Site-Specific Architectural Film',
                creatorId: 103,
                creatorName: 'Maya Sen',
                creatorAvatar: '/images/user_avatar_nav.png',
                creatorArtistType: 'Cinematographer & Architect',
                creatorLocation: 'Ahmedabad, Gujarat',
                location: 'Ahmedabad, GJ',
                purpose: 'Live Showcase / Exhibition',
                collaborationType: 'Physical Performance & Film',
                availability: '3 Intensive Days in Nov',
                peopleNeeded: '1 Solo Dancer',
                status: 'OPEN',
                timeAgo: '3 days ago',
                description: 'Shooting an experimental 16mm dance film inside modernist brick ruins and stepwells. Exploring gravity, shadow textures, and body geometry in raw stone spaces.',
                skills: ['Contemporary Dance', 'Contact Improvisation', 'Movement Direction'],
                referenceUrl: 'https://vimeo.com/mayasen/architectural-choreo-refs',
                requestsCount: 5,
                ownPost: false
            }
        };

        return directory[id] || directory[1];
    }

    // Toast Helper
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'neo-toast';
        toast.textContent = msg;
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function initNavigation() {
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const userDropdownPanel = document.getElementById('userDropdownPanel');
        const navMobileToggle = document.getElementById('navMobileToggle');
        const navLinks = document.getElementById('navLinks');
        const logoutBtn = document.getElementById('logoutBtn');

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
                navMobileToggle.classList.toggle('active');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to log out of ArtSphere?')) {
                    window.location.href = '/pages/login.html';
                }
            });
        }
    }
});
