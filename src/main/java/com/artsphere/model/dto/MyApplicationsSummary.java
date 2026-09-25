package com.artsphere.model.dto;

public class MyApplicationsSummary {

    private int totalCount;
    private int eventsCount;
    private int collaborationsCount;
    private int opportunitiesCount;
    private int upcomingCount;
    private int acceptedCount;
    private int pendingCount;
    private int rejectedCount;

    public MyApplicationsSummary() {
    }

    public MyApplicationsSummary(int totalCount, int eventsCount, int collaborationsCount, int opportunitiesCount,
                                int upcomingCount, int acceptedCount, int pendingCount, int rejectedCount) {
        this.totalCount = totalCount;
        this.eventsCount = eventsCount;
        this.collaborationsCount = collaborationsCount;
        this.opportunitiesCount = opportunitiesCount;
        this.upcomingCount = upcomingCount;
        this.acceptedCount = acceptedCount;
        this.pendingCount = pendingCount;
        this.rejectedCount = rejectedCount;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public int getEventsCount() {
        return eventsCount;
    }

    public void setEventsCount(int eventsCount) {
        this.eventsCount = eventsCount;
    }

    public int getCollaborationsCount() {
        return collaborationsCount;
    }

    public void setCollaborationsCount(int collaborationsCount) {
        this.collaborationsCount = collaborationsCount;
    }

    public int getOpportunitiesCount() {
        return opportunitiesCount;
    }

    public void setOpportunitiesCount(int opportunitiesCount) {
        this.opportunitiesCount = opportunitiesCount;
    }

    public int getUpcomingCount() {
        return upcomingCount;
    }

    public void setUpcomingCount(int upcomingCount) {
        this.upcomingCount = upcomingCount;
    }

    public int getAcceptedCount() {
        return acceptedCount;
    }

    public void setAcceptedCount(int acceptedCount) {
        this.acceptedCount = acceptedCount;
    }

    public int getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(int pendingCount) {
        this.pendingCount = pendingCount;
    }

    public int getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(int rejectedCount) {
        this.rejectedCount = rejectedCount;
    }
}
