-- ===================================================
-- Notifications Schema and Seed Data
-- ===================================================

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    sender_id BIGINT NULL,
    sender_name VARCHAR(100) NULL,
    sender_avatar VARCHAR(255) NULL,
    entity_type VARCHAR(50) NULL,
    entity_id BIGINT NULL,
    action_url VARCHAR(255) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO notifications (id, user_id, type, title, message, sender_id, sender_name, sender_avatar, entity_type, entity_id, action_url, is_read, created_at)
VALUES
(1, 101, 'COLLABORATION', 'Arjun Mehta sent you a collaboration request', 'Hi! I loved your artwork and would love to collaborate on a music + visual art project.', 104, 'Arjun Mehta', '/images/artist_arjun_thumb.png', 'COLLABORATION_REQUEST', 1, '/pages/collaboration-requests.html', FALSE, NOW() - INTERVAL 2 HOUR),
(2, 101, 'PORTFOLIO', 'Sneha Patil liked your portfolio', '"Your style is amazing!"', 108, 'Sneha Patil', '/images/avatar_sneha.png', 'PORTFOLIO', 101, '/pages/portfolio.html?id=101', FALSE, NOW() - INTERVAL 4 HOUR),
(3, 101, 'EVENT', 'New event posted', 'College Art Fest 2024', NULL, 'ArtSphere Events', '/images/event_art_festival.png', 'EVENT', 801, '/pages/event-details.html?id=801', FALSE, NOW() - INTERVAL 1 DAY),
(4, 101, 'COLLABORATION', 'Rohan Deshmukh invited you to collaborate', '"Would love to collaborate on this!"', 102, 'Rohan Deshmukh', '/images/artist_rohan_avatar.png', 'COLLABORATION', 501, '/pages/collaboration-details.html?id=501', TRUE, NOW() - INTERVAL 2 DAY),
(5, 101, 'OPPORTUNITY', 'New opportunity posted', 'Looking for background dancers for music video', NULL, 'Pulse Productions', '/images/opportunity_dancer.png', 'OPPORTUNITY', 102, '/pages/opportunity-details.html?id=102', TRUE, NOW() - INTERVAL 3 DAY),
(6, 101, 'ARTWORK', 'Aditya Kulkarni liked your artwork', '"Such a unique perspective!"', 110, 'Aditya Kulkarni', '/images/artist_ishita_thumb.png', 'ARTWORK', 1, '/pages/portfolio.html?id=101', TRUE, NOW() - INTERVAL 5 DAY)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    message = VALUES(message),
    is_read = VALUES(is_read);
