package com.artsphere.model;

import java.time.LocalDateTime;

public class Collaboration {
    private Long id;
    private Long creatorId;
    private String title;
    private String description;
    private String purpose;
    private String skills;
    private String tags;
    private String location;
    private String collaborationType;
    private String availability;
    private String peopleNeeded;
    private String referenceUrl;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Collaboration() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCreatorId() { return creatorId; }
    public void setCreatorId(Long creatorId) { this.creatorId = creatorId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
