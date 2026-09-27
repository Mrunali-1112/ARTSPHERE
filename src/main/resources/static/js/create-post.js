/**
 * ArtSphere — Create Post Script
 * Handles post publishing, image previewing, sample chips, and form validation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Dropdown
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

    // Form & Input Elements
    const form = document.getElementById('createPostForm');
    const imageUrlInput = document.getElementById('postImageUrlInput');
    const dropzonePrompt = document.getElementById('dropzonePrompt');
    const dropzonePreview = document.getElementById('dropzonePreview');
    const previewImg = document.getElementById('previewImg');
    const btnRemoveMedia = document.getElementById('btnRemoveMedia');
    const captionInput = document.getElementById('postCaptionInput');
    const charCounter = document.getElementById('charCounter');
    const artFormSelect = document.getElementById('postArtFormSelect');
    const tagsInput = document.getElementById('postTagsInput');
    const btnSubmit = document.getElementById('btnSubmitPost');
    const sampleChips = document.querySelectorAll('.sample-chip');

    // Helper: Update Image Preview
    function updateImagePreview(url) {
        if (!url || !url.trim()) {
            if (dropzonePrompt) dropzonePrompt.style.display = 'flex';
            if (dropzonePreview) dropzonePreview.style.display = 'none';
            if (previewImg) previewImg.src = '';
            return;
        }

        const validUrl = url.trim();
        if (previewImg) previewImg.src = validUrl;
        if (dropzonePrompt) dropzonePrompt.style.display = 'none';
        if (dropzonePreview) dropzonePreview.style.display = 'inline-block';
    }

    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', (e) => {
            updateImagePreview(e.target.value);
        });
    }

    if (btnRemoveMedia) {
        btnRemoveMedia.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (imageUrlInput) imageUrlInput.value = '';
            updateImagePreview('');
        });
    }

    // Sample Image Chips
    sampleChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const sampleUrl = chip.dataset.url;
            if (imageUrlInput && sampleUrl) {
                imageUrlInput.value = sampleUrl;
                updateImagePreview(sampleUrl);
            }
        });
    });

    // Character Counter
    if (captionInput && charCounter) {
        captionInput.addEventListener('input', () => {
            const length = captionInput.value.length;
            charCounter.textContent = `${length} / 500`;
            if (length >= 480) {
                charCounter.style.color = 'var(--color-orange)';
            } else {
                charCounter.style.color = 'var(--color-ink-muted)';
            }
        });
    }

    // Helper: Show Toast
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
        }, 3000);
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const caption = captionInput ? captionInput.value.trim() : '';
            if (!caption) {
                showToast('Please enter your caption or artistic reflections.', 'error');
                if (captionInput) captionInput.focus();
                return;
            }

            const imageUrl = imageUrlInput ? imageUrlInput.value.trim() : '';
            const artForm = artFormSelect ? artFormSelect.value : 'Visual Arts';
            const tags = tagsInput ? tagsInput.value.trim() : '';

            const postData = {
                caption,
                imageUrl: imageUrl || null,
                artForm,
                tags: tags || null
            };

            const originalBtnText = btnSubmit ? btnSubmit.innerHTML : 'Publish to Feed';
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<span>Publishing...</span>';
            }

            try {
                // User 101 default logged-in session creator
                await api.createPost(postData, 101);
                showToast('Art published successfully to the Studio Feed!');
                setTimeout(() => {
                    window.location.href = '/pages/feed.html';
                }, 1000);
            } catch (err) {
                console.error('Error creating post:', err);
                showToast(err.message || 'Failed to publish post. Please try again.', 'error');
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalBtnText;
                }
            }
        });
    }
});
