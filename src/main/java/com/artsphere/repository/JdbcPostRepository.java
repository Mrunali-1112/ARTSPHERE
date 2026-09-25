package com.artsphere.repository;

import com.artsphere.model.Post;
import com.artsphere.model.PostComment;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcPostRepository implements PostRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcPostRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Post> postRowMapper = (rs, rowNum) -> {
        Post p = new Post();
        p.setId(rs.getLong("id"));
        p.setUserId(rs.getLong("user_id"));
        p.setTitle(rs.getString("title"));
        p.setCaption(rs.getString("caption"));
        p.setMediaUrl(rs.getString("media_url"));
        p.setMediaType(rs.getString("media_type"));
        p.setArtForm(rs.getString("art_form"));
        p.setCategory(rs.getString("category"));
        p.setLocation(rs.getString("location"));
        p.setTags(rs.getString("tags"));
        p.setVisibility(rs.getString("visibility"));
        p.setLikesCount(rs.getInt("likes_count"));
        p.setCommentsCount(rs.getInt("comments_count"));
        p.setSharesCount(rs.getInt("shares_count"));
        p.setSavesCount(rs.getInt("saves_count"));
        Timestamp createdTs = rs.getTimestamp("created_at");
        p.setCreatedAt(createdTs != null ? createdTs.toLocalDateTime() : LocalDateTime.now());
        Timestamp updatedTs = rs.getTimestamp("updated_at");
        p.setUpdatedAt(updatedTs != null ? updatedTs.toLocalDateTime() : LocalDateTime.now());
        return p;
    };

    private final RowMapper<PostComment> commentRowMapper = (rs, rowNum) -> {
        PostComment c = new PostComment();
        c.setId(rs.getLong("id"));
        c.setPostId(rs.getLong("post_id"));
        c.setUserId(rs.getLong("user_id"));
        c.setContent(rs.getString("content"));
        c.setLikesCount(rs.getInt("likes_count"));
        Timestamp ts = rs.getTimestamp("created_at");
        c.setCreatedAt(ts != null ? ts.toLocalDateTime() : LocalDateTime.now());
        return c;
    };

    @Override
    public List<Post> findAll(String artForm, String tab, String search) {
        StringBuilder sql = new StringBuilder("SELECT * FROM posts WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (artForm != null && !artForm.isBlank() && !artForm.equalsIgnoreCase("All")) {
            sql.append("AND LOWER(art_form) = LOWER(?) ");
            params.add(artForm.trim());
        }

        if (search != null && !search.isBlank()) {
            sql.append("AND (LOWER(title) LIKE LOWER(?) OR LOWER(caption) LIKE LOWER(?) OR LOWER(tags) LIKE LOWER(?) OR LOWER(art_form) LIKE LOWER(?)) ");
            String pattern = "%" + search.trim() + "%";
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
        }

        if ("foryou".equalsIgnoreCase(tab)) {
            sql.append("ORDER BY likes_count DESC, created_at DESC ");
        } else {
            sql.append("ORDER BY created_at DESC ");
        }

        return jdbcTemplate.query(sql.toString(), postRowMapper, params.toArray());
    }

    @Override
    public Optional<Post> findById(Long id) {
        String sql = "SELECT * FROM posts WHERE id = ?";
        try {
            Post post = jdbcTemplate.queryForObject(sql, postRowMapper, id);
            return Optional.ofNullable(post);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Post save(Post post) {
        String sql = "INSERT INTO posts (user_id, title, caption, media_url, media_type, art_form, category, location, tags, visibility, likes_count, comments_count, shares_count, saves_count) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, post.getUserId());
            ps.setString(2, post.getTitle() != null ? post.getTitle() : "");
            ps.setString(3, post.getCaption());
            ps.setString(4, post.getMediaUrl());
            ps.setString(5, post.getMediaType() != null ? post.getMediaType() : "image");
            ps.setString(6, post.getArtForm());
            ps.setString(7, post.getCategory() != null ? post.getCategory() : "Showcase");
            ps.setString(8, post.getLocation() != null ? post.getLocation() : "Pune, Maharashtra");
            ps.setString(9, post.getTags() != null ? post.getTags() : "");
            ps.setString(10, post.getVisibility() != null ? post.getVisibility() : "Public");
            ps.setInt(11, post.getLikesCount());
            ps.setInt(12, post.getCommentsCount());
            ps.setInt(13, post.getSharesCount());
            ps.setInt(14, post.getSavesCount());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            post.setId(keyHolder.getKey().longValue());
        }
        return post;
    }

    @Override
    public boolean existsById(Long id) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM posts WHERE id = ?", Integer.class, id);
        return count != null && count > 0;
    }

    @Override
    public boolean isLikedByUser(Long postId, Long userId) {
        if (userId == null) return false;
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM post_likes WHERE post_id = ? AND user_id = ?",
                Integer.class, postId, userId);
        return count != null && count > 0;
    }

    @Override
    public boolean isSavedByUser(Long postId, Long userId) {
        if (userId == null) return false;
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM post_saves WHERE post_id = ? AND user_id = ?",
                Integer.class, postId, userId);
        return count != null && count > 0;
    }

    @Override
    public boolean isFollowing(Long followerId, Long followedId) {
        if (followerId == null || followedId == null) return false;
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM artist_connections WHERE user_id = ? AND artist_id = ?",
                Integer.class, followerId, followedId);
        return count != null && count > 0;
    }

    @Override
    public void addLike(Long postId, Long userId) {
        jdbcTemplate.update("INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)", postId, userId);
        jdbcTemplate.update("UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?", postId, postId);
    }

    @Override
    public void removeLike(Long postId, Long userId) {
        jdbcTemplate.update("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?", postId, userId);
        jdbcTemplate.update("UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?", postId, postId);
    }

    @Override
    public void addSave(Long postId, Long userId) {
        jdbcTemplate.update("INSERT IGNORE INTO post_saves (post_id, user_id) VALUES (?, ?)", postId, userId);
        jdbcTemplate.update("UPDATE posts SET saves_count = (SELECT COUNT(*) FROM post_saves WHERE post_id = ?) WHERE id = ?", postId, postId);
    }

    @Override
    public void removeSave(Long postId, Long userId) {
        jdbcTemplate.update("DELETE FROM post_saves WHERE post_id = ? AND user_id = ?", postId, userId);
        jdbcTemplate.update("UPDATE posts SET saves_count = (SELECT COUNT(*) FROM post_saves WHERE post_id = ?) WHERE id = ?", postId, postId);
    }

    @Override
    public List<PostComment> findCommentsByPostId(Long postId) {
        String sql = "SELECT * FROM post_comments WHERE post_id = ? ORDER BY created_at ASC";
        return jdbcTemplate.query(sql, commentRowMapper, postId);
    }

    @Override
    public PostComment addComment(PostComment comment) {
        String sql = "INSERT INTO post_comments (post_id, user_id, content, likes_count) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, comment.getPostId());
            ps.setLong(2, comment.getUserId());
            ps.setString(3, comment.getContent());
            ps.setInt(4, comment.getLikesCount());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            comment.setId(keyHolder.getKey().longValue());
        }

        jdbcTemplate.update("UPDATE posts SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = ?) WHERE id = ?",
                comment.getPostId(), comment.getPostId());

        return comment;
    }

    @Override
    public List<Post> findOtherPostsByUserId(Long userId, Long excludePostId, int limit) {
        String sql = "SELECT * FROM posts WHERE user_id = ? AND id != ? ORDER BY created_at DESC LIMIT ?";
        return jdbcTemplate.query(sql, postRowMapper, userId, excludePostId, limit);
    }
}
