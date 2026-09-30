package com.artsphere.service;

import com.artsphere.model.dto.ConversationSummaryResponse;
import com.artsphere.model.dto.MessageItemResponse;
import com.artsphere.model.dto.SendMessageRequest;
import com.artsphere.model.dto.StartConversationRequest;

import java.util.List;

public interface MessageService {

    List<ConversationSummaryResponse> getConversations(String username);

    List<MessageItemResponse> getMessages(Long conversationId, String username);

    MessageItemResponse sendMessage(Long conversationId, String username, SendMessageRequest request);

    ConversationSummaryResponse startConversation(String username, StartConversationRequest request);
}
