-- ArtSphere Complete Database Schema

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS event_registrations;
DROP TABLE IF EXISTS community_members;
DROP TABLE IF EXISTS collaboration_requests;
DROP TABLE IF EXISTS post_comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS collaborations;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS artist_connections;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS communities;
DROP TABLE IF EXISTS artworks;
DROP TABLE IF EXISTS opportunities;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_picture VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    location VARCHAR(100) DEFAULT 'Mumbai, MH',
    cover_image VARCHAR(255) DEFAULT '/images/artist_profile_cover.png',
    artist_type VARCHAR(100) DEFAULT 'Visual Artist',
    skills TEXT,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    posts_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Artworks Table
CREATE TABLE artworks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    for_sale BOOLEAN DEFAULT FALSE,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    artist_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_artworks_artist FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Communities Table
CREATE TABLE communities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    member_count INT DEFAULT 0,
    category VARCHAR(50),
    image_url VARCHAR(255),
    cover_image VARCHAR(255) DEFAULT '/images/comm_creative_souls_cover.png',
    location VARCHAR(100) DEFAULT 'Global',
    art_forms VARCHAR(100) DEFAULT 'All art forms',
    rules TEXT,
    owner_id BIGINT DEFAULT 101,
    is_featured BOOLEAN DEFAULT FALSE,
    created_date VARCHAR(50) DEFAULT '12 Mar 2024',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Events Table
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    organizer VARCHAR(100),
    location VARCHAR(150) NOT NULL,
    event_date VARCHAR(50) NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    community_id BIGINT NULL,
    event_type VARCHAR(50) DEFAULT 'Workshop',
    attendees_count INT DEFAULT 24,
    cover_image VARCHAR(255) DEFAULT '/images/comm_event_detail_cover.png',
    organizer_role VARCHAR(150) DEFAULT 'Organizer',
    organizer_avatar VARCHAR(255) DEFAULT '/images/comm_creative_souls_avatar.png',
    venue VARCHAR(255) DEFAULT 'Art Studio, Mumbai',
    art_form VARCHAR(50) DEFAULT 'All',
    what_youll_learn TEXT,
    who_can_join TEXT,
    things_to_bring TEXT,
    guidelines TEXT,
    quote TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Posts Table
CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150),
    caption TEXT,
    media_url VARCHAR(255),
    media_type VARCHAR(50) DEFAULT 'IMAGE',
    art_form VARCHAR(50),
    category VARCHAR(50),
    location VARCHAR(100),
    tags VARCHAR(255),
    visibility VARCHAR(20) DEFAULT 'PUBLIC',
    community_id BIGINT DEFAULT NULL,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    saves_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Post Comments Table
CREATE TABLE post_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6b. Post Likes Table
CREATE TABLE IF NOT EXISTS post_likes (
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6c. Post Saves Table
CREATE TABLE IF NOT EXISTS post_saves (
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_post_saves_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_saves_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Collaborations Table
CREATE TABLE collaborations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    creator_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    purpose VARCHAR(100) DEFAULT 'Work on a Project',
    skills VARCHAR(255) DEFAULT '',
    tags VARCHAR(255) DEFAULT '',
    location VARCHAR(100) DEFAULT 'Mumbai, MH',
    collaboration_type VARCHAR(100) DEFAULT 'Short Film',
    availability VARCHAR(100) DEFAULT 'Flexible',
    people_needed VARCHAR(50) DEFAULT '1-2 collaborators',
    reference_url VARCHAR(255) DEFAULT '',
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_collab_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Collaboration Requests Table
CREATE TABLE collaboration_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    collaboration_id BIGINT NULL,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_req_collab FOREIGN KEY (collaboration_id) REFERENCES collaborations(id) ON DELETE SET NULL,
    CONSTRAINT fk_req_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Community Members Table
CREATE TABLE community_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_community_member (community_id, user_id),
    CONSTRAINT fk_comm_mem_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_comm_mem_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Event Registrations Table
CREATE TABLE event_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_event_user (event_id, user_id),
    CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Artist Connections Table
CREATE TABLE artist_connections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    artist_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'CONNECTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_artist (user_id, artist_id)
);

-- 12. Notifications Table
CREATE TABLE notifications (
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

-- 13. Opportunities Table
CREATE TABLE opportunities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    category VARCHAR(50),
    art_category VARCHAR(50),
    organizer VARCHAR(100),
    organizer_type VARCHAR(50),
    organizer_avatar VARCHAR(255),
    location VARCHAR(100),
    days_left VARCHAR(50),
    deadline VARCHAR(50),
    duration VARCHAR(50),
    image_url VARCHAR(255),
    requirements TEXT,
    benefits TEXT,
    quote_text TEXT,
    quote_author VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Applications Table
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    opportunity_id BIGINT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_opp (user_id, opportunity_id),
    CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);
