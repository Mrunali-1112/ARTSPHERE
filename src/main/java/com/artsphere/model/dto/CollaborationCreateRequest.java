package com.artsphere.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CollaborationCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String purpose;
    private String skills;
    private String tags;
    private String location;
    private String collaborationType;
    private String availability;
    private String peopleNeeded;
    private String referenceUrl;

    public CollaborationCreateRequest() {}

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
}