/**
 * ArtSphere – Settings Details / Edit Profile Controller
 * Matches Approved Design Reference: page_24.jpg
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const btnHeaderBack = document.getElementById('btnHeaderBack');
    const btnPageBack = document.getElementById('btnPageBack');
    const userHeaderAvatar = document.getElementById('userHeaderAvatar');

    const avatarPreview = document.getElementById('avatarPreview');
    const btnCameraBadge = document.getElementById('btnCameraBadge');
    const btnChangePhoto = document.getElementById('btnChangePhoto');
    const fileAvatarInput = document.getElementById('fileAvatarInput');

    const editProfileForm = document.getElementById('editProfileForm');
    const inputFullName = document.getElementById('inputFullName');
    const inputUsername = document.getElementById('inputUsername');
    const inputEmail = document.getElementById('inputEmail');
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
    const toastMessage = document.getElementById('toastMessage');
    const toastText = document.getElementById('toastText');

    let currentUserId = 101;
    let toastTimeout = null;

    // 2. Navigation
    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/pages/settings.html';
        }
    };
    if (btnHeaderBack) btnHeaderBack.addEventListener('click', goBack);
    if (btnPageBack) btnPageBack.addEventListener('click', goBack);

    // 3. Bio Character Counter
    const updateBioCounter = () => {
        if (!inputBio || !bioCounter) return;
        const len = inputBio.value.length;
        bioCounter.textContent = `${len}/150`;
    };
    if (inputBio) {
        inputBio.addEventListener('input', updateBioCounter);
    }

    // 4. Photo Picker Handlers
    const triggerFilePicker = () => {
        if (fileAvatarInput) fileAvatarInput.click();
    };
    if (btnChangePhoto) btnChangePhoto.addEventListener('click', triggerFilePicker);
    if (btnCameraBadge) btnCameraBadge.addEventListener('click', triggerFilePicker);

    if (fileAvatarInput) {
        fileAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target.result;
                    if (avatarPreview) avatarPreview.src = result;
                    if (userHeaderAvatar) userHeaderAvatar.src = result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 5. Toast Helper
    const showToast = (message, isError = false) => {
        if (!toastMessage) return;
        if (toastTimeout) clearTimeout(toastTimeout);

        if (toastText) toastText.textContent = message;
        toastMessage.classList.remove('toast-error');
        if (isError) toastMessage.classList.add('toast-error');

        toastMessage.classList.add('show');
        toastTimeout = setTimeout(() => {
            toastMessage.classList.remove('show');
        }, 3200);
    };

    // 6. Load Initial Profile Data
    const loadProfileData = async () => {
        try {
            // Check logged in user or query param
            const urlParams = new URLSearchParams(window.location.search);
            const paramId = urlParams.get('id') || urlParams.get('userId');
            if (paramId) {
                currentUserId = parseInt(paramId, 10);
            } else {
                const currentUser = (window.ArtSphereAPI && typeof window.ArtSphereAPI.getCurrentUser === 'function')
                    ? window.ArtSphereAPI.getCurrentUser()
                    : null;
                if (currentUser && currentUser.id) {
                    currentUserId = currentUser.id;
                }
            }

            if (!window.ArtSphereAPI || typeof window.ArtSphereAPI.getArtistProfile !== 'function') {
                return;
            }

            const profile = await window.ArtSphereAPI.getArtistProfile(currentUserId);
            if (!profile) return;

            // Populate form fields
            if (inputFullName && profile.fullName) inputFullName.value = profile.fullName;
            if (inputUsername && profile.username) inputUsername.value = profile.username;
            if (inputEmail) {
                inputEmail.value = (profile.username ? `${profile.username.toLowerCase()}@example.com` : 'mrunali.shinde@example.com');
            }
            if (inputBio && profile.bio) {
                inputBio.value = profile.bio;
                updateBioCounter();
            }

            if (selectArtistType && (profile.artForm || profile.artistType)) {
                const typeVal = profile.artForm || profile.artistType;
                let found = false;
                for (let i = 0; i < selectArtistType.options.length; i++) {
                    if (selectArtistType.options[i].value.toLowerCase() === typeVal.toLowerCase()) {
                        selectArtistType.selectedIndex = i;
                        found = true;
                        break;
                    }
                }
                if (!found && typeVal) {
                    const opt = document.createElement('option');
                    opt.value = typeVal;
                    opt.textContent = typeVal;
                    opt.selected = true;
                    selectArtistType.appendChild(opt);
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
                inputPortfolioLink.value = profile.portfolioUrl || (profile.username ? `https://${profile.username}.carrd.co` : 'https://mrunaliart.carrd.co');
            }

            if (inputInstagram) {
                inputInstagram.value = profile.instagram || (profile.username ? `@${profile.username}` : '@mrunali_art');
            }

            if (inputBehance) {
                inputBehance.value = profile.behance || (profile.username ? `${profile.username}_design` : '');
            }

            if (inputYoutube) {
                inputYoutube.value = profile.youtube || '';
            }

            const photoUrl = profile.avatarUrl || profile.profilePicture || '/images/user_avatar_nav.png';
            if (avatarPreview) avatarPreview.src = photoUrl;
            if (userHeaderAvatar) userHeaderAvatar.src = photoUrl;

        } catch (err) {
            console.error('Failed to load profile details:', err);
        }
    };

    // 7. Save Profile Handler
    const handleSaveChanges = async (e) => {
        if (e) e.preventDefault();

        const fullName = inputFullName ? inputFullName.value.trim() : '';
        if (!fullName) {
            showToast('Please enter your full name', true);
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
                artistType: selectArtistType ? selectArtistType.value : 'Illustrator',
                skills: inputSkills ? inputSkills.value.trim() : '',
                profilePicture: avatarPreview ? avatarPreview.src : undefined
            };

            if (window.ArtSphereAPI && typeof window.ArtSphereAPI.updateArtistProfile === 'function') {
                const updated = await window.ArtSphereAPI.updateArtistProfile(currentUserId, payload);
                showToast('Profile updated successfully!');

                if (userHeaderAvatar && updated && (updated.avatarUrl || updated.profilePicture)) {
                    userHeaderAvatar.src = updated.avatarUrl || updated.profilePicture;
                }
            } else {
                showToast('Profile updated locally!');
            }
        } catch (error) {
            console.error('Error saving profile changes:', error);
            showToast(error.message || 'Failed to update profile. Please try again.', true);
        } finally {
            btnSaveChanges.disabled = false;
            if (btnText) btnText.textContent = 'Save Changes';
            if (spinner) spinner.style.display = 'none';
        }
    };

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleSaveChanges);
    }
    if (btnSaveChanges) {
        btnSaveChanges.addEventListener('click', handleSaveChanges);
    }

    // Initialize
    loadProfileData();
});
