package com.artsphere.model;

import java.time.LocalDateTime;

public class Opportunity {

    private Long id;
    private String title;
    private String subtitle;
    private String description;
    private String category;
    private String artCategory;
    private String organizer;
    private String organizerType;
    private String organizerAvatar;
    private String location;
    private String daysLeft;
    private String deadline;
    private String duration;
    private String imageUrl;
    private String requirements;
    private String benefits;
    private String quoteText;
    private String quoteAuthor;
    private boolean isFeatured;
    private String status;
    private LocalDateTime createdAt;

    public Opportunity() {
    }

    public Opportunity(Long id, String title, String subtitle, String description, String category,
                       String artCategory, String organizer, String organizerType, String organizerAvatar,
                       String location, String daysLeft, String deadline, String duration, String imageUrl,
                       String requirements, String benefits, String quoteText, String quoteAuthor,
                       boolean isFeatured, String status, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.description = description;
        this.category = category;
        this.artCategory = artCategory;
        this.organizer = organizer;
        this.organizerType = organizerType;
        this.organizerAvatar = organizerAvatar;
        this.location = location;
        this.daysLeft = daysLeft;
        this.deadline = deadline;
        this.duration = duration;
        this.imageUrl = imageUrl;
        this.requirements = requirements;
        this.benefits = benefits;
        this.quoteText = quoteText;
        this.quoteAuthor = quoteAuthor;
        this.isFeatured = isFeatured;
        this.status = status;
        this.createdAt = createdAt;
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

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getArtCategory() {
        return artCategory;
    }

    public void setArtCategory(String artCategory) {
        this.artCategory = artCategory;
    }

    public String getOrganizer() {
        return organizer;
    }

    public void setOrganizer(String organizer) {
        this.organizer = organizer;
    }

    public String getOrganizerType() {
        return organizerType;
    }

    public void setOrganizerType(String organizerType) {
        this.organizerType = organizerType;
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

    public String getDaysLeft() {
        return daysLeft;
    }

    public void setDaysLeft(String daysLeft) {
        this.daysLeft = daysLeft;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public String getQuoteText() {
        return quoteText;
    }

    public void setQuoteText(String quoteText) {
        this.quoteText = quoteText;
    }

    public String getQuoteAuthor() {
        return quoteAuthor;
    }

    public void setQuoteAuthor(String quoteAuthor) {
        this.quoteAuthor = quoteAuthor;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
