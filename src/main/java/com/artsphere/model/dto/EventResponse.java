package com.artsphere.model.dto;

import java.util.List;

public class EventResponse {

    private Long id;
    private String title;
    private String organizer;
    private String organizerRole;
    private String organizerAvatar;
    private String location;
    private String venue;
    private String eventDate;
    private String eventTime;
    private String imageUrl;
    private String coverImage;
    private String description;
    private Long communityId;
    private String eventType;
    private Integer attendeesCount;
    private String artForm;
    private Boolean isFeatured;
    private boolean registered;
    private List<String> attendeeAvatars;

    public EventResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOrganizer() {
        return organizer;
    }

    public void setOrganizer(String organizer) {
        this.organizer = organizer;
    }

    public String getOrganizerRole() {
        return organizerRole;
    }

    public void setOrganizerRole(String organizerRole) {
        this.organizerRole = organizerRole;
    }

    public String getOrganizerAvatar() {
        return organizerAvatar;
    }

    public void setOrganizerAvatar(String organizerAvatar) {
        this.organizerAvatar = organizerAvatar;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getEventDate() {
        return eventDate;
    }

    public void setEventDate(String eventDate) {
        this.eventDate = eventDate;
    }

    public String getEventTime() {
        return eventTime;
    }

    public void setEventTime(String eventTime) {
        this.eventTime = eventTime;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCommunityId() {
        return communityId;
    }

    public void setCommunityId(Long communityId) {
        this.communityId = communityId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Integer getAttendeesCount() {
        return attendeesCount;
    }

    public void setAttendeesCount(Integer attendeesCount) {
        this.attendeesCount = attendeesCount;
    }

    public String getArtForm() {
        return artForm;
    }

    public void setArtForm(String artForm) {
        this.artForm = artForm;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }

    public boolean isRegistered() {
        return registered;
    }

    public void setRegistered(boolean registered) {
        this.registered = registered;
    }

    public List<String> getAttendeeAvatars() {
        return attendeeAvatars;
    }

    public void setAttendeeAvatars(List<String> attendeeAvatars) {
        this.attendeeAvatars = attendeeAvatars;
    }
}
