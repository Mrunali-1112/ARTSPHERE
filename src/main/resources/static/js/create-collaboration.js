/**
 * ArtSphere — Create Collaboration & Publish Pitch Controller
 * Handles Form Validation, Purpose Selection, Authentication Resolution,
 * Real REST Backend Integration, and Mobile Drawer Controls.
 */

document.addEventListener('DOMContentLoaded', async () => {
    let currentUserId = 101;
    let currentUser = null;

    // Initialize Navigation & UI Controls
    initSidebarControls();
    initUserDropdown();
    initPurposeSelection();
    initCharacterCounter();

    // Authenticate / Resolve Current User
    await resolveCurrentUser();

    // Attach Form Submission & Validation Handlers
    initFormSubmission();
    initLiveValidation();

    /**
     * 1. Authenticate & Resolve Current User
     */
    async function resolveCurrentUser() {
        try {
            let user = null;
            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCurrentUser === 'function') {
                user = await window.ArtSphereAPI.getCurrentUser();
            } else if (window.api && typeof window.api.getCurrentUser === 'function') {
                user = await window.api.getCurrentUser();
            } else {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const json = await res.json();
                    user = json.data;
                }
            }

            if (!user) {
                const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
                if (stored) {
                    try { user = JSON.parse(stored); } catch (_) {}
                }
            }

            if (user) {
                currentUser = user;
                if (user.id) currentUserId = user.id;

                const displayName = user.fullName || user.username || user.name || 'Mrunali S.';
                const displayRole = user.artistType || user.bio || 'Digital Artist';
                const displayAvatar = user.profilePicture || user.avatarUrl || '/images/user_avatar_nav.png';

                // Update Sidebar User Card
                const sidebarUserName = document.getElementById('sidebarUserName');
                const sidebarUserRole = document.getElementById('sidebarUserRole');
                const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
                const sidebarProfileCard = document.getElementById('sidebarProfileCard');

                if (sidebarUserName) sidebarUserName.textContent = displayName;
                if (sidebarUserRole) sidebarUserRole.textContent = displayRole;
                if (sidebarUserAvatar) sidebarUserAvatar.src = displayAvatar;
                if (sidebarProfileCard) sidebarProfileCard.href = `/pages/artist-profile.html?id=${user.id || 101}`;

                // Update Top Header Avatar & Dropdown
                const dropdownUserName = document.getElementById('dropdownUserName');
                const dropdownUserBio = document.getElementById('dropdownUserBio');
                const headerUserAvatar = document.getElementById('headerUserAvatar');

                if (dropdownUserName) dropdownUserName.textContent = displayName;
                if (dropdownUserBio) dropdownUserBio.textContent = displayRole;
                if (headerUserAvatar) headerUserAvatar.src = displayAvatar;
            }
        } catch (err) {
            console.warn('User session check completed with fallback user:', err);
        }
    }

    /**
     * 2. Selectable Purpose Cards
     */
    function initPurposeSelection() {
        const purposeCardsGrid = document.getElementById('purposeCardsGrid');
        const selectedPurposeInput = document.getElementById('selectedPurpose');

        if (!purposeCardsGrid || !selectedPurposeInput) return;

        purposeCardsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.purpose-card');
            if (!card) return;

            // Remove active state from all cards
            purposeCardsGrid.querySelectorAll('.purpose-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const purposeValue = card.getAttribute('data-purpose') || 'Work on a Project';
            selectedPurposeInput.value = purposeValue;

            // Clear any inline purpose error
            const purposeError = document.getElementById('purposeError');
            if (purposeError) {
                purposeError.textContent = '';
                purposeError.classList.remove('visible');
            }
        });
    }

    /**
     * 3. Character Counter for Narrative Description
     */
    function initCharacterCounter() {
        const descInput = document.getElementById('collabDescription');
        const countDisplay = document.getElementById('descCharCount');

        if (!descInput || !countDisplay) return;

        descInput.addEventListener('input', () => {
            const len = descInput.value.length;
            countDisplay.textContent = `${len}/2000`;
            if (len >= 1950) {
                countDisplay.style.color = '#D13B68';
            } else {
                countDisplay.style.color = '#8E829C';
            }
        });
    }

    /**
     * 4. Real-time Live Field Validation
     */
    function initLiveValidation() {
        const titleInput = document.getElementById('collabTitle');
        const skillsInput = document.getElementById('collabSkills');
        const descInput = document.getElementById('collabDescription');
        const urlInput = document.getElementById('collabRefUrl');

        if (titleInput) {
            titleInput.addEventListener('input', () => {
                if (titleInput.value.trim().length > 0) {
                    clearError(titleInput, 'titleError');
                }
            });
        }

        if (skillsInput) {
            skillsInput.addEventListener('input', () => {
                if (skillsInput.value.trim().length > 0) {
                    clearError(skillsInput, 'skillsError');
                }
            });
        }

        if (descInput) {
            const container = descInput.closest('.textarea-container');
            descInput.addEventListener('input', () => {
                if (descInput.value.trim().length > 0) {
                    if (container) container.classList.remove('input-error');
                    const errEl = document.getElementById('descError');
                    if (errEl) {
                        errEl.textContent = '';
                        errEl.classList.remove('visible');
                    }
                }
            });
        }

        if (urlInput) {
            urlInput.addEventListener('input', () => {
                const val = urlInput.value.trim();
                if (!val || isValidUrl(val)) {
                    clearError(urlInput, 'urlError');
                }
            });
        }
    }

    function clearError(inputEl, errorId) {
        if (inputEl) inputEl.classList.remove('input-error');
        const err = document.getElementById(errorId);
        if (err) {
            err.textContent = '';
            err.classList.remove('visible');
        }
    }

    function setError(inputEl, errorId, message) {
        if (inputEl) inputEl.classList.add('input-error');
        const err = document.getElementById(errorId);
        if (err) {
            err.textContent = message;
            err.classList.add('visible');
        }
    }

    function isValidUrl(str) {
        try {
            const url = new URL(str);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    /**
     * 5. Form Submission Flow & REST API Persistence
     */
    function initFormSubmission() {
        const form = document.getElementById('createCollabForm');
        const submitBtn = document.getElementById('submitCollabBtn');
        const selectedPurposeInput = document.getElementById('selectedPurpose');

        if (!form || !submitBtn) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous errors
            clearAllErrors();

            const title = (document.getElementById('collabTitle').value || '').trim();
            const purpose = (selectedPurposeInput ? selectedPurposeInput.value : 'Work on a Project').trim();
            const skills = (document.getElementById('collabSkills').value || '').trim();
            const collaborationType = (document.getElementById('collabType').value || '').trim() || 'Short Film';
            const availability = (document.getElementById('collabAvailability').value || '').trim() || 'Flexible';
            const peopleNeeded = (document.getElementById('collabPeopleNeeded').value || '').trim() || '1-2 collaborators';
            const location = (document.getElementById('collabLocation').value || '').trim() || 'Mumbai, MH';
            const description = (document.getElementById('collabDescription').value || '').trim();
            const referenceUrl = (document.getElementById('collabRefUrl').value || '').trim();
            const tags = (document.getElementById('collabTags').value || '').trim();

            let isValid = true;

            // Validate Title
            if (!title) {
                setError(document.getElementById('collabTitle'), 'titleError', 'Please enter a collaboration title.');
                isValid = false;
            } else if (title.length > 200) {
                setError(document.getElementById('collabTitle'), 'titleError', 'Title cannot exceed 200 characters.');
                isValid = false;
            }

            // Validate Purpose
            if (!purpose) {
                const purposeErr = document.getElementById('purposeError');
                if (purposeErr) {
                    purposeErr.textContent = 'Please choose a collaboration purpose.';
                    purposeErr.classList.add('visible');
                }
                isValid = false;
            }

            // Validate Skills
            if (!skills) {
                setError(document.getElementById('collabSkills'), 'skillsError', 'Please specify the skills or disciplines needed.');
                isValid = false;
            }

            // Validate Description
            if (!description) {
                const descEl = document.getElementById('collabDescription');
                const container = descEl ? descEl.closest('.textarea-container') : null;
                if (container) container.classList.add('input-error');
                const descErr = document.getElementById('descError');
                if (descErr) {
                    descErr.textContent = 'Please detail your project vision and narrative.';
                    descErr.classList.add('visible');
                }
                isValid = false;
            }

            // Validate Reference URL if provided
            if (referenceUrl && !isValidUrl(referenceUrl)) {
                setError(document.getElementById('collabRefUrl'), 'urlError', 'Please enter a valid URL starting with http:// or https://');
                isValid = false;
            }

            if (!isValid) {
                showToast('Please correct the highlighted fields before submitting.', 'error');
                return;
            }

            // Construct payload matching Spring Boot DTO (CollaborationCreateRequest)
            const payload = {
                title,
                description,
                purpose,
                skills,
                collaborationType,
                availability,
                peopleNeeded,
                location,
                referenceUrl,
                tags
            };

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>Publishing Pitch...</span>
                <span class="btn-spinner"></span>
            `;

            try {
                let createdPost = null;

                // Send to backend via ArtSphereAPI / api
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.createCollaboration === 'function') {
                    createdPost = await window.ArtSphereAPI.createCollaboration(payload, currentUserId);
                } else if (window.api && typeof window.api.createCollaboration === 'function') {
                    createdPost = await window.api.createCollaboration(payload, currentUserId);
                } else {
                    const response = await fetch(`/api/collaborations?userId=${encodeURIComponent(currentUserId)}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();
                    if (!response.ok) {
                        throw new Error(result.message || 'Failed to create collaboration pitch');
                    }
                    createdPost = result.data;
                }

                showToast('Collaboration call published successfully!', 'success');

                setTimeout(() => {
                    const newId = (createdPost && createdPost.id) ? createdPost.id : '';
                    if (newId) {
                        window.location.href = `/pages/collaboration-details.html?id=${newId}`;
                    } else {
                        window.location.href = '/pages/collaborators.html';
                    }
                }, 800);

            } catch (err) {
                console.error('Error creating collaboration:', err);
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <span class="btn-text">Publish Collaboration Call</span>
                    <svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                `;
                showToast(err.message || 'Failed to publish collaboration. Please try again.', 'error');
            }
        });
    }

    function clearAllErrors() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.field-error-msg').forEach(el => {
            el.textContent = '';
            el.classList.remove('visible');
        });
    }

    /**
     * 6. User Dropdown & Sidebar Mobile Controls
     */
    function initUserDropdown() {
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const userDropdownPanel = document.getElementById('userDropdownPanel');
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');

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

        const handleLogout = async () => {
            if (confirm('Are you sure you want to log out of ArtSphere?')) {
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } catch (_) {}
                sessionStorage.clear();
                localStorage.removeItem('currentUser');
                window.location.href = '/pages/login.html';
            }
        };

        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
        if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);
    }

    function initSidebarControls() {
        const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
        const sidebar = document.getElementById('dashboardSidebar');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');

        if (mobileMenuTrigger && sidebar) {
            mobileMenuTrigger.addEventListener('click', () => {
                sidebar.classList.add('sidebar-open');
                if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
            });
        }

        const closeSidebar = () => {
            if (sidebar) sidebar.classList.remove('sidebar-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        };

        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
        if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);
    }

    /**
     * 7. Custom Toast Notifications
     */
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer') || document.body;
        const toast = document.createElement('div');
        toast.className = `custom-toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 20);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }
});
