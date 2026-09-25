package com.artsphere.model.dto;

import java.util.List;

public class CommunityEventResponse {

    private Long id;
    private Long communityId;
    private String title;
    private String organizer;
    private String location;
    private String eventDate;
    private String eventTime;
    private String imageUrl;
    private String description;
    private String eventType;
    private Integer attendeesCount;
    private boolean isRegistered;
    private List<String> attendeeAvatars;

    public CommunityEventResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getOrganizer() { return organizer; }
    public void setOrganizer(String organizer) { this.organizer = organizer; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }

    public String getEventTime() { return eventTime; }
    public void setEventTime(String eventTime) { this.eventTime = eventTime; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Integer getAttendeesCount() { return attendeesCount; }
    public void setAttendeesCount(Integer attendeesCount) { this.attendeesCount = attendeesCount; }

    public boolean isRegistered() { return isRegistered; }
    public void setRegistered(boolean registered) { isRegistered = registered; }

    public List<String> getAttendeeAvatars() { return attendeeAvatars; }
    public void setAttendeeAvatars(List<String> attendeeAvatars) { this.attendeeAvatars = attendeeAvatars; }
}

