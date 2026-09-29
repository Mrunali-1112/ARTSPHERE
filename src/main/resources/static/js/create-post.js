/**
 * ArtSphere — Create Post / Studio Publisher Controller
 * Modern Pastel-Purple Creative Workspace
 * Handles file preview via URL.createObjectURL, drag-and-drop, sample chips,
 * character counter, responsive navigation, and Spring Boot REST API integration.
 */

document.addEventListener('DOMContentLoaded', async () => {
    let currentUserId = 101;
    let currentUser = null;
    let selectedFile = null;
    let currentObjectUrl = null;
    let selectedSampleUrl = null;

    // 1. Navigation & Dropdown Controls
    initNavigationControls();
    await resolveCurrentUser();

    // 2. Media Upload & Preview Initialization
    initMediaUploadAndPreview();

    // 3. Quick Samples Chips
    initQuickSamples();

    // 4. Character Counter
    initCharacterCounter();

    // 5. Form Submission
    initFormSubmission();

    /**
     * =========================================================================
     * 1. Navigation & Authentication Resolution
     * =========================================================================
     */
    function initNavigationControls() {
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const userDropdownPanel = document.getElementById('userDropdownPanel');
        const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        const dashboardSidebar = document.getElementById('dashboardSidebar');
        const logoutBtn = document.getElementById('logoutBtn');
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

        // Toggle user menu dropdown
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

        // Mobile drawer open
        if (mobileMenuTrigger && dashboardSidebar && sidebarBackdrop) {
            mobileMenuTrigger.addEventListener('click', () => {
                dashboardSidebar.classList.add('mobile-open');
                sidebarBackdrop.classList.add('active');
            });
        }

        // Mobile drawer close
        const closeSidebar = () => {
            if (dashboardSidebar) dashboardSidebar.classList.remove('mobile-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        };

        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
        if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

        // Logout handlers
        const handleLogout = async () => {
            try {
                if (window.api && typeof window.api.logout === 'function') {
                    await window.api.logout();
                } else {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/pages/login.html';
                }
            } catch (err) {
                console.warn('Logout error:', err);
                window.location.href = '/pages/login.html';
            }
        };

        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
    }

    async function resolveCurrentUser() {
        try {
            let user = null;
            if (window.api && typeof window.api.getCurrentUser === 'function') {
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

                const name = user.fullName || user.username || user.name || 'Aanya D.';
                const role = user.artistType || user.bio || 'Visual Artist';
                const avatar = user.profilePicture || user.avatarUrl || '/images/user_avatar_nav.png';

                // Update Sidebar
                const sidebarUserName = document.getElementById('sidebarUserName');
                const sidebarUserRole = document.getElementById('sidebarUserRole');
                const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
                const sidebarProfileCard = document.getElementById('sidebarProfileCard');

                if (sidebarUserName) sidebarUserName.textContent = name;
                if (sidebarUserRole) sidebarUserRole.textContent = role;
                if (sidebarUserAvatar) sidebarUserAvatar.src = avatar;
                if (sidebarProfileCard) sidebarProfileCard.href = `/pages/artist-profile.html?id=${user.id || 101}`;

                // Update Header
                const dropdownUserName = document.getElementById('dropdownUserName');
                const dropdownUserBio = document.getElementById('dropdownUserBio');
                const headerUserAvatar = document.getElementById('headerUserAvatar');
                const dropdownProfileLink = document.getElementById('dropdownProfileLink');
                const dropdownPortfolioLink = document.getElementById('dropdownPortfolioLink');

                if (dropdownUserName) dropdownUserName.textContent = name;
                if (dropdownUserBio) dropdownUserBio.textContent = role;
                if (headerUserAvatar) headerUserAvatar.src = avatar;
                if (dropdownProfileLink) dropdownProfileLink.href = `/pages/artist-profile.html?id=${user.id || 101}`;
                if (dropdownPortfolioLink) dropdownPortfolioLink.href = `/pages/portfolio.html?id=${user.id || 101}`;
            }
        } catch (err) {
            console.warn('Session verification fallback to defaults:', err);
        }
    }

    /**
     * =========================================================================
     * 2. Media Upload & Live File Preview
     * =========================================================================
     */
    function initMediaUploadAndPreview() {
        const mediaDropzone = document.getElementById('mediaDropzone');
        const mediaFileInput = document.getElementById('mediaFileInput');
        const dropzonePrompt = document.getElementById('dropzonePrompt');
        const dropzonePreview = document.getElementById('dropzonePreview');
        const previewImg = document.getElementById('previewImg');
        const previewVideo = document.getElementById('previewVideo');
        const previewAudio = document.getElementById('previewAudio');
        const btnRemoveMedia = document.getElementById('btnRemoveMedia');
        const btnChangeMedia = document.getElementById('btnChangeMedia');
        const previewFilename = document.getElementById('previewFilename');
        const previewFilesize = document.getElementById('previewFilesize');
        const previewStatusPill = document.getElementById('previewStatusPill');
        const previewTriggerChip = document.getElementById('previewTriggerChip');
        const postImageUrlInput = document.getElementById('postImageUrlInput');

        if (!mediaDropzone || !mediaFileInput) return;

        // Click on dropzone opens real file picker (unless clicking buttons inside)
        mediaDropzone.addEventListener('click', (e) => {
            if (e.target.closest('#btnRemoveMedia') || e.target.closest('#btnChangeMedia')) return;
            mediaFileInput.click();
        });

        // Click on preview trigger chip
        if (previewTriggerChip) {
            previewTriggerChip.addEventListener('click', (e) => {
                e.stopPropagation();
                mediaFileInput.click();
            });
        }

        // Click on change media button
        if (btnChangeMedia) {
            btnChangeMedia.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                mediaFileInput.click();
            });
        }

        // File Input Change
        mediaFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                processSelectedFile(file);
            }
        });

        // Drag & Drop handlers
        ['dragenter', 'dragover'].forEach(eventName => {
            mediaDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                mediaDropzone.classList.add('drag-over');
            });
        });

        ['dragleave', 'dragend'].forEach(eventName => {
            mediaDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                mediaDropzone.classList.remove('drag-over');
            });
        });

        mediaDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mediaDropzone.classList.remove('drag-over');

            const dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                processSelectedFile(dt.files[0]);
            }
        });

        // Remove Media Action
        if (btnRemoveMedia) {
            btnRemoveMedia.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                clearMediaSelection();
            });
        }

        // Process & Validate Selected File
        function processSelectedFile(file) {
            // Validation: File Type (JPG, PNG, WEBP, MP4, MP3)
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
            const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

            const isImage = validImageTypes.includes(file.type) || file.type.startsWith('image/');
            const isVideo = validVideoTypes.includes(file.type) || file.type.startsWith('video/');
            const isAudio = validAudioTypes.includes(file.type) || file.type.startsWith('audio/');

            if (!isImage && !isVideo && !isAudio) {
                showToast('Unsupported file type. Please upload JPG, PNG, WEBP, MP4, or MP3.', 'error');
                return;
            }

            // Validation: Max File Size (20 MB)
            const MAX_SIZE = 20 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                showToast('File size exceeds the 20 MB limit. Please select a smaller file.', 'error');
                return;
            }

            // Clean up previous Object URL
            if (currentObjectUrl) {
                URL.revokeObjectURL(currentObjectUrl);
                currentObjectUrl = null;
            }

            // Reset sample selection state
            selectedSampleUrl = null;
            document.querySelectorAll('.sample-chip-pill').forEach(c => c.classList.remove('active'));

            // Store selected local file
            selectedFile = file;
            currentObjectUrl = URL.createObjectURL(file);

            if (postImageUrlInput) postImageUrlInput.value = '';

            // Update Preview DOM safely without broken images
            if (isImage) {
                if (previewImg) {
                    previewImg.style.display = 'block';
                    previewImg.onerror = () => {
                        previewImg.style.display = 'none';
                    };
                    // Use FileReader for instant reliable local display
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        if (re.target && re.target.result) {
                            previewImg.src = re.target.result;
                        }
                    };
                    reader.readAsDataURL(file);
                }
                if (previewVideo) {
                    previewVideo.src = '';
                    previewVideo.style.display = 'none';
                }
                if (previewAudio) {
                    previewAudio.src = '';
                    previewAudio.style.display = 'none';
                }
            } else if (isVideo) {
                if (previewVideo) {
                    previewVideo.src = currentObjectUrl;
                    previewVideo.style.display = 'block';
                }
                if (previewImg) {
                    previewImg.src = '';
                    previewImg.style.display = 'none';
                }
                if (previewAudio) {
                    previewAudio.src = '';
                    previewAudio.style.display = 'none';
                }
            } else if (isAudio) {
                if (previewAudio) {
                    previewAudio.src = currentObjectUrl;
                    previewAudio.style.display = 'block';
                }
                if (previewImg) {
                    previewImg.src = '';
                    previewImg.style.display = 'none';
                }
                if (previewVideo) {
                    previewVideo.src = '';
                    previewVideo.style.display = 'none';
                }
            }

            // Metadata info
            if (previewFilename) previewFilename.textContent = file.name;
            if (previewFilesize) {
                const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
                previewFilesize.textContent = `${sizeInMb} MB`;
            }
            if (previewStatusPill) previewStatusPill.textContent = 'Ready to publish';

            // Show Preview State
            if (dropzonePrompt) dropzonePrompt.style.display = 'none';
            if (dropzonePreview) dropzonePreview.style.display = 'flex';
        }

        // Clear preview & state
        function clearMediaSelection() {
            if (currentObjectUrl) {
                URL.revokeObjectURL(currentObjectUrl);
                currentObjectUrl = null;
            }
            selectedFile = null;
            selectedSampleUrl = null;
            if (mediaFileInput) mediaFileInput.value = '';
            if (postImageUrlInput) postImageUrlInput.value = '';

            if (previewImg) {
                previewImg.src = '';
                previewImg.style.display = 'none';
            }
            if (previewVideo) {
                previewVideo.src = '';
                previewVideo.style.display = 'none';
            }
            if (previewAudio) {
                previewAudio.src = '';
                previewAudio.style.display = 'none';
            }

            document.querySelectorAll('.sample-chip-pill').forEach(c => c.classList.remove('active'));

            if (dropzonePreview) dropzonePreview.style.display = 'none';
            if (dropzonePrompt) dropzonePrompt.style.display = 'flex';
        }
    }

    /**
     * =========================================================================
     * 3. Quick Samples Chips
     * =========================================================================
     */
    function initQuickSamples() {
        const sampleChips = document.querySelectorAll('.sample-chip-pill');
        const dropzonePrompt = document.getElementById('dropzonePrompt');
        const dropzonePreview = document.getElementById('dropzonePreview');
        const previewImg = document.getElementById('previewImg');
        const previewVideo = document.getElementById('previewVideo');
        const previewFilename = document.getElementById('previewFilename');
        const previewFilesize = document.getElementById('previewFilesize');
        const previewStatusPill = document.getElementById('previewStatusPill');
        const mediaFileInput = document.getElementById('mediaFileInput');
        const postImageUrlInput = document.getElementById('postImageUrlInput');

        sampleChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();

                const url = chip.dataset.url;
                const typeName = chip.dataset.type || 'Quick Sample';

                if (!url) return;

                // Clean up any uploaded file object URL
                if (currentObjectUrl) {
                    URL.revokeObjectURL(currentObjectUrl);
                    currentObjectUrl = null;
                }
                selectedFile = null;
                if (mediaFileInput) mediaFileInput.value = '';

                // Active chip style
                sampleChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                selectedSampleUrl = url;
                if (postImageUrlInput) postImageUrlInput.value = url;

                // Display sample in preview frame
                if (previewImg) {
                    previewImg.src = url;
                    previewImg.style.display = 'block';
                }
                if (previewVideo) {
                    previewVideo.src = '';
                    previewVideo.style.display = 'none';
                }

                if (previewFilename) previewFilename.textContent = `Sample: ${typeName}`;
                if (previewFilesize) previewFilesize.textContent = 'Curated Asset';
                if (previewStatusPill) previewStatusPill.textContent = 'Sample Ready';

                if (dropzonePrompt) dropzonePrompt.style.display = 'none';
                if (dropzonePreview) dropzonePreview.style.display = 'flex';
            });
        });
    }

    /**
     * =========================================================================
     * 4. Character Counter
     * =========================================================================
     */
    function initCharacterCounter() {
        const captionInput = document.getElementById('postCaptionInput');
        const charCounter = document.getElementById('charCounter');

        if (!captionInput || !charCounter) return;

        captionInput.addEventListener('input', () => {
            const length = captionInput.value.length;
            charCounter.textContent = `${length} / 500`;

            if (length >= 500) {
                charCounter.className = 'char-count-pill limit';
            } else if (length >= 450) {
                charCounter.className = 'char-count-pill warn';
            } else {
                charCounter.className = 'char-count-pill';
            }
        });
    }

    /**
     * =========================================================================
     * 5. Form Submission & Spring Boot REST API Integration
     * =========================================================================
     */
    function initFormSubmission() {
        const form = document.getElementById('createPostForm');
        const captionInput = document.getElementById('postCaptionInput');
        const artFormSelect = document.getElementById('postArtFormSelect');
        const tagsInput = document.getElementById('postTagsInput');
        const btnSubmit = document.getElementById('btnSubmitPost');
        const postImageUrlInput = document.getElementById('postImageUrlInput');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate Caption
            const caption = captionInput ? captionInput.value.trim() : '';
            if (!caption) {
                showToast('Please enter your caption or artistic reflections.', 'error');
                if (captionInput) captionInput.focus();
                return;
            }

            const artForm = artFormSelect ? artFormSelect.value : 'Visual Arts & Painting';
            const tags = tagsInput ? tagsInput.value.trim() : '';

            // Handle Media Resolution
            let resolvedMediaUrl = null;
            let isVideoMedia = false;

            const originalBtnHtml = btnSubmit ? btnSubmit.innerHTML : 'Publish to Feed';

            // Case A: User selected a local file -> upload to backend
            if (selectedFile) {
                isVideoMedia = selectedFile.type.startsWith('video/');
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.innerHTML = '<span>Uploading artwork...</span>';
                }

                try {
                    resolvedMediaUrl = await window.api.uploadImage(selectedFile);
                } catch (uploadErr) {
                    console.error('File upload failed:', uploadErr);
                    showToast(uploadErr.message || 'Image upload failed. Please ensure you are logged in.', 'error');
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.innerHTML = originalBtnHtml;
                    }
                    return;
                }
            } 
            // Case B: User picked a quick sample asset
            else if (selectedSampleUrl) {
                resolvedMediaUrl = selectedSampleUrl;
            } 
            // Case C: Fallback or manually populated URL
            else if (postImageUrlInput && postImageUrlInput.value.trim()) {
                resolvedMediaUrl = postImageUrlInput.value.trim();
            }

            // Construct payload matching Spring Boot PostRequest.java
            const postPayload = {
                title: 'Studio Feed Post',
                caption: caption,
                mediaUrl: resolvedMediaUrl || null,
                imageUrl: resolvedMediaUrl || null, // ensure backward compatibility
                mediaType: isVideoMedia ? 'video' : 'image',
                artForm: artForm,
                category: 'Showcase',
                tags: tags || null
            };

            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<span>Publishing to feed...</span>';
            }

            try {
                // Call existing API contract
                await window.api.createPost(postPayload, currentUserId);
                showToast('Art published successfully to the Studio Feed!');

                // Clean up object URL upon successful publish
                if (currentObjectUrl) {
                    URL.revokeObjectURL(currentObjectUrl);
                    currentObjectUrl = null;
                }

                setTimeout(() => {
                    window.location.href = '/pages/feed.html';
                }, 900);
            } catch (err) {
                console.error('Error publishing post:', err);
                showToast(err.message || 'Failed to publish post. Please try again.', 'error');
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    /**
     * Helper: Display Friendly Toast Notification
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
            setTimeout(() => toast.remove(), 320);
        }, 3200);
    }
});
