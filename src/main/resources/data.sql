-- ==============================================================================
-- ArtSphere Master Unified Seed Dataset
-- Covers all 10 modules: Users, Artworks, Communities, Events, Posts,
-- Collaborations, Collaboration Requests, Opportunities, Applications, Notifications
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Users (Artists & Creators)
-- ------------------------------------------------------------------------------
INSERT INTO users (id, username, email, password, full_name, bio, profile_picture, role, location, cover_image, artist_type, skills, followers_count, following_count, posts_count)
VALUES
(101, 'aanya', 'aanya@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Aanya Deshmukh', 'Illustrator and digital artist exploring everyday moments through art.', '/images/artist_profile_avatar.png', 'ROLE_ARTIST', 'Mumbai, MH', '/images/artist_profile_cover.png', 'Visual Artist', 'Digital Art, Illustration, Portraits, Concept Art, Nature Art', 1800, 356, 24),
(102, 'rohan', 'rohan@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Rohan Mehta', 'Acoustic fingerstyle guitarist & indie composer.', '/images/artist_rohan_avatar.png', 'ROLE_ARTIST', 'Pune, MH', '/images/artist_rohan_cover.png', 'Musician', 'Acoustic Guitar, Indie Folk, Songwriting, Fingerstyle, Composition', 2100, 412, 18),
(103, 'kavya', 'kavya@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Kavya Iyer', 'Contemporary fusion dancer and stage choreographer.', '/images/artist_kavya_avatar.png', 'ROLE_ARTIST', 'Bengaluru, KA', '/images/artist_kavya_cover.png', 'Dancer', 'Contemporary, Classical Fusion, Stage Choreography, Improvisation', 1420, 280, 15),
(104, 'arjun', 'arjun@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Arjun Rao', 'Street and documentary photographer.', '/images/artist_arjun_thumb.png', 'ROLE_ARTIST', 'Navi Mumbai', '/images/artist_profile_cover.png', 'Photographer', 'Street Photography, Monochromatic, Urban Landscapes, Portraits', 980, 195, 32),
(105, 'meera', 'meera@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Meera Singh', 'Soulful vocalist and playback artist.', '/images/artist_meera_thumb.png', 'ROLE_ARTIST', 'Mumbai', '/images/artist_profile_cover.png', 'Singer', 'Vocal Performance, Ghazals, Classical Ragas, Voice Modulation', 1650, 310, 21),
(106, 'ishita', 'ishita@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Ishita Kulkarni', 'Oil and acrylic canvas painter.', '/images/artist_ishita_thumb.png', 'ROLE_ARTIST', 'Thane', '/images/artist_profile_cover.png', 'Painter', 'Oil Painting, Acrylics, Textured Canvas, Abstract Expressions', 890, 140, 12),
(107, 'riya', 'riya@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Riya Deshmukh', 'Love creating expressive characters and open to exciting collaborations!', '/images/avatar_riya.png', 'ROLE_ARTIST', 'Mumbai, MH', '/images/artist_profile_cover.png', 'Illustrator', 'Character Art, Digital Art, Concept Art, Storytelling', 1450, 290, 19),
(108, 'sneha', 'sneha@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Sneha Patil', 'Exploring colors, emotions and everything in between. Let''s create something beautiful!', '/images/avatar_sneha.png', 'ROLE_ARTIST', 'Navi Mumbai, MH', '/images/artist_profile_cover.png', 'Painter', 'Acrylic, Abstract, Oil Painting, Contemporary', 1120, 210, 16),
(109, 'karan', 'karan@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Karan Shah', 'Designing ideas that make an impact. Open to collaborate on creative projects.', '/images/avatar_karan.png', 'ROLE_ARTIST', 'Mumbai, MH', '/images/artist_profile_cover.png', 'Graphic Designer', 'Branding, Visual Design, Typography, Poster Art', 1340, 315, 22),
(110, 'aditya', 'aditya@artsphere.com', '$2a$10$wO082Tsk0Hw20D.5L9c1qOYv3uL.EaO9hRz7VfU5bMhS7F5K7e9vC', 'Aditya Kulkarni', 'Community muralist and experimental painter.', '/images/artist_ishita_thumb.png', 'ROLE_ARTIST', 'Thane, Maharashtra', '/images/artist_profile_cover.png', 'Painter', 'Community Art, Murals, Acrylic, Canvas Painting', 820, 160, 14)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    bio = VALUES(bio),
    profile_picture = VALUES(profile_picture),
    artist_type = VALUES(artist_type),
    skills = VALUES(skills),
    followers_count = VALUES(followers_count),
    following_count = VALUES(following_count),
    posts_count = VALUES(posts_count);

