package com.artsphere.model;

import java.time.LocalDateTime;

public class Application {

    private Long id;
    private Long userId;
    private Long opportunityId;
    private String status;
    private String notes;
    private LocalDateTime appliedAt;

    public Application() {
    }

    public Application(Long id, Long userId, Long opportunityId, String status, String notes, LocalDateTime appliedAt) {
        this.id = id;
        this.userId = userId;
        this.opportunityId = opportunityId;
        this.status = status;
        this.notes = notes;
        this.appliedAt = appliedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getOpportunityId() {
        return opportunityId;
    }

    public void setOpportunityId(Long opportunityId) {
        this.opportunityId = opportunityId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
}
