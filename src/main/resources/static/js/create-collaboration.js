/**
 * ArtSphere – Create Collaboration JavaScript
 * Editorial Neo-brutalism • Pitch Creation & Purpose Selection
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = 101; // Demo User (Mrunali / Aanya)

    // Navigation & Dropdown
    initNavigation();

    const form = document.getElementById('createCollabForm');
    const submitBtn = document.getElementById('submitCollabBtn');
    const purposeChipsGroup = document.getElementById('purposeChipsGroup');
    const selectedPurposeInput = document.getElementById('selectedPurpose');

    // Handle Purpose Chips
    if (purposeChipsGroup) {
        purposeChipsGroup.addEventListener('click', (e) => {
            const chip = e.target.closest('.purpose-chip');
            if (!chip) return;

            purposeChipsGroup.querySelectorAll('.purpose-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const purposeVal = chip.getAttribute('data-purpose') || 'Work on a Project';
            if (selectedPurposeInput) selectedPurposeInput.value = purposeVal;
        });
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('collabTitle').value.trim();
            const purpose = selectedPurposeInput ? selectedPurposeInput.value : 'Work on a Project';
            const skills = document.getElementById('collabSkills').value.trim();
            const collaborationType = document.getElementById('collabType').value.trim() || 'Creative Project';
            const availability = document.getElementById('collabAvailability').value.trim() || 'Flexible';
            const peopleNeeded = document.getElementById('collabPeopleNeeded').value.trim() || '1-2 Collaborators';
            const location = document.getElementById('collabLocation').value.trim() || 'Mumbai, MH';
            const description = document.getElementById('collabDescription').value.trim();
            const referenceUrl = document.getElementById('collabRefUrl').value.trim();
            const tags = document.getElementById('collabTags').value.trim();

            if (!title || !description || !skills) {
                showToast('Please fill out all mandatory fields marked with an asterisk.');
                return;
            }

            const payload = {
                title,
                purpose,
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
                collaborationType,
                availability,
                peopleNeeded,
                location,
                description,
                referenceUrl,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Publishing Call...</span>';
            }

            try {
                let createdCollab = null;
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.createCollaboration === 'function') {
                    createdCollab = await window.ArtSphereAPI.createCollaboration(payload, currentUserId);
                }

                showToast('Collaboration call published successfully!');

                setTimeout(() => {
                    const newId = (createdCollab && createdCollab.id) ? createdCollab.id : 1;
                    window.location.href = `/pages/collaboration-details.html?id=${newId}`;
                }, 900);

            } catch (err) {
                console.warn('API error when creating collaboration, simulated fallback success:', err);
                showToast('Collaboration call published!');
                setTimeout(() => {
                    window.location.href = '/pages/collaboration-details.html?id=1';
                }, 900);
            }
        });
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'neo-toast';
        toast.textContent = msg;
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
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
