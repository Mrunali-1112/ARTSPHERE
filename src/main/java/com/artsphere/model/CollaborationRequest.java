package com.artsphere.model;

import java.time.LocalDateTime;

public class CollaborationRequest {
    private Long id;
    private Long collaborationId;
    private Long senderId;
    private Long receiverId;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CollaborationRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCollaborationId() { return collaborationId; }
    public void setCollaborationId(Long collaborationId) { this.collaborationId = collaborationId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
