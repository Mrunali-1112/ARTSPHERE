package com.artsphere.repository;

import com.artsphere.model.dto.NotificationResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class JdbcNotificationRepository implements NotificationRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcNotificationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<NotificationResponse> rowMapper = (rs, rowNum) -> {
        NotificationResponse n = new NotificationResponse();
        n.setId(rs.getLong("id"));
        n.setUserId(rs.getLong("user_id"));
        n.setType(rs.getString("type"));
        n.setTitle(rs.getString("title"));
        n.setMessage(rs.getString("message"));
        n.setSenderId(rs.getObject("sender_id") != null ? rs.getLong("sender_id") : null);
        n.setSenderName(rs.getString("sender_name"));
        n.setSenderAvatar(rs.getString("sender_avatar"));
        n.setEntityType(rs.getString("entity_type"));
        n.setEntityId(rs.getObject("entity_id") != null ? rs.getLong("entity_id") : null);
        n.setActionUrl(rs.getString("action_url"));
        n.setRead(rs.getBoolean("is_read"));

        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) {
            LocalDateTime created = ts.toLocalDateTime();
            n.setCreatedAt(created);

            LocalDateTime now = LocalDateTime.now();
            Duration duration = Duration.between(created, now);
            long seconds = duration.getSeconds();
            long minutes = duration.toMinutes();
            long hours = duration.toHours();
            long days = duration.toDays();

            String timeAgo;
            String timeGroup;

            if (seconds < 60) {
                timeAgo = "Just now";
                timeGroup = "Today";
            } else if (minutes < 60) {
                timeAgo = minutes + " minutes ago";
                timeGroup = "Today";
            } else if (hours < 24) {
                timeAgo = hours + (hours == 1 ? " hour ago" : " hours ago");
                timeGroup = "Today";
            } else if (days < 7) {
                timeAgo = days + (days == 1 ? " day ago" : " days ago");
                timeGroup = "This Week";
            } else {
                timeAgo = days + " days ago";
                timeGroup = "Earlier";
            }

            n.setTimeAgo(timeAgo);
            n.setTimeGroup(timeGroup);
        } else {
            n.setTimeAgo("Recently");
            n.setTimeGroup("Earlier");
        }

        return n;
    };

    @Override
    public List<NotificationResponse> findByUserId(Long userId, String category) {
        StringBuilder sql = new StringBuilder("SELECT * FROM notifications WHERE user_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            String cat = category.trim().toUpperCase();
            String norm = switch (cat) {
                case "EVENTS", "EVENT" -> "EVENT";
                case "COLLABORATIONS", "COLLABORATION" -> "COLLABORATION";
                case "OPPORTUNITIES", "OPPORTUNITY" -> "OPPORTUNITY";
                case "PORTFOLIOS", "PORTFOLIO" -> "PORTFOLIO";
                case "ARTWORKS", "ARTWORK" -> "ARTWORK";
                default -> cat;
            };
            sql.append(" AND UPPER(type) = ?");
            params.add(norm);
        }

        sql.append(" ORDER BY created_at DESC");
        return jdbcTemplate.query(sql.toString(), rowMapper, params.toArray());
    }

    @Override
    public int countUnreadByUserId(Long userId) {
        String sql = "SELECT COUNT(1) FROM notifications WHERE user_id = ? AND is_read = FALSE";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null ? count : 0;
    }

    @Override
    public boolean markAsRead(Long id, Long userId) {
        String sql = "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?";
        return jdbcTemplate.update(sql, id, userId) > 0;
    }

    @Override
    public boolean markAllAsRead(Long userId) {
        String sql = "UPDATE notifications SET is_read = TRUE WHERE user_id = ?";
        return jdbcTemplate.update(sql, userId) >= 0;
    }
}