-- ------------------------------------------------------------------------------
-- 2. Artworks for Artists
-- ------------------------------------------------------------------------------
INSERT INTO artworks (id, title, description, category, image_url, likes_count, comments_count, price, for_sale, artist_id)
VALUES
(202, 'Acoustic Soul', 'Live acoustic session recording', 'Music', '/images/artist_rohan_cover.png', 85, 9, 0.00, false, 102),
(203, 'Graceful Horizon', 'Contemporary dusk choreography', 'Dance', '/images/artist_kavya_cover.png', 110, 14, 0.00, false, 103),
(204, 'Urban Moments', 'Street photography collection', 'Photography', '/images/artist_arjun_thumb.png', 72, 5, 0.00, false, 104),
(205, 'Melodic Vibes', 'Soulful vocal singles', 'Music', '/images/artist_meera_thumb.png', 94, 8, 0.00, false, 105),
(206, 'Colors of Thane', 'Acrylic on canvas study', 'Visual Arts', '/images/artist_ishita_thumb.png', 63, 4, 0.00, false, 106),
(207, 'Character Expressions', 'Digital character concept art sheet', 'Illustrations', '/images/avatar_riya.png', 104, 11, 400.00, true, 107),
(208, 'Vibrant Harmony', 'Textured modern abstract study', 'Paintings', '/images/avatar_sneha.png', 88, 7, 550.00, true, 108),
(209, 'Typography in Space', 'Modern brutalist poster design collection', 'Graphic Design', '/images/avatar_karan.png', 95, 6, 280.00, false, 109),
(210, 'Street Wall Tapestry', 'Community outdoor mural photography', 'Murals', '/images/highlight_clay_character.png', 79, 5, 0.00, false, 110),
(211, 'Sunlit', 'Digital portrait illustration exploring sunlight and calm expressions.', 'Digital Art', '/images/artwork_sunlit.png', 124, 8, 450.00, true, 101),
(212, 'Beyond the Hills', 'Lush mountainous landscape with sunset clouds and pine forests.', 'Paintings', '/images/artwork_beyond_the_hills.png', 98, 12, 600.00, false, 101),
(213, 'Curious', 'Golden sunlit portrait of a domestic tabby feline.', 'Photography', '/images/artwork_curious.png', 143, 10, 300.00, false, 101),
(214, 'Still', 'Morning sunlight casting floral shadows in glass vase.', 'Digital Art', '/images/artwork_still.png', 76, 4, 380.00, false, 101),
(215, 'City Shades', 'Architectural shadow play and street lamp geometry.', 'Photography', '/images/artwork_city_shades.png', 89, 6, 250.00, false, 101),
(216, 'Bloom', 'Floral hair portrait celebrating spring warmth.', 'Illustrations', '/images/artwork_bloom.png', 112, 9, 520.00, true, 101),
(217, 'Evening Calm', 'Waves rolling gently along dusk shoreline under radiant sunset.', 'Photography', '/images/artwork_evening_calm.png', 95, 5, 410.00, false, 101),
(218, 'Thoughts', 'Introspective pencil and ink portrait study.', 'Illustrations', '/images/artwork_thoughts.png', 68, 3, 340.00, false, 101),
(219, 'A Better Day', 'Cozy cafe interior with typography art wall.', 'Digital Art', '/images/artwork_a_better_day.png', 101, 7, 490.00, true, 101)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    category = VALUES(category),
    image_url = VALUES(image_url),
    likes_count = VALUES(likes_count),
    price = VALUES(price);

-- ------------------------------------------------------------------------------
-- 3. Communities
-- ------------------------------------------------------------------------------
INSERT INTO communities (id, name, description, member_count, category, image_url, cover_image, location, art_forms, rules, owner_id, is_featured, created_date)
VALUES
(601, 'Creative Souls', 'A space for all kinds of artists to share, support and inspire each other.', 1200, 'All', '/images/comm_creative_souls_avatar.png', '/images/comm_creative_souls_cover.png', 'Global', 'All art forms', 'Be kind and respectful\nShare original work\nGive constructive feedback\nNo hate or spam\nKeep it art-related', 101, TRUE, '12 Mar 2024'),
(602, 'Painting Souls', 'Passionate painters sharing techniques, textures, and canvas journeys.', 1100, 'Painting', '/images/comm_painting_souls.png', '/images/comm_creative_souls_cover.png', 'Mumbai, India', 'Painting, Watercolor, Oil', 'Be kind and respectful\nShare original work\nGive constructive feedback\nNo hate or spam\nKeep it art-related', 102, FALSE, '15 Jan 2024'),
(603, 'Lens & Life', 'Shutterbugs capturing real stories, light, angles, and timeless memories.', 856, 'Photography', '/images/comm_lens_life.png', '/images/opp_lens_and_life.png', 'Pune, India', 'Photography, Street, Portrait', 'Respect copyrights\nNo reposts without credit\nConstructive feedback only', 103, FALSE, '02 Feb 2024'),
(604, 'SoundSphere', 'Musicians, producers, lyricists and indie bands jamming and collaborating.', 642, 'Music', '/images/comm_soundsphere.png', '/images/opp_campus_band.png', 'Bengaluru, India', 'Music, Indie, Acoustic', 'Share audio links freely\nCollaborate honorably\nRespect diverse genres', 104, FALSE, '10 Nov 2023'),
(605, 'Move Together', 'Dancers, choreographers, and movement artists uniting to express through rhythm.', 498, 'Dance', '/images/comm_move_together.png', '/images/opp_dance_performance.png', 'Delhi, India', 'Dance, Classical, Contemporary', 'Positive vibes only\nCredit choreography\nEncourage beginners', 105, FALSE, '20 Dec 2023'),
(606, 'Words & Worlds', 'Poets, authors, and scriptwriters spinning universes with ink and imagination.', 379, 'Writing', '/images/comm_words_worlds.png', '/images/opp_content_writer.png', 'Global', 'Writing, Poetry, Fiction', 'Constructive critique\nNo plagiarism\nRespect creative flow', 106, FALSE, '05 Jan 2024'),
(607, 'Create & Craft', 'Ceramic sculptors, clay artists, and DIY makers turning raw materials into magic.', 521, 'Crafts', '/images/comm_create_craft.png', '/images/highlight_clay_character.png', 'Mumbai, India', 'Crafts, Pottery, Sculpting', 'Share processes\nCelebrate handmade\nHelp newcomers', 107, FALSE, '18 Feb 2024'),
(401, 'Let\'s Create Together', 'Join communities, find collaborators and be part of a growing creative world.', 1250, 'All Art Forms', '/images/community_leaf_decor.png', '/images/comm_creative_souls_cover.png', 'Global', 'All Art Forms', 'Be respectful\nSupport creators\nCreate daily', 101, FALSE, '01 Jan 2024')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    member_count = VALUES(member_count),
    cover_image = VALUES(cover_image),
    is_featured = VALUES(is_featured);

