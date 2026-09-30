package com.artsphere.repository;

import com.artsphere.model.Conversation;
import com.artsphere.model.dto.ConversationSummaryResponse;
import com.artsphere.model.dto.MessageItemResponse;

import java.util.List;
import java.util.Optional;

public interface MessageRepository {

    List<ConversationSummaryResponse> findConversationsForUser(Long userId);

    Optional<Conversation> findConversationById(Long conversationId);

    boolean isUserInConversation(Long conversationId, Long userId);

    List<MessageItemResponse> findMessagesByConversationId(Long conversationId, Long currentUserId);

    MessageItemResponse saveMessage(Long conversationId, Long senderId, String messageText);

    ConversationSummaryResponse findOrCreateDirectConversation(Long currentUserId, Long recipientId, String contextType, Long contextId, String contextTitle, String contextImage, String contextUrl);

    void markMessagesAsRead(Long conversationId, Long userId);

    List<Long> findParticipantUserIds(Long conversationId, Long excludeUserId);
}
