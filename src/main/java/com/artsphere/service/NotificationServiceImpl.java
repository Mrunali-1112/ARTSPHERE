package com.artsphere.service;

import com.artsphere.model.dto.NotificationResponse;
import com.artsphere.model.dto.NotificationsPageResponse;
import com.artsphere.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public NotificationsPageResponse getNotifications(Long userId, String category) {
        Long targetUserId = (userId != null && userId > 0) ? userId : 101L;
        List<NotificationResponse> list = notificationRepository.findByUserId(targetUserId, category);
        int unread = notificationRepository.countUnreadByUserId(targetUserId);
        return new NotificationsPageResponse(list, unread, list.size());
    }

    @Override
    public boolean markAsRead(Long id, Long userId) {
        Long targetUserId = (userId != null && userId > 0) ? userId : 101L;
        return notificationRepository.markAsRead(id, targetUserId);
    }

    @Override
    public boolean markAllAsRead(Long userId) {
        Long targetUserId = (userId != null && userId > 0) ? userId : 101L;
        return notificationRepository.markAllAsRead(targetUserId);
    }
}