-- ------------------------------------------------------------------------------
-- 4. Community Members
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO community_members (community_id, user_id, role, joined_at)
VALUES
(601, 101, 'ADMIN', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(601, 102, 'ACTIVE MEMBER', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(601, 103, 'ACTIVE MEMBER', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(601, 104, 'MEMBER', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(601, 105, 'ACTIVE MEMBER', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(601, 106, 'MEMBER', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(601, 107, 'MEMBER', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(602, 101, 'MEMBER', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(602, 102, 'ADMIN', DATE_SUB(NOW(), INTERVAL 40 DAY)),
(603, 104, 'ADMIN', DATE_SUB(NOW(), INTERVAL 50 DAY)),
(604, 102, 'MEMBER', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(605, 103, 'ADMIN', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(607, 107, 'ADMIN', DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ------------------------------------------------------------------------------
-- 5. Events
-- ------------------------------------------------------------------------------
INSERT INTO events (
    id, title, organizer, organizer_role, organizer_avatar, location, venue, event_date, event_time,
    image_url, cover_image, description, community_id, event_type, attendees_count, art_form,
    what_youll_learn, who_can_join, things_to_bring, guidelines, quote, is_featured
) VALUES
(
    801,
    'Watercolor Basics Workshop',
    'Creative Souls',
    'A community for all kinds of artists.',
    '/images/comm_creative_souls_avatar.png',
    'Mumbai, Maharashtra',
    'Art Studio, 123 Creative Street, Bandra West, Mumbai, Maharashtra 400050',
    '15 Mar 2024',
    '4:00 PM - 6:00 PM (IST)',
    '/images/comm_event_watercolor.png',
    '/images/event_detail_banner_watercolor.png',
    'Learn the fundamentals of watercolor painting with easy techniques and step-by-step guidance. Perfect for beginners and art enthusiasts! This hands-on workshop will introduce you to the world of watercolors. You will learn basic tools, color mixing, different brush techniques, and create your own small artwork by the end of the session. No prior experience is needed - just bring your creativity!',
    601,
    'Workshop',
    32,
    'Painting',
    'Introduction to watercolor materials\nColor mixing and blending techniques\nBrush control and texture creation\nStep-by-step guided painting\nTips and tricks from an experienced artist',
    'Open to all art lovers, especially beginners! No prior experience is required.',
    'A positive attitude!\nMaterials will be provided, but you can also bring your own favorites',
    'Be respectful and supportive\nFollow the venue rules\nNo plagiarism or misuse of content\nKeep the space clean\nHave fun and be creative!',
    'Art is better when shared.',
    TRUE
),
(
    802,
    'Local Artists Exhibition',
    'ArtHouse Collective',
    'Curated contemporary gallery and artist showcase.',
    '/images/artist_ishita_thumb.png',
    'Mumbai, Maharashtra',
    'Community Art Gallery, Heritage Block, Kala Ghoda, Mumbai 400001',
    '22 Mar 2024',
    '10:00 AM - 5:00 PM (IST)',
    '/images/comm_event_exhibition.png',
    '/images/comm_event_detail_cover.png',
    'Explore stunning works from emerging and master artists in our vibrant regional community. Meet the creators, understand their visual storytelling process, and immerse yourself in a diverse spectrum of canvas and sculptured pieces.',
    601,
    'Exhibition',
    48,
    'Painting',
    'Curatorial walkthrough with exhibiting painters\nInsights into composition, scale, and color palettes\nNetworking with collectors, art patrons, and gallery curators',
    'Artists, collectors, art enthusiasts, and anyone who appreciates contemporary Indian visual arts.',
    'Notebook or digital sketchbook for reflections\nComfortable walking shoes',
    'Do not touch framed artworks\nPhotography without flash is permitted\nBe mindful of quiet gallery zones',
    'Every canvas has a heartbeat.',
    FALSE
),
(
    803,
    'Outdoor Sketching Meetup',
    'Creative Souls',
    'A community for all kinds of artists.',
    '/images/comm_creative_souls_avatar.png',
    'Mumbai, Maharashtra',
    'Riverside Promontory, Bandra Bandstand, Mumbai 400050',
    '28 Mar 2024',
    '3:00 PM - 6:00 PM (IST)',
    '/images/comm_event_sketching.png',
    '/images/comm_event_detail_cover.png',
    'Join fellow artists for a relaxed sketching session by the sea. Bring your sketchbooks, charcoal pencils, or water brushes and enjoy the open breeze.',
    601,
    'Meetup',
    17,
    'Drawing',
    'Plein-air sketching techniques\nCapturing sea reflections and quick figures\nGroup critique and sharing session',
    'Anyone who loves drawing outdoors.',
    'Sketchbook, drawing pens/pencils, portable stool or mat',
    'Leave no trace behind\nEncourage beginners',
    'Observation is the highest form of sketching.',
    FALSE
),
(
    804,
    'Digital Art Basics (Live Session)',
    'Creative Souls',
    'A community for all kinds of artists.',
    '/images/comm_creative_souls_avatar.png',
    'Online (Google Meet)',
    'Virtual Link provided upon RSVP',
    '05 Apr 2024',
    '5:00 PM - 7:00 PM (IST)',
    '/images/comm_event_digital_art.png',
    '/images/event_detail_banner_watercolor.png',
    'Get started with digital art tools, layers, blending modes, and brush engines. Perfect for beginners transitioning from traditional painting!',
    601,
    'Live Session',
    32,
    'Digital Art',
    'Tablet setup and pen pressure calibration\nLayer hierarchy and clipping masks\nExporting high-res files for social and print',
    'Beginner digital illustrators and hobbyists.',
    'Laptop/Tablet with Photoshop, Procreate, or Krita installed',
    'Mute mic during demo; questions in chat',
    'Pixels are just pure light on a canvas.',
    FALSE
),
(
    805,
    'Acoustic Indie Jam & Open Mic',
    'SoundSphere',
    'Independent musicians and acoustic jam guild.',
    '/images/artist_rohan_avatar.png',
    'Pune, Maharashtra',
    'The Bohemian Cafe & Jam Room, Koregaon Park, Pune 411001',
    '12 Apr 2024',
    '6:00 PM - 9:00 PM (IST)',
    '/images/opp_campus_band.png',
    '/images/artist_rohan_cover.png',
    'An unplugged evening for indie singer-songwriters, fingerstyle guitarists, and spoken word poets. Share an original song or join the impromptu circle jam!',
    604,
    'Jam Session',
    28,
    'Music',
    'Live stage confidence and acoustic dynamics\nImpromptu chord progressions and harmonization\nSongwriting feedback circle',
    'Musicians, singers, and acoustic music fans.',
    'Your acoustic instrument, capos, picks',
    'Cheer for every performer\nRespect original compositions',
    'Music connects what words cannot reach.',
    FALSE
),
(
    806,
    'Contemporary Dance Improvisation',
    'Move Together',
    'Movement laboratory for dancers and choreographers.',
    '/images/artist_kavya_avatar.png',
    'Bengaluru, Karnataka',
    'Shoonya Movement Studio, Lal Bagh Main Road, Bengaluru 560027',
    '18 Apr 2024',
    '4:30 PM - 7:30 PM (IST)',
    '/images/opp_dance_performance.png',
    '/images/artist_kavya_cover.png',
    'Explore floor work, spatial awareness, and intuitive bodily expression through contemporary dance and somatic improvisation guided by Kavya Iyer.',
    605,
    'Workshop',
    22,
    'Dance',
    'Grounding and momentum transitions\nExpressive rhythm synchronization\nPartner contact improvisation',
    'Dancers of all genres with intermediate physical fitness.',
    'Comfortable breathable dancewear, water bottle',
    'No footwear in the movement hall\nRespect personal physical boundaries',
    'Movement is the soul speaking without a voice.',
    FALSE
),
(
    807,
    'Street Photography Masterclass',
    'Lens & Life',
    'Street documentary and candid photography guild.',
    '/images/artist_arjun_thumb.png',
    'Navi Mumbai, Maharashtra',
    'Belapur CBD Railway Concourse & Market Walk, Navi Mumbai 400614',
    '25 Apr 2024',
    '7:00 AM - 10:30 AM (IST)',
    '/images/opp_lens_and_life.png',
    '/images/artist_profile_cover.png',
    'Morning golden hour photo-walk focusing on decisive moments, architectural geometry, street reflections, and respectful documentary storytelling.',
    603,
    'Masterclass',
    19,
    'Photography',
    'Anticipating candid human moments\nWorking with high-contrast shadows and silhouette angles\nStreet ethics and photographer rights',
    'Photographers with DSLR, mirrorless, or high-end smartphone camera.',
    'Charged camera battery, empty SD card, comfortable shoes',
    'Ask consent when photographing close children or vendors\nStay with the group',
    'Photography is seeing what others only walk past.',
    FALSE
),
(
    808,
    'Ceramic & Clay Pottery Sculpting',
    'Create & Craft',
    'Potters, sculptors and handmade craft enthusiasts.',
    '/images/comm_create_craft.png',
    'Mumbai, Maharashtra',
    'Kala Mitti Studio, Versova, Andheri West, Mumbai 400061',
    '30 Apr 2024',
    '2:00 PM - 5:30 PM (IST)',
    '/images/highlight_clay_character.png',
    '/images/comm_creative_souls_cover.png',
    'Hands-on wheel throwing and hand-building ceramics workshop. Shape, carve, and take home your very own handmade terracotta or glazed clay mug.',
    607,
    'Workshop',
    16,
    'Crafts',
    'Centering clay on the electric potter wheel\nPinch pot and slab building fundamentals\nBisque firing and glaze finishes',
    'Anyone interested in pottery; zero experience necessary.',
    'Apron or clothes you do not mind getting clay on',
    'Trim long nails before class\nClean up your wheel station after work',
    'Clay reminds us of the beauty of patience.',
    FALSE
),
(
    301,
    'Watercolor Workshop',
    'ArtHouse',
    'ArtHouse Collective',
    '/images/event_watercolor_thumb.png',
    'ArtHouse, Mumbai',
    'ArtHouse Main Hall, Mumbai 400001',
    '25 SEP',
    '10:00 AM – 1:00 PM',
    '/images/event_watercolor_thumb.png',
    '/images/comm_event_detail_cover.png',
    'Hands-on watercolor painting workshop with master artists.',
    601,
    'Workshop',
    24,
    'Painting',
    'Brush techniques\nColor palettes',
    'All creators',
    'Art materials provided',
    'Standard studio etiquette',
    'Creativity takes courage.',
    FALSE
)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    venue = VALUES(venue),
    location = VALUES(location),
    event_date = VALUES(event_date),
    event_time = VALUES(event_time),
    attendees_count = VALUES(attendees_count),
    is_featured = VALUES(is_featured);

-- ------------------------------------------------------------------------------
-- 6. Event Registrations
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO event_registrations (event_id, user_id, registered_at)
VALUES
(801, 101, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(802, 101, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(805, 101, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(807, 101, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(301, 101, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(801, 102, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(801, 103, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(802, 104, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(805, 105, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ------------------------------------------------------------------------------
-- 7. Collaborations
-- ------------------------------------------------------------------------------
INSERT INTO collaborations (id, creator_id, title, description, purpose, skills, tags, location, collaboration_type, availability, people_needed, reference_url, status)
VALUES
(501, 101, 'Looking for a Digital Artist for a Short Film Project', 'I''m working on a short film and looking for a digital artist to collaborate on concept art, character design and backgrounds. Excited to work with creative minds!', 'Work on a Project', 'Character Design, Background Art, Concept Art, Storyboarding', '#digitalart, #conceptart, #characterdesign, #shortfilm', 'Mumbai, MH', 'Short Film', 'Flexible', '1-2 collaborators', 'https://artsphere.com/shortfilm-refs', 'OPEN'),
(502, 102, 'Music + Visual Art Project Collaboration', 'Looking to collaborate with visual artists and painters to create animated projection backdrops for our upcoming acoustic indie folk EP.', 'Create Content', 'Animation, Visual Arts, Projection Mapping', '#music, #visualart, #animation, #collab', 'Pune, MH', 'Music Video', 'Weekend', '1 collaborator', '', 'OPEN'),
(503, 103, 'Stage Visuals & Poster Art for Dance Showcase', 'Seeking graphic designers and visual illustrators to craft stage visuals, motion graphics, and promotional posters for annual college dance showcase.', 'Work on a Project', 'Graphic Design, Poster Art, Stage Visuals', '#dance, #graphicdesign, #posters, #stageart', 'Mumbai, Maharashtra', 'Dance Showcase', 'Flexible', '2-3 collaborators', '', 'OPEN'),
(504, 104, 'Monochromatic Street Photography Book', 'Collaborative photo-essay and poetry book documenting urban vendors and night markets across Mumbai. Seeking writers & poets for captions.', 'Work on a Project', 'Creative Writing, Poetry, Photography Curation', '#photography, #poetry, #book, #street', 'Navi Mumbai, MH', 'Book Project', 'Flexible', '1-2 collaborators', '', 'OPEN'),
(505, 105, 'Indie Folk Duet & Vocal Harmonies', 'Seeking acoustic guitarists or cello players to compose backing melodies for a three-track acoustic EP. Studio time in Bandra provided.', 'Create Content', 'Acoustic Guitar, Cello, Music Production', '#folk, #vocal, #acoustic, #musiccollab', 'Mumbai, MH', 'Song Single', 'Evenings', '1 collaborator', '', 'OPEN'),
(506, 106, 'Canvas Mural for Urban Community Center', 'Inviting 2 passionate painters to co-create a 20ft textured community wall mural celebrating nature and community spirit in Thane.', 'Work on a Project', 'Wall Painting, Acrylics, Scaffolding, Texture Work', '#mural, #communityart, #painting, #thane', 'Thane, Maharashtra', 'Mural', 'Weekends', '2 collaborators', '', 'OPEN')
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    skills = VALUES(skills),
    tags = VALUES(tags),
    status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 8. Collaboration Requests
-- ------------------------------------------------------------------------------
INSERT INTO collaboration_requests (id, collaboration_id, sender_id, receiver_id, message, status)
VALUES
(1, 502, 104, 101, 'Hi! I loved your artwork and would love to collaborate on a music + visual art project. Let''s create something unique together!', 'PENDING'),
(2, 503, 108, 101, 'I''m working on a dance showcase and would love to collaborate with you for stage visuals and posters.', 'PENDING'),
(3, 501, 102, 101, 'Your artistic style is amazing! Interested in collaborating for an upcoming college event.', 'PENDING'),
(4, 501, 103, 101, 'I would love to collaborate on a creative photoshoot for my upcoming exhibition.', 'PENDING'),
(5, 501, 110, 101, 'Let''s collaborate on a community art project. I think our styles will complement each other!', 'PENDING'),
(6, 501, 101, 105, 'Collaboration for college cultural event', 'PENDING'),
(7, 501, 101, 109, 'Music video project collaboration on storyboards', 'PENDING'),
(8, 501, 107, 101, 'Let''s create character concepts together for the film!', 'APPROVED'),
(9, 501, 106, 101, 'Collaborative oil and digital mixed media piece for exhibition', 'APPROVED'),
(10, 502, 101, 102, 'I would love to design the album projection graphics for your indie folk EP!', 'APPROVED'),
(11, 503, 101, 103, 'Excited to collaborate on stage visuals and promotional posters for the dance showcase.', 'PENDING')
ON DUPLICATE KEY UPDATE
    message = VALUES(message),
    status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 9. Opportunities (Grants, Residencies, Gigs & Auditions)
-- ------------------------------------------------------------------------------
INSERT INTO opportunities (
    id, title, subtitle, description, category, art_category, organizer, organizer_type, organizer_avatar,
    location, days_left, deadline, duration, image_url, requirements, benefits, quote_text, quote_author, is_featured, status
) VALUES
(
    101,
    'Serendipity Arts Residency 2026',
    'Fully Funded 6-Week Coastal Ecology & Arts Residency',
    'A 6-week intensive multidisciplinary residency in Goa for visual artists, choreographers, and experimental soundmakers exploring coastal ecosystems, indigenous folklore, and community memory.',
    'Residencies',
    'Multidisciplinary',
    'Serendipity Arts Foundation',
    'Arts Foundation',
    '/images/comm_creative_souls_avatar.png',
    'Goa, India',
    '32 Days Left',
    'Oct 30, 2026',
    '6 Weeks',
    '/images/event_detail_banner_watercolor.png',
    'Submit portfolio of 5-8 works\nOne page artist statement\nOpen to artists with 2+ years of continuous practice',
    '₹1,50,000 Production Stipend\nPrivate studio & accommodation provided\nCulminating exhibition in Panaji',
    'Residencies give creators the sacred gift of uninterrupted time.',
    'Sunil Kant Munjal, Patron',
    TRUE,
    'OPEN'
),
(
    102,
    'Background Dancers & Movement Artists for Music Video',
    'Commercial Indie Pop Shoot in Mumbai Studios',
    'Leading indie production house casting 4 contemporary dancers for a narrative music video shoot. Choreography blends Indian contemporary with street movement.',
    'Auditions',
    'Dance',
    'Pulse Productions',
    'Film Production',
    '/images/artist_kavya_avatar.png',
    'Mumbai, Maharashtra',
    '12 Days Left',
    'Nov 10, 2026',
    '3 Days Shoot',
    '/images/opp_dance_performance.png',
    'Strong foundation in contemporary or hip-hop\nAudition video reel required\nAvailable for rehearsals in Andheri West',
    '₹12,000 per shoot day (Total ₹36,000)\nFull styling, wardrobe & meals provided\nFeatured dancer credits on YouTube & streaming channels',
    'Dance is kinetic cinema.',
    'Kabir Verma, Director',
    FALSE,
    'OPEN'
),
(
    103,
    'Character Designer & Concept Illustrator for Animated Short',
    'Indie Studio Fantasy Animation Commission',
    'Seeking a character concept artist with distinct style for an 8-minute 2D mythological animated short film currently in pre-production.',
    'Gigs',
    'Visual Arts',
    'Studio Mirage',
    'Animation Studio',
    '/images/avatar_riya.png',
    'Bengaluru, Karnataka (Remote)',
    '18 Days Left',
    'Nov 16, 2026',
    '2 Months',
    '/images/comm_event_digital_art.png',
    'Demonstrated portfolio in character turnarounds and expression sheets\nProficiency in digital sketching tools (Photoshop, Clip Studio, Procreate)',
    '₹75,000 Project Contract Fee\nMilestone based pay schedule\nTitle screen & festival credits',
    'Great characters are born from expressive silhouettes.',
    'Ananya Sen, Creative Director',
    FALSE,
    'OPEN'
),
(
    104,
    'Monochromatic Street Photography Book Publication Grant',
    'Publication & Solo Printing Grant for Documentary Photographers',
    'Annual grant awarding ₹50,000 production support plus hardbound photobook publishing for a photographer documenting contemporary Indian urban life.',
    'Grants',
    'Photography',
    'LensCulture India Guild',
    'Photography Collective',
    '/images/artist_arjun_thumb.png',
    'Delhi, NCR',
    '45 Days Left',
    'Dec 01, 2026',
    'Book Release Spring 2027',
    '/images/opp_lens_and_life.png',
    'Body of 20-30 cohesive monochrome photographs\nShort 300-word curatorial proposal',
    '₹50,000 Cash Grant\n500 copies printed and distributed nationwide\nBook launch gala at Delhi Habitat Centre',
    'Candid photographs reveal truths that words conceal.',
    'Raghu Rai, Chief Juror',
    FALSE,
    'OPEN'
),
(
    105,
    'Acoustic Guitarist & Vocalist for 10-City College Tour',
    'Live Tour Support for Rising Indie Singer',
    'Opening slot and acoustic rhythm accompaniment for an upcoming autumn campus tour across Mumbai, Pune, Bengaluru, Hyderabad, and Chennai.',
    'Open Calls',
    'Music',
    'RedBull Music Tour Hub',
    'Music Festival Network',
    '/images/artist_rohan_avatar.png',
    'Pan-India',
    '22 Days Left',
    'Nov 20, 2026',
    '3 Weeks Tour',
    '/images/opp_campus_band.png',
    'Clean fingerpicking and rhythm acoustic timing\nVocal harmonies / backings ability\nValid ID and ability to travel',
    '₹25,000 per gig (₹2,50,000 total for 10 shows)\nFlights, 4-star lodging and daily per-diem covered\nAccess to sound engineering crew',
    'There is no energy on earth like a live collegiate audience.',
    'Pooja Nair, Tour Manager',
    FALSE,
    'OPEN'
),
(
    106,
    'Editorial Creative Content & Social Media Intern',
    'Paid 3-Month Media Internship at ArtSphere Guild',
    'Calling design and communication students passionate about visual storytelling, artist spotlights, reel production, and cultural journalism.',
    'Internships',
    'Writing & Media',
    'ArtSphere Editorial Guild',
    'Media Platform',
    '/images/comm_creative_souls_avatar.png',
    'Mumbai, Maharashtra',
    '8 Days Left',
    'Nov 06, 2026',
    '3 Months',
    '/images/opp_content_writer.png',
    'Enthusiasm for contemporary arts\nBasic Canva/Photoshop & Premiere/CapCut skills\nEngaging copywriting style',
    '₹20,000 Monthly Stipend\nFlexible hybrid schedule (2 days office, 3 days remote)\nRecommendation letter from ArtSphere Core Team',
    'Storytelling gives art its cultural footprint.',
    'Mrunali G., Editor-in-Chief',
    FALSE,
    'OPEN'
),
(
    107,
    'Public Art Ceramic Sculpture Commission',
    'Civic Park Installation Project',
    'Commissioning a ceramic or terracotta outdoor sculptured fountain for the new cultural garden promenade at Palm Beach Road.',
    'Commissions',
    'Sculpture & Crafts',
    'Navi Mumbai Urban Arts Council',
    'Public Arts Body',
    '/images/highlight_clay_character.png',
    'Navi Mumbai, MH',
    '60 Days Left',
    'Dec 15, 2026',
    '3 Months Fabrication',
    '/images/comm_create_craft.png',
    'Experience working with weather-resistant ceramic slips and clay\nConcept sketches with structural scale dimensions',
    '₹2,00,000 All-Inclusive Honorarium\nMaterial and kiln firing costs reimbursed up to ₹80,000\nPlaque dedication at site opening',
    'Public art belongs to every citizen who walks by.',
    'Commissioner S. Jadhav',
    FALSE,
    'OPEN'
),
(
    108,
    'Independent Playwright & Monologue Writer Residency',
    'Experimental Theatre Script Incubator',
    '3-week quiet writing retreat in Panchgani hill station for playwrights drafting fresh original scripts in Hindi, English, or Marathi.',
    'Residencies',
    'Writing',
    'Natak Studio Collective',
    'Theatre Group',
    '/images/comm_words_worlds.png',
    'Pune / Panchgani, MH',
    '40 Days Left',
    'Nov 28, 2026',
    '3 Weeks',
    '/images/comm_post_sketchbook.png',
    '10-page sample excerpt from an original dramatic piece\nStatement of intent for the new script',
    '₹60,000 Writing Fellowship Grant\nDedicated mountain cabin and all meals included\nStaged table reading with professional actors',
    'A written word is an actor''s oxygen.',
    'Vikram Phadke, Dramaturge',
    FALSE,
    'OPEN'
)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    subtitle = VALUES(subtitle),
    description = VALUES(description),
    category = VALUES(category),
    location = VALUES(location),
    days_left = VALUES(days_left),
    deadline = VALUES(deadline),
    is_featured = VALUES(is_featured),
    status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 10. Applications (Opportunities Applied By User 101)
-- ------------------------------------------------------------------------------
INSERT INTO applications (user_id, opportunity_id, status, notes)
VALUES
(101, 101, 'ACCEPTED', 'Portfolio submitted for campus exhibition display.'),
(101, 103, 'SHORTLISTED', 'Character design sample sheets sent.'),
(101, 106, 'PENDING', 'Applied for creative content intern role.')
ON DUPLICATE KEY UPDATE
    status = VALUES(status),
    notes = VALUES(notes);

-- ------------------------------------------------------------------------------
-- 11. Feed Posts
-- ------------------------------------------------------------------------------
INSERT INTO posts (id, user_id, community_id, title, caption, media_url, media_type, art_form, category, location, tags, visibility, likes_count, comments_count, shares_count, saves_count, created_at)
VALUES
(701, 101, 601, 'Evening Sunset Painting', 'Spent my evening painting this sunset 🌅 Nature always gives the best colours! 💜', '/images/comm_post_sunset_painting.png', 'image', 'Painting', 'Artworks', 'Mumbai, MH', '#painting,#sunset,#nature,#acrylic', 'Public', 124, 18, 5, 34, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(702, 102, 601, 'Charcoal Sketch Study', 'Tried charcoal sketching after a long time. Still learning, but happy with the progress! ✏️ Any tips to improve? 🥺', '/images/comm_post_sketchbook.png', 'image', 'Drawing', 'Showcase', 'Pune, MH', '#sketching,#charcoal,#study,#beginner', 'Public', 89, 24, 3, 19, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(703, 104, 603, 'Golden Hour Reflections', 'The light hitting the old railway bridge just right at 6:15 PM today.', '/images/artwork_city_shades.png', 'image', 'Photography', 'Artworks', 'Navi Mumbai', '#street,#goldenhour,#mumbai,#light', 'Public', 94, 8, 4, 21, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(704, 102, 604, 'New Fingerstyle Melody', 'Recorded an acoustic passage in open D tuning. Hoping to develop this into a full song soon.', '/images/artist_rohan_cover.png', 'image', 'Music', 'Audio', 'Pune, MH', '#guitar,#indiefolk,#acoustic,#melody', 'Public', 156, 31, 12, 45, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(705, 103, 605, 'Rehearsal Still: Fluid Transitions', 'Working on floor work transitions for the upcoming showcase. Bruised knees but happy spirit!', '/images/artist_kavya_cover.png', 'image', 'Dance', 'Behind the Scenes', 'Bengaluru, KA', '#dance,#contemporary,#rehearsal,#movement', 'Public', 110, 15, 6, 28, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(706, 107, 607, 'Morning Terracotta Vases', 'Fresh out of the bisque kiln! Ready for glazing experiments this weekend.', '/images/highlight_clay_character.png', 'image', 'Crafts', 'Showcase', 'Mumbai, MH', '#pottery,#ceramics,#terracotta,#handmade', 'Public', 82, 12, 2, 16, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(707, 101, 601, 'Sunlit Expressions Study', 'Exploring morning sunlight on face contours and subtle skin warmth.', '/images/artwork_sunlit.png', 'image', 'Digital Art', 'Artworks', 'Mumbai, MH', '#digitalart,#portrait,#sunlit,#illustration', 'Public', 198, 27, 9, 62, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(708, 106, 606, 'Monologue Excerpt: Old Balconies', 'The city wakes up in three shifts: the milkmen, the dreamers, and those who never slept.', '/images/comm_post_sketchbook.png', 'image', 'Writing', 'Showcase', 'Thane, MH', '#poetry,#writing,#citylife,#thoughts', 'Public', 67, 9, 3, 14, DATE_SUB(NOW(), INTERVAL 5 DAY))
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    caption = VALUES(caption),
    likes_count = VALUES(likes_count),
    comments_count = VALUES(comments_count);

-- ------------------------------------------------------------------------------
-- 12. Post Comments
-- ------------------------------------------------------------------------------
INSERT INTO post_comments (id, post_id, user_id, content, likes_count, created_at)
VALUES
(1, 701, 102, 'The gradient transition from peach to violet is so smooth Aanya! Loved this piece.', 8, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(2, 701, 103, 'Such warm and calming energy! Reminds me of our terrace evenings.', 5, DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(3, 702, 101, 'The contrast on the cheekbone is spot on! Try using a kneaded eraser for subtler highlights.', 12, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(4, 704, 105, 'That chord inversion at 0:24 is so nostalgic Rohan! We should definitely jam on this.', 9, DATE_SUB(NOW(), INTERVAL 20 HOUR))
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    likes_count = VALUES(likes_count);

-- ------------------------------------------------------------------------------
-- 13. Notifications for User 101
-- ------------------------------------------------------------------------------
INSERT INTO notifications (id, user_id, type, title, message, sender_id, sender_name, sender_avatar, entity_type, entity_id, action_url, is_read, created_at)
VALUES
(1, 101, 'COLLABORATION', 'Arjun Rao sent you a collaboration request', 'Hi! I loved your artwork and would love to collaborate on a music + visual art project.', 104, 'Arjun Rao', '/images/artist_arjun_thumb.png', 'COLLABORATION_REQUEST', 1, '/pages/collaboration-requests.html', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 101, 'PORTFOLIO', 'Sneha Patil liked your portfolio', '"Your illustration style is absolutely breathtaking!"', 108, 'Sneha Patil', '/images/avatar_sneha.png', 'PORTFOLIO', 101, '/pages/portfolio.html?id=101', FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 101, 'EVENT', 'New event in Creative Souls', 'Watercolor Basics Workshop starts in 3 days.', NULL, 'ArtSphere Events', '/images/comm_event_watercolor.png', 'EVENT', 801, '/pages/event-details.html?id=801', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 101, 'COLLABORATION', 'Rohan Mehta approved your collaboration request', '"Excited to design album graphics together!"', 102, 'Rohan Mehta', '/images/artist_rohan_avatar.png', 'COLLABORATION', 502, '/pages/collaboration-details.html?id=502', TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 101, 'OPPORTUNITY', 'Application Status Update: Serendipity Arts Residency', 'Congratulations! Your application has been ACCEPTED.', NULL, 'Serendipity Arts Foundation', '/images/comm_creative_souls_avatar.png', 'OPPORTUNITY', 101, '/pages/my-applications.html', TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 101, 'ARTWORK', 'Aditya Kulkarni liked your artwork', '"Sunlit expressions has such an evocative palette!"', 110, 'Aditya Kulkarni', '/images/artist_ishita_thumb.png', 'ARTWORK', 211, '/pages/portfolio.html?id=101', TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(7, 101, 'COMMUNITY', 'Welcome to Creative Souls Guild', 'You are designated as community ADMIN. Check the creator moderation guidelines.', NULL, 'Creative Souls Guild', '/images/comm_creative_souls_avatar.png', 'COMMUNITY', 601, '/pages/community-details.html?id=601', TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(8, 101, 'OPPORTUNITY', 'New Grant matching your profile: Studio Mirage Animation', 'Studio Mirage posted an open call for character designers.', NULL, 'Studio Mirage', '/images/avatar_riya.png', 'OPPORTUNITY', 103, '/pages/opportunity-details.html?id=103', TRUE, DATE_SUB(NOW(), INTERVAL 6 DAY))
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    message = VALUES(message),
    is_read = VALUES(is_read),
    action_url = VALUES(action_url);

-- ------------------------------------------------------------------------------
-- 14. Artist Connections
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO artist_connections (user_id, artist_id, status, created_at)
VALUES
(101, 102, 'CONNECTED', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(101, 103, 'CONNECTED', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(101, 104, 'CONNECTED', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(101, 107, 'CONNECTED', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(101, 108, 'CONNECTED', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(102, 101, 'CONNECTED', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(103, 101, 'CONNECTED', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(104, 101, 'CONNECTED', DATE_SUB(NOW(), INTERVAL 15 DAY));

SET FOREIGN_KEY_CHECKS = 1;
