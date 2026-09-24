/**
 * ArtSphere Login Page Interactions & API Integration
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const passwordInput = document.getElementById('password');
    const alertMessage = document.getElementById('alertMessage');
    const submitBtn = document.getElementById('submitBtn');

    // Toggle Password Visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        });
    }

    // Submit handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameOrEmail = document.getElementById('usernameOrEmail').value.trim();
            const password = passwordInput.value;

            if (!usernameOrEmail || !password) {
                showAlert('Please enter both email/username and password.', 'error');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Logging in...';

                await window.ArtSphereAPI.login(usernameOrEmail, password);
                
                showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/account-setup.html';
                }, 700);
            } catch (err) {
                showAlert(err.message || 'Login failed. Please check your credentials.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Login <span>&rarr;</span>';
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
