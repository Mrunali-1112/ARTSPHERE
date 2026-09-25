package com.artsphere.model.dto;

import java.util.List;

public class PostResponse {

    private Long id;
    private String title;
    private String caption;
    private String mediaUrl;
    private String mediaType;
    private String artForm;
    private String category;
    private String location;
    private List<String> tags;
    private String visibility;
    private int likesCount;
    private int commentsCount;
    private int sharesCount;
    private int savesCount;
    private String timeAgo;
    private String formattedDate;

    // Artist / Author Information
    private Long artistId;
    private String artistName;
    private String artistUsername;
    private String artistAvatar;
    private String artistType;

    // Current user interaction flags
    private boolean liked;
    private boolean saved;

    public PostResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

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

    public String getTimeAgo() { return timeAgo; }
    public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }

    public String getFormattedDate() { return formattedDate; }
    public void setFormattedDate(String formattedDate) { this.formattedDate = formattedDate; }

    public Long getArtistId() { return artistId; }
    public void setArtistId(Long artistId) { this.artistId = artistId; }

    public String getArtistName() { return artistName; }
    public void setArtistName(String artistName) { this.artistName = artistName; }

    public String getArtistUsername() { return artistUsername; }
    public void setArtistUsername(String artistUsername) { this.artistUsername = artistUsername; }

    public String getArtistAvatar() { return artistAvatar; }
    public void setArtistAvatar(String artistAvatar) { this.artistAvatar = artistAvatar; }

    public String getArtistType() { return artistType; }
    public void setArtistType(String artistType) { this.artistType = artistType; }

    public boolean isLiked() { return liked; }
    public void setLiked(boolean liked) { this.liked = liked; }

    public boolean isSaved() { return saved; }
    public void setSaved(boolean saved) { this.saved = saved; }
}
