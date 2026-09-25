package com.artsphere.model.dto;

import jakarta.validation.constraints.NotBlank;

public class CollabSendRequest {

    private Long collaborationId;
    private Long receiverId;

    @NotBlank(message = "Message is required")
    private String message;

    public CollabSendRequest() {}

    public Long getCollaborationId() { return collaborationId; }
    public void setCollaborationId(Long collaborationId) { this.collaborationId = collaborationId; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}