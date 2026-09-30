package com.artsphere.model.dto;

public class ConversationSummaryResponse {

    private Long id;
    private String title;
    private Long otherUserId;
    private String otherUserName;
    private String otherUserAvatar;
    private String otherUserType;
    private String lastMessage;
    private String lastMessageTime;
    private int unreadCount;
    private String contextType;
    private Long contextId;
    private String contextTitle;
    private String contextImage;
    private String contextUrl;

    public ConversationSummaryResponse() {
    }

    public ConversationSummaryResponse(Long id, String title, Long otherUserId, String otherUserName, String otherUserAvatar, String otherUserType, String lastMessage, String lastMessageTime, int unreadCount, String contextType, Long contextId, String contextTitle, String contextImage, String contextUrl) {
        this.id = id;
        this.title = title;
        this.otherUserId = otherUserId;
        this.otherUserName = otherUserName;
        this.otherUserAvatar = otherUserAvatar;
        this.otherUserType = otherUserType;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.unreadCount = unreadCount;
        this.contextType = contextType;
        this.contextId = contextId;
        this.contextTitle = contextTitle;
        this.contextImage = contextImage;
        this.contextUrl = contextUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getOtherUserId() {
        return otherUserId;
    }

    public void setOtherUserId(Long otherUserId) {
        this.otherUserId = otherUserId;
    }

    public String getOtherUserName() {
        return otherUserName;
    }

    public void setOtherUserName(String otherUserName) {
        this.otherUserName = otherUserName;
    }

    public String getOtherUserAvatar() {
        return otherUserAvatar;
    }

    public void setOtherUserAvatar(String otherUserAvatar) {
        this.otherUserAvatar = otherUserAvatar;
    }

    public String getOtherUserType() {
        return otherUserType;
    }

    public void setOtherUserType(String otherUserType) {
        this.otherUserType = otherUserType;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(String lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public int getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(int unreadCount) {
        this.unreadCount = unreadCount;
    }

    public String getContextType() {
        return contextType;
    }

    public void setContextType(String contextType) {
        this.contextType = contextType;
    }

    public Long getContextId() {
        return contextId;
    }

    public void setContextId(Long contextId) {
        this.contextId = contextId;
    }

    public String getContextTitle() {
        return contextTitle;
    }

    public void setContextTitle(String contextTitle) {
        this.contextTitle = contextTitle;
    }

    public String getContextImage() {
        return contextImage;
    }

    public void setContextImage(String contextImage) {
        this.contextImage = contextImage;
    }

    public String getContextUrl() {
        return contextUrl;
    }

    public void setContextUrl(String contextUrl) {
        this.contextUrl = contextUrl;
    }
}
