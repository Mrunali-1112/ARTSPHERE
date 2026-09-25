package com.artsphere.repository;

import com.artsphere.model.Post;
import com.artsphere.model.PostComment;

import java.util.List;
import java.util.Optional;

public interface PostRepository {

    List<Post> findAll(String artForm, String tab, String search);

    Optional<Post> findById(Long id);

    Post save(Post post);

    boolean existsById(Long id);

    boolean isLikedByUser(Long postId, Long userId);

    boolean isSavedByUser(Long postId, Long userId);

    boolean isFollowing(Long followerId, Long followedId);

    void addLike(Long postId, Long userId);

    void removeLike(Long postId, Long userId);

    void addSave(Long postId, Long userId);

    void removeSave(Long postId, Long userId);

    List<PostComment> findCommentsByPostId(Long postId);

    PostComment addComment(PostComment comment);

    List<Post> findOtherPostsByUserId(Long userId, Long excludePostId, int limit);
}
