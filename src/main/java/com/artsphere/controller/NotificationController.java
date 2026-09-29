package com.artsphere.controller;

import com.artsphere.model.dto.ApiResponse;
import com.artsphere.model.dto.NotificationsPageResponse;
import com.artsphere.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationsPageResponse>> getNotifications(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "category", required = false) String category) {
        NotificationsPageResponse data = notificationService.getNotifications(userId, category);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", data));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAsRead(
            @PathVariable Long id,
            @RequestParam(value = "userId", required = false) Long userId) {
        boolean marked = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", Map.of(
                "id", id,
                "markedRead", marked
        )));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllAsRead(
            @RequestParam(value = "userId", required = false) Long userId) {
        boolean marked = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", Map.of(
                "allRead", marked
        )));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createNotification(
            @RequestBody Map<String, Object> body,
            @RequestParam(value = "userId", required = false) Long userId) {
        Long targetUserId = userId != null ? userId : (body.get("userId") != null ? Long.valueOf(body.get("userId").toString()) : 101L);
        String type = (String) body.getOrDefault("type", "SYSTEM");
        String title = (String) body.getOrDefault("title", "New Notification");
        String message = (String) body.getOrDefault("message", "");
        Long senderId = body.get("senderId") != null ? Long.valueOf(body.get("senderId").toString()) : null;
        String senderName = (String) body.get("senderName");
        String senderAvatar = (String) body.get("senderAvatar");
        String entityType = (String) body.get("entityType");
        Long entityId = body.get("entityId") != null ? Long.valueOf(body.get("entityId").toString()) : null;
        String actionUrl = (String) body.get("actionUrl");

        notificationService.createNotification(targetUserId, type, title, message, senderId, senderName, senderAvatar, entityType, entityId, actionUrl);
        return ResponseEntity.ok(ApiResponse.success("Notification created successfully", Map.of("created", true)));
    }
}
