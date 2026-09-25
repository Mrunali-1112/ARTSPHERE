/**
 * ArtSphere – Create Collaboration JavaScript
 * Handles purpose chip selection, validation, and post creation.
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Aanya / Mrunali)

    const form = document.getElementById('createCollabForm');
    const submitBtn = document.getElementById('submitCollabBtn');
    const purposeChipsGroup = document.getElementById('purposeChipsGroup');
    const selectedPurposeInput = document.getElementById('selectedPurpose');
    const toastNotification = document.getElementById('toastNotification');

    // Handle purpose chips
    if (purposeChipsGroup) {
        purposeChipsGroup.addEventListener('click', (e) => {
            const chip = e.target.closest('.purpose-chip');
            if (!chip) return;

            purposeChipsGroup.querySelectorAll('.purpose-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const val = chip.getAttribute('data-purpose') || 'Work on a Project';
            selectedPurposeInput.value = val;
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('collabTitle').value.trim();
            const purpose = selectedPurposeInput.value;
            const skills = document.getElementById('collabSkills').value.trim();
            const collaborationType = document.getElementById('collabType').value.trim() || 'Project';
            const availability = document.getElementById('collabAvailability').value.trim() || 'Flexible';
            const peopleNeeded = document.getElementById('collabPeopleNeeded').value.trim() || '1-2 collaborators';
            const location = document.getElementById('collabLocation').value.trim() || 'Mumbai, MH';
            const description = document.getElementById('collabDescription').value.trim();
            const referenceUrl = document.getElementById('collabRefUrl').value.trim();
            const tags = document.getElementById('collabTags').value.trim();

            if (!title || !description || !skills) {
                alert('Please fill out all required fields (Title, Skills, and Description).');
                return;
            }

            const payload = {
                title,
                purpose,
                skills,
                collaborationType,
                availability,
                peopleNeeded,
                location,
                description,
                referenceUrl,
                tags
            };

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Posting...';
                }

                const created = await window.ArtSphereAPI.createCollaboration(payload, currentUserId);
                showToast('Collaboration post created successfully!');

                setTimeout(() => {
                    if (created && created.id) {
                        window.location.href = `/pages/collaboration-details.html?id=${created.id}`;
                    } else {
                        window.location.href = '/pages/collaborators.html';
                    }
                }, 1000);

            } catch (err) {
                console.error('Failed to create collaboration:', err);
                alert('Failed to post collaboration. Please check your network and try again.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Post Collaboration';
                }
            }
        });
    }

    function showToast(msg) {
        if (!toastNotification) return;
        toastNotification.textContent = msg;
        toastNotification.style.display = 'block';
        setTimeout(() => {
            toastNotification.style.display = 'none';
        }, 3000);
    }
});
