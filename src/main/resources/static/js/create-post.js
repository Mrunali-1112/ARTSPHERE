/**
 * ArtSphere – Create Post JavaScript (Matches page_26.jpg)
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Default active artist

    // Elements
    const createPostForm = document.getElementById('createPostForm');
    const mediaDropzone = document.getElementById('mediaDropzone');
    const mediaFileInput = document.getElementById('mediaFileInput');
    const dropzonePrompt = document.getElementById('dropzonePrompt');
    const dropzonePreview = document.getElementById('dropzonePreview');
    const previewImg = document.getElementById('previewImg');
    const btnRemoveMedia = document.getElementById('btnRemoveMedia');
    const presetButtons = document.querySelectorAll('.preset-thumb-btn');

    const captionInput = document.getElementById('postCaptionInput');
    const charCounter = document.getElementById('charCounter');
    const artFormSelect = document.getElementById('postArtFormSelect');
    const categorySelect = document.getElementById('postCategorySelect');
    const tagsInput = document.getElementById('postTagsInput');
    const tagSuggestionPills = document.querySelectorAll('.tag-suggestion-pill');
    const visibilityLabels = document.querySelectorAll('.visibility-option-label');
    const btnPublish = document.getElementById('btnPublishPost');

    let selectedMediaUrl = '/images/post_a_brighter_day.png'; // default fallback

    // 1. File Upload Dropzone
    if (mediaDropzone && mediaFileInput) {
        mediaDropzone.addEventListener('click', (e) => {
            if (e.target !== btnRemoveMedia) {
                mediaFileInput.click();
            }
        });

        mediaFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setMediaPreview(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });

        // Drag & drop support
        ['dragenter', 'dragover'].forEach(name => {
            mediaDropzone.addEventListener(name, (e) => {
                e.preventDefault();
                mediaDropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(name => {
            mediaDropzone.addEventListener(name, (e) => {
                e.preventDefault();
                mediaDropzone.classList.remove('dragover');
            });
        });

        mediaDropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files && dt.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setMediaPreview(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnRemoveMedia) {
        btnRemoveMedia.addEventListener('click', (e) => {
            e.stopPropagation();
            resetMediaPreview();
        });
    }

    // Preset Sample Pickers
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            if (url) {
                setMediaPreview(url);
            }
        });
    });

    function setMediaPreview(url) {
        selectedMediaUrl = url;
        if (previewImg) previewImg.src = url;
        if (dropzonePrompt) dropzonePrompt.style.display = 'none';
        if (dropzonePreview) dropzonePreview.style.display = 'block';
    }

    function resetMediaPreview() {
        selectedMediaUrl = '';
        if (mediaFileInput) mediaFileInput.value = '';
        if (previewImg) previewImg.src = '';
        if (dropzonePreview) dropzonePreview.style.display = 'none';
        if (dropzonePrompt) dropzonePrompt.style.display = 'flex';
    }

    // 2. Caption Character Counter
    if (captionInput && charCounter) {
        captionInput.addEventListener('input', () => {
            const count = captionInput.value.length;
            charCounter.textContent = `${count}/500`;
        });
    }

    // 3. Tag Suggestion Pills
    tagSuggestionPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const tag = pill.getAttribute('data-tag');
            if (!tag || !tagsInput) return;

            let currentTags = tagsInput.value.trim();
            if (!currentTags) {
                tagsInput.value = tag;
            } else if (!currentTags.includes(tag)) {
                tagsInput.value = currentTags.endsWith(',')
                    ? `${currentTags} ${tag}`
                    : `${currentTags}, ${tag}`;
            }
        });
    });

    // 4. Visibility Radio Labels
    visibilityLabels.forEach(label => {
        label.addEventListener('click', () => {
            visibilityLabels.forEach(l => l.classList.remove('active'));
            label.classList.add('active');
            const radio = label.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    // 5. Publish Post Form Submission
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const caption = captionInput ? captionInput.value.trim() : '';
            const artForm = artFormSelect ? artFormSelect.value : '';
            const category = categorySelect ? categorySelect.value : 'Showcase';
            const tags = tagsInput ? tagsInput.value.trim() : '';
            const visibilityRadio = document.querySelector('input[name="visibility"]:checked');
            const visibility = visibilityRadio ? visibilityRadio.value : 'Public';

            if (!caption) {
                alert('Please enter a caption for your post.');
                return;
            }

            if (!artForm) {
                alert('Please select an art form.');
                return;
            }

            // Fallback media if none selected
            const mediaUrl = selectedMediaUrl || '/images/post_a_brighter_day.png';

            const payload = {
                title: caption.slice(0, 40) + (caption.length > 40 ? '...' : ''),
                caption: caption,
                artForm: artForm,
                category: category,
                tags: tags || '#art',
                visibility: visibility,
                mediaUrl: mediaUrl,
                userId: currentUserId
            };

            // Loading state
            if (btnPublish) {
                btnPublish.disabled = true;
                btnPublish.innerHTML = `<span>Publishing...</span>`;
            }

            try {
                const result = await window.ArtSphereAPI.createPost(payload, currentUserId);
                console.log('Post created successfully:', result);

                // Redirect to feed page to view the published post
                window.location.href = '/pages/feed.html';
            } catch (err) {
                console.error('Failed to publish post:', err);
                alert('Error creating post: ' + (err.message || 'Please try again.'));
                if (btnPublish) {
                    btnPublish.disabled = false;
                    btnPublish.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        <span>Post</span>
                    `;
                }
            }
        });
    }
});
