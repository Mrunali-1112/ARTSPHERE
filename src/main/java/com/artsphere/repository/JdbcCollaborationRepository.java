package com.artsphere.repository;

import com.artsphere.model.Collaboration;
import com.artsphere.model.CollaborationRequest;
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
public class JdbcCollaborationRepository implements CollaborationRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcCollaborationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Collaboration> collabRowMapper = (rs, rowNum) -> {
        Collaboration c = new Collaboration();
        c.setId(rs.getLong("id"));
        c.setCreatorId(rs.getLong("creator_id"));
        c.setTitle(rs.getString("title"));
        c.setDescription(rs.getString("description"));
        c.setPurpose(rs.getString("purpose"));
        c.setSkills(rs.getString("skills"));
        c.setTags(rs.getString("tags"));
        c.setLocation(rs.getString("location"));
        c.setCollaborationType(rs.getString("collaboration_type"));
        c.setAvailability(rs.getString("availability"));
        c.setPeopleNeeded(rs.getString("people_needed"));
        c.setReferenceUrl(rs.getString("reference_url"));
        c.setStatus(rs.getString("status"));
        Timestamp createdTs = rs.getTimestamp("created_at");
        c.setCreatedAt(createdTs != null ? createdTs.toLocalDateTime() : LocalDateTime.now());
        Timestamp updatedTs = rs.getTimestamp("updated_at");
        c.setUpdatedAt(updatedTs != null ? updatedTs.toLocalDateTime() : LocalDateTime.now());
        return c;
    };

    private final RowMapper<CollaborationRequest> requestRowMapper = (rs, rowNum) -> {
        CollaborationRequest r = new CollaborationRequest();
        r.setId(rs.getLong("id"));
        long collabId = rs.getLong("collaboration_id");
        r.setCollaborationId(rs.wasNull() ? null : collabId);
        r.setSenderId(rs.getLong("sender_id"));
        r.setReceiverId(rs.getLong("receiver_id"));
        r.setMessage(rs.getString("message"));
        r.setStatus(rs.getString("status"));
        Timestamp createdTs = rs.getTimestamp("created_at");
        r.setCreatedAt(createdTs != null ? createdTs.toLocalDateTime() : LocalDateTime.now());
        Timestamp updatedTs = rs.getTimestamp("updated_at");
        r.setUpdatedAt(updatedTs != null ? updatedTs.toLocalDateTime() : LocalDateTime.now());
        return r;
    };

    @Override
    public Collaboration save(Collaboration c) {
        if (c.getId() == null) {
            String sql = "INSERT INTO collaborations (creator_id, title, description, purpose, skills, tags, location, collaboration_type, availability, people_needed, reference_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, c.getCreatorId());
                ps.setString(2, c.getTitle());
                ps.setString(3, c.getDescription());
                ps.setString(4, c.getPurpose() != null ? c.getPurpose() : "Work on a Project");
                ps.setString(5, c.getSkills() != null ? c.getSkills() : "");
                ps.setString(6, c.getTags() != null ? c.getTags() : "");
                ps.setString(7, c.getLocation() != null ? c.getLocation() : "Mumbai, MH");
                ps.setString(8, c.getCollaborationType() != null ? c.getCollaborationType() : "Short Film");
                ps.setString(9, c.getAvailability() != null ? c.getAvailability() : "Flexible");
                ps.setString(10, c.getPeopleNeeded() != null ? c.getPeopleNeeded() : "1-2 collaborators");
                ps.setString(11, c.getReferenceUrl() != null ? c.getReferenceUrl() : "");
                ps.setString(12, c.getStatus() != null ? c.getStatus() : "OPEN");
                return ps;
            }, keyHolder);

            if (keyHolder.getKey() != null) {
                c.setId(keyHolder.getKey().longValue());
            }
            c.setCreatedAt(LocalDateTime.now());
            c.setUpdatedAt(LocalDateTime.now());
            return c;
        } else {
            String sql = "UPDATE collaborations SET title = ?, description = ?, purpose = ?, skills = ?, tags = ?, location = ?, collaboration_type = ?, availability = ?, people_needed = ?, reference_url = ?, status = ? WHERE id = ?";
            jdbcTemplate.update(sql, c.getTitle(), c.getDescription(), c.getPurpose(), c.getSkills(), c.getTags(),
                    c.getLocation(), c.getCollaborationType(), c.getAvailability(), c.getPeopleNeeded(),
                    c.getReferenceUrl(), c.getStatus(), c.getId());
            return c;
        }
    }

    @Override
    public Optional<Collaboration> findById(Long id) {
        String sql = "SELECT * FROM collaborations WHERE id = ?";
        try {
            Collaboration c = jdbcTemplate.queryForObject(sql, collabRowMapper, id);
            return Optional.ofNullable(c);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Collaboration> findAll(String skill, String location, String search) {
        StringBuilder sql = new StringBuilder("SELECT * FROM collaborations WHERE status = 'OPEN' ");
        List<Object> params = new ArrayList<>();

        if (skill != null && !skill.trim().isEmpty() && !skill.equalsIgnoreCase("all")) {
            sql.append("AND (LOWER(skills) LIKE LOWER(?) OR LOWER(tags) LIKE LOWER(?) OR LOWER(collaboration_type) LIKE LOWER(?)) ");
            String skillPattern = "%" + skill.trim() + "%";
            params.add(skillPattern);
            params.add(skillPattern);
            params.add(skillPattern);
        }

        if (location != null && !location.trim().isEmpty()) {
            sql.append("AND LOWER(location) LIKE LOWER(?) ");
            params.add("%" + location.trim() + "%");
        }

        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(skills) LIKE LOWER(?) OR LOWER(tags) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?)) ");
            String searchPattern = "%" + search.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }

        sql.append("ORDER BY created_at DESC");
        return jdbcTemplate.query(sql.toString(), collabRowMapper, params.toArray());
    }

    @Override
    public List<Collaboration> findByCreatorId(Long creatorId) {
        String sql = "SELECT * FROM collaborations WHERE creator_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, collabRowMapper, creatorId);
    }

    @Override
    public boolean updateStatus(Long id, String status) {
        int rows = jdbcTemplate.update("UPDATE collaborations SET status = ? WHERE id = ?", status, id);
        return rows > 0;
    }

    @Override
    public CollaborationRequest saveRequest(CollaborationRequest request) {
        if (request.getId() == null) {
            String sql = "INSERT INTO collaboration_requests (collaboration_id, sender_id, receiver_id, message, status) VALUES (?, ?, ?, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                if (request.getCollaborationId() != null) {
                    ps.setLong(1, request.getCollaborationId());
                } else {
                    ps.setNull(1, java.sql.Types.BIGINT);
                }
                ps.setLong(2, request.getSenderId());
                ps.setLong(3, request.getReceiverId());
                ps.setString(4, request.getMessage());
                ps.setString(5, request.getStatus() != null ? request.getStatus() : "PENDING");
                return ps;
            }, keyHolder);

            if (keyHolder.getKey() != null) {
                request.setId(keyHolder.getKey().longValue());
            }
            request.setCreatedAt(LocalDateTime.now());
            request.setUpdatedAt(LocalDateTime.now());
            return request;
        } else {
            String sql = "UPDATE collaboration_requests SET status = ? WHERE id = ?";
            jdbcTemplate.update(sql, request.getStatus(), request.getId());
            return request;
        }
    }

    @Override
    public Optional<CollaborationRequest> findRequestById(Long id) {
        String sql = "SELECT * FROM collaboration_requests WHERE id = ?";
        try {
            CollaborationRequest r = jdbcTemplate.queryForObject(sql, requestRowMapper, id);
            return Optional.ofNullable(r);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<CollaborationRequest> findReceivedRequests(Long userId) {
        String sql = "SELECT * FROM collaboration_requests WHERE receiver_id = ? AND status = 'PENDING' ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, requestRowMapper, userId);
    }

    @Override
    public List<CollaborationRequest> findSentRequests(Long userId) {
        String sql = "SELECT * FROM collaboration_requests WHERE sender_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, requestRowMapper, userId);
    }

    @Override
    public List<CollaborationRequest> findApprovedRequests(Long userId) {
        String sql = "SELECT * FROM collaboration_requests WHERE (receiver_id = ? OR sender_id = ?) AND status IN ('APPROVED', 'ACCEPTED') ORDER BY updated_at DESC";
        return jdbcTemplate.query(sql, requestRowMapper, userId, userId);
    }

    @Override
    public boolean updateRequestStatus(Long id, String status) {
        int rows = jdbcTemplate.update("UPDATE collaboration_requests SET status = ? WHERE id = ?", status, id);
        return rows > 0;
    }

    @Override
    public int countRequestsForCollaboration(Long collaborationId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM collaboration_requests WHERE collaboration_id = ?",
                Integer.class, collaborationId);
        return count != null ? count : 0;
    }

    @Override
    public boolean hasUserRequestedCollaboration(Long collaborationId, Long userId) {
        if (collaborationId == null || userId == null) return false;
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM collaboration_requests WHERE collaboration_id = ? AND sender_id = ?",
                Integer.class, collaborationId, userId);
        return count != null && count > 0;
    }
}