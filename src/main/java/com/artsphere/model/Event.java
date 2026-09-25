package com.artsphere.model;

import java.time.LocalDateTime;

public class Event {

    private Long id;
    private String title;
    private String organizer;
    private String location;
    private String eventDate;
    private String eventTime;
    private String imageUrl;
    private String description;
    private LocalDateTime createdAt;

    public Event() {
    }

    public Event(Long id, String title, String organizer, String location, String eventDate, String eventTime, String imageUrl, String description) {
        this.id = id;
        this.title = title;
        this.organizer = organizer;
        this.location = location;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.imageUrl = imageUrl;
        this.description = description;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
