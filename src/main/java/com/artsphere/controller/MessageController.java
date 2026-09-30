package com.artsphere.controller;

import com.artsphere.model.dto.*;
import com.artsphere.repository.UserRepository;
import com.artsphere.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    public MessageController(MessageService messageService, UserRepository userRepository) {
        this.messageService = messageService;
        this.userRepository = userRepository;
    }

    private String resolveUsername(Authentication authentication, Long paramUserId) {
        if (paramUserId != null) {
            return userRepository.findById(paramUserId)
                    .map(u -> u.getUsername())
                    .orElse("aanya");
        }
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            return authentication.getName();
        }
        return "aanya";
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationSummaryResponse>>> getConversations(
            @RequestParam(value = "userId", required = false) Long userId,
            Authentication authentication) {
        String username = resolveUsername(authentication, userId);
        List<ConversationSummaryResponse> list = messageService.getConversations(username);
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully", list));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageItemResponse>>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(value = "userId", required = false) Long userId,
            Authentication authentication) {
        String username = resolveUsername(authentication, userId);
        List<MessageItemResponse> messages = messageService.getMessages(conversationId, username);
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", messages));
    }

    @PostMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<MessageItemResponse>> sendMessage(
            @PathVariable Long conversationId,
            @RequestParam(value = "userId", required = false) Long userId,
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication) {
        String username = resolveUsername(authentication, userId);
        MessageItemResponse sent = messageService.sendMessage(conversationId, username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Message sent successfully", sent));
    }

    @PostMapping({"/start", "/conversations"})
    public ResponseEntity<ApiResponse<ConversationSummaryResponse>> startConversation(
            @RequestParam(value = "userId", required = false) Long userId,
            @Valid @RequestBody StartConversationRequest request,
            Authentication authentication) {
        String username = resolveUsername(authentication, userId);
        ConversationSummaryResponse conversation = messageService.startConversation(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Conversation ready", conversation));
    }
}
