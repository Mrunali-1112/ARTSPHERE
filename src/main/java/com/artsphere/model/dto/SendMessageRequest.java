package com.artsphere.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.AssertTrue;

public class SendMessageRequest {

    @JsonAlias({"content", "message", "text"})
    private String messageText;

    public SendMessageRequest() {
    }

    public SendMessageRequest(String messageText) {
        this.messageText = messageText;
    }

    public String getMessageText() {
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

    public String getContent() {
        return messageText;
    }

    public void setContent(String content) {
        this.messageText = content;
    }

    @AssertTrue(message = "Message text cannot be empty")
    public boolean isValid() {
        return messageText != null && !messageText.trim().isEmpty();
    }
}
