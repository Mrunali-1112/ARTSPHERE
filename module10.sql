-- ===================================================
-- Module 10: My Applications (Events, Collaborations, Opportunities)
-- ===================================================

-- 1. Ensure event registrations for User 101
INSERT IGNORE INTO event_registrations (event_id, user_id) VALUES
(801, 101),
(802, 101),
(805, 101),
(807, 101);

-- 2. Ensure opportunity applications for User 101
INSERT INTO applications (user_id, opportunity_id, status, notes) VALUES
(101, 101, 'ACCEPTED', 'Portfolio submitted for campus exhibition display.'),
(101, 103, 'SHORTLISTED', 'Character design sample sheets sent.'),
(101, 106, 'PENDING', 'Applied for creative content intern role.')
ON DUPLICATE KEY UPDATE
    status = VALUES(status),
    notes = VALUES(notes);

-- 3. Ensure collaboration requests sent by User 101
INSERT INTO collaboration_requests (id, collaboration_id, sender_id, receiver_id, message, status) VALUES
(10, 502, 101, 102, 'I would love to design the album projection graphics for your indie folk EP!', 'APPROVED'),
(11, 503, 101, 103, 'Excited to collaborate on stage visuals and promotional posters for the dance showcase.', 'PENDING')
ON DUPLICATE KEY UPDATE
    collaboration_id = VALUES(collaboration_id),
    sender_id = VALUES(sender_id),
    receiver_id = VALUES(receiver_id),
    message = VALUES(message),
    status = VALUES(status);
