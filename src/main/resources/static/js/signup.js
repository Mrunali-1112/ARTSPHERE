/**
 * ArtSphere — Sign Up Script (Editorial Neo-Brutalist)
 * Handles artist account creation, discipline selection, and auto-session establishment
 */

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPasswordBtn');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const alertMessage = document.getElementById('alertMessage');
    const submitBtn = document.getElementById('submitBtn');
    const disciplineChips = document.querySelectorAll('.discipline-chip');

    let selectedDiscipline = 'Visual Artist';

    // Discipline Radio Selection
    disciplineChips.forEach(chip => {
        chip.addEventListener('click', () => {
            disciplineChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const radio = chip.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                selectedDiscipline = radio.value;
            }
        });
    });

    // Password Toggles
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        });
    }

    if (toggleConfirmPasswordBtn && confirmPasswordInput) {
        toggleConfirmPasswordBtn.addEventListener('click', () => {
            const isPassword = confirmPasswordInput.getAttribute('type') === 'password';
            confirmPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
        });
    }

    // Form Submit
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (password !== confirmPassword) {
                showAlert('Passwords do not match. Please re-enter.', 'error');
                return;
            }

            if (password.length < 6) {
                showAlert('Password must be at least 6 characters.', 'error');
                return;
            }

            // Derive username from email prefix or name
            const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') + '_' + Math.floor(100 + Math.random() * 900);

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>Creating Studio...</span>';
                }

                const apiObj = window.api || window.ArtSphereAPI;
                await apiObj.register({
                    username: username,
                    email: email,
                    password: password,
                    fullName: fullName,
                    role: 'ROLE_ARTIST',
                    bio: `Independent ${selectedDiscipline} exploring creative dialogues.`
                });

                // Auto-login to establish session
                await apiObj.login(username, password);

                // Save setup context
                sessionStorage.setItem('artsphere_user', JSON.stringify({
                    fullName,
                    email,
                    username,
                    artistType: selectedDiscipline
                }));

                showAlert('Studio established successfully! Opening dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/home.html';
                }, 800);

            } catch (err) {
                showAlert(err.message || 'Registration failed. Please try again.', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Create Studio Account</span> <span>&rarr;</span>';
                }
            }
        });
    }

    function showAlert(msg, type) {
        if (!alertMessage) return;
        alertMessage.textContent = msg;
        alertMessage.className = `auth-alert-message ${type}`;
        alertMessage.style.display = 'block';
    }
});
