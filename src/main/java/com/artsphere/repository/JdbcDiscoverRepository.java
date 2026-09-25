package com.artsphere.repository;

import com.artsphere.model.dto.DiscoverArtistResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class JdbcDiscoverRepository implements DiscoverRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcDiscoverRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<DiscoverArtistResponse> artistRowMapper = (rs, rowNum) -> {
        DiscoverArtistResponse artist = new DiscoverArtistResponse();
        artist.setId(rs.getLong("artist_id"));
        artist.setName(rs.getString("full_name"));
        artist.setProfession(rs.getString("profession"));
        artist.setAvatarUrl(rs.getString("profile_picture"));
        artist.setCoverImageUrl(rs.getString("cover_image_url"));
        artist.setArtworkTitle(rs.getString("artwork_title"));
        artist.setCategory(rs.getString("artwork_category"));
        try {
            artist.setLocation(rs.getString("location"));
        } catch (Exception ignored) {
            artist.setLocation("Mumbai, MH");
        }
        return artist;
    };

    @Override
    public List<DiscoverArtistResponse> findArtists(String artForm, String location, String search) {
        StringBuilder sql = new StringBuilder(
                "SELECT " +
                "    u.id AS artist_id, " +
                "    u.full_name, " +
                "    COALESCE(u.artist_type, u.bio) AS profession, " +
                "    u.location, " +
                "    u.profile_picture, " +
                "    a.image_url AS cover_image_url, " +
                "    a.title AS artwork_title, " +
                "    a.category AS artwork_category " +
                "FROM users u " +
                "LEFT JOIN ( " +
                "    SELECT a1.* " +
                "    FROM artworks a1 " +
                "    INNER JOIN ( " +
                "        SELECT artist_id, MIN(id) AS min_id " +
                "        FROM artworks " +
                "        GROUP BY artist_id " +
                "    ) a2 ON a1.id = a2.min_id " +
                ") a ON u.id = a.artist_id " +
                "WHERE u.role = 'ROLE_ARTIST' "
        );

        List<Object> params = new ArrayList<>();

        if (artForm != null && !artForm.isBlank() && !artForm.equalsIgnoreCase("All")) {
            sql.append("AND (LOWER(a.category) LIKE ? OR LOWER(u.bio) LIKE ?) ");
            String categoryParam = "%" + artForm.trim().toLowerCase() + "%";
            params.add(categoryParam);
            params.add(categoryParam);
        }

        if (location != null && !location.isBlank()) {
            sql.append("AND LOWER(u.location) LIKE ? ");
            params.add("%" + location.trim().toLowerCase() + "%");
        }

        if (search != null && !search.isBlank()) {
            sql.append("AND (LOWER(u.full_name) LIKE ? OR LOWER(u.bio) LIKE ? OR LOWER(u.location) LIKE ? OR LOWER(a.title) LIKE ? OR LOWER(a.category) LIKE ?) ");
            String searchParam = "%" + search.trim().toLowerCase() + "%";
            params.add(searchParam);
            params.add(searchParam);
            params.add(searchParam);
            params.add(searchParam);
            params.add(searchParam);
        }

        sql.append("ORDER BY u.id ASC");

        List<DiscoverArtistResponse> artists = jdbcTemplate.query(sql.toString(), artistRowMapper, params.toArray());
        for (DiscoverArtistResponse a : artists) {
            a.setConnected(isConnected(101L, a.getId()));
        }
        return artists;
    }

    @Override
    public List<DiscoverArtistResponse> findFeaturedArtists() {
        String sql =
                "SELECT " +
                "    u.id AS artist_id, " +
                "    u.full_name, " +
                "    COALESCE(u.artist_type, u.bio) AS profession, " +
                "    u.location, " +
                "    u.profile_picture, " +
                "    a.image_url AS cover_image_url, " +
                "    a.title AS artwork_title, " +
                "    a.category AS artwork_category " +
                "FROM users u " +
                "LEFT JOIN ( " +
                "    SELECT a1.* " +
                "    FROM artworks a1 " +
                "    INNER JOIN ( " +
                "        SELECT artist_id, MIN(id) AS min_id " +
                "        FROM artworks " +
                "        GROUP BY artist_id " +
                "    ) a2 ON a1.id = a2.min_id " +
                ") a ON u.id = a.artist_id " +
                "WHERE u.role = 'ROLE_ARTIST' AND u.id IN (101, 102, 103) " +
                "ORDER BY u.id ASC";

        List<DiscoverArtistResponse> artists = jdbcTemplate.query(sql, artistRowMapper);
        for (DiscoverArtistResponse a : artists) {
            a.setConnected(isConnected(101L, a.getId()));
        }
        return artists;
    }

    @Override
    public List<DiscoverArtistResponse> findArtistsNearYou() {
        String sql =
                "SELECT " +
                "    u.id AS artist_id, " +
                "    u.full_name, " +
                "    COALESCE(u.artist_type, u.bio) AS profession, " +
                "    u.location, " +
                "    u.profile_picture, " +
                "    a.image_url AS cover_image_url, " +
                "    a.title AS artwork_title, " +
                "    a.category AS artwork_category " +
                "FROM users u " +
                "LEFT JOIN ( " +
                "    SELECT a1.* " +
                "    FROM artworks a1 " +
                "    INNER JOIN ( " +
                "        SELECT artist_id, MIN(id) AS min_id " +
                "        FROM artworks " +
                "        GROUP BY artist_id " +
                "    ) a2 ON a1.id = a2.min_id " +
                ") a ON u.id = a.artist_id " +
                "WHERE u.role = 'ROLE_ARTIST' AND u.id IN (104, 105, 106) " +
                "ORDER BY u.id ASC";

        List<DiscoverArtistResponse> artists = jdbcTemplate.query(sql, artistRowMapper);
        for (DiscoverArtistResponse a : artists) {
            a.setConnected(isConnected(101L, a.getId()));
        }
        return artists;
    }

    @Override
    public boolean toggleConnection(Long userId, Long artistId) {
        String checkSql = "SELECT COUNT(1) FROM artist_connections WHERE user_id = ? AND artist_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, artistId);
        if (count != null && count > 0) {
            jdbcTemplate.update("DELETE FROM artist_connections WHERE user_id = ? AND artist_id = ?", userId, artistId);
            return false;
        } else {
            jdbcTemplate.update("INSERT INTO artist_connections (user_id, artist_id, status) VALUES (?, ?, 'CONNECTED')", userId, artistId);
            return true;
        }
    }

    @Override
    public boolean isConnected(Long userId, Long artistId) {
        try {
            String sql = "SELECT COUNT(1) FROM artist_connections WHERE user_id = ? AND artist_id = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId, artistId);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }
}
