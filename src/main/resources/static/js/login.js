/**
 * ArtSphere — Creator Studio Login Script
 * Pastel Purple / Lavender Visual Language
 * Handles authentication, demo credentials quick-fill, session persistence, and error feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('usernameOrEmail');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const alertMessage = document.getElementById('alertMessage');
    const submitBtn = document.getElementById('submitBtn');
    const demoFillBtns = document.querySelectorAll('.demo-fill-btn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const pwEyeIcon = document.getElementById('pwEyeIcon');

    // 1. Toggle Password Visibility with Eye Icon Update
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

            if (pwEyeIcon) {
                if (isPassword) {
                    // Show eye-off icon
                    pwEyeIcon.innerHTML = `
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    `;
                } else {
                    // Show normal eye icon
                    pwEyeIcon.innerHTML = `
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    `;
                }
            }
        });
    }

    // 2. Quick Demo Credentials Fillers
    demoFillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const user = btn.dataset.user;
            const pass = btn.dataset.pass || 'password';

            demoFillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (usernameInput && user) usernameInput.value = user;
            if (passwordInput && pass) passwordInput.value = pass;

            showAlert(`Demo credentials for "${user}" selected. Click "Sign In to Dashboard".`, 'success');
        });
    });

    // 3. Forgot Password Handler
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            const identifier = usernameInput ? usernameInput.value.trim() : '';
            if (identifier) {
                showAlert(`Password reset instructions dispatched to account associated with "${identifier}".`, 'success');
            } else {
                showAlert('Enter your username or email above, then click "Forgot?" to receive a reset link.', 'success');
            }
        });
    }

    // 4. Form Submit & Authentication
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameOrEmail = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!usernameOrEmail || !password) {
                showAlert('Please enter both your username/email and password.', 'error');
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>Verifying credentials...</span>';
                }

                let loginResult = null;
                const apiObj = window.api || window.ArtSphereAPI;

                if (apiObj && typeof apiObj.login === 'function') {
                    loginResult = await apiObj.login(usernameOrEmail, password);
                } else {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: usernameOrEmail, password })
                    });
                    const result = await response.json();
                    if (!response.ok || !result.success) {
                        throw new Error(result.message || 'Invalid username or password');
                    }
                    loginResult = result;
                }

                // Authenticated session state persistence
                const user = loginResult?.data;
                if (user) {
                    const shouldRemember = rememberMeCheckbox ? rememberMeCheckbox.checked : true;
                    if (shouldRemember) {
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        sessionStorage.removeItem('currentUser');
                    } else {
                        sessionStorage.setItem('currentUser', JSON.stringify(user));
                        localStorage.removeItem('currentUser');
                    }
                }

                showAlert('Access authorized! Entering your studio space...', 'success');

                setTimeout(() => {
                    window.location.href = '/pages/home.html';
                }, 600);

            } catch (err) {
                showAlert(err.message || 'Login failed. Please check your credentials and try again.', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Sign In to Dashboard</span> <span aria-hidden="true">&rarr;</span>';
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
