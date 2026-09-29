package com.artsphere.repository;

import com.artsphere.model.Conversation;
import com.artsphere.model.dto.ConversationSummaryResponse;
import com.artsphere.model.dto.MessageItemResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class JdbcMessageRepository implements MessageRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcMessageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Conversation> conversationRowMapper = (rs, rowNum) -> {
        Conversation c = new Conversation();
        c.setId(rs.getLong("id"));
        c.setTitle(rs.getString("title"));
        c.setContextType(rs.getString("context_type"));
        Long ctxId = rs.getLong("context_id");
        if (!rs.wasNull()) {
            c.setContextId(ctxId);
        }
        c.setContextTitle(rs.getString("context_title"));
        c.setContextImage(rs.getString("context_image"));
        c.setContextUrl(rs.getString("context_url"));
        Timestamp cat = rs.getTimestamp("created_at");
        if (cat != null) c.setCreatedAt(cat.toLocalDateTime());
        Timestamp uat = rs.getTimestamp("updated_at");
        if (uat != null) c.setUpdatedAt(uat.toLocalDateTime());
        return c;
    };

    @Override
    public List<ConversationSummaryResponse> findConversationsForUser(Long userId) {
        String sql = """
            SELECT c.id, c.title, c.context_type, c.context_id, c.context_title, c.context_image, c.context_url, c.updated_at
            FROM conversations c
            JOIN conversation_members cm ON c.id = cm.conversation_id
            WHERE cm.user_id = ?
            ORDER BY c.updated_at DESC
        """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, userId);
        List<ConversationSummaryResponse> result = new ArrayList<>();

        for (Map<String, Object> r : rows) {
            Long convId = ((Number) r.get("id")).longValue();
            String title = (String) r.get("title");
            String contextType = (String) r.get("context_type");
            Number ctxIdNum = (Number) r.get("context_id");
            Long contextId = ctxIdNum != null ? ctxIdNum.longValue() : null;
            String contextTitle = (String) r.get("context_title");
            String contextImage = (String) r.get("context_image");
            String contextUrl = (String) r.get("context_url");

            // Find other participant
            String otherUserSql = """
                SELECT u.id, u.full_name, u.profile_picture, COALESCE(u.artist_type, 'Artist') AS artist_type
                FROM conversation_members cm
                JOIN users u ON cm.user_id = u.id
                WHERE cm.conversation_id = ? AND cm.user_id != ?
                LIMIT 1
            """;

            Long otherUserId = null;
            String otherUserName = "Creator";
            String otherUserAvatar = "/images/artist_profile_avatar.png";
            String otherUserType = "Artist";

            try {
                Map<String, Object> otherUser = jdbcTemplate.queryForMap(otherUserSql, convId, userId);
                otherUserId = ((Number) otherUser.get("id")).longValue();
                otherUserName = (String) otherUser.get("full_name");
                if (otherUser.get("profile_picture") != null) {
                    otherUserAvatar = (String) otherUser.get("profile_picture");
                }
                if (otherUser.get("artist_type") != null) {
                    otherUserType = (String) otherUser.get("artist_type");
                }
            } catch (EmptyResultDataAccessException ignored) {
            }

            // Find latest message
            String lastMsgSql = """
                SELECT message_text, sent_at
                FROM messages
                WHERE conversation_id = ?
                ORDER BY sent_at DESC, id DESC
                LIMIT 1
            """;

            String lastMessage = "No messages yet";
            String lastMessageTime = "";

            try {
                Map<String, Object> lastMsg = jdbcTemplate.queryForMap(lastMsgSql, convId);
                lastMessage = (String) lastMsg.get("message_text");
                Timestamp ts = (Timestamp) lastMsg.get("sent_at");
                if (ts != null) {
                    lastMessageTime = formatRelativeTime(ts.toLocalDateTime());
                }
            } catch (EmptyResultDataAccessException ignored) {
            }

            // Count unread
            String unreadSql = """
                SELECT COUNT(*)
                FROM messages
                WHERE conversation_id = ? AND (receiver_id = ? OR (sender_id != ? AND receiver_id IS NULL)) AND is_read = FALSE
            """;
            Integer unread = jdbcTemplate.queryForObject(unreadSql, Integer.class, convId, userId, userId);
            int unreadCount = unread != null ? unread : 0;

            ConversationSummaryResponse summary = new ConversationSummaryResponse(
                    convId,
                    title,
                    otherUserId,
                    otherUserName,
                    otherUserAvatar,
                    otherUserType,
                    lastMessage,
                    lastMessageTime,
                    unreadCount,
                    contextType,
                    contextId,
                    contextTitle,
                    contextImage,
                    contextUrl
            );
            result.add(summary);
        }

        return result;
    }

    @Override
    public Optional<Conversation> findConversationById(Long conversationId) {
        String sql = "SELECT * FROM conversations WHERE id = ?";
        try {
            Conversation c = jdbcTemplate.queryForObject(sql, conversationRowMapper, conversationId);
            return Optional.ofNullable(c);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean isUserInConversation(Long conversationId, Long userId) {
        String sql = "SELECT COUNT(1) FROM conversation_members WHERE conversation_id = ? AND user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, conversationId, userId);
        return count != null && count > 0;
    }

    @Override
    public List<MessageItemResponse> findMessagesByConversationId(Long conversationId, Long currentUserId) {
        String sql = """
            SELECT m.id, m.conversation_id, m.sender_id, m.receiver_id, m.message_text, m.is_read, m.sent_at,
                   u.full_name AS sender_name, u.profile_picture AS sender_avatar
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.sent_at ASC, m.id ASC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Long id = rs.getLong("id");
            Long convId = rs.getLong("conversation_id");
            Long senderId = rs.getLong("sender_id");
            Long receiverId = rs.getLong("receiver_id");
            if (rs.wasNull()) receiverId = null;
            String messageText = rs.getString("message_text");
            boolean isRead = rs.getBoolean("is_read");
            Timestamp sentAtTs = rs.getTimestamp("sent_at");
            LocalDateTime sentAt = sentAtTs != null ? sentAtTs.toLocalDateTime() : LocalDateTime.now();
            String senderName = rs.getString("sender_name");
            String senderAvatar = rs.getString("sender_avatar");
            if (senderAvatar == null || senderAvatar.isBlank()) {
                senderAvatar = "/images/artist_profile_avatar.png";
            }

            boolean isOwn = currentUserId != null && currentUserId.equals(senderId);
            String formattedTime = sentAt.format(DateTimeFormatter.ofPattern("hh:mm a"));

            return new MessageItemResponse(
                    id,
                    convId,
                    senderId,
                    senderName,
                    senderAvatar,
                    receiverId,
                    messageText,
                    isOwn,
                    isRead,
                    sentAt,
                    formattedTime
            );
        }, conversationId);
    }

    @Override
    public MessageItemResponse saveMessage(Long conversationId, Long senderId, String messageText) {
        // Find other member
        String otherUserSql = "SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ? LIMIT 1";
        Long receiverId = null;
        try {
            receiverId = jdbcTemplate.queryForObject(otherUserSql, Long.class, conversationId, senderId);
        } catch (EmptyResultDataAccessException ignored) {
        }

        String insertSql = "INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text, is_read, sent_at) VALUES (?, ?, ?, ?, FALSE, NOW())";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        Long finalReceiverId = receiverId;

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, conversationId);
            ps.setLong(2, senderId);
            if (finalReceiverId != null) {
                ps.setLong(3, finalReceiverId);
            } else {
                ps.setNull(3, java.sql.Types.BIGINT);
            }
            ps.setString(4, messageText);
            return ps;
        }, keyHolder);

        Long messageId = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;

        // Update conversation timestamp
        jdbcTemplate.update("UPDATE conversations SET updated_at = NOW() WHERE id = ?", conversationId);

        // Fetch sender info
        String userSql = "SELECT full_name, profile_picture FROM users WHERE id = ?";
        String senderName = "Creator";
        String senderAvatar = "/images/artist_profile_avatar.png";
        try {
            Map<String, Object> u = jdbcTemplate.queryForMap(userSql, senderId);
            senderName = (String) u.get("full_name");
            if (u.get("profile_picture") != null) {
                senderAvatar = (String) u.get("profile_picture");
            }
        } catch (EmptyResultDataAccessException ignored) {
        }

        LocalDateTime now = LocalDateTime.now();
        return new MessageItemResponse(
                messageId,
                conversationId,
                senderId,
                senderName,
                senderAvatar,
                finalReceiverId,
                messageText,
                true,
                false,
                now,
                now.format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
    }

    @Override
    public ConversationSummaryResponse findOrCreateDirectConversation(Long currentUserId, Long recipientId, String contextType, Long contextId, String contextTitle, String contextImage, String contextUrl) {
        // Check if a direct conversation already exists between these two users
        String findExistingSql = """
            SELECT cm1.conversation_id
            FROM conversation_members cm1
            JOIN conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
            WHERE cm1.user_id = ? AND cm2.user_id = ?
            LIMIT 1
        """;

        Long existingConvId = null;
        try {
            existingConvId = jdbcTemplate.queryForObject(findExistingSql, Long.class, currentUserId, recipientId);
        } catch (EmptyResultDataAccessException ignored) {
        }

        if (existingConvId != null) {
            if (contextType != null && !contextType.isBlank()) {
                jdbcTemplate.update("""
                    UPDATE conversations
                    SET context_type = COALESCE(?, context_type),
                        context_id = COALESCE(?, context_id),
                        context_title = COALESCE(?, context_title),
                        context_image = COALESCE(?, context_image),
                        context_url = COALESCE(?, context_url),
                        updated_at = NOW()
                    WHERE id = ?
                """, contextType, contextId, contextTitle, contextImage, contextUrl, existingConvId);
            }
            return getConversationSummary(existingConvId, currentUserId);
        }

        // Fetch recipient name
        String recipientNameSql = "SELECT full_name, profile_picture, COALESCE(artist_type, 'Artist') AS artist_type FROM users WHERE id = ?";
        String recipientName = "Artist";
        try {
            Map<String, Object> r = jdbcTemplate.queryForMap(recipientNameSql, recipientId);
            recipientName = (String) r.get("full_name");
        } catch (EmptyResultDataAccessException ignored) {
        }

        String title = "Chat with " + recipientName;
        String insertConvSql = "INSERT INTO conversations (title, context_type, context_id, context_title, context_image, context_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(insertConvSql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, title);
            ps.setString(2, contextType != null ? contextType : "DIRECT");
            if (contextId != null) {
                ps.setLong(3, contextId);
            } else {
                ps.setNull(3, java.sql.Types.BIGINT);
            }
            ps.setString(4, contextTitle);
            ps.setString(5, contextImage);
            ps.setString(6, contextUrl);
            return ps;
        }, keyHolder);

        Long newConvId = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;

        // Add members
        jdbcTemplate.update("INSERT INTO conversation_members (conversation_id, user_id, joined_at, last_read_at) VALUES (?, ?, NOW(), NOW())", newConvId, currentUserId);
        jdbcTemplate.update("INSERT INTO conversation_members (conversation_id, user_id, joined_at, last_read_at) VALUES (?, ?, NOW(), NULL)", newConvId, recipientId);

        return getConversationSummary(newConvId, currentUserId);
    }

    @Override
    public void markMessagesAsRead(Long conversationId, Long userId) {
        jdbcTemplate.update("""
            UPDATE messages
            SET is_read = TRUE
            WHERE conversation_id = ? AND (receiver_id = ? OR (sender_id != ? AND receiver_id IS NULL))
        """, conversationId, userId, userId);

        jdbcTemplate.update("""
            UPDATE conversation_members
            SET last_read_at = NOW()
            WHERE conversation_id = ? AND user_id = ?
        """, conversationId, userId);
    }

    @Override
    public List<Long> findParticipantUserIds(Long conversationId, Long excludeUserId) {
        String sql = "SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("user_id"), conversationId, excludeUserId);
    }

    private ConversationSummaryResponse getConversationSummary(Long conversationId, Long currentUserId) {
        List<ConversationSummaryResponse> list = findConversationsForUser(currentUserId);
        for (ConversationSummaryResponse c : list) {
            if (c.getId().equals(conversationId)) {
                return c;
            }
        }
        return new ConversationSummaryResponse(conversationId, "Conversation", null, "Artist", "/images/artist_profile_avatar.png", "Artist", "Start a conversation", "", 0, null, null, null, null, null);
    }

    private String formatRelativeTime(LocalDateTime time) {
        if (time == null) return "";
        Duration duration = Duration.between(time, LocalDateTime.now());
        long seconds = duration.getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = duration.toMinutes();
        if (minutes < 60) return minutes + "m ago";
        long hours = duration.toHours();
        if (hours < 24) return hours + "h ago";
        long days = duration.toDays();
        if (days == 1) return "Yesterday";
        if (days < 7) return days + "d ago";
        return time.format(DateTimeFormatter.ofPattern("dd MMM"));
    }
}
