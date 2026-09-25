-- Module 8: Communities, Community Members, Community Posts & Events

-- 1. Alter communities table
ALTER TABLE communities
    ADD COLUMN cover_image VARCHAR(255) DEFAULT '/images/comm_creative_souls_cover.png',
    ADD COLUMN location VARCHAR(100) DEFAULT 'Global',
    ADD COLUMN art_forms VARCHAR(100) DEFAULT 'All art forms',
    ADD COLUMN rules TEXT,
    ADD COLUMN owner_id BIGINT DEFAULT 101,
    ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
    ADD COLUMN created_date VARCHAR(50) DEFAULT '12 Mar 2024';

-- 2. Create community_members table
CREATE TABLE IF NOT EXISTS community_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_community_member (community_id, user_id),
    CONSTRAINT fk_comm_mem_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_comm_mem_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Alter posts table
ALTER TABLE posts
    ADD COLUMN community_id BIGINT DEFAULT NULL;

-- 4. Alter events table
ALTER TABLE events
    ADD COLUMN community_id BIGINT DEFAULT NULL,
    ADD COLUMN event_type VARCHAR(50) DEFAULT 'Workshop',
    ADD COLUMN attendees_count INT DEFAULT 24;

-- 5. Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_event_user (event_id, user_id)
);

-- 6. Insert seed data for communities (clear old 401 or update it, and insert 601-607)
DELETE FROM community_members WHERE community_id >= 600;
DELETE FROM communities WHERE id >= 600;

INSERT INTO communities (id, name, description, member_count, category, image_url, cover_image, location, art_forms, rules, owner_id, is_featured, created_date) VALUES
(601, 'Creative Souls', 'A space for all kinds of artists to share, support and inspire each other.', 1200, 'All', '/images/comm_creative_souls_avatar.png', '/images/comm_creative_souls_cover.png', 'Global', 'All art forms', 'Be kind and respectful\nShare original work\nGive constructive feedback\nNo hate or spam\nKeep it art-related', 101, TRUE, '12 Mar 2024'),
(602, 'Painting Souls', 'Passionate painters sharing techniques, textures, and canvas journeys.', 1100, 'Painting', '/images/comm_painting_souls.png', '/images/comm_creative_souls_cover.png', 'Mumbai, India', 'Painting, Watercolor, Oil', 'Be kind and respectful\nShare original work\nGive constructive feedback\nNo hate or spam\nKeep it art-related', 102, FALSE, '15 Jan 2024'),
(603, 'Lens & Life', 'Shutterbugs capturing real stories, light, angles, and timeless memories.', 856, 'Photography', '/images/comm_lens_life.png', '/images/opp_lens_and_life.png', 'Pune, India', 'Photography, Street, Portrait', 'Respect copyrights\nNo reposts without credit\nConstructive feedback only', 103, FALSE, '02 Feb 2024'),
(604, 'SoundSphere', 'Musicians, producers, lyricists and indie bands jamming and collaborating.', 642, 'Music', '/images/comm_soundsphere.png', '/images/opp_campus_band.png', 'Bengaluru, India', 'Music, Indie, Acoustic', 'Share audio links freely\nCollaborate honorably\nRespect diverse genres', 104, FALSE, '10 Nov 2023'),
(605, 'Move Together', 'Dancers, choreographers, and movement artists uniting to express through rhythm.', 498, 'Dance', '/images/comm_move_together.png', '/images/opp_dance_performance.png', 'Delhi, India', 'Dance, Classical, Contemporary', 'Positive vibes only\nCredit choreography\nEncourage beginners', 105, FALSE, '20 Dec 2023'),
(606, 'Words & Worlds', 'Poets, authors, and scriptwriters spinning universes with ink and imagination.', 379, 'Writing', '/images/comm_words_worlds.png', '/images/opp_content_writer.png', 'Global', 'Writing, Poetry, Fiction', 'Constructive critique\nNo plagiarism\nRespect creative flow', 106, FALSE, '05 Jan 2024'),
(607, 'Create & Craft', 'Ceramic sculptors, clay artists, and DIY makers turning raw materials into magic.', 521, 'Crafts', '/images/comm_create_craft.png', '/images/highlight_clay_character.png', 'Mumbai, India', 'Crafts, Pottery, Sculpting', 'Share processes\nCelebrate handmade\nHelp newcomers', 107, FALSE, '18 Feb 2024');

-- 7. Seed community_members for Creative Souls (601) and Painting Souls (602)
INSERT IGNORE INTO community_members (community_id, user_id, role, joined_at) VALUES
(601, 101, 'ADMIN', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(601, 102, 'ACTIVE MEMBER', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(601, 103, 'ACTIVE MEMBER', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(601, 104, 'MEMBER', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(601, 105, 'ACTIVE MEMBER', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(601, 106, 'MEMBER', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(601, 107, 'MEMBER', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(602, 101, 'MEMBER', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(602, 102, 'ADMIN', DATE_SUB(NOW(), INTERVAL 40 DAY));

-- 8. Seed community posts for Creative Souls (601)
DELETE FROM posts WHERE id IN (701, 702);
INSERT INTO posts (id, user_id, community_id, title, caption, media_url, media_type, art_form, category, location, tags, visibility, likes_count, comments_count, shares_count, saves_count, created_at) VALUES
(701, 101, 601, 'Evening Sunset Painting', 'Spent my evening painting this sunset 🌅 Nature always gives the best colours! 💜', '/images/comm_post_sunset_painting.png', 'image', 'Painting', 'Artworks', 'Mumbai, MH', '#painting,#sunset,#nature,#acrylic', 'Public', 124, 18, 5, 34, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(702, 102, 601, 'Charcoal Sketch Study', 'Tried charcoal sketching after a long time. Still learning, but happy with the progress! ✏️ Any tips to improve? 🥺', '/images/comm_post_sketchbook.png', 'image', 'Drawing', 'Showcase', 'Pune, MH', '#sketching,#charcoal,#study,#beginner', 'Public', 89, 24, 3, 19, DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- 9. Seed community events for Creative Souls (601)
DELETE FROM events WHERE id IN (801, 802, 803, 804);
INSERT INTO events (id, community_id, title, organizer, location, event_date, event_time, image_url, description, event_type, attendees_count) VALUES
(801, 601, 'Watercolor Painting Workshop', 'Creative Souls', 'Art Studio, Downtown', '15 Mar 2024', '4:00 PM - 6:00 PM', '/images/comm_event_watercolor.png', 'Learn basic techniques and create your own artwork with watercolors.', 'Workshop', 24),
(802, 601, 'Local Artists Exhibition', 'Creative Souls', 'Community Art Gallery', '22 Mar 2024', '10:00 AM - 5:00 PM', '/images/comm_event_exhibition.png', 'Explore stunning works from emerging artists in our community.', 'Exhibition', 48),
(803, 601, 'Sketching Meetup', 'Creative Souls', 'Riverside Park', '28 Mar 2024', '3:00 PM - 6:00 PM', '/images/comm_event_sketching.png', 'Join fellow artists for a relaxed sketching session at the park.', 'Meetup', 17),
(804, 601, 'Digital Art Basics (Live Session)', 'Creative Souls', 'Online (Google Meet)', '5 Apr 2024', '5:00 PM - 7:00 PM', '/images/comm_event_digital_art.png', 'Get started with digital art tools and software. Perfect for beginners!', 'Live Session', 32);

