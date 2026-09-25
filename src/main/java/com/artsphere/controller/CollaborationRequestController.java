package com.artsphere.controller;

import com.artsphere.model.dto.*;
import com.artsphere.repository.UserRepository;
import com.artsphere.service.CollaborationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collaboration-requests")
public class CollaborationRequestController {

    private final CollaborationService collaborationService;
    private final UserRepository userRepository;

    public CollaborationRequestController(CollaborationService collaborationService, UserRepository userRepository) {
        this.collaborationService = collaborationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CollabRequestItemResponse>>> getRequests(
            @RequestParam(defaultValue = "received") String type,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        List<CollabRequestItemResponse> list = collaborationService.getRequests(type, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Collaboration requests retrieved successfully", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CollabRequestItemResponse>> sendRequest(
            @Valid @RequestBody CollabSendRequest request,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        CollabRequestItemResponse res = collaborationService.sendCollaborationRequest(request.getCollaborationId(), request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Collaboration request sent successfully", res));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<Map<String, Object>>> acceptRequest(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        boolean updated = collaborationService.respondToRequest(id, "APPROVED", currentUserId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        data.put("status", "APPROVED");
        data.put("updated", updated);
        return ResponseEntity.ok(ApiResponse.success("Collaboration request accepted", data));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectRequest(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        boolean updated = collaborationService.respondToRequest(id, "REJECTED", currentUserId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        data.put("status", "REJECTED");
        data.put("updated", updated);
        return ResponseEntity.ok(ApiResponse.success("Collaboration request rejected", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateRequest(
            @PathVariable Long id,
            @RequestBody CollabRequestActionRequest actionRequest,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        String status = (actionRequest != null && actionRequest.getStatus() != null) ? actionRequest.getStatus() : "APPROVED";
        boolean updated = collaborationService.respondToRequest(id, status, currentUserId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        data.put("status", status);
        data.put("updated", updated);
        return ResponseEntity.ok(ApiResponse.success("Collaboration request updated", data));
    }

    private Long resolveUserId(Long paramUserId, Authentication authentication) {
        if (paramUserId != null) {
            return paramUserId;
        }
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            return userRepository.findByUsername(authentication.getName())
                    .map(u -> u.getId())
                    .orElse(101L);
        }
        return 101L;
    }
}
