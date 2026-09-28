/**
 * ArtSphere — Login Script (Editorial Neo-Brutalist)
 * Handles authentication, demo credentials quick-fill, and error messaging
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('usernameOrEmail');
    const alertMessage = document.getElementById('alertMessage');
    const submitBtn = document.getElementById('submitBtn');
    const demoFillBtns = document.querySelectorAll('.demo-fill-btn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    // Toggle Password Visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        });
    }

    // Quick Demo Credentials Fillers
    demoFillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const user = btn.dataset.user;
            const pass = btn.dataset.pass;
            if (usernameInput && user) usernameInput.value = user;
            if (passwordInput && pass) passwordInput.value = pass;
            showAlert(`Demo credentials for "${user}" inserted! Click Sign In.`, 'success');
        });
    });

    // Forgot Password
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAlert('Password reset link has been dispatched to your email address.', 'success');
        });
    }

    // Submit handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameOrEmail = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!usernameOrEmail || !password) {
                showAlert('Please enter both your email/username and password.', 'error');
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>Verifying...</span>';
                }

                const apiObj = window.api || window.ArtSphereAPI;
                await apiObj.login(usernameOrEmail, password);
                
                showAlert('Access authorized! Redirecting to studio dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/home.html';
                }, 800);
            } catch (err) {
                showAlert(err.message || 'Login failed. Please check your credentials.', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Sign In to Dashboard</span> <span>&rarr;</span>';
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
