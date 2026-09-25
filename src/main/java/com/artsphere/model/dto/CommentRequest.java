package com.artsphere.model.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentRequest {

    @NotBlank(message = "Comment content is required")
    private String content;

    private Long userId;

    public CommentRequest() {}

    public CommentRequest(String content, Long userId) {
        this.content = content;
        this.userId = userId;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
