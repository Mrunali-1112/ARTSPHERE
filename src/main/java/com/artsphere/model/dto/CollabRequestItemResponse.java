package com.artsphere.model.dto;

public class CollabRequestItemResponse {

    private Long id;
    private Long collaborationId;
    private String collaborationTitle;

    // Sender details
    private Long senderId;
    private String senderName;
    private String senderUsername;
    private String senderAvatar;
    private String senderArtistType;
    private String senderLocation;

    // Receiver details
    private Long receiverId;
    private String receiverName;
    private String receiverUsername;
    private String receiverAvatar;
    private String receiverArtistType;
    private String receiverLocation;

    private String message;
    private String status;
    private String timeAgo;
    private String createdAt;

    public CollabRequestItemResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCollaborationId() { return collaborationId; }
    public void setCollaborationId(Long collaborationId) { this.collaborationId = collaborationId; }

    public String getCollaborationTitle() { return collaborationTitle; }
    public void setCollaborationTitle(String collaborationTitle) { this.collaborationTitle = collaborationTitle; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }

    public String getSenderAvatar() { return senderAvatar; }
    public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }

    public String getSenderArtistType() { return senderArtistType; }
    public void setSenderArtistType(String senderArtistType) { this.senderArtistType = senderArtistType; }

    public String getSenderLocation() { return senderLocation; }
    public void setSenderLocation(String senderLocation) { this.senderLocation = senderLocation; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getReceiverUsername() { return receiverUsername; }
    public void setReceiverUsername(String receiverUsername) { this.receiverUsername = receiverUsername; }

    public String getReceiverAvatar() { return receiverAvatar; }
    public void setReceiverAvatar(String receiverAvatar) { this.receiverAvatar = receiverAvatar; }

    public String getReceiverArtistType() { return receiverArtistType; }
    public void setReceiverArtistType(String receiverArtistType) { this.receiverArtistType = receiverArtistType; }

    public String getReceiverLocation() { return receiverLocation; }
    public void setReceiverLocation(String receiverLocation) { this.receiverLocation = receiverLocation; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTimeAgo() { return timeAgo; }
    public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}