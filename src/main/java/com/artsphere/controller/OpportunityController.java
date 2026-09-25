package com.artsphere.controller;

import com.artsphere.model.dto.ApiResponse;
import com.artsphere.model.dto.OpportunityDetailResponse;
import com.artsphere.model.dto.OpportunityResponse;
import com.artsphere.repository.UserRepository;
import com.artsphere.service.OpportunityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/opportunities")
public class OpportunityController {

    private final OpportunityService opportunityService;
    private final UserRepository userRepository;

    public OpportunityController(OpportunityService opportunityService, UserRepository userRepository) {
        this.opportunityService = opportunityService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OpportunityResponse>>> getOpportunities(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search,
            @RequestParam(value = "q", required = false) String q) {
        String query = (search != null && !search.isBlank()) ? search : q;
        List<OpportunityResponse> list = opportunityService.getOpportunities(category, location, query);
        return ResponseEntity.ok(ApiResponse.success("Opportunities retrieved successfully", list));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<OpportunityResponse>>> searchOpportunities(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "search", required = false) String search) {
        String query = (q != null && !q.isBlank()) ? q : search;
        List<OpportunityResponse> list = opportunityService.getOpportunities(null, null, query);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", list));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<OpportunityResponse>> getFeaturedOpportunity() {
        OpportunityResponse opp = opportunityService.getFeaturedOpportunity();
        return ResponseEntity.ok(ApiResponse.success("Featured opportunity retrieved successfully", opp));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OpportunityDetailResponse>> getOpportunityById(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long resolvedUserId = resolveUserId(userId, authentication);
        OpportunityDetailResponse detail = opportunityService.getOpportunityDetails(id, resolvedUserId);
        return ResponseEntity.ok(ApiResponse.success("Opportunity details retrieved successfully", detail));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<Map<String, Object>>> applyToOpportunity(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        Long resolvedUserId = resolveUserId(userId, authentication);
        if (resolvedUserId == null) {
            resolvedUserId = 101L; // Fallback demo user
        }

        String notes = (body != null && body.containsKey("notes")) ? body.get("notes") : "Applied via ArtSphere web portal";
        boolean applied = opportunityService.applyToOpportunity(id, resolvedUserId, notes);

        Map<String, Object> result = new HashMap<>();
        result.put("opportunityId", id);
        result.put("userId", resolvedUserId);
        result.put("status", "PENDING");
        result.put("applied", applied);

        return ResponseEntity.ok(ApiResponse.success("Application submitted successfully", result));
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
