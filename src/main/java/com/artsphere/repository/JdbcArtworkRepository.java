package com.artsphere.repository;

import com.artsphere.model.Artwork;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcArtworkRepository implements ArtworkRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcArtworkRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Artwork> artworkRowMapper = (rs, rowNum) -> {
        Artwork artwork = new Artwork();
        artwork.setId(rs.getLong("id"));
        artwork.setTitle(rs.getString("title"));
        artwork.setDescription(rs.getString("description"));
        artwork.setCategory(rs.getString("category"));
        artwork.setImageUrl(rs.getString("image_url"));
        artwork.setPrice(rs.getBigDecimal("price"));
        artwork.setForSale(rs.getBoolean("for_sale"));
        artwork.setArtistId(rs.getLong("artist_id"));

        try {
            artwork.setLikesCount(rs.getInt("likes_count"));
            artwork.setCommentsCount(rs.getInt("comments_count"));
        } catch (Exception ignored) {
            artwork.setLikesCount(0);
            artwork.setCommentsCount(0);
        }

        try {
            artwork.setArtistName(rs.getString("artist_name"));
            artwork.setArtistUsername(rs.getString("artist_username"));
        } catch (Exception ignored) {
            // In case columns are not present in custom projection
        }

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            artwork.setCreatedAt(createdAt.toLocalDateTime());
        }

        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            artwork.setUpdatedAt(updatedAt.toLocalDateTime());
        }

        return artwork;
    };

    @Override
    public Artwork save(Artwork artwork) {
        String sql = "INSERT INTO artworks (title, description, category, image_url, price, for_sale, likes_count, comments_count, artist_id) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, artwork.getTitle());
            ps.setString(2, artwork.getDescription());
            ps.setString(3, artwork.getCategory());
            ps.setString(4, artwork.getImageUrl());
            ps.setBigDecimal(5, artwork.getPrice());
            ps.setBoolean(6, artwork.isForSale());
            ps.setInt(7, artwork.getLikesCount() != null ? artwork.getLikesCount() : 0);
            ps.setInt(8, artwork.getCommentsCount() != null ? artwork.getCommentsCount() : 0);
            ps.setLong(9, artwork.getArtistId());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            artwork.setId(key.longValue());
        }
        return artwork;
    }

    @Override
    public Optional<Artwork> findById(Long id) {
        String sql = "SELECT a.*, u.full_name AS artist_name, u.username AS artist_username " +
                     "FROM artworks a " +
                     "JOIN users u ON a.artist_id = u.id " +
                     "WHERE a.id = ?";
        List<Artwork> results = jdbcTemplate.query(sql, artworkRowMapper, id);
        return results.stream().findFirst();
    }

    @Override
    public List<Artwork> findAll(String category, String search) {
        StringBuilder sql = new StringBuilder(
                "SELECT a.*, u.full_name AS artist_name, u.username AS artist_username " +
                "FROM artworks a " +
                "JOIN users u ON a.artist_id = u.id WHERE 1=1"
        );

        List<Object> params = new ArrayList<>();

        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category.trim())) {
            sql.append(" AND a.category = ?");
            params.add(category.trim());
        }

        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(a.title) LIKE ? OR LOWER(a.description) LIKE ?)");
            String query = "%" + search.trim().toLowerCase() + "%";
            params.add(query);
            params.add(query);
        }

        sql.append(" ORDER BY a.created_at DESC");

        return jdbcTemplate.query(sql.toString(), artworkRowMapper, params.toArray());
    }

    @Override
    public List<Artwork> findByArtistId(Long artistId) {
        String sql = "SELECT a.*, u.full_name AS artist_name, u.username AS artist_username " +
                     "FROM artworks a " +
                     "JOIN users u ON a.artist_id = u.id " +
                     "WHERE a.artist_id = ? " +
                     "ORDER BY a.created_at DESC";
        return jdbcTemplate.query(sql, artworkRowMapper, artistId);
    }

    @Override
    public List<Artwork> findByArtistIdAndCategory(Long artistId, String category) {
        if (category == null || category.isBlank() || "all".equalsIgnoreCase(category.trim())) {
            return findByArtistId(artistId);
        }
        String sql = "SELECT a.*, u.full_name AS artist_name, u.username AS artist_username " +
                     "FROM artworks a " +
                     "JOIN users u ON a.artist_id = u.id " +
                     "WHERE a.artist_id = ? AND LOWER(a.category) = LOWER(?) " +
                     "ORDER BY a.created_at DESC";
        return jdbcTemplate.query(sql, artworkRowMapper, artistId, category.trim());
    }

    @Override
    public int update(Artwork artwork) {
        String sql = "UPDATE artworks SET title = ?, description = ?, category = ?, " +
                     "image_url = ?, price = ?, for_sale = ?, likes_count = ?, comments_count = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
                artwork.getTitle(),
                artwork.getDescription(),
                artwork.getCategory(),
                artwork.getImageUrl(),
                artwork.getPrice(),
                artwork.isForSale(),
                artwork.getLikesCount() != null ? artwork.getLikesCount() : 0,
                artwork.getCommentsCount() != null ? artwork.getCommentsCount() : 0,
                artwork.getId());
    }

    @Override
    public int deleteById(Long id) {
        String sql = "DELETE FROM artworks WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    @Override
    public boolean existsById(Long id) {
        String sql = "SELECT COUNT(1) FROM artworks WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }
}
