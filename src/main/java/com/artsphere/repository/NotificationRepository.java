package com.artsphere.repository;

import com.artsphere.model.dto.NotificationResponse;

import java.util.List;

public interface NotificationRepository {

    List<NotificationResponse> findByUserId(Long userId, String category);

    int countUnreadByUserId(Long userId);

    boolean markAsRead(Long id, Long userId);

    boolean markAllAsRead(Long userId);
}
