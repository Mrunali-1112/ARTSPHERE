package com.artsphere.model;

import java.time.LocalDateTime;

public class Post {

    private Long id;
    private Long userId;
    private String title;
    private String caption;
    private String mediaUrl;
    private String mediaType;
    private String artForm;
    private String category;
    private String location;
    private String tags;
    private String visibility;
    private int likesCount;
    private int commentsCount;
    private int sharesCount;
    private int savesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Post() {}

    public Post(Long id, Long userId, String title, String caption, String mediaUrl, String mediaType,
                String artForm, String category, String location, String tags, String visibility,
                int likesCount, int commentsCount, int sharesCount, int savesCount,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.caption = caption;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.artForm = artForm;
        this.category = category;
        this.location = location;
        this.tags = tags;
        this.visibility = visibility;
        this.likesCount = likesCount;
        this.commentsCount = commentsCount;
        this.sharesCount = sharesCount;
        this.savesCount = savesCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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

    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }

    public int getCommentsCount() { return commentsCount; }
    public void setCommentsCount(int commentsCount) { this.commentsCount = commentsCount; }

    public int getSharesCount() { return sharesCount; }
    public void setSharesCount(int sharesCount) { this.sharesCount = sharesCount; }

    public int getSavesCount() { return savesCount; }
    public void setSavesCount(int savesCount) { this.savesCount = savesCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
