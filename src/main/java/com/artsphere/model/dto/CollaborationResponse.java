package com.artsphere.model.dto;

import java.util.List;

public class CollaborationResponse {

    private Long id;
    private Long creatorId;
    private String creatorName;
    private String creatorUsername;
    private String creatorAvatar;
    private String creatorArtistType;
    private String creatorLocation;

    private String title;
    private String description;
    private String purpose;
    private List<String> skills;
    private List<String> tags;
    private String location;
    private String collaborationType;
    private String availability;
    private String peopleNeeded;
    private String referenceUrl;
    private String status;
    private String timeAgo;
    private String createdAt;
    private boolean ownPost;

    public CollaborationResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCreatorId() { return creatorId; }
    public void setCreatorId(Long creatorId) { this.creatorId = creatorId; }

    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }

    public String getCreatorUsername() { return creatorUsername; }
    public void setCreatorUsername(String creatorUsername) { this.creatorUsername = creatorUsername; }

    public String getCreatorAvatar() { return creatorAvatar; }
    public void setCreatorAvatar(String creatorAvatar) { this.creatorAvatar = creatorAvatar; }

    public String getCreatorArtistType() { return creatorArtistType; }
    public void setCreatorArtistType(String creatorArtistType) { this.creatorArtistType = creatorArtistType; }

    public String getCreatorLocation() { return creatorLocation; }
    public void setCreatorLocation(String creatorLocation) { this.creatorLocation = creatorLocation; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCollaborationType() { return collaborationType; }
    public void setCollaborationType(String collaborationType) { this.collaborationType = collaborationType; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getPeopleNeeded() { return peopleNeeded; }
    public void setPeopleNeeded(String peopleNeeded) { this.peopleNeeded = peopleNeeded; }

    public String getReferenceUrl() { return referenceUrl; }
    public void setReferenceUrl(String referenceUrl) { this.referenceUrl = referenceUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTimeAgo() { return timeAgo; }
    public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public boolean isOwnPost() { return ownPost; }
    public void setOwnPost(boolean ownPost) { this.ownPost = ownPost; }
}