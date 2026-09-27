/**
 * ArtSphere — Help & Support Live Chat Script (Editorial Neo-Brutalist)
 * Handles conversational inquiries, FAQ chip auto-responses, and steward knowledge base
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Universal Nav Dropdown & Mobile Toggle
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

    // 2. Chat Elements
    const chatArea = document.getElementById('chatArea');
    const messagesList = document.getElementById('messagesList');
    const chatMessageInput = document.getElementById('chatMessageInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const faqChips = document.querySelectorAll('.faq-chip');

    // 3. Time Helper
    const formatTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    };

    // 4. Scroll to Bottom
    const scrollToBottom = () => {
        if (!chatArea) return;
        setTimeout(() => {
            chatArea.scrollTo({
                top: chatArea.scrollHeight,
                behavior: 'smooth'
            });
        }, 60);
    };

    // 5. Bot Knowledge Base
    const BOT_RESPONSES = {
        'How do I pitch a collaboration?': "To propose a collaboration, open any artist's profile or visit the Collaborations board. Tap 'Post Collab Pitch' or 'Send Inquiry', outline your concept, roles needed, and timeline.",
        'Portfolio showcase standards': "ArtSphere supports high-res PNG, JPG, and WebP media up to 25MB. Each piece can feature detailed captions explaining materials, process sketches, and medium tags.",
        'Submitting open calls': "Browse active residency, grant, and exhibition opportunities under 'Opportunities'. When you find an open call that fits your practice, click 'Submit Application' to attach your portfolio works and cover statement.",
        'Joining fellowship guilds': "Visit 'Communities' to explore specialized collectives (e.g., Acoustic Guitarists, Film Scoring, Watercolorists). Tap 'Join Guild' to participate in jam sessions and private critiques."
    };

    const getBotResponseForQuery = (query) => {
        if (BOT_RESPONSES[query]) return BOT_RESPONSES[query];

        const q = query.toLowerCase();
        if (q.includes('collab') || q.includes('partner') || q.includes('pitch')) {
            return BOT_RESPONSES['How do I pitch a collaboration?'];
        }
        if (q.includes('portfolio') || q.includes('art') || q.includes('upload') || q.includes('image')) {
            return BOT_RESPONSES['Portfolio showcase standards'];
        }
        if (q.includes('open call') || q.includes('opportunity') || q.includes('grant') || q.includes('apply')) {
            return BOT_RESPONSES['Submitting open calls'];
        }
        if (q.includes('community') || q.includes('guild') || q.includes('group')) {
            return BOT_RESPONSES['Joining fellowship guilds'];
        }
        if (q.includes('event') || q.includes('workshop')) {
            return "Head over to the Events hub to RSVP for masterclasses and live jams. Registrations can be viewed anytime under 'My Applications'.";
        }
        if (q.includes('settings') || q.includes('profile') || q.includes('bio')) {
            return "You can edit your artist bio, primary discipline, location, and social links in Studio Settings > Edit Profile.";
        }
        return "Thank you for reaching out! A community steward has received your dispatch and will respond promptly. For urgent assistance, email stewards@artsphere.com.";
    };

    // 6. Message Appenders
    const appendUserMessage = (text) => {
        const row = document.createElement('div');
        row.className = 'msg-row user-msg';
        row.innerHTML = `
            <div class="msg-body">
                <div class="msg-bubble user-bubble">
                    <p class="bubble-p">${escapeHTML(text)}</p>
                </div>
                <span class="msg-time">${formatTime()}</span>
            </div>
        `;
        messagesList.appendChild(row);
        scrollToBottom();
    };

    const appendBotMessage = (text) => {
        const row = document.createElement('div');
        row.className = 'msg-row bot-msg';
        row.innerHTML = `
            <div class="bot-avatar">✦</div>
            <div class="msg-body">
                <div class="msg-bubble bot-bubble">
                    <p class="bubble-p">${escapeHTML(text)}</p>
                </div>
                <span class="msg-time">${formatTime()} &bull; Steward Response</span>
            </div>
        `;
        messagesList.appendChild(row);
        scrollToBottom();
    };

    // 7. Send Message Flow
    const handleSendMessage = (messageText) => {
        const text = messageText || (chatMessageInput ? chatMessageInput.value.trim() : '');
        if (!text) return;

        appendUserMessage(text);
        if (chatMessageInput) chatMessageInput.value = '';

        // Bot response after short natural delay
        setTimeout(() => {
            const reply = getBotResponseForQuery(text);
            appendBotMessage(reply);
        }, 500);
    };

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

    // FAQ Chips
    faqChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.dataset.query;
            if (query) {
                handleSendMessage(query);
            }
        });
    });

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
