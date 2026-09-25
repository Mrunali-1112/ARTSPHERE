package com.artsphere.repository;

import com.artsphere.model.Community;
import com.artsphere.model.Event;
import com.artsphere.model.Post;
import com.artsphere.model.dto.CommunityMemberResponse;
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
public class JdbcCommunityRepository implements CommunityRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcCommunityRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Community> communityRowMapper = (rs, rowNum) -> {
        Community c = new Community();
        c.setId(rs.getLong("id"));
        c.setName(rs.getString("name"));
        c.setDescription(rs.getString("description"));
        c.setMemberCount(rs.getInt("member_count"));
        c.setCategory(rs.getString("category"));
        c.setImageUrl(rs.getString("image_url"));
        c.setCoverImage(rs.getString("cover_image"));
        c.setLocation(rs.getString("location"));
        c.setArtForms(rs.getString("art_forms"));
        c.setRules(rs.getString("rules"));
        c.setOwnerId(rs.getLong("owner_id"));
        c.setIsFeatured(rs.getBoolean("is_featured"));
        c.setCreatedDate(rs.getString("created_date"));

        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) {
            c.setCreatedAt(ts.toLocalDateTime());
        }
        return c;
    };

    private final RowMapper<CommunityMemberResponse> memberRowMapper = (rs, rowNum) -> {
        CommunityMemberResponse m = new CommunityMemberResponse();
        m.setUserId(rs.getLong("user_id"));
        m.setName(rs.getString("full_name"));
        m.setUsername(rs.getString("username"));
        m.setAvatarUrl(rs.getString("profile_picture"));
        m.setProfession(rs.getString("bio") != null && rs.getString("bio").contains("Artist") ? "Visual Artist" : "Artist");
        m.setLocation(rs.getString("location"));
        m.setRole(rs.getString("role"));
        Timestamp joinedTs = rs.getTimestamp("joined_at");
        m.setJoinedAt(joinedTs != null ? joinedTs.toLocalDateTime().toString() : "");
        return m;
    };

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
        Timestamp ts = rs.getTimestamp("created_at");
        p.setCreatedAt(ts != null ? ts.toLocalDateTime() : LocalDateTime.now());
        Timestamp upd = rs.getTimestamp("updated_at");
        p.setUpdatedAt(upd != null ? upd.toLocalDateTime() : LocalDateTime.now());
        return p;
    };

    private final RowMapper<Event> eventRowMapper = (rs, rowNum) -> {
        Event e = new Event();
        e.setId(rs.getLong("id"));
        e.setTitle(rs.getString("title"));
        e.setOrganizer(rs.getString("organizer"));
        e.setLocation(rs.getString("location"));
        e.setEventDate(rs.getString("event_date"));
        e.setEventTime(rs.getString("event_time"));
        e.setImageUrl(rs.getString("image_url"));
        e.setDescription(rs.getString("description"));
        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) {
            e.setCreatedAt(ts.toLocalDateTime());
        }
        return e;
    };

    @Override
    public List<Community> findAll(String category, String search) {
        StringBuilder sql = new StringBuilder("SELECT * FROM communities WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category.trim())) {
            sql.append(" AND (LOWER(category) = LOWER(?) OR LOWER(art_forms) LIKE LOWER(?))");
            params.add(category.trim());
            params.add("%" + category.trim() + "%");
        }

        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(art_forms) LIKE LOWER(?))");
            String q = "%" + search.trim() + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }

        sql.append(" ORDER BY is_featured DESC, member_count DESC, id ASC");
        return jdbcTemplate.query(sql.toString(), communityRowMapper, params.toArray());
    }

    @Override
    public Optional<Community> findById(Long id) {
        String sql = "SELECT * FROM communities WHERE id = ?";
        try {
            Community c = jdbcTemplate.queryForObject(sql, communityRowMapper, id);
            return Optional.ofNullable(c);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Community> findFeatured() {
        String sql = "SELECT * FROM communities WHERE is_featured = TRUE LIMIT 1";
        try {
            Community c = jdbcTemplate.queryForObject(sql, communityRowMapper);
            return Optional.ofNullable(c);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean isMember(Long communityId, Long userId) {
        if (communityId == null || userId == null) return false;
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM community_members WHERE community_id = ? AND user_id = ?",
                Integer.class, communityId, userId);
        return count != null && count > 0;
    }

    @Override
    public String getMemberRole(Long communityId, Long userId) {
        if (communityId == null || userId == null) return null;
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT role FROM community_members WHERE community_id = ? AND user_id = ? LIMIT 1",
                    String.class, communityId, userId);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    @Override
    public boolean addMember(Long communityId, Long userId, String role) {
        if (communityId == null || userId == null) return false;
        String userRole = (role != null && !role.isBlank()) ? role : "MEMBER";
        int rows = jdbcTemplate.update(
                "INSERT IGNORE INTO community_members (community_id, user_id, role, joined_at) VALUES (?, ?, ?, NOW())",
                communityId, userId, userRole);
        // update member count
        jdbcTemplate.update(
                "UPDATE communities SET member_count = (SELECT COUNT(*) FROM community_members WHERE community_id = ?) WHERE id = ?",
                communityId, communityId);
        return rows > 0;
    }

    @Override
    public boolean removeMember(Long communityId, Long userId) {
        if (communityId == null || userId == null) return false;
        int rows = jdbcTemplate.update(
                "DELETE FROM community_members WHERE community_id = ? AND user_id = ?",
                communityId, userId);
        // update member count
        jdbcTemplate.update(
                "UPDATE communities SET member_count = (SELECT COUNT(*) FROM community_members WHERE community_id = ?) WHERE id = ?",
                communityId, communityId);
        return rows > 0;
    }

    @Override
    public List<CommunityMemberResponse> findMembers(Long communityId) {
        String sql = "SELECT cm.role, cm.joined_at, u.id as user_id, u.full_name, u.username, u.profile_picture, u.bio, u.location " +
                "FROM community_members cm " +
                "JOIN users u ON cm.user_id = u.id " +
                "WHERE cm.community_id = ? " +
                "ORDER BY CASE WHEN cm.role = 'ADMIN' THEN 1 WHEN cm.role = 'ACTIVE MEMBER' THEN 2 ELSE 3 END, cm.joined_at ASC";
        return jdbcTemplate.query(sql, memberRowMapper, communityId);
    }

    @Override
    public int countMembers(Long communityId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM community_members WHERE community_id = ?",
                Integer.class, communityId);
        return count != null ? count : 0;
    }

    @Override
    public int countPosts(Long communityId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM posts WHERE community_id = ?",
                Integer.class, communityId);
        return count != null ? count : 0;
    }

    @Override
    public int countEvents(Long communityId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM events WHERE community_id = ?",
                Integer.class, communityId);
        return count != null ? count : 0;
    }

    @Override
    public List<Post> findCommunityPosts(Long communityId, String category) {
        StringBuilder sql = new StringBuilder("SELECT * FROM posts WHERE community_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(communityId);

        if (category != null && !category.isBlank() && !"all posts".equalsIgnoreCase(category.trim()) && !"all".equalsIgnoreCase(category.trim())) {
            sql.append(" AND LOWER(category) = LOWER(?)");
            params.add(category.trim());
        }

        sql.append(" ORDER BY created_at DESC");
        return jdbcTemplate.query(sql.toString(), postRowMapper, params.toArray());
    }

    @Override
    public List<Event> findCommunityEvents(Long communityId, String eventType) {
        StringBuilder sql = new StringBuilder("SELECT * FROM events WHERE community_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(communityId);

        if (eventType != null && !eventType.isBlank() && !"all".equalsIgnoreCase(eventType.trim())) {
            sql.append(" AND LOWER(event_type) = LOWER(?)");
            params.add(eventType.trim());
        }

        sql.append(" ORDER BY id ASC");
        return jdbcTemplate.query(sql.toString(), eventRowMapper, params.toArray());
    }

    @Override
    public boolean isEventRegistered(Long eventId, Long userId) {
        if (eventId == null || userId == null) return false;
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM event_registrations WHERE event_id = ? AND user_id = ?",
                Integer.class, eventId, userId);
        return count != null && count > 0;
    }

    @Override
    public boolean registerEvent(Long eventId, Long userId) {
        if (eventId == null || userId == null) return false;
        int rows = jdbcTemplate.update(
                "INSERT IGNORE INTO event_registrations (event_id, user_id, registered_at) VALUES (?, ?, NOW())",
                eventId, userId);
        jdbcTemplate.update(
                "UPDATE events SET attendees_count = (SELECT COUNT(*) FROM event_registrations WHERE event_id = ?) + 24 WHERE id = ?",
                eventId, eventId);
        return rows > 0;
    }

    @Override
    public Community save(Community community) {
        if (community.getId() == null) {
            String sql = "INSERT INTO communities (name, description, member_count, category, image_url, cover_image, location, art_forms, rules, owner_id, is_featured, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, community.getName());
                ps.setString(2, community.getDescription());
                ps.setInt(3, community.getMemberCount() != null ? community.getMemberCount() : 1);
                ps.setString(4, community.getCategory() != null ? community.getCategory() : "All");
                ps.setString(5, community.getImageUrl() != null ? community.getImageUrl() : "/images/comm_creative_souls_avatar.png");
                ps.setString(6, community.getCoverImage() != null ? community.getCoverImage() : "/images/comm_creative_souls_cover.png");
                ps.setString(7, community.getLocation() != null ? community.getLocation() : "Global");
                ps.setString(8, community.getArtForms() != null ? community.getArtForms() : "All art forms");
                ps.setString(9, community.getRules() != null ? community.getRules() : "Be kind and respectful\nShare original work");
                ps.setLong(10, community.getOwnerId() != null ? community.getOwnerId() : 101L);
                ps.setBoolean(11, community.getIsFeatured() != null ? community.getIsFeatured() : false);
                ps.setString(12, community.getCreatedDate() != null ? community.getCreatedDate() : "12 Mar 2024");
                return ps;
            }, keyHolder);

            if (keyHolder.getKey() != null) {
                community.setId(keyHolder.getKey().longValue());
            }
            community.setCreatedAt(LocalDateTime.now());
            return community;
        } else {
            String sql = "UPDATE communities SET name = ?, description = ?, member_count = ?, category = ?, image_url = ?, cover_image = ?, location = ?, art_forms = ?, rules = ?, owner_id = ?, is_featured = ? WHERE id = ?";
            jdbcTemplate.update(sql, community.getName(), community.getDescription(), community.getMemberCount(),
                    community.getCategory(), community.getImageUrl(), community.getCoverImage(), community.getLocation(),
                    community.getArtForms(), community.getRules(), community.getOwnerId(), community.getIsFeatured(), community.getId());
            return community;
        }
    }
}
