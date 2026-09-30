/**
 * ArtSphere — Messages Application Workspace
 * Real database integration, conversation navigation, instant messaging, and responsive layout.
 */

(function () {
    'use strict';

    // Application State
    let conversations = [];
    let activeConversation = null;
    let activeTab = 'ALL';
    let searchQuery = '';
    let currentUser = null;
    let availableArtists = [];
    let selectedArtistId = null;
    let pollInterval = null;

    // DOM Elements
    const conversationsList = document.getElementById('conversationsList');
    const conversationSearchInput = document.getElementById('conversationSearchInput');
    const clearConvoSearchBtn = document.getElementById('clearConvoSearchBtn');
    const headerSearchInput = document.getElementById('headerSearchInput');
    const headerClearSearchBtn = document.getElementById('headerClearSearchBtn');
    const messagesWorkspace = document.getElementById('messagesWorkspace');

    // Chat Viewport Elements
    const chatPlaceholderView = document.getElementById('chatPlaceholderView');
    const chatErrorView = document.getElementById('chatErrorView');
    const chatActiveView = document.getElementById('chatActiveView');
    const chatMessagesFeed = document.getElementById('chatMessagesFeed');
    const chatComposer = document.getElementById('chatComposer');
    const messageInput = document.getElementById('messageInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const btnBackToList = document.getElementById('btnBackToList');

    // Header & Recipient Elements
    const recipientAvatar = document.getElementById('recipientAvatar');
    const recipientName = document.getElementById('recipientName');
    const recipientRole = document.getElementById('recipientRole');
    const recipientProfileLink = document.getElementById('recipientProfileLink');
    const chatContextCard = document.getElementById('chatContextCard');
    const chatContextThumb = document.getElementById('chatContextThumb');
    const chatContextTag = document.getElementById('chatContextTag');
    const chatContextTitle = document.getElementById('chatContextTitle');
    const chatContextLink = document.getElementById('chatContextLink');

    // New Chat Modal Elements
    const newChatModal = document.getElementById('newChatModal');
    const btnNewChat = document.getElementById('btnNewChat');
    const btnEmptyStartChat = document.getElementById('btnEmptyStartChat');
    const btnCloseNewChatModal = document.getElementById('btnCloseNewChatModal');
    const btnCancelNewChat = document.getElementById('btnCancelNewChat');
    const btnConfirmStartChat = document.getElementById('btnConfirmStartChat');
    const modalArtistSearch = document.getElementById('modalArtistSearch');
    const modalArtistsList = document.getElementById('modalArtistsList');
    const initialMessageInput = document.getElementById('initialMessageInput');

    // Retry Button
    const btnRetryLoad = document.getElementById('btnRetryLoad');

    // Badges & Counters
    const sidebarMsgBadge = document.getElementById('sidebarMsgBadge');
    const tabAllBadge = document.getElementById('tabAllBadge');

    // Mobile Drawer
    const dashboardSidebar = document.getElementById('dashboardSidebar');
    const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    // Dropdown elements
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownPanel = document.getElementById('userDropdownPanel');
    const headerDropdownLogoutBtn = document.getElementById('headerDropdownLogoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

    /* ==========================================================================
       Initialization
       ========================================================================== */
    async function init() {
        setupEventListeners();
        await resolveCurrentUser();
        await loadConversations();
        startPolling();
    }

    /* ==========================================================================
       Authentication & Current User Profile
       ========================================================================== */
    async function resolveCurrentUser() {
        try {
            currentUser = await api.getCurrentUser();
        } catch (e) {
            console.warn('Could not fetch /api/auth/me, using fallback profile', e);
        }

        if (!currentUser) {
            currentUser = {
                id: 101,
                username: 'aanya',
                fullName: 'Aanya Deshmukh',
                profilePicture: '/images/artist_profile_avatar.png',
                artistType: 'Visual Artist',
                location: 'Mumbai, MH'
            };
        }

        // Populate Sidebar & Top Header User Meta
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserRole = document.getElementById('sidebarUserRole');
        const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
        const headerUserAvatar = document.getElementById('headerUserAvatar');
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserBio = document.getElementById('dropdownUserBio');

        if (sidebarUserName) sidebarUserName.textContent = currentUser.fullName || currentUser.username;
        if (sidebarUserRole) sidebarUserRole.textContent = currentUser.artistType || 'Visual Artist';
        if (sidebarUserAvatar && currentUser.profilePicture) sidebarUserAvatar.src = currentUser.profilePicture;
        if (headerUserAvatar && currentUser.profilePicture) headerUserAvatar.src = currentUser.profilePicture;
        if (dropdownUserName) dropdownUserName.textContent = currentUser.fullName || currentUser.username;
        if (dropdownUserBio) dropdownUserBio.textContent = currentUser.artistType || 'Visual Artist';
    }

    /* ==========================================================================
       Event Listeners Setup
       ========================================================================== */
    function setupEventListeners() {
        // Mobile Sidebar Drawer
        if (mobileMenuTrigger) {
            mobileMenuTrigger.addEventListener('click', () => {
                dashboardSidebar.classList.add('drawer-open');
                sidebarBackdrop.classList.add('active');
            });
        }
        if (sidebarCloseBtn) {
            sidebarCloseBtn.addEventListener('click', closeSidebarDrawer);
        }
        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', closeSidebarDrawer);
        }

        // Header User Dropdown
        if (userAvatarBtn && userDropdownPanel) {
            userAvatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdownPanel.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if (!userDropdownPanel.contains(e.target) && !userAvatarBtn.contains(e.target)) {
                    userDropdownPanel.classList.remove('show');
                }
            });
        }

        // Logout
        if (headerDropdownLogoutBtn) {
            headerDropdownLogoutBtn.addEventListener('click', () => api.logout());
        }
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.addEventListener('click', () => api.logout());
        }

        // Tabs Filtering
        const tabBtns = document.querySelectorAll('.convo-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                activeTab = btn.getAttribute('data-tab');
                renderConversationsList();
            });
        });

        // Conversation Search
        if (conversationSearchInput) {
            conversationSearchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                if (clearConvoSearchBtn) {
                    clearConvoSearchBtn.style.display = searchQuery ? 'block' : 'none';
                }
                renderConversationsList();
            });
        }
        if (clearConvoSearchBtn) {
            clearConvoSearchBtn.addEventListener('click', () => {
                conversationSearchInput.value = '';
                searchQuery = '';
                clearConvoSearchBtn.style.display = 'none';
                renderConversationsList();
                conversationSearchInput.focus();
            });
        }

        // Top Header Universal Search
        if (headerSearchInput) {
            headerSearchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                if (headerClearSearchBtn) {
                    headerClearSearchBtn.style.display = searchQuery ? 'block' : 'none';
                }
                if (conversationSearchInput) {
                    conversationSearchInput.value = e.target.value;
                }
                renderConversationsList();
            });
        }
        if (headerClearSearchBtn) {
            headerClearSearchBtn.addEventListener('click', () => {
                headerSearchInput.value = '';
                searchQuery = '';
                headerClearSearchBtn.style.display = 'none';
                if (conversationSearchInput) conversationSearchInput.value = '';
                renderConversationsList();
            });
        }

        // Mobile Back Button to list
        if (btnBackToList) {
            btnBackToList.addEventListener('click', () => {
                if (messagesWorkspace) {
                    messagesWorkspace.classList.remove('mobile-chat-active');
                }
            });
        }

        // Retry Load
        if (btnRetryLoad) {
            btnRetryLoad.addEventListener('click', () => loadConversations());
        }

        // Message Composer Submit
        if (chatComposer) {
            chatComposer.addEventListener('submit', handleSendMessage);
        }

        // New Chat Modal Controls
        if (btnNewChat) {
            btnNewChat.addEventListener('click', openNewChatModal);
        }
        if (btnEmptyStartChat) {
            btnEmptyStartChat.addEventListener('click', openNewChatModal);
        }
        if (btnCloseNewChatModal) {
            btnCloseNewChatModal.addEventListener('click', closeNewChatModal);
        }
        if (btnCancelNewChat) {
            btnCancelNewChat.addEventListener('click', closeNewChatModal);
        }
        if (newChatModal) {
            newChatModal.addEventListener('click', (e) => {
                if (e.target === newChatModal) closeNewChatModal();
            });
        }
        if (modalArtistSearch) {
            modalArtistSearch.addEventListener('input', handleArtistSearch);
        }
        if (btnConfirmStartChat) {
            btnConfirmStartChat.addEventListener('click', handleStartNewChat);
        }

        // Call Buttons (Informative Tooltips)
        const btnVoiceCall = document.getElementById('btnVoiceCall');
        const btnVideoCall = document.getElementById('btnVideoCall');
        const btnChatMore = document.getElementById('btnChatMore');
        if (btnVoiceCall) {
            btnVoiceCall.addEventListener('click', () => alert('Voice calling will be available in the upcoming ArtSphere audio update!'));
        }
        if (btnVideoCall) {
            btnVideoCall.addEventListener('click', () => alert('Video calling will be available in the upcoming ArtSphere studio update!'));
        }
        if (btnChatMore) {
            btnChatMore.addEventListener('click', () => {
                if (activeConversation && activeConversation.otherUserId) {
                    window.location.href = '/pages/artist-profile.html?id=' + activeConversation.otherUserId;
                }
            });
        }
    }

    function closeSidebarDrawer() {
        dashboardSidebar.classList.remove('drawer-open');
        sidebarBackdrop.classList.remove('active');
    }

    /* ==========================================================================
       Load Conversations from Real Backend API
       ========================================================================== */
    async function loadConversations(keepActive = true) {
        try {
            const data = await api.getConversations(currentUser?.id);
            conversations = Array.isArray(data) ? data : [];
            
            // Hide error view
            if (chatErrorView) chatErrorView.style.display = 'none';

            updateBadges();
            renderConversationsList();

            // Auto-select first or maintain active
            if (conversations.length > 0) {
                const urlParams = new URLSearchParams(window.location.search);
                const queryConvoId = urlParams.get('id') || urlParams.get('convoId');
                const queryArtistId = urlParams.get('artistId') || urlParams.get('userId');

                let targetConvo = null;
                if (queryConvoId) {
                    targetConvo = conversations.find(c => c.id == queryConvoId);
                } else if (queryArtistId) {
                    targetConvo = conversations.find(c => c.otherUserId == queryArtistId);
                } else if (keepActive && activeConversation) {
                    targetConvo = conversations.find(c => c.id === activeConversation.id);
                }

                if (!targetConvo && !activeConversation) {
                    targetConvo = conversations[0];
                }

                if (targetConvo) {
                    await selectConversation(targetConvo);
                }
            } else {
                // Empty state
                showEmptyPlaceholder();
            }
        } catch (err) {
            console.error('Failed to load conversations:', err);
            showErrorState();
        }
    }

    /* ==========================================================================
       Render Conversations List
       ========================================================================== */
    function renderConversationsList() {
        if (!conversationsList) return;

        // Apply tab filter & search
        let filtered = conversations.filter(c => {
            // Tab filter
            if (activeTab === 'UNREAD') {
                if (!c.unreadCount || c.unreadCount <= 0) return false;
            } else if (activeTab === 'GROUPS') {
                if (c.contextType !== 'COLLABORATION' && c.contextType !== 'GROUP') return false;
            }

            // Search filter
            if (searchQuery) {
                const name = (c.otherUserName || c.title || '').toLowerCase();
                const snippet = (c.lastMessage || '').toLowerCase();
                const role = (c.otherUserType || '').toLowerCase();
                return name.includes(searchQuery) || snippet.includes(searchQuery) || role.includes(searchQuery);
            }

            return true;
        });

        if (filtered.length === 0) {
            conversationsList.innerHTML = `
                <div class="convo-empty-msg-box">
                    <p style="font-size:13.5px;color:var(--text-muted);margin-top:24px;">
                        ${searchQuery ? 'No conversations matching "' + escapeHtml(searchQuery) + '"' : 'No conversations in this tab.'}
                    </p>
                </div>
            `;
            return;
        }

        conversationsList.innerHTML = '';

        filtered.forEach(convo => {
            const isSelected = activeConversation && activeConversation.id === convo.id;
            const hasUnread = convo.unreadCount && convo.unreadCount > 0;
            const avatar = convo.otherUserAvatar || '/images/artist_profile_avatar.png';
            const displayName = convo.otherUserName || convo.title || 'Creator';
            const snippet = convo.lastMessage || 'Start a conversation';
            const time = convo.lastMessageTime || '';

            const item = document.createElement('div');
            item.className = `convo-item-card ${isSelected ? 'active' : ''} ${hasUnread ? 'has-unread' : ''}`;
            item.dataset.id = convo.id;

            item.innerHTML = `
                <div class="convo-avatar-wrapper">
                    <img src="${avatar}" alt="${escapeHtml(displayName)}" class="convo-avatar-img">
                    <span class="convo-online-indicator"></span>
                </div>
                <div class="convo-details-col">
                    <div class="convo-top-row">
                        <span class="convo-name">${escapeHtml(displayName)}</span>
                        <span class="convo-time">${escapeHtml(time)}</span>
                    </div>
                    <div class="convo-bottom-row">
                        <span class="convo-snippet">${escapeHtml(snippet)}</span>
                        ${hasUnread ? `<span class="convo-unread-badge">${convo.unreadCount}</span>` : ''}
                    </div>
                </div>
            `;

            item.addEventListener('click', () => {
                selectConversation(convo);
            });

            conversationsList.appendChild(item);
        });
    }

    /* ==========================================================================
       Select & Open Active Conversation
       ========================================================================== */
    async function selectConversation(convo) {
        activeConversation = convo;

        // Mobile viewport transition
        if (messagesWorkspace) {
            messagesWorkspace.classList.add('mobile-chat-active');
        }

        // Highlight active item in list
        document.querySelectorAll('.convo-item-card').forEach(el => {
            el.classList.toggle('active', el.dataset.id == convo.id);
        });

        // Hide placeholder & error
        if (chatPlaceholderView) chatPlaceholderView.style.display = 'none';
        if (chatErrorView) chatErrorView.style.display = 'none';
        if (chatActiveView) chatActiveView.style.display = 'flex';

        // Update Chat Header Information
        const displayName = convo.otherUserName || convo.title || 'Artist';
        const avatar = convo.otherUserAvatar || '/images/artist_profile_avatar.png';
        const role = convo.otherUserType || 'Artist';

        if (recipientName) recipientName.textContent = displayName;
        if (recipientRole) recipientRole.innerHTML = `${escapeHtml(role)} &bull; Mumbai, MH`;
        if (recipientAvatar) recipientAvatar.src = avatar;
        if (recipientProfileLink && convo.otherUserId) {
            recipientProfileLink.href = `/pages/artist-profile.html?id=${convo.otherUserId}`;
        }

        // Collaboration / Project Context Banner
        if (chatContextCard) {
            if (convo.contextTitle && convo.contextTitle.trim() !== '') {
                chatContextCard.style.display = 'flex';
                if (chatContextThumb) chatContextThumb.src = convo.contextImage || '/images/opp_short_film_illustrator.png';
                if (chatContextTag) chatContextTag.textContent = convo.contextType || 'COLLABORATION';
                if (chatContextTitle) chatContextTitle.textContent = convo.contextTitle;
                if (chatContextLink) chatContextLink.href = convo.contextUrl || '#';
            } else {
                chatContextCard.style.display = 'none';
            }
        }

        // Clear unread badge locally
        if (convo.unreadCount > 0) {
            convo.unreadCount = 0;
            updateBadges();
            renderConversationsList();
        }

        // Load Messages
        await loadMessages(convo.id);

        if (messageInput) {
            messageInput.focus();
        }
    }

    /* ==========================================================================
       Load Messages History
       ========================================================================== */
    async function loadMessages(conversationId) {
        if (!chatMessagesFeed) return;

        chatMessagesFeed.innerHTML = `
            <div class="convo-loading-placeholder">
                <div class="convo-spinner"></div>
                <span>Loading messages...</span>
            </div>
        `;

        try {
            const messages = await api.getConversationMessages(conversationId, currentUser?.id);
            renderMessagesFeed(messages);
        } catch (err) {
            console.error('Failed to load messages:', err);
            chatMessagesFeed.innerHTML = `
                <div class="convo-empty-msg-box">
                    <p style="color:#d94f68;">Failed to load messages. <button id="btnRetryMessages" style="color:var(--primary-plum);text-decoration:underline;cursor:pointer;">Retry</button></p>
                </div>
            `;
            const retry = document.getElementById('btnRetryMessages');
            if (retry) retry.addEventListener('click', () => loadMessages(conversationId));
        }
    }

    /* ==========================================================================
       Render Messages Feed
       ========================================================================== */
    function renderMessagesFeed(messages) {
        if (!chatMessagesFeed) return;
        chatMessagesFeed.innerHTML = '';

        // Add Date Divider "Today"
        const dateDiv = document.createElement('div');
        dateDiv.className = 'chat-date-divider';
        dateDiv.innerHTML = '<span class="chat-date-pill">Today</span>';
        chatMessagesFeed.appendChild(dateDiv);

        if (!messages || messages.length === 0) {
            const emptyNotice = document.createElement('div');
            emptyNotice.className = 'convo-empty-msg-box';
            emptyNotice.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No messages yet. Send a greeting to start chatting!</p>';
            chatMessagesFeed.appendChild(emptyNotice);
            return;
        }

        messages.forEach(msg => {
            const isOwn = msg.own || (currentUser && msg.senderId === currentUser.id);
            const time = msg.formattedTime || formatTime(msg.sentAt);

            const group = document.createElement('div');
            group.className = `message-bubble-group ${isOwn ? 'outgoing' : 'incoming'}`;

            // Check if message text has special card pattern or render as normal bubble
            let bubbleContent = '';
            
            // Render text
            bubbleContent = `<div class="message-bubble">${escapeHtml(msg.messageText)}</div>`;

            // Meta row with timestamp & read ticks
            const metaRow = document.createElement('div');
            metaRow.className = 'message-meta-row';
            metaRow.innerHTML = `
                <span>${escapeHtml(time)}</span>
                ${isOwn ? '<span class="message-checkmarks">&#10003;&#10003;</span>' : ''}
            `;

            group.innerHTML = bubbleContent;
            group.appendChild(metaRow);
            chatMessagesFeed.appendChild(group);
        });

        // Auto-scroll to bottom
        chatMessagesFeed.scrollTop = chatMessagesFeed.scrollHeight;
    }

    /* ==========================================================================
       Send Message
       ========================================================================== */
    async function handleSendMessage(e) {
        e.preventDefault();
        if (!activeConversation) return;

        const text = messageInput.value.trim();
        if (!text) return;

        // Disable to prevent duplicate submission
        messageInput.disabled = true;
        btnSendMessage.disabled = true;

        try {
            const sent = await api.sendMessage(activeConversation.id, text, currentUser?.id);
            
            // Append message bubble immediately
            appendSingleMessage(sent);

            // Update conversation snippet in list
            activeConversation.lastMessage = text;
            activeConversation.lastMessageTime = 'Just now';

            // Move active conversation to top of list
            const idx = conversations.findIndex(c => c.id === activeConversation.id);
            if (idx > 0) {
                conversations.splice(idx, 1);
                conversations.unshift(activeConversation);
            }

            renderConversationsList();

            // Clear input & focus
            messageInput.value = '';
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Unable to send message: ' + (err.message || 'Server error'));
        } finally {
            messageInput.disabled = false;
            btnSendMessage.disabled = false;
            messageInput.focus();
        }
    }

    function appendSingleMessage(msg) {
        if (!chatMessagesFeed) return;

        const isOwn = true;
        const time = msg.formattedTime || 'Just now';

        const group = document.createElement('div');
        group.className = 'message-bubble-group outgoing';
        group.innerHTML = `
            <div class="message-bubble">${escapeHtml(msg.messageText)}</div>
            <div class="message-meta-row">
                <span>${escapeHtml(time)}</span>
                <span class="message-checkmarks">&#10003;&#10003;</span>
            </div>
        `;

        chatMessagesFeed.appendChild(group);
        chatMessagesFeed.scrollTop = chatMessagesFeed.scrollHeight;
    }

    /* ==========================================================================
       New Chat Modal Flow
       ========================================================================== */
    async function openNewChatModal() {
        if (!newChatModal) return;
        newChatModal.style.display = 'flex';
        selectedArtistId = null;
        if (btnConfirmStartChat) btnConfirmStartChat.disabled = true;
        if (initialMessageInput) initialMessageInput.value = '';
        if (modalArtistSearch) modalArtistSearch.value = '';

        await loadArtistsForModal();
    }

    function closeNewChatModal() {
        if (newChatModal) newChatModal.style.display = 'none';
    }

    async function loadArtistsForModal() {
        if (!modalArtistsList) return;
        modalArtistsList.innerHTML = `
            <div class="convo-loading-placeholder">
                <div class="convo-spinner"></div>
                <span>Loading artists...</span>
            </div>
        `;

        try {
            const res = await fetch('/api/artists');
            const json = await res.json();
            availableArtists = (json.data || []).filter(a => !currentUser || a.id !== currentUser.id);
            renderArtistsList(availableArtists);
        } catch (err) {
            console.error('Failed to load artists:', err);
            modalArtistsList.innerHTML = '<p style="padding:12px;color:var(--text-muted);font-size:13px;">Unable to load artists.</p>';
        }
    }

    function renderArtistsList(artists) {
        if (!modalArtistsList) return;
        if (artists.length === 0) {
            modalArtistsList.innerHTML = '<p style="padding:12px;color:var(--text-muted);font-size:13px;">No artists found.</p>';
            return;
        }

        modalArtistsList.innerHTML = '';
        artists.forEach(artist => {
            const item = document.createElement('div');
            item.className = `modal-artist-item ${selectedArtistId === artist.id ? 'selected' : ''}`;
            item.innerHTML = `
                <img src="${artist.avatarUrl || '/images/artist_profile_avatar.png'}" class="modal-artist-avatar" alt="${escapeHtml(artist.name)}">
                <div class="modal-artist-info">
                    <span class="modal-artist-name">${escapeHtml(artist.name)}</span>
                    <span class="modal-artist-role">${escapeHtml(artist.profession || 'Artist')} &bull; ${escapeHtml(artist.location || 'Mumbai')}</span>
                </div>
            `;

            item.addEventListener('click', () => {
                selectedArtistId = artist.id;
                document.querySelectorAll('.modal-artist-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                if (btnConfirmStartChat) btnConfirmStartChat.disabled = false;
            });

            modalArtistsList.appendChild(item);
        });
    }

    function handleArtistSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        const filtered = availableArtists.filter(a => 
            (a.name || '').toLowerCase().includes(query) ||
            (a.profession || '').toLowerCase().includes(query) ||
            (a.location || '').toLowerCase().includes(query)
        );
        renderArtistsList(filtered);
    }

    async function handleStartNewChat() {
        if (!selectedArtistId) return;

        btnConfirmStartChat.disabled = true;
        btnConfirmStartChat.textContent = 'Starting...';

        try {
            // Check if conversation already exists
            let existing = conversations.find(c => c.otherUserId === selectedArtistId);

            if (!existing) {
                // Create conversation via backend
                const newConvo = await api.startConversation(selectedArtistId, { contextType: 'DIRECT' }, currentUser?.id);
                conversations.unshift(newConvo);
                existing = newConvo;
            }

            // If user typed an initial message, send it now
            const initText = initialMessageInput ? initialMessageInput.value.trim() : '';
            if (initText && existing) {
                await api.sendMessage(existing.id, initText, currentUser?.id);
                existing.lastMessage = initText;
                existing.lastMessageTime = 'Just now';
            }

            closeNewChatModal();
            renderConversationsList();
            await selectConversation(existing);
        } catch (err) {
            console.error('Failed to start conversation:', err);
            alert('Unable to start conversation: ' + (err.message || 'Server error'));
        } finally {
            btnConfirmStartChat.disabled = false;
            btnConfirmStartChat.textContent = 'Start Chat';
        }
    }

    /* ==========================================================================
       Helpers & Badges
       ========================================================================== */
    function updateBadges() {
        const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        if (sidebarMsgBadge) {
            sidebarMsgBadge.textContent = totalUnread;
            sidebarMsgBadge.style.display = totalUnread > 0 ? 'inline-block' : 'none';
        }
        if (tabAllBadge) {
            tabAllBadge.textContent = conversations.length;
        }
    }

    function showEmptyPlaceholder() {
        if (chatActiveView) chatActiveView.style.display = 'none';
        if (chatErrorView) chatErrorView.style.display = 'none';
        if (chatPlaceholderView) chatPlaceholderView.style.display = 'flex';
        if (conversationsList) {
            conversationsList.innerHTML = `
                <div class="convo-empty-msg-box">
                    <p style="font-size:13.5px;color:var(--text-muted);margin-top:24px;">No conversations yet.<br>Start chatting with fellow creators!</p>
                </div>
            `;
        }
    }

    function showErrorState() {
        if (chatActiveView) chatActiveView.style.display = 'none';
        if (chatPlaceholderView) chatPlaceholderView.style.display = 'none';
        if (chatErrorView) chatErrorView.style.display = 'flex';
        if (conversationsList) {
            conversationsList.innerHTML = `
                <div class="convo-empty-msg-box">
                    <p style="font-size:13.5px;color:#d94f68;margin-top:24px;">Failed to load conversations.<br>Please try again.</p>
                </div>
            `;
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatTime(isoString) {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    }

    /* ==========================================================================
       Polling for New Messages (Background Sync)
       ========================================================================== */
    function startPolling() {
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(async () => {
            if (activeConversation && document.visibilityState === 'visible') {
                try {
                    const messages = await api.getConversationMessages(activeConversation.id, currentUser?.id);
                    // Only update feed if count increased
                    const currentCount = chatMessagesFeed.querySelectorAll('.message-bubble-group').length;
                    if (messages.length > currentCount) {
                        renderMessagesFeed(messages);
                    }
                } catch {
                    // Silently ignore background poll errors
                }
            }
        }, 5000);
    }

    // Auto-boot on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
