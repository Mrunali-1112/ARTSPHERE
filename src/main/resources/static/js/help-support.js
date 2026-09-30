/**
 * ArtSphere — Help & Support Application Controller
 * Conversational Steward Desk, Knowledge Base, Conversation Persistence,
 * Authentication Resolution, and Mobile Drawer Controls.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // State
    let currentUser = null;
    const STORAGE_KEY = 'artsphere_support_chat_history';

    // DOM Elements - Shell & Navigation
    const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
    const dashboardSidebar = document.getElementById('dashboardSidebar');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    const globalSearchInput = document.getElementById('globalSearchInput');

    // DOM Elements - Chat Area
    const chatArea = document.getElementById('chatArea');
    const messagesList = document.getElementById('messagesList');
    const chatMessageInput = document.getElementById('chatMessageInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const btnAttachment = document.getElementById('btnAttachment');
    const hiddenFileInput = document.getElementById('hiddenFileInput');
    const btnClearChat = document.getElementById('btnClearChat');
    const topicButtons = document.querySelectorAll('.topic-pill-btn');
    const resourceTiles = document.querySelectorAll('.resource-nav-tile');

    // Knowledge Base Responses
    const KNOWLEDGE_BASE = {
        'pitch collab': "To propose a collaboration, open any creator's profile or visit the Collaborations board under 'Collaborate'. Tap 'Post Collab Pitch' or 'Send Inquiry', outline your creative concept, roles required, milestone deliverables, and estimated timeline.",
        'portfolio standards': "ArtSphere supports high-res PNG, JPG, and WebP media up to 25MB. Each piece can feature detailed medium tags, concept descriptions, creation year, and commercial availability status.",
        'open call deadlines': "Browse active residency, grant, and exhibition open calls under 'Opportunities'. When you find an open call that fits your discipline, click 'Submit Application' to attach your portfolio works and cover statement.",
        'guild invitations': "Visit 'Communities' to explore specialized collectives (e.g., Acoustic Guitarists, Film Scoring, Watercolorists). Tap 'Join Guild' to participate in jam sessions, project boards, and private critiques.",
        'community guidelines': "ArtSphere is dedicated to fostering an empathetic, respectful creative sanctuary. We enforce constructive critique, strict co-creator attribution, and zero tolerance for harassment, hate speech, or copyright theft.",
        'copyright & ip': "You retain 100% intellectual property ownership of all original artworks and pitch proposals published to ArtSphere. When co-creating in a collaboration, agreed attribution and licensing terms apply.",
        'events': "Head over to the Events hub to RSVP for masterclasses and live jams. Registrations can be viewed anytime under 'My Applications'.",
        'settings': "You can edit your artist bio, primary discipline, location, and external social profiles in Studio Settings > Edit Profile."
    };

    // Initialize Navigation Controls & Session
    initNavigationControls();
    await resolveCurrentUser();

    // Initialize Chat History from Storage
    initChatHistory();

    // Initialize Event Listeners
    initChatEventListeners();
    initTopicButtons();
    initResourceTiles();
    initAttachmentHandling();

    /**
     * =========================================================================
     * 1. RESOLVE CURRENT AUTHENTICATED USER
     * =========================================================================
     */
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

                const displayName = user.fullName || user.username || user.name || 'Mrunali S.';
                const displayRole = user.artistType || user.bio || 'Digital Artist';
                const displayAvatar = user.profilePicture || user.avatarUrl || '/images/user_avatar_nav.png';

                // Update Sidebar Mini-Card
                const sidebarUserName = document.getElementById('sidebarUserName');
                const sidebarUserRole = document.getElementById('sidebarUserRole');
                const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
                const sidebarProfileCard = document.getElementById('sidebarProfileCard');

                if (sidebarUserName) sidebarUserName.textContent = displayName;
                if (sidebarUserRole) sidebarUserRole.textContent = displayRole;
                if (sidebarUserAvatar) sidebarUserAvatar.src = displayAvatar;
                if (sidebarProfileCard) sidebarProfileCard.href = `/pages/artist-profile.html?id=${user.id || 101}`;

                // Update Top Header Dropdown
                const headerUserAvatar = document.getElementById('headerUserAvatar');
                const dropdownUserName = document.getElementById('dropdownUserName');
                const dropdownUserBio = document.getElementById('dropdownUserBio');
                const dropdownProfileLink = document.getElementById('dropdownProfileLink');
                const dropdownPortfolioLink = document.getElementById('dropdownPortfolioLink');

                if (headerUserAvatar) headerUserAvatar.src = displayAvatar;
                if (dropdownUserName) dropdownUserName.textContent = displayName;
                if (dropdownUserBio) dropdownUserBio.textContent = displayRole;
                if (dropdownProfileLink) dropdownProfileLink.href = `/pages/artist-profile.html?id=${user.id || 101}`;
                if (dropdownPortfolioLink) dropdownPortfolioLink.href = `/pages/portfolio.html?id=${user.id || 101}`;

                // Mobile Profile Nav Button
                const mobileProfileNavBtn = document.getElementById('mobileProfileNavBtn');
                if (mobileProfileNavBtn) {
                    mobileProfileNavBtn.href = `/pages/artist-profile.html?id=${user.id || 101}`;
                }
            }
        } catch (e) {
            console.warn('Could not resolve authenticated user:', e);
        }
    }

    /**
     * =========================================================================
     * 2. INITIALIZE CHAT HISTORY & PERSISTENCE
     * =========================================================================
     */
    function initChatHistory() {
        if (!messagesList) return;

        const savedHistory = localStorage.getItem(STORAGE_KEY);
        if (savedHistory) {
            try {
                const messages = JSON.parse(savedHistory);
                if (Array.isArray(messages) && messages.length > 0) {
                    messagesList.innerHTML = '';
                    messages.forEach(msg => {
                        const cleanTime = (msg.time || formatTime()).replace(/\s*•\s*Steward Response/gi, '').trim();
                        if (msg.sender === 'user') {
                            appendUserMessageToDOM(msg.text, cleanTime, false);
                        } else {
                            appendBotMessageToDOM(msg.text, cleanTime, false);
                        }
                    });
                    scrollToBottom();
                    return;
                }
            } catch (err) {
                console.warn('Failed parsing saved chat history:', err);
            }
        }

        // Default initial greeting if no history saved
        saveCurrentHistory();
    }

    function saveCurrentHistory() {
        if (!messagesList) return;
        const bubbles = messagesList.querySelectorAll('.msg-bubble-row');
        const history = [];

        bubbles.forEach(row => {
            const isUser = row.classList.contains('user-bubble-row');
            const textEl = row.querySelector('.bubble-message-text');
            const timeEl = row.querySelector('.msg-timestamp-meta');

            if (textEl) {
                const rawTime = timeEl ? timeEl.textContent.trim() : formatTime();
                const cleanTime = rawTime.replace(/\s*•\s*Steward Response/gi, '').trim();
                history.push({
                    sender: isUser ? 'user' : 'steward',
                    text: textEl.textContent.trim(),
                    time: cleanTime
                });
            }
        });

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.warn('Unable to persist chat history:', e);
        }
    }

    /**
     * =========================================================================
     * 3. CHAT MESSAGE RENDERING & STEWARD LOGIC
     * =========================================================================
     */
    function formatTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `Today • ${hours}:${minutesStr} ${ampm}`;
    }

    function scrollToBottom() {
        if (!chatArea) return;
        setTimeout(() => {
            chatArea.scrollTo({
                top: chatArea.scrollHeight,
                behavior: 'smooth'
            });
        }, 50);
    }

    function appendUserMessageToDOM(text, timestamp = null, shouldSave = true) {
        if (!messagesList) return;
        const time = timestamp || formatTime();

        const row = document.createElement('div');
        row.className = 'msg-bubble-row user-bubble-row';
        row.innerHTML = `
            <div class="msg-bubble-wrapper user-bubble-wrapper">
                <div class="msg-bubble-card user-bubble-card">
                    <p class="bubble-message-text">${escapeHTML(text)}</p>
                </div>
                <span class="msg-timestamp-meta">${time}</span>
            </div>
        `;
        messagesList.appendChild(row);
        scrollToBottom();

        if (shouldSave) saveCurrentHistory();
    }

    function appendBotMessageToDOM(text, timestamp = null, shouldSave = true) {
        if (!messagesList) return;
        const time = timestamp || formatTime();

        const row = document.createElement('div');
        row.className = 'msg-bubble-row bot-bubble-row';
        row.innerHTML = `
            <div class="msg-bubble-wrapper">
                <div class="msg-bubble-card bot-bubble-card">
                    <p class="bubble-message-text">${escapeHTML(text)}</p>
                </div>
                <span class="msg-timestamp-meta">${time}</span>
            </div>
        `;
        messagesList.appendChild(row);
        scrollToBottom();

        if (shouldSave) saveCurrentHistory();
    }

    function showTypingIndicator() {
        if (!messagesList) return null;
        const indicator = document.createElement('div');
        indicator.className = 'msg-bubble-row bot-bubble-row typing-indicator-item';
        indicator.innerHTML = `
            <div class="msg-bubble-wrapper">
                <div class="typing-indicator-row">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        messagesList.appendChild(indicator);
        scrollToBottom();
        return indicator;
    }

    function resolveBotAnswer(query) {
        const q = query.toLowerCase();

        if (q.includes('pitch') || q.includes('collab') || q.includes('partner') || q.includes('inquiry')) {
            return KNOWLEDGE_BASE['pitch collab'];
        }
        if (q.includes('portfolio') || q.includes('standard') || q.includes('artwork') || q.includes('upload') || q.includes('res') || q.includes('image')) {
            return KNOWLEDGE_BASE['portfolio standards'];
        }
        if (q.includes('open call') || q.includes('deadline') || q.includes('grant') || q.includes('residency') || q.includes('apply')) {
            return KNOWLEDGE_BASE['open call deadlines'];
        }
        if (q.includes('guild') || q.includes('invitation') || q.includes('community') || q.includes('join')) {
            return KNOWLEDGE_BASE['guild invitations'];
        }
        if (q.includes('guideline') || q.includes('standard') || q.includes('etiquette') || q.includes('rule')) {
            return KNOWLEDGE_BASE['community guidelines'];
        }
        if (q.includes('copyright') || q.includes('ip') || q.includes('rights') || q.includes('intellectual')) {
            return KNOWLEDGE_BASE['copyright & ip'];
        }
        if (q.includes('event') || q.includes('jam') || q.includes('masterclass')) {
            return KNOWLEDGE_BASE['events'];
        }
        if (q.includes('setting') || q.includes('profile') || q.includes('bio') || q.includes('account')) {
            return KNOWLEDGE_BASE['settings'];
        }

        return "Thank you for reaching out to the ArtSphere Steward Desk! A community steward has received your dispatch and will respond promptly. For urgent assistance or studio queries, feel free to write directly to stewards@artsphere.com.";
    }

    async function handleSendMessage(customText = null) {
        const text = customText || (chatMessageInput ? chatMessageInput.value.trim() : '');
        if (!text) return;

        // Append user message
        appendUserMessageToDOM(text);
        if (chatMessageInput) chatMessageInput.value = '';

        // Show typing indicator
        const indicator = showTypingIndicator();

        // Natural typing delay
        setTimeout(() => {
            if (indicator) indicator.remove();
            const reply = resolveBotAnswer(text);
            appendBotMessageToDOM(reply);
        }, 450);
    }

    /**
     * =========================================================================
     * 4. CHAT EVENT LISTENERS & POPULAR TOPICS
     * =========================================================================
     */
    function initChatEventListeners() {
        if (btnSendMessage) {
            btnSendMessage.addEventListener('click', () => handleSendMessage());
        }

        if (chatMessageInput) {
            chatMessageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                }
            });
        }

        if (btnClearChat) {
            btnClearChat.addEventListener('click', () => {
                if (confirm('Restart conversation with ArtSphere Support?')) {
                    localStorage.removeItem(STORAGE_KEY);
                    if (messagesList) {
                        messagesList.innerHTML = `
                            <div class="msg-bubble-row bot-bubble-row">
                                <div class="msg-bubble-wrapper">
                                    <div class="msg-bubble-card bot-bubble-card">
                                        <p class="bubble-message-text">
                                            Greetings from the ArtSphere Steward desk! Whether you need technical assistance with your showreel, advice on pitching a cross-discipline collaborator, or guidance on copyright protections, we're here to help.
                                        </p>
                                    </div>
                                    <span class="msg-timestamp-meta">Today &bull; 10:24 AM</span>
                                </div>
                            </div>
                        `;
                    }
                    saveCurrentHistory();
                    showToast('Conversation restarted.');
                }
            });
        }
    }

    function initTopicButtons() {
        topicButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                if (query) {
                    handleSendMessage(query);
                }
            });
        });
    }

    function initResourceTiles() {
        resourceTiles.forEach(tile => {
            tile.addEventListener('click', () => {
                const topic = tile.getAttribute('data-topic');
                if (topic) {
                    handleSendMessage(topic);
                }
            });
        });
    }

    function initAttachmentHandling() {
        if (btnAttachment && hiddenFileInput) {
            btnAttachment.addEventListener('click', () => {
                hiddenFileInput.click();
            });

            hiddenFileInput.addEventListener('change', () => {
                if (hiddenFileInput.files && hiddenFileInput.files.length > 0) {
                    const file = hiddenFileInput.files[0];
                    showToast(`Attachment ready: ${file.name}`);
                    appendUserMessageToDOM(`[Attached File: ${file.name}]`);
                    setTimeout(() => {
                        appendBotMessageToDOM(`Received attachment "${file.name}". A community steward will inspect your creative materials and follow up.`);
                    }, 400);
                }
            });
        }
    }

    /**
     * =========================================================================
     * 5. NAVIGATION, DRAWER, AND DROPDOWN CONTROLS
     * =========================================================================
     */
    function initNavigationControls() {
        // Drawer toggle
        function openDrawer() {
            if (dashboardSidebar) dashboardSidebar.classList.add('drawer-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            if (dashboardSidebar) dashboardSidebar.classList.remove('drawer-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (mobileMenuTrigger) mobileMenuTrigger.addEventListener('click', openDrawer);
        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeDrawer);
        if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeDrawer);

        // User Dropdown
        if (userMenuTrigger && userDropdownMenu) {
            userMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = userDropdownMenu.classList.toggle('active');
                userMenuTrigger.setAttribute('aria-expanded', isOpen);
            });

            document.addEventListener('click', (e) => {
                if (!userDropdownMenu.contains(e.target) && !userMenuTrigger.contains(e.target)) {
                    userDropdownMenu.classList.remove('active');
                    userMenuTrigger.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Global Search
        if (globalSearchInput) {
            globalSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const q = globalSearchInput.value.trim();
                    if (q) {
                        window.location.href = `/pages/discover.html?q=${encodeURIComponent(q)}`;
                    }
                }
            });
        }

        // Logout
        async function handleLogout() {
            if (confirm('Are you sure you want to log out of ArtSphere?')) {
                if (window.api && typeof window.api.logout === 'function') {
                    await window.api.logout();
                } else {
                    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
                    window.location.href = '/pages/login.html';
                }
            }
        }

        if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);
        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
    }

    /**
     * =========================================================================
     * 6. HELPER UTILITIES: TOAST & ESCAPE
     * =========================================================================
     */
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'support-toast-item';
        toast.textContent = msg;

        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 280);
        }, 2800);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
