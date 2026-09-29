package com.artsphere.repository;

import com.artsphere.model.dto.NotificationResponse;

import java.util.List;

public interface NotificationRepository {

    List<NotificationResponse> findByUserId(Long userId, String category);

    int countUnreadByUserId(Long userId);

    boolean markAsRead(Long id, Long userId);

    boolean markAllAsRead(Long userId);

    void createNotification(Long userId, String type, String title, String message, Long senderId, String senderName, String senderAvatar, String entityType, Long entityId, String actionUrl);
}
