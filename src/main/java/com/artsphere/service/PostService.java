package com.artsphere.service;

import com.artsphere.model.dto.*;

import java.util.List;

public interface PostService {

    List<PostResponse> getPosts(String artForm, String tab, String search, Long currentUserId);

    PostDetailResponse getPostDetails(Long id, Long currentUserId);

    PostResponse createPost(PostRequest request, Long currentUserId);

    boolean toggleLike(Long postId, Long currentUserId);

    boolean toggleSave(Long postId, Long currentUserId);

    List<CommentResponse> getComments(Long postId);

    CommentResponse addComment(Long postId, CommentRequest request, Long currentUserId);
}
