package com.artsphere.model.dto;

import jakarta.validation.constraints.NotBlank;

public class CommunityPostCreateRequest {

    private String title;

    @NotBlank(message = "Caption / content is required")
    private String caption;

    private String mediaUrl;
    private String mediaType;
    private String category;
    private String tags;

    public CommunityPostCreateRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}
