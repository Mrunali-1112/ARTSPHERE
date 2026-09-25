package com.artsphere.controller;

import com.artsphere.model.dto.ApiResponse;
import com.artsphere.model.dto.MyApplicationsResponse;
import com.artsphere.model.dto.MyApplicationsSummary;
import com.artsphere.repository.UserRepository;
import com.artsphere.service.MyApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/my-applications")
public class MyApplicationController {

    private final MyApplicationService myApplicationService;
    private final UserRepository userRepository;

    public MyApplicationController(MyApplicationService myApplicationService, UserRepository userRepository) {
        this.myApplicationService = myApplicationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<MyApplicationsResponse>> getMyApplications(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        MyApplicationsResponse response = myApplicationService.getMyApplications(currentUserId, category, status);
        return ResponseEntity.ok(ApiResponse.success("User applications retrieved successfully", response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<MyApplicationsSummary>> getSummary(
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        MyApplicationsSummary summary = myApplicationService.getSummary(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Applications summary retrieved successfully", summary));
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
