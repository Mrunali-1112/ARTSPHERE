-- Seed data for ArtSphere Home & Discover Pages

-- 1. Artists (Featured & Near You)
INSERT IGNORE INTO users (id, username, email, password, full_name, bio, profile_picture, role, location, cover_image, artist_type, skills, followers_count, following_count, posts_count)
VALUES
(101, 'aanya', 'aanya@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Aanya Deshmukh', 'Illustrator and digital artist exploring everyday moments through art.', '/images/artist_profile_avatar.png', 'ROLE_ARTIST', 'Mumbai, MH', '/images/artist_profile_cover.png', 'Visual Artist', 'Digital Art, Illustration, Portraits, Concept Art, Nature Art', 1800, 356, 24),
(102, 'rohan', 'rohan@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Rohan Mehta', 'Acoustic fingerstyle guitarist & indie composer.', '/images/artist_rohan_avatar.png', 'ROLE_ARTIST', 'Pune, MH', '/images/artist_rohan_cover.png', 'Musician', 'Acoustic Guitar, Indie Folk, Songwriting, Fingerstyle, Composition', 2100, 412, 18),
(103, 'kavya', 'kavya@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Kavya Iyer', 'Contemporary fusion dancer and stage choreographer.', '/images/artist_kavya_avatar.png', 'ROLE_ARTIST', 'Bengaluru, KA', '/images/artist_kavya_cover.png', 'Dancer', 'Contemporary, Classical Fusion, Stage Choreography, Improvisation', 1420, 280, 15),
(104, 'arjun', 'arjun@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Arjun Rao', 'Street and documentary photographer.', '/images/artist_arjun_thumb.png', 'ROLE_ARTIST', 'Navi Mumbai', '/images/artist_profile_cover.png', 'Photographer', 'Street Photography, Monochromatic, Urban Landscapes, Portraits', 980, 195, 32),
(105, 'meera', 'meera@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Meera Singh', 'Soulful vocalist and playback artist.', '/images/artist_meera_thumb.png', 'ROLE_ARTIST', 'Mumbai', '/images/artist_profile_cover.png', 'Singer', 'Vocal Performance, Ghazals, Classical Ragas, Voice Modulation', 1650, 310, 21),
(106, 'ishita', 'ishita@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Ishita Kulkarni', 'Oil and acrylic canvas painter.', '/images/artist_ishita_thumb.png', 'ROLE_ARTIST', 'Thane', '/images/artist_profile_cover.png', 'Painter', 'Oil Painting, Acrylics, Textured Canvas, Abstract Expressions', 890, 140, 12);

-- 2. Artworks for Artists
INSERT IGNORE INTO artworks (id, title, description, category, image_url, likes_count, comments_count, price, for_sale, artist_id)
VALUES
(202, 'Acoustic Soul', 'Live acoustic session recording', 'Music', '/images/artist_rohan_cover.png', 85, 9, 0.00, false, 102),
(203, 'Graceful Horizon', 'Contemporary dusk choreography', 'Dance', '/images/artist_kavya_cover.png', 110, 14, 0.00, false, 103),
(204, 'Urban Moments', 'Street photography collection', 'Photography', '/images/artist_arjun_thumb.png', 72, 5, 0.00, false, 104),
(205, 'Melodic Vibes', 'Soulful vocal singles', 'Music', '/images/artist_meera_thumb.png', 94, 8, 0.00, false, 105),
(206, 'Colors of Thane', 'Acrylic on canvas study', 'Visual Arts', '/images/artist_ishita_thumb.png', 63, 4, 0.00, false, 106),
(211, 'Sunlit', 'Digital portrait illustration exploring sunlight and calm expressions.', 'Digital Art', '/images/artwork_sunlit.png', 124, 8, 450.00, true, 101),
(212, 'Beyond the Hills', 'Lush mountainous landscape with sunset clouds and pine forests.', 'Paintings', '/images/artwork_beyond_the_hills.png', 98, 12, 600.00, false, 101),
(213, 'Curious', 'Golden sunlit portrait of a domestic tabby feline.', 'Photography', '/images/artwork_curious.png', 143, 10, 300.00, false, 101),
(214, 'Still', 'Morning sunlight casting floral shadows in glass vase.', 'Digital Art', '/images/artwork_still.png', 76, 4, 380.00, false, 101),
(215, 'City Shades', 'Architectural shadow play and street lamp geometry.', 'Photography', '/images/artwork_city_shades.png', 89, 6, 250.00, false, 101),
(216, 'Bloom', 'Floral hair portrait celebrating spring warmth.', 'Illustrations', '/images/artwork_bloom.png', 112, 9, 520.00, true, 101),
(217, 'Evening Calm', 'Waves rolling gently along dusk shoreline under radiant sunset.', 'Photography', '/images/artwork_evening_calm.png', 95, 5, 410.00, false, 101),
(218, 'Thoughts', 'Introspective pencil and ink portrait study.', 'Illustrations', '/images/artwork_thoughts.png', 68, 3, 340.00, false, 101),
(219, 'A Better Day', 'Cozy cafe interior with typography art wall.', 'Digital Art', '/images/artwork_a_better_day.png', 101, 7, 490.00, true, 101);

-- 3. Upcoming Events
INSERT IGNORE INTO events (id, title, organizer, location, event_date, event_time, image_url, description)
VALUES
(301, 'Watercolor Workshop', 'ArtHouse', 'ArtHouse, Mumbai', '25 SEP', '10:00 AM – 1:00 PM', '/images/event_watercolor_thumb.png', 'Hands-on watercolor painting workshop with master artists.');

-- 4. Communities
INSERT IGNORE INTO communities (id, name, description, member_count, category, image_url)
VALUES
(401, 'Let\'s Create Together', 'Join communities, find collaborators and be part of a growing creative world.', 1250, 'All Art Forms', '/images/community_leaf_decor.png');
