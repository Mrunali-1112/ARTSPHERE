package com.artsphere.repository;

import com.artsphere.model.Community;
import com.artsphere.model.Event;
import com.artsphere.model.dto.FeaturedArtistResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class JdbcHomeRepository implements HomeRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcHomeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<FeaturedArtistResponse> featuredArtistRowMapper = (rs, rowNum) -> {
        FeaturedArtistResponse artist = new FeaturedArtistResponse();
        artist.setId(rs.getLong("artist_id"));
        artist.setName(rs.getString("full_name"));
        artist.setProfession(rs.getString("profession"));
        artist.setAvatarUrl(rs.getString("profile_picture"));
        artist.setCoverImageUrl(rs.getString("cover_image_url"));
        artist.setArtworkTitle(rs.getString("artwork_title"));
        artist.setArtworkCategory(rs.getString("artwork_category"));
        return artist;
    };

    private final RowMapper<Event> eventRowMapper = (rs, rowNum) -> {
        Event event = new Event();
        event.setId(rs.getLong("id"));
        event.setTitle(rs.getString("title"));
        event.setOrganizer(rs.getString("organizer"));
        event.setLocation(rs.getString("location"));
        event.setEventDate(rs.getString("event_date"));
        event.setEventTime(rs.getString("event_time"));
        event.setImageUrl(rs.getString("image_url"));
        event.setDescription(rs.getString("description"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            event.setCreatedAt(createdAt.toLocalDateTime());
        }
        return event;
    };

    private final RowMapper<Community> communityRowMapper = (rs, rowNum) -> {
        Community community = new Community();
        community.setId(rs.getLong("id"));
        community.setName(rs.getString("name"));
        community.setDescription(rs.getString("description"));
        community.setMemberCount(rs.getInt("member_count"));
        community.setCategory(rs.getString("category"));
        community.setImageUrl(rs.getString("image_url"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            community.setCreatedAt(createdAt.toLocalDateTime());
        }
        return community;
    };

    @Override
    public List<FeaturedArtistResponse> findFeaturedArtists() {
        String sql = "SELECT " +
                     "    u.id AS artist_id, " +
                     "    u.full_name, " +
                     "    COALESCE(u.artist_type, u.bio) AS profession, " +
                     "    u.profile_picture, " +
                     "    a.image_url AS cover_image_url, " +
                     "    a.title AS artwork_title, " +
                     "    a.category AS artwork_category " +
                     "FROM users u " +
                     "LEFT JOIN ( " +
                     "    SELECT artist_id, title, category, image_url " +
                     "    FROM artworks " +
                     "    WHERE id IN (SELECT MIN(id) FROM artworks GROUP BY artist_id) " +
                     ") a ON u.id = a.artist_id " +
                     "WHERE u.role = 'ROLE_ARTIST' " +
                     "ORDER BY u.id ASC";
        return jdbcTemplate.query(sql, featuredArtistRowMapper);
    }

    @Override
    public List<Event> findUpcomingEvents() {
        String sql = "SELECT * FROM events ORDER BY id ASC";
        return jdbcTemplate.query(sql, eventRowMapper);
    }

    @Override
    public List<Community> findCommunities() {
        String sql = "SELECT * FROM communities ORDER BY id ASC";
        return jdbcTemplate.query(sql, communityRowMapper);
    }
}
