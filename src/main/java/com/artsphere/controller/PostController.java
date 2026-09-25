package com.artsphere.controller;

import com.artsphere.model.dto.*;
import com.artsphere.repository.UserRepository;
import com.artsphere.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserRepository userRepository;

    public PostController(PostService postService, UserRepository userRepository) {
        this.postService = postService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPosts(
            @RequestParam(required = false) String artForm,
            @RequestParam(required = false) String tab,
            @RequestParam(required = false) String search,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        String query = (search != null && !search.isBlank()) ? search : q;
        Long currentUserId = resolveUserId(userId, authentication);
        List<PostResponse> list = postService.getPosts(artForm, tab, query, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Posts retrieved successfully", list));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PostResponse>>> searchPosts(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        String query = (q != null && !q.isBlank()) ? q : search;
        Long currentUserId = resolveUserId(userId, authentication);
        List<PostResponse> list = postService.getPosts(null, null, query, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDetailResponse>> getPostById(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        PostDetailResponse detail = postService.getPostDetails(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Post details retrieved successfully", detail));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody PostRequest request,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        PostResponse created = postService.createPost(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Post created successfully", created));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        boolean liked = postService.toggleLike(id, currentUserId);
        PostDetailResponse detail = postService.getPostDetails(id, currentUserId);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("postId", id);
        responseData.put("liked", liked);
        responseData.put("likesCount", detail.getLikesCount());

        String message = liked ? "Post liked" : "Post unliked";
        return ResponseEntity.ok(ApiResponse.success(message, responseData));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleSave(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        boolean saved = postService.toggleSave(id, currentUserId);
        PostDetailResponse detail = postService.getPostDetails(id, currentUserId);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("postId", id);
        responseData.put("saved", saved);
        responseData.put("savesCount", detail.getSavesCount());

        String message = saved ? "Post saved to bookmarks" : "Post removed from bookmarks";
        return ResponseEntity.ok(ApiResponse.success(message, responseData));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable Long id) {
        List<CommentResponse> comments = postService.getComments(id);
        return ResponseEntity.ok(ApiResponse.success("Comments retrieved successfully", comments));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        Long currentUserId = resolveUserId(userId, authentication);
        CommentResponse comment = postService.addComment(id, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", comment));
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
