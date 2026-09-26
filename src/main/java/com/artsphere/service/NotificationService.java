package com.artsphere.service;

import com.artsphere.model.dto.NotificationsPageResponse;

public interface NotificationService {

    NotificationsPageResponse getNotifications(Long userId, String category);

    boolean markAsRead(Long id, Long userId);

    boolean markAllAsRead(Long userId);
}
