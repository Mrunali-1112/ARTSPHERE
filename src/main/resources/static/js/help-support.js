/**
 * ArtSphere – Help & Support Live Chat Controller
 * Matches Approved Design Reference: page_22.jpg
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const btnHeaderBack = document.getElementById('btnHeaderBack');
    const btnPageBack = document.getElementById('btnPageBack');
    const userHeaderAvatar = document.getElementById('userHeaderAvatar');
    const chatArea = document.getElementById('chatArea');
    const messagesList = document.getElementById('messagesList');
    const chatMessageInput = document.getElementById('chatMessageInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const btnAttachment = document.getElementById('btnAttachment');
    const fileAttachInput = document.getElementById('fileAttachInput');

    // 2. Navigation
    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/pages/settings.html';
        }
    };
    if (btnHeaderBack) btnHeaderBack.addEventListener('click', goBack);
    if (btnPageBack) btnPageBack.addEventListener('click', goBack);

    // 3. Time Formatter Helper
    const formatTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
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
        }, 80);
    };

    // 5. Bot Knowledge Base
    const BOT_RESPONSES = {
        'How do I create a post?': "To create a post, tap the '+' button at the bottom center, choose the type of post, add your content and click 'Publish'. Let me know if you need more help!",
        'What types of posts are allowed?': "ArtSphere welcomes all forms of creative expression! You can share digital illustrations, sketches, paintings, photography, concept art, 3D renders, and project work in progress. Please ensure you own or have permission for any media you share.",
        'Can I edit or delete my post?': "Yes! Go to your profile or feed, locate your post, tap the options menu (⋯), and select 'Edit Post' to update details or 'Delete' to permanently remove it.",
        'Why is my post not visible?': "If your post was recently created, check your network connection and pull to refresh your feed. You can also visit your Profile to view all published works under your portfolio.",
        'I need help with something else': "We're here for you! You can type your question directly in the message box below, or reach out to our team at support@artsphere.com."
    };

    const getBotResponseForQuery = (query) => {
        const q = query.toLowerCase();
        if (BOT_RESPONSES[query]) {
            return BOT_RESPONSES[query];
        }
        if (q.includes('create') && q.includes('post')) {
            return BOT_RESPONSES['How do I create a post?'];
        }
        if (q.includes('portfolio') || q.includes('artwork') || q.includes('image')) {
            return "You can showcase and organize your artworks in your Portfolio tab. Navigate to Profile > Add Artwork to upload high-res images and descriptions.";
        }
        if (q.includes('collab') || q.includes('collaboration') || q.includes('partner')) {
            return "Visit the Collaborations hub to discover projects, find creative partners, or send a collaboration request directly from artist profiles.";
        }
        if (q.includes('event') || q.includes('workshop') || q.includes('exhibition')) {
            return "Head over to the Events page to explore upcoming exhibitions, webinars, and masterclasses. You can register instantly with one tap!";
        }
        if (q.includes('application') || q.includes('applied') || q.includes('status')) {
            return "You can check all your active event registrations and collaboration requests under 'My Applications' to track their live status.";
        }
        if (q.includes('settings') || q.includes('account') || q.includes('profile')) {
            return "You can update your personal information, bio, creative skills, and social links anytime from Settings > Edit Profile.";
        }
        return "Thank you for reaching out! Our support team has logged your message. If you need immediate assistance, feel free to email support@artsphere.com or browse the quick options above.";
    };

    // 6. Append User Message
    const appendUserMessage = (text) => {
        const row = document.createElement('div');
        row.className = 'msg-row user-msg';
        row.innerHTML = `
            <div class="msg-body">
                <div class="msg-bubble user-bubble">
                    <p class="bubble-p">${escapeHTML(text)}</p>
                </div>
                <span class="msg-time">${formatTime()} <span class="checkmarks">✔✔</span></span>
            </div>
        `;
        messagesList.appendChild(row);
        scrollToBottom();
    };

    // 7. Append Typing Indicator
    const showTypingIndicator = () => {
        const row = document.createElement('div');
        row.className = 'msg-row bot-msg typing-row';
        row.id = 'botTypingRow';
        row.innerHTML = `
            <div class="bot-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
            </div>
            <div class="msg-body">
                <div class="typing-bubble">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        messagesList.appendChild(row);
        scrollToBottom();
    };

    const removeTypingIndicator = () => {
        const row = document.getElementById('botTypingRow');
        if (row) row.remove();
    };

    // 8. Append Bot Message & Feedback
    const appendBotMessage = (text, withFeedback = true) => {
        const row = document.createElement('div');
        row.className = 'msg-row bot-msg';
        row.innerHTML = `
            <div class="bot-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
            </div>
            <div class="msg-body">
                <div class="msg-bubble bot-bubble">
                    <p class="bubble-p">${escapeHTML(text)}</p>
                </div>
                <span class="msg-time">${formatTime()}</span>
            </div>
        `;
        messagesList.appendChild(row);

        if (withFeedback) {
            appendFeedbackWidget();
        }
        scrollToBottom();
    };

    // 9. Feedback Widget
    const appendFeedbackWidget = () => {
        const row = document.createElement('div');
        row.className = 'msg-row bot-msg feedback-widget-row';
        row.innerHTML = `
            <div class="bot-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
            </div>
            <div class="msg-body">
                <div class="msg-bubble bot-bubble">
                    <p class="bubble-p">Was this helpful?</p>
                    <div class="feedback-actions-row">
                        <button type="button" class="btn-feedback btn-feedback-yes" aria-label="Yes, this was helpful">
                            <span>👍 Yes</span>
                        </button>
                        <button type="button" class="btn-feedback btn-feedback-no" aria-label="No, this was not helpful">
                            <span>👎 No</span>
                        </button>
                        <button type="button" class="btn-feedback btn-feedback-share" aria-label="Share Feedback">
                            <span>💬 Share Feedback</span>
                        </button>
                    </div>
                </div>
                <span class="msg-time">${formatTime()}</span>
            </div>
        `;

        const yesBtn = row.querySelector('.btn-feedback-yes');
        const noBtn = row.querySelector('.btn-feedback-no');
        const shareBtn = row.querySelector('.btn-feedback-share');
        const actionsRow = row.querySelector('.feedback-actions-row');

        if (yesBtn) {
            yesBtn.addEventListener('click', () => {
                actionsRow.innerHTML = '<span style="font-size:13px; color:#10b981; font-weight:600;">Glad we could help! 😊</span>';
            });
        }
        if (noBtn) {
            noBtn.addEventListener('click', () => {
                actionsRow.innerHTML = '<span style="font-size:13px; color:#637083;">Thanks for letting us know. You can email support@artsphere.com anytime! ✉️</span>';
            });
        }
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                actionsRow.innerHTML = '<span style="font-size:13px; color:#5540d9; font-weight:600;">Thank you for sharing your feedback with the ArtSphere team! ✨</span>';
            });
        }

        messagesList.appendChild(row);
    };

    // 10. Handle Question Chip Click
    const handleQuestionChipClick = (question) => {
        appendUserMessage(question);
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const reply = getBotResponseForQuery(question);
            appendBotMessage(reply, true);
        }, 550);
    };

    // Bind initial question chips
    const initQuestionChips = () => {
        const chips = document.querySelectorAll('.btn-question-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const question = chip.getAttribute('data-question') || chip.textContent.trim();
                handleQuestionChipClick(question);
            });
        });
    };

    // 11. Send Message Handler
    const handleSendMessage = () => {
        if (!chatMessageInput) return;
        const text = chatMessageInput.value.trim();
        if (!text) return;

        appendUserMessage(text);
        chatMessageInput.value = '';
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const reply = getBotResponseForQuery(text);
            appendBotMessage(reply, true);
        }, 650);
    };

    if (btnSendMessage) {
        btnSendMessage.addEventListener('click', handleSendMessage);
    }
    if (chatMessageInput) {
        chatMessageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    // 12. File Attachment Handler
    if (btnAttachment && fileAttachInput) {
        btnAttachment.addEventListener('click', () => {
            fileAttachInput.click();
        });

        fileAttachInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                appendUserMessage(`📎 Attached file: ${file.name}`);
                showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    appendBotMessage(`We received your attachment: "${file.name}". Our team will review this shortly!`, false);
                }, 600);
            }
        });
    }

    // Helper: Escape HTML
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Initialize
    initQuestionChips();
    scrollToBottom();
});
