package com.artsphere.service;

import com.artsphere.exception.ResourceNotFoundException;
import com.artsphere.model.User;
import com.artsphere.model.dto.ConversationSummaryResponse;
import com.artsphere.model.dto.MessageItemResponse;
import com.artsphere.model.dto.SendMessageRequest;
import com.artsphere.model.dto.StartConversationRequest;
import com.artsphere.repository.MessageRepository;
import com.artsphere.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MessageServiceImpl(MessageRepository messageRepository,
                              UserRepository userRepository,
                              NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User getAuthenticatedUser(String username) {
        if (username != null && !username.isBlank() && !"anonymousUser".equals(username)) {
            Optional<User> u = userRepository.findByUsername(username)
                    .or(() -> userRepository.findByEmail(username));
            if (u.isPresent()) {
                return u.get();
            }
        }
        return userRepository.findById(101L)
                .orElseThrow(() -> new ResourceNotFoundException("Default user not found"));
    }

    @Override
    public List<ConversationSummaryResponse> getConversations(String username) {
        User user = getAuthenticatedUser(username);
        return messageRepository.findConversationsForUser(user.getId());
    }

    @Override
    @Transactional
    public List<MessageItemResponse> getMessages(Long conversationId, String username) {
        User user = getAuthenticatedUser(username);

        // Security check: User must be a participant
        if (!messageRepository.isUserInConversation(conversationId, user.getId())) {
            throw new IllegalArgumentException("Access denied: You are not a participant in this conversation");
        }

        // Mark incoming messages as read
        messageRepository.markMessagesAsRead(conversationId, user.getId());

        return messageRepository.findMessagesByConversationId(conversationId, user.getId());
    }

    @Override
    @Transactional
    public MessageItemResponse sendMessage(Long conversationId, String username, SendMessageRequest request) {
        User user = getAuthenticatedUser(username);

        // Security check: User must be a participant
        if (!messageRepository.isUserInConversation(conversationId, user.getId())) {
            throw new IllegalArgumentException("Access denied: You are not a participant in this conversation");
        }

        if (request.getMessageText() == null || request.getMessageText().trim().isEmpty()) {
            throw new IllegalArgumentException("Message text cannot be empty");
        }

        MessageItemResponse msg = messageRepository.saveMessage(conversationId, user.getId(), request.getMessageText().trim());

        try {
            List<Long> recipientIds = messageRepository.findParticipantUserIds(conversationId, user.getId());
            for (Long recipientId : recipientIds) {
                notificationService.createNotification(
                        recipientId,
                        "MESSAGE",
                        "New message from " + user.getFullName(),
                        request.getMessageText().trim(),
                        user.getId(),
                        user.getFullName(),
                        user.getProfilePicture() != null ? user.getProfilePicture() : "/images/artist_profile_avatar.png",
                        "CONVERSATION",
                        conversationId,
                        "/pages/messages.html?conversationId=" + conversationId
                );
            }
        } catch (Exception ignored) {}

        return msg;
    }

    @Override
    @Transactional
    public ConversationSummaryResponse startConversation(String username, StartConversationRequest request) {
        User user = getAuthenticatedUser(username);

        if (request.getRecipientId() == null) {
            throw new IllegalArgumentException("Recipient ID is required");
        }

        if (user.getId().equals(request.getRecipientId())) {
            throw new IllegalArgumentException("You cannot start a conversation with yourself");
        }

        // Verify recipient exists
        if (userRepository.findById(request.getRecipientId()).isEmpty()) {
            throw new ResourceNotFoundException("Recipient user not found with ID: " + request.getRecipientId());
        }

        return messageRepository.findOrCreateDirectConversation(
                user.getId(),
                request.getRecipientId(),
                request.getContextType(),
                request.getContextId(),
                request.getContextTitle(),
                request.getContextImage(),
                request.getContextUrl()
        );
    }
}
