package com.artsphere.controller;

import com.artsphere.model.dto.*;
import com.artsphere.repository.UserRepository;
import com.artsphere.service.CommunityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityService communityService;
    private final UserRepository userRepository;

    public CommunityController(CommunityService communityService, UserRepository userRepository) {
        this.communityService = communityService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getCommunities(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String artForm,
            @RequestParam(required = false) String search,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        String filterCategory = (category != null && !category.isBlank()) ? category : artForm;
        String query = (search != null && !search.isBlank()) ? search : q;
        Long currentUserId = resolveUserId(userId, authentication);
        List<CommunityResponse> list = communityService.getCommunities(filterCategory, query, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Communities retrieved successfully", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommunityResponse>> createCommunity(
            @RequestBody Map<String, String> request,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        CommunityResponse community = communityService.createCommunity(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Community created successfully", community));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> searchCommunities(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        String query = (q != null && !q.isBlank()) ? q : search;
        Long currentUserId = resolveUserId(userId, authentication);
        List<CommunityResponse> list = communityService.getCommunities(null, query, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityDetailResponse>> getCommunityDetails(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        CommunityDetailResponse detail = communityService.getCommunityDetails(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Community details retrieved successfully", detail));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<Map<String, Object>>> joinCommunity(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        Map<String, Object> result = communityService.joinCommunity(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Community join status updated", result));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Map<String, Object>>> leaveCommunity(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        Map<String, Object> result = communityService.leaveCommunity(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Left community successfully", result));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<CommunityMemberResponse>>> getMembers(@PathVariable Long id) {
        List<CommunityMemberResponse> members = communityService.getCommunityMembers(id);
        return ResponseEntity.ok(ApiResponse.success("Community members retrieved successfully", members));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPosts(
            @PathVariable Long id,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        List<PostResponse> posts = communityService.getCommunityPosts(id, category, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Community posts retrieved successfully", posts));
    }

    @PostMapping("/{id}/posts")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @PathVariable Long id,
            @Valid @RequestBody CommunityPostCreateRequest request,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        PostResponse post = communityService.createCommunityPost(id, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Community post created successfully", post));
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<ApiResponse<List<CommunityEventResponse>>> getEvents(
            @PathVariable Long id,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        List<CommunityEventResponse> events = communityService.getCommunityEvents(id, type, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Community events retrieved successfully", events));
    }

    @PostMapping("/events/{eventId}/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerForEvent(
            @PathVariable Long eventId,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        Map<String, Object> result = communityService.registerForEvent(eventId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Registered for event successfully", result));
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
        return 101L; // default demo user (Aanya)
    }
}
