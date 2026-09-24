/**
 * ArtSphere Sign Up Page Interactions & API Integration
 */
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPasswordBtn');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const alertMessage = document.getElementById('alertMessage');
    const submitBtn = document.getElementById('submitBtn');
    const categoryCards = document.querySelectorAll('.category-select-card');

    let selectedCategory = 'Musician';

    // Category Card Selection
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedCategory = card.getAttribute('data-category');
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
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Creating Account...';

                await window.ArtSphereAPI.register({
                    username: username,
                    email: email,
                    password: password,
                    fullName: fullName,
                    role: 'ROLE_ARTIST',
                    bio: `Artist of ${selectedCategory}`
                });

                // Auto-login to establish session
                await window.ArtSphereAPI.login(username, password);

                // Save setup context
                sessionStorage.setItem('artsphere_user', JSON.stringify({
                    fullName,
                    email,
                    username,
                    artistType: selectedCategory
                }));

                showAlert('Account created! Setting up your profile...', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/account-setup.html';
                }, 700);

            } catch (err) {
                showAlert(err.message || 'Registration failed. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Create Account <span>&rarr;</span>';
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
