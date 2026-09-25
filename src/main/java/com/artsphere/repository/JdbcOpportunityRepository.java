package com.artsphere.repository;

import com.artsphere.model.Opportunity;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcOpportunityRepository implements OpportunityRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcOpportunityRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Opportunity> opportunityRowMapper = (rs, rowNum) -> {
        Opportunity opp = new Opportunity();
        opp.setId(rs.getLong("id"));
        opp.setTitle(rs.getString("title"));
        opp.setSubtitle(rs.getString("subtitle"));
        opp.setDescription(rs.getString("description"));
        opp.setCategory(rs.getString("category"));
        opp.setArtCategory(rs.getString("art_category"));
        opp.setOrganizer(rs.getString("organizer"));
        opp.setOrganizerType(rs.getString("organizer_type"));
        opp.setOrganizerAvatar(rs.getString("organizer_avatar"));
        opp.setLocation(rs.getString("location"));
        opp.setDaysLeft(rs.getString("days_left"));
        opp.setDeadline(rs.getString("deadline"));
        opp.setDuration(rs.getString("duration"));
        opp.setImageUrl(rs.getString("image_url"));
        opp.setRequirements(rs.getString("requirements"));
        opp.setBenefits(rs.getString("benefits"));
        opp.setQuoteText(rs.getString("quote_text"));
        opp.setQuoteAuthor(rs.getString("quote_author"));
        opp.setFeatured(rs.getBoolean("is_featured"));
        opp.setStatus(rs.getString("status"));

        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) {
            opp.setCreatedAt(ts.toLocalDateTime());
        }
        return opp;
    };

    @Override
    public List<Opportunity> findAll(String category, String location, String search) {
        StringBuilder sql = new StringBuilder("SELECT * FROM opportunities WHERE status = 'OPEN' ");
        List<Object> params = new ArrayList<>();

        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            sql.append("AND LOWER(category) = LOWER(?) ");
            params.add(category.trim());
        }

        if (location != null && !location.trim().isEmpty()) {
            sql.append("AND LOWER(location) LIKE LOWER(?) ");
            params.add("%" + location.trim() + "%");
        }

        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(organizer) LIKE LOWER(?) OR LOWER(art_category) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?)) ");
            String wild = "%" + search.trim() + "%";
            params.add(wild);
            params.add(wild);
            params.add(wild);
            params.add(wild);
            params.add(wild);
        }

        sql.append("ORDER BY is_featured DESC, id ASC");
        return jdbcTemplate.query(sql.toString(), opportunityRowMapper, params.toArray());
    }

    @Override
    public Optional<Opportunity> findById(Long id) {
        String sql = "SELECT * FROM opportunities WHERE id = ?";
        try {
            Opportunity opp = jdbcTemplate.queryForObject(sql, opportunityRowMapper, id);
            return Optional.ofNullable(opp);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Opportunity> findFeatured() {
        String sql = "SELECT * FROM opportunities WHERE is_featured = TRUE AND status = 'OPEN' ORDER BY id ASC LIMIT 1";
        try {
            Opportunity opp = jdbcTemplate.queryForObject(sql, opportunityRowMapper);
            return Optional.ofNullable(opp);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean hasUserApplied(Long userId, Long opportunityId) {
        String sql = "SELECT COUNT(1) FROM applications WHERE user_id = ? AND opportunity_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId, opportunityId);
        return count != null && count > 0;
    }

    @Override
    public int apply(Long userId, Long opportunityId, String notes) {
        String sql = "INSERT INTO applications (user_id, opportunity_id, status, notes) VALUES (?, ?, 'PENDING', ?)";
        return jdbcTemplate.update(sql, userId, opportunityId, notes);
    }
}
