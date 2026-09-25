package com.artsphere.model.dto;

import jakarta.validation.constraints.NotBlank;

public class PostRequest {

    private String title;

    @NotBlank(message = "Caption is required")
    private String caption;

    private String mediaUrl;
    private String mediaType = "image";

    @NotBlank(message = "Art form is required")
    private String artForm;

    private String category = "Showcase";
    private String location;
    private String tags;
    private String visibility = "Public";
    private Long userId;

    public PostRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }

    public String getArtForm() { return artForm; }
    public void setArtForm(String artForm) { this.artForm = artForm; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
