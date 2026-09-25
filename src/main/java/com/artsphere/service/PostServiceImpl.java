package com.artsphere.service;

import com.artsphere.exception.ResourceNotFoundException;
import com.artsphere.model.Post;
import com.artsphere.model.PostComment;
import com.artsphere.model.dto.*;
import com.artsphere.repository.PostRepository;
import com.artsphere.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostServiceImpl(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getPosts(String artForm, String tab, String search, Long currentUserId) {
        List<Post> posts = postRepository.findAll(artForm, tab, search);
        List<PostResponse> result = new ArrayList<>();
        for (Post p : posts) {
            result.add(mapToResponse(p, currentUserId));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public PostDetailResponse getPostDetails(Long id, Long currentUserId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        PostDetailResponse detail = new PostDetailResponse();
        populateBaseResponse(detail, post, currentUserId);

        // Fetch Artist
        userRepository.findById(post.getUserId()).ifPresent(user -> {
            detail.setArtistBio(user.getBio());
            detail.setArtistFollowersCount(user.getFollowersCount());
        });

        if (currentUserId != null) {
            detail.setFollowing(postRepository.isFollowing(currentUserId, post.getUserId()));
        } else {
            detail.setFollowing(false);
        }

        // Fetch Comments
        List<PostComment> comments = postRepository.findCommentsByPostId(id);
        List<CommentResponse> commentResponses = new ArrayList<>();
        for (PostComment c : comments) {
            CommentResponse cr = new CommentResponse();
            cr.setId(c.getId());
            cr.setPostId(c.getPostId());
            cr.setUserId(c.getUserId());
            cr.setContent(c.getContent());
            cr.setLikesCount(c.getLikesCount());
            cr.setCreatedAt(c.getCreatedAt());
            cr.setTimeAgo(formatTimeAgo(c.getCreatedAt()));

            userRepository.findById(c.getUserId()).ifPresentOrElse(u -> {
                cr.setAuthorName(u.getFullName());
                cr.setAuthorUsername(u.getUsername());
                cr.setAuthorAvatar(u.getProfilePicture() != null ? u.getProfilePicture() : "/images/user_avatar_nav.png");
            }, () -> {
                cr.setAuthorName("Artist Member");
                cr.setAuthorUsername("artist");
                cr.setAuthorAvatar("/images/user_avatar_nav.png");
            });

            commentResponses.add(cr);
        }
        detail.setComments(commentResponses);

        // Fetch "More from Artist"
        List<PostDetailResponse.PostThumb> thumbs = new ArrayList<>();
        List<Post> otherPosts = postRepository.findOtherPostsByUserId(post.getUserId(), post.getId(), 4);
        for (Post op : otherPosts) {
            thumbs.add(new PostDetailResponse.PostThumb(op.getId(), op.getTitle(), op.getMediaUrl(), op.getLikesCount()));
        }

        // If not enough posts by this artist, supply default approved showcase items
        if (thumbs.isEmpty() || thumbs.size() < 4) {
            if (thumbs.stream().noneMatch(t -> "Bloom Again".equalsIgnoreCase(t.getTitle()))) {
                thumbs.add(new PostDetailResponse.PostThumb(216L, "Bloom Again", "/images/post_thumb_bloom_again.png", 842));
            }
            if (thumbs.stream().noneMatch(t -> "Evening Hues".equalsIgnoreCase(t.getTitle()))) {
                thumbs.add(new PostDetailResponse.PostThumb(217L, "Evening Hues", "/images/post_thumb_evening_hues.png", 1100));
            }
            if (thumbs.stream().noneMatch(t -> "Little Details".equalsIgnoreCase(t.getTitle()))) {
                thumbs.add(new PostDetailResponse.PostThumb(214L, "Little Details", "/images/post_thumb_little_details.png", 460));
            }
            if (thumbs.stream().noneMatch(t -> "Into the Calm".equalsIgnoreCase(t.getTitle()))) {
                thumbs.add(new PostDetailResponse.PostThumb(219L, "Into the Calm", "/images/post_thumb_into_the_calm.png", 920));
            }
        }
        detail.setMoreFromArtist(thumbs);

        return detail;
    }

    @Override
    public PostResponse createPost(PostRequest request, Long currentUserId) {
        Long authorId = request.getUserId() != null ? request.getUserId() : (currentUserId != null ? currentUserId : 101L);

        Post post = new Post();
        post.setUserId(authorId);
        post.setTitle(request.getTitle() != null && !request.getTitle().isBlank() ? request.getTitle().trim() : "Creative Showcase");
        post.setCaption(request.getCaption().trim());
        post.setMediaUrl(request.getMediaUrl() != null && !request.getMediaUrl().isBlank()
                ? request.getMediaUrl().trim()
                : "/images/post_a_brighter_day.png");
        post.setMediaType(request.getMediaType() != null ? request.getMediaType() : "image");
        post.setArtForm(request.getArtForm() != null ? request.getArtForm().trim() : "Painting");
        post.setCategory(request.getCategory() != null ? request.getCategory().trim() : "Showcase");
        post.setLocation(request.getLocation() != null && !request.getLocation().isBlank() ? request.getLocation().trim() : "Pune, Maharashtra");
        post.setTags(request.getTags() != null ? request.getTags().trim() : "#art, #creativity");
        post.setVisibility(request.getVisibility() != null ? request.getVisibility().trim() : "Public");
        post.setLikesCount(0);
        post.setCommentsCount(0);
        post.setSharesCount(0);
        post.setSavesCount(0);

        Post saved = postRepository.save(post);
        return mapToResponse(saved, authorId);
    }

    @Override
    public boolean toggleLike(Long postId, Long currentUserId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }
        Long uid = currentUserId != null ? currentUserId : 101L;
        boolean alreadyLiked = postRepository.isLikedByUser(postId, uid);
        if (alreadyLiked) {
            postRepository.removeLike(postId, uid);
            return false;
        } else {
            postRepository.addLike(postId, uid);
            return true;
        }
    }

    @Override
    public boolean toggleSave(Long postId, Long currentUserId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }
        Long uid = currentUserId != null ? currentUserId : 101L;
        boolean alreadySaved = postRepository.isSavedByUser(postId, uid);
        if (alreadySaved) {
            postRepository.removeSave(postId, uid);
            return false;
        } else {
            postRepository.addSave(postId, uid);
            return true;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }
        List<PostComment> comments = postRepository.findCommentsByPostId(postId);
        List<CommentResponse> result = new ArrayList<>();
        for (PostComment c : comments) {
            CommentResponse cr = new CommentResponse();
            cr.setId(c.getId());
            cr.setPostId(c.getPostId());
            cr.setUserId(c.getUserId());
            cr.setContent(c.getContent());
            cr.setLikesCount(c.getLikesCount());
            cr.setCreatedAt(c.getCreatedAt());
            cr.setTimeAgo(formatTimeAgo(c.getCreatedAt()));

            userRepository.findById(c.getUserId()).ifPresentOrElse(u -> {
                cr.setAuthorName(u.getFullName());
                cr.setAuthorUsername(u.getUsername());
                cr.setAuthorAvatar(u.getProfilePicture() != null ? u.getProfilePicture() : "/images/user_avatar_nav.png");
            }, () -> {
                cr.setAuthorName("Artist Member");
                cr.setAuthorUsername("artist");
                cr.setAuthorAvatar("/images/user_avatar_nav.png");
            });

            result.add(cr);
        }
        return result;
    }

    @Override
    public CommentResponse addComment(Long postId, CommentRequest request, Long currentUserId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }
        Long authorId = request.getUserId() != null ? request.getUserId() : (currentUserId != null ? currentUserId : 101L);

        PostComment comment = new PostComment();
        comment.setPostId(postId);
        comment.setUserId(authorId);
        comment.setContent(request.getContent().trim());
        comment.setLikesCount(0);
        comment.setCreatedAt(LocalDateTime.now());

        PostComment saved = postRepository.addComment(comment);

        CommentResponse cr = new CommentResponse();
        cr.setId(saved.getId());
        cr.setPostId(saved.getPostId());
        cr.setUserId(saved.getUserId());
        cr.setContent(saved.getContent());
        cr.setLikesCount(saved.getLikesCount());
        cr.setCreatedAt(saved.getCreatedAt());
        cr.setTimeAgo("Just now");

        userRepository.findById(authorId).ifPresentOrElse(u -> {
            cr.setAuthorName(u.getFullName());
            cr.setAuthorUsername(u.getUsername());
            cr.setAuthorAvatar(u.getProfilePicture() != null ? u.getProfilePicture() : "/images/user_avatar_nav.png");
        }, () -> {
            cr.setAuthorName("Artist Member");
            cr.setAuthorUsername("artist");
            cr.setAuthorAvatar("/images/user_avatar_nav.png");
        });

        return cr;
    }

    private PostResponse mapToResponse(Post post, Long currentUserId) {
        PostResponse resp = new PostResponse();
        populateBaseResponse(resp, post, currentUserId);
        return resp;
    }

    private void populateBaseResponse(PostResponse resp, Post post, Long currentUserId) {
        resp.setId(post.getId());
        resp.setTitle(post.getTitle());
        resp.setCaption(post.getCaption());
        resp.setMediaUrl(post.getMediaUrl());
        resp.setMediaType(post.getMediaType());
        resp.setArtForm(post.getArtForm());
        resp.setCategory(post.getCategory());
        resp.setLocation(post.getLocation());
        resp.setVisibility(post.getVisibility());
        resp.setLikesCount(post.getLikesCount());
        resp.setCommentsCount(post.getCommentsCount());
        resp.setSharesCount(post.getSharesCount());
        resp.setSavesCount(post.getSavesCount());
        resp.setTimeAgo(formatTimeAgo(post.getCreatedAt()));

        if (post.getCreatedAt() != null) {
            resp.setFormattedDate(post.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        } else {
            resp.setFormattedDate("12 Sept 2024");
        }

        // Parse tags
        List<String> tagList = new ArrayList<>();
        if (post.getTags() != null && !post.getTags().isBlank()) {
            for (String tag : post.getTags().split("[, ]+")) {
                String clean = tag.trim();
                if (!clean.isEmpty()) {
                    if (!clean.startsWith("#")) {
                        clean = "#" + clean;
                    }
                    tagList.add(clean);
                }
            }
        }
        resp.setTags(tagList);

        // Artist Info
        userRepository.findById(post.getUserId()).ifPresentOrElse(user -> {
            resp.setArtistId(user.getId());
            // Format name to match UI design (e.g. Aanya Verma / Aanya Deshmukh)
            resp.setArtistName(user.getFullName());
            resp.setArtistUsername(user.getUsername());
            resp.setArtistAvatar(user.getProfilePicture() != null ? user.getProfilePicture() : "/images/artist_profile_avatar.png");
            resp.setArtistType(user.getArtistType() != null ? user.getArtistType() : "Artist");
        }, () -> {
            resp.setArtistId(post.getUserId());
            resp.setArtistName("Aanya Verma");
            resp.setArtistUsername("aanyaart");
            resp.setArtistAvatar("/images/artist_profile_avatar.png");
            resp.setArtistType("Visual Artist");
        });

        // Current User Interactivity
        if (currentUserId != null) {
            resp.setLiked(postRepository.isLikedByUser(post.getId(), currentUserId));
            resp.setSaved(postRepository.isSavedByUser(post.getId(), currentUserId));
        } else {
            resp.setLiked(false);
            resp.setSaved(false);
        }
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        if (days == 1) return "1 day ago";
        if (days < 7) return days + " days ago";
        long weeks = days / 7;
        return weeks + (weeks == 1 ? " week ago" : " weeks ago");
    }
}
