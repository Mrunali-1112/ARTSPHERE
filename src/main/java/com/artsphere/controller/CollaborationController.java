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
@RequestMapping("/api/collaborations")
public class CollaborationController {

    private final CollaborationService collaborationService;
    private final UserRepository userRepository;

    public CollaborationController(CollaborationService collaborationService, UserRepository userRepository) {
        this.collaborationService = collaborationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CollaborationResponse>>> getCollaborations(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        String query = (search != null && !search.isBlank()) ? search : q;
        Long currentUserId = resolveUserId(userId, authentication);
        List<CollaborationResponse> list = collaborationService.getCollaborations(skill, location, query, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Collaborations retrieved successfully", list));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CollaborationResponse>>> searchCollaborations(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        String query = (q != null && !q.isBlank()) ? q : search;
        Long currentUserId = resolveUserId(userId, authentication);
        List<CollaborationResponse> list = collaborationService.getCollaborations(null, null, query, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CollaborationDetailResponse>> getCollaborationDetails(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        CollaborationDetailResponse detail = collaborationService.getCollaborationDetails(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Collaboration details retrieved successfully", detail));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CollaborationResponse>> createCollaboration(
            @Valid @RequestBody CollaborationCreateRequest request,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        CollaborationResponse created = collaborationService.createCollaboration(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Collaboration post created successfully", created));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        String newStatus = "CLOSED";
        if (body != null && body.containsKey("status") && body.get("status") != null) {
            newStatus = body.get("status");
        } else if (status != null && !status.isBlank()) {
            newStatus = status;
        }

        boolean updated = collaborationService.updateCollaborationStatus(id, newStatus, currentUserId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        data.put("status", newStatus);
        data.put("updated", updated);

        return ResponseEntity.ok(ApiResponse.success("Collaboration status updated", data));
    }

    @PostMapping("/{id}/requests")
    public ResponseEntity<ApiResponse<CollabRequestItemResponse>> sendRequest(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CollabSendRequest request,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        if (request == null) {
            request = new CollabSendRequest();
        }
        CollabRequestItemResponse res = collaborationService.sendCollaborationRequest(id, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Collaboration request sent successfully", res));
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
