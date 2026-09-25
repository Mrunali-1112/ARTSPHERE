package com.artsphere.repository;

import com.artsphere.model.Event;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcEventRepository implements EventRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcEventRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Event> eventRowMapper = (rs, rowNum) -> {
        Event event = new Event();
        event.setId(rs.getLong("id"));
        event.setTitle(rs.getString("title"));
        event.setOrganizer(rs.getString("organizer"));
        event.setOrganizerRole(rs.getString("organizer_role"));
        event.setOrganizerAvatar(rs.getString("organizer_avatar"));
        event.setLocation(rs.getString("location"));
        event.setVenue(rs.getString("venue"));
        event.setEventDate(rs.getString("event_date"));
        event.setEventTime(rs.getString("event_time"));
        event.setImageUrl(rs.getString("image_url"));
        event.setCoverImage(rs.getString("cover_image"));
        event.setDescription(rs.getString("description"));
        event.setCommunityId((Long) rs.getObject("community_id"));
        event.setEventType(rs.getString("event_type"));
        event.setAttendeesCount(rs.getInt("attendees_count"));
        event.setArtForm(rs.getString("art_form"));
        event.setWhatYoullLearn(rs.getString("what_youll_learn"));
        event.setWhoCanJoin(rs.getString("who_can_join"));
        event.setThingsToBring(rs.getString("things_to_bring"));
        event.setGuidelines(rs.getString("guidelines"));
        event.setQuote(rs.getString("quote"));
        event.setIsFeatured(rs.getBoolean("is_featured"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            event.setCreatedAt(createdAt.toLocalDateTime());
        }
        return event;
    };

    @Override
    public List<Event> findAll(String artForm, String search) {
        StringBuilder sql = new StringBuilder("SELECT * FROM events WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (artForm != null && !artForm.isBlank() && !artForm.equalsIgnoreCase("All")) {
            sql.append(" AND (LOWER(art_form) = LOWER(?) OR LOWER(event_type) = LOWER(?) OR LOWER(title) LIKE LOWER(?))");
            params.add(artForm.trim());
            params.add(artForm.trim());
            params.add("%" + artForm.trim() + "%");
        }

        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(title) LIKE LOWER(?) OR LOWER(organizer) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
            String term = "%" + search.trim() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
            params.add(term);
        }

        sql.append(" ORDER BY is_featured DESC, id ASC");
        return jdbcTemplate.query(sql.toString(), eventRowMapper, params.toArray());
    }

    @Override
    public List<Event> findFeatured() {
        String sql = "SELECT * FROM events WHERE is_featured = TRUE ORDER BY id ASC";
        return jdbcTemplate.query(sql, eventRowMapper);
    }

    @Override
    public Optional<Event> findById(Long id) {
        String sql = "SELECT * FROM events WHERE id = ?";
        try {
            Event event = jdbcTemplate.queryForObject(sql, eventRowMapper, id);
            return Optional.ofNullable(event);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean isUserRegistered(Long eventId, Long userId) {
        String sql = "SELECT COUNT(*) FROM event_registrations WHERE event_id = ? AND user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, eventId, userId);
        return count != null && count > 0;
    }

    @Override
    public boolean registerUser(Long eventId, Long userId) {
        String sql = "INSERT IGNORE INTO event_registrations (event_id, user_id) VALUES (?, ?)";
        int rows = jdbcTemplate.update(sql, eventId, userId);
        if (rows > 0) {
            jdbcTemplate.update("UPDATE events SET attendees_count = attendees_count + 1 WHERE id = ?", eventId);
        }
        return true;
    }

    @Override
    public int countRegistrations(Long eventId) {
        String sql = "SELECT COUNT(*) FROM event_registrations WHERE event_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, eventId);
        return count != null ? count : 0;
    }

    @Override
    public List<String> findAttendeeAvatars(Long eventId) {
        String sql = "SELECT u.profile_picture FROM event_registrations er " +
                     "JOIN users u ON er.user_id = u.id " +
                     "WHERE er.event_id = ? ORDER BY er.registered_at DESC LIMIT 5";
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("profile_picture"), eventId);
    }
}
