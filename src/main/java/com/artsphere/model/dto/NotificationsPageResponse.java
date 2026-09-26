package com.artsphere.model.dto;

import java.util.List;

public class NotificationsPageResponse {

    private List<NotificationResponse> notifications;
    private int unreadCount;
    private int totalCount;

    public NotificationsPageResponse() {
    }

    public NotificationsPageResponse(List<NotificationResponse> notifications, int unreadCount, int totalCount) {
        this.notifications = notifications;
        this.unreadCount = unreadCount;
        this.totalCount = totalCount;
    }

    public List<NotificationResponse> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<NotificationResponse> notifications) {
        this.notifications = notifications;
    }

    public int getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(int unreadCount) {
        this.unreadCount = unreadCount;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
}
