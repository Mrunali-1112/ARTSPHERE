package com.artsphere.controller;

import com.artsphere.model.dto.ApiResponse;
import com.artsphere.model.dto.EventDetailResponse;
import com.artsphere.model.dto.EventResponse;
import com.artsphere.repository.UserRepository;
import com.artsphere.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    public EventController(EventService eventService, UserRepository userRepository) {
        this.eventService = eventService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEvents(
            @RequestParam(required = false) String artForm,
            @RequestParam(required = false) String search,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        String query = (search != null && !search.isBlank()) ? search : q;
        Long currentUserId = resolveUserId(userId, authentication);
        List<EventResponse> list = eventService.getEvents(artForm, query, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Events retrieved successfully", list));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EventResponse>>> searchEvents(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        String query = (q != null && !q.isBlank()) ? q : search;
        Long currentUserId = resolveUserId(userId, authentication);
        List<EventResponse> list = eventService.getEvents(null, query, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", list));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getFeaturedEvents(
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        List<EventResponse> list = eventService.getFeaturedEvents(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Featured events retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventDetailResponse>> getEventDetails(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        EventDetailResponse detail = eventService.getEventDetails(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Event details retrieved successfully", detail));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerForEvent(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        Map<String, Object> result = eventService.registerForEvent(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Event registration processed successfully", result));
    }

    @GetMapping("/{id}/registration-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRegistrationStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        Map<String, Object> result = eventService.getRegistrationStatus(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Registration status retrieved successfully", result));
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
