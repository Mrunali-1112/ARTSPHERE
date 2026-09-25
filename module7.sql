CREATE TABLE IF NOT EXISTS collaborations (
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

CREATE TABLE IF NOT EXISTS collaboration_requests (
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

INSERT IGNORE INTO users (id, username, email, password, full_name, bio, profile_picture, role, location, cover_image, artist_type, skills, followers_count, following_count, posts_count)
VALUES
(107, 'riya', 'riya@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Riya Deshmukh', 'Love creating expressive characters and open to exciting collaborations!', '/images/avatar_riya.png', 'ROLE_ARTIST', 'Mumbai, MH', '/images/artist_profile_cover.png', 'Illustrator', 'Character Art, Digital Art, Concept Art, Storytelling', 1450, 290, 19),
(108, 'sneha', 'sneha@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Sneha Patil', 'Exploring colors, emotions and everything in between. Let''s create something beautiful!', '/images/avatar_sneha.png', 'ROLE_ARTIST', 'Navi Mumbai, MH', '/images/artist_profile_cover.png', 'Painter', 'Acrylic, Abstract, Oil Painting, Contemporary', 1120, 210, 16),
(109, 'karan', 'karan@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Karan Shah', 'Designing ideas that make an impact. Open to collaborate on creative projects.', '/images/avatar_karan.png', 'ROLE_ARTIST', 'Mumbai, MH', '/images/artist_profile_cover.png', 'Graphic Designer', 'Branding, Visual Design, Typography, Poster Art', 1340, 315, 22),
(110, 'aditya', 'aditya@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Aditya Kulkarni', 'Community muralist and experimental painter.', '/images/artist_ishita_thumb.png', 'ROLE_ARTIST', 'Thane, Maharashtra', '/images/artist_profile_cover.png', 'Painter', 'Community Art, Murals, Acrylic, Canvas Painting', 820, 160, 14);

INSERT IGNORE INTO collaborations (id, creator_id, title, description, purpose, skills, tags, location, collaboration_type, availability, people_needed, reference_url, status)
VALUES
(501, 101, 'Looking for a Digital Artist for a Short Film Project', 'I''m working on a short film and looking for a digital artist to collaborate on concept art, character design and backgrounds. Excited to work with creative minds!', 'Work on a Project', 'Character Design, Background Art, Concept Art, Storyboarding', '#digitalart, #conceptart, #characterdesign, #shortfilm', 'Mumbai, MH', 'Short Film', 'Flexible', '1-2 collaborators', 'https://artsphere.com/shortfilm-refs', 'OPEN'),
(502, 102, 'Music + Visual Art Project Collaboration', 'Looking to collaborate with visual artists and painters to create animated projection backdrops for our upcoming acoustic indie folk EP.', 'Create Content', 'Animation, Visual Arts, Projection Mapping', '#music, #visualart, #animation, #collab', 'Pune, MH', 'Music Video', 'Weekend', '1 collaborator', '', 'OPEN'),
(503, 103, 'Stage Visuals & Poster Art for Dance Showcase', 'Seeking graphic designers and visual illustrators to craft stage visuals, motion graphics, and promotional posters for annual college dance showcase.', 'Work on a Project', 'Graphic Design, Poster Art, Stage Visuals', '#dance, #graphicdesign, #posters, #stageart', 'Mumbai, Maharashtra', 'Dance Showcase', 'Flexible', '2-3 collaborators', '', 'OPEN');

INSERT IGNORE INTO collaboration_requests (id, collaboration_id, sender_id, receiver_id, message, status)
VALUES
(1, 502, 104, 101, 'Hi! I loved your artwork and would love to collaborate on a music + visual art project. Let''s create something unique together!', 'PENDING'),
(2, 503, 108, 101, 'I''m working on a dance showcase and would love to collaborate with you for stage visuals and posters.', 'PENDING'),
(3, 501, 102, 101, 'Your artistic style is amazing! Interested in collaborating for an upcoming college event.', 'PENDING'),
(4, 501, 103, 101, 'I would love to collaborate on a creative photoshoot for my upcoming exhibition.', 'PENDING'),
(5, 501, 110, 101, 'Let''s collaborate on a community art project. I think our styles will complement each other!', 'PENDING'),
(6, 501, 101, 105, 'Collaboration for college cultural event', 'PENDING'),
(7, 501, 101, 109, 'Music video project collaboration on storyboards', 'PENDING'),
(8, 501, 107, 101, 'Let''s create character concepts together for the film!', 'APPROVED'),
(9, 501, 106, 101, 'Collaborative oil and digital mixed media piece for exhibition', 'APPROVED');
