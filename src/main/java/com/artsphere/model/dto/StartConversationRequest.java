package com.artsphere.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;

public class StartConversationRequest {

    @NotNull(message = "Recipient ID is required")
    @JsonAlias({"recipientId", "artistId", "userId"})
    private Long recipientId;

    @JsonAlias({"initialMessage", "message", "content"})
    private String initialMessage;

    private String contextType;
    private Long contextId;
    private String contextTitle;
    private String contextImage;
    private String contextUrl;

    public StartConversationRequest() {
    }

    public StartConversationRequest(Long recipientId) {
        this.recipientId = recipientId;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getInitialMessage() {
        return initialMessage;
    }

    public void setInitialMessage(String initialMessage) {
        this.initialMessage = initialMessage;
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
