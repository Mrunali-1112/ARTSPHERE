/**
 * ArtSphere — Settings Details / Edit Profile Script (Editorial Neo-Brutalist)
 * Handles artist profile editing, avatar updating, skills tagging, and live preview
 */

document.addEventListener('DOMContentLoaded', () => {
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

    // 2. Elements
    const avatarPreview = document.getElementById('avatarPreview');
    const inputAvatarUrl = document.getElementById('inputAvatarUrl');
    const sampleChips = document.querySelectorAll('.sample-chip');
    const headerUserAvatar = document.getElementById('headerUserAvatar');

    const editProfileForm = document.getElementById('editProfileForm');
    const inputFullName = document.getElementById('inputFullName');
    const inputUsername = document.getElementById('inputUsername');
    const inputBio = document.getElementById('inputBio');
    const bioCounter = document.getElementById('bioCounter');
    const selectArtistType = document.getElementById('selectArtistType');
    const inputSkills = document.getElementById('inputSkills');
    const inputLocation = document.getElementById('inputLocation');
    const inputPortfolioLink = document.getElementById('inputPortfolioLink');
    const inputInstagram = document.getElementById('inputInstagram');
    const inputBehance = document.getElementById('inputBehance');
    const inputYoutube = document.getElementById('inputYoutube');

    const btnSaveChanges = document.getElementById('btnSaveChanges');
    let currentUserId = 101;

    // 3. Avatar URL & Sample Chips
    if (inputAvatarUrl) {
        inputAvatarUrl.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url && avatarPreview) {
                avatarPreview.src = url;
            }
        });
    }

    sampleChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const avatarUrl = chip.dataset.avatar;
            if (avatarUrl) {
                if (avatarPreview) avatarPreview.src = avatarUrl;
                if (inputAvatarUrl) inputAvatarUrl.value = avatarUrl;
            }
        });
    });

    // 4. Bio Character Counter
    const updateBioCounter = () => {
        if (!inputBio || !bioCounter) return;
        const len = inputBio.value.length;
        bioCounter.textContent = `${len} / 300`;
    };
    if (inputBio) {
        inputBio.addEventListener('input', updateBioCounter);
    }

    // 5. Toast Helper
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
        }, 2800);
    }

    // 6. Load Initial Profile Data
    const loadProfileData = async () => {
        try {
            const apiObj = window.api || window.ArtSphereAPI;
            if (!apiObj || typeof apiObj.getArtistProfile !== 'function') return;

            const profile = await apiObj.getArtistProfile(currentUserId);
            if (!profile) return;

            if (inputFullName && profile.fullName) inputFullName.value = profile.fullName;
            if (inputUsername && profile.username) inputUsername.value = profile.username;
            if (inputBio && profile.bio) {
                inputBio.value = profile.bio;
                updateBioCounter();
            }

            if (selectArtistType && (profile.artForm || profile.artistType)) {
                const typeVal = profile.artForm || profile.artistType;
                for (let i = 0; i < selectArtistType.options.length; i++) {
                    if (selectArtistType.options[i].value.toLowerCase() === typeVal.toLowerCase()) {
                        selectArtistType.selectedIndex = i;
                        break;
                    }
                }
            }

            if (inputSkills) {
                if (Array.isArray(profile.skills)) {
                    inputSkills.value = profile.skills.join(', ');
                } else if (profile.skills) {
                    inputSkills.value = profile.skills;
                }
            }

            if (inputLocation && profile.location) {
                inputLocation.value = profile.location;
            }

            if (inputPortfolioLink) {
                inputPortfolioLink.value = profile.portfolioUrl || `https://${profile.username || 'aanya'}.carrd.co`;
            }

            if (inputInstagram) {
                inputInstagram.value = profile.instagram || `@${profile.username || 'aanya'}_art`;
            }

            const photoUrl = profile.avatarUrl || profile.profilePicture || '/images/user_avatar_nav.png';
            if (avatarPreview) avatarPreview.src = photoUrl;
            if (inputAvatarUrl) inputAvatarUrl.value = photoUrl;

        } catch (err) {
            console.error('Failed to load profile details:', err);
        }
    };

    // 7. Save Profile Handler
    const handleSaveChanges = async (e) => {
        if (e) e.preventDefault();

        const fullName = inputFullName ? inputFullName.value.trim() : '';
        if (!fullName) {
            showToast('Please enter your full name', 'error');
            if (inputFullName) inputFullName.focus();
            return;
        }

        const btnText = btnSaveChanges.querySelector('.btn-save-text');
        const spinner = btnSaveChanges.querySelector('.btn-save-spinner');

        try {
            btnSaveChanges.disabled = true;
            if (btnText) btnText.textContent = 'Saving...';
            if (spinner) spinner.style.display = 'inline-block';

            const payload = {
                fullName: fullName,
                username: inputUsername ? inputUsername.value.trim() : undefined,
                bio: inputBio ? inputBio.value.trim() : '',
                location: inputLocation ? inputLocation.value.trim() : '',
                artistType: selectArtistType ? selectArtistType.value : 'Visual Artist',
                skills: inputSkills ? inputSkills.value.trim() : '',
                profilePicture: avatarPreview ? avatarPreview.src : undefined
            };

            const apiObj = window.api || window.ArtSphereAPI;
            if (apiObj && typeof apiObj.updateArtistProfile === 'function') {
                const updated = await apiObj.updateArtistProfile(currentUserId, payload);
                showToast('Creator profile updated successfully!');

                if (headerUserAvatar && updated && (updated.avatarUrl || updated.profilePicture)) {
                    headerUserAvatar.src = updated.avatarUrl || updated.profilePicture;
                }
            } else {
                showToast('Profile updated locally!');
            }
        } catch (error) {
            console.error('Error saving profile changes:', error);
            showToast(error.message || 'Failed to update profile.', 'error');
        } finally {
            btnSaveChanges.disabled = false;
            if (btnText) btnText.textContent = 'Save Changes';
            if (spinner) spinner.style.display = 'none';
        }
    };

    if (editProfileForm) editProfileForm.addEventListener('submit', handleSaveChanges);
    if (btnSaveChanges) btnSaveChanges.addEventListener('click', handleSaveChanges);

    loadProfileData();
});
