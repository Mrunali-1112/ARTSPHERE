package com.artsphere.service;

import com.artsphere.exception.ResourceNotFoundException;
import com.artsphere.model.Artwork;
import com.artsphere.model.Community;
import com.artsphere.model.Event;
import com.artsphere.model.Post;
import com.artsphere.model.dto.*;
import com.artsphere.repository.ArtworkRepository;
import com.artsphere.repository.CommunityRepository;
import com.artsphere.repository.PostRepository;
import com.artsphere.repository.UserRepository;
import com.artsphere.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ArtworkRepository artworkRepository;
    private final NotificationService notificationService;

    public CommunityServiceImpl(CommunityRepository communityRepository,
                                UserRepository userRepository,
                                PostRepository postRepository,
                                ArtworkRepository artworkRepository,
                                NotificationService notificationService) {
        this.communityRepository = communityRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.artworkRepository = artworkRepository;
        this.notificationService = notificationService;
    }

    private Long resolveCurrentUserId(Long currentUserId) {
        if (currentUserId != null) {
            return currentUserId;
        }
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                Optional<User> u = userRepository.findByUsername(auth.getName());
                if (u.isPresent()) {
                    return u.get().getId();
                }
            }
        } catch (Exception ignored) {}
        return userRepository.findByUsername("mrunali")
                .map(User::getId)
                .orElseGet(() -> userRepository.findAll().stream().findFirst().map(User::getId).orElse(101L));
    }

    @Override
    public List<CommunityResponse> getCommunities(String category, String search, Long currentUserId) {
        Long userId = resolveCurrentUserId(currentUserId);
        List<Community> list = communityRepository.findAll(category, search);
        return list.stream()
                .map(c -> mapToResponse(c, userId))
                .collect(Collectors.toList());
    }

    @Override
    public CommunityDetailResponse getCommunityDetails(Long id, Long currentUserId) {
        Long userId = resolveCurrentUserId(currentUserId);
        Community c = communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + id));

        CommunityDetailResponse detail = new CommunityDetailResponse();
        populateBaseResponse(detail, c, userId);

        detail.setRules(c.getRules() != null ? c.getRules() : "Be kind and respectful\nShare original work\nGive constructive feedback\nNo hate or spam\nKeep it art-related");
        detail.setCreatedDate(c.getCreatedDate() != null ? c.getCreatedDate() : "12 Mar 2024");
        detail.setOwnerId(c.getOwnerId());

        userRepository.findById(c.getOwnerId() != null ? c.getOwnerId() : 101L).ifPresent(owner -> {
            detail.setOwnerName(owner.getFullName());
            detail.setOwnerUsername(owner.getUsername());
            detail.setOwnerAvatar(owner.getProfilePicture() != null ? owner.getProfilePicture() : "/images/artist_profile_avatar.png");
        });

        int memberCount = communityRepository.countMembers(id);
        int postsCount = communityRepository.countPosts(id);
        int eventsCount = communityRepository.countEvents(id);

        detail.setMemberCount(memberCount > 0 ? memberCount : c.getMemberCount());
        detail.setPostsCount(postsCount);
        detail.setEventsCount(eventsCount);

        List<CommunityMemberResponse> members = communityRepository.findMembers(id);
        detail.setTopMembers(members.stream().limit(5).collect(Collectors.toList()));

        // Add 3 featured artworks for overview section
        List<Artwork> artworks = artworkRepository.findAll(null, null);
        List<ArtworkResponse> featuredList = artworks.stream()
                .limit(3)
                .map(art -> {
                    ArtworkResponse ar = new ArtworkResponse();
                    ar.setId(art.getId());
                    ar.setTitle(art.getTitle());
                    ar.setImageUrl(art.getImageUrl());
                    ar.setCategory(art.getCategory());
                    ar.setArtistId(art.getArtistId());
                    userRepository.findById(art.getArtistId()).ifPresent(u -> {
                        ar.setArtistName(u.getFullName());
                        ar.setArtistUsername(u.getUsername());
                    });
                    return ar;
                })
                .collect(Collectors.toList());
        detail.setFeaturedWorks(featuredList);

        return detail;
    }

    @Override
    @Transactional
    public Map<String, Object> joinCommunity(Long id, Long currentUserId) {
        Long userId = resolveCurrentUserId(currentUserId);
        Community c = communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + id));

        boolean alreadyMember = communityRepository.isMember(id, userId);
        if (alreadyMember) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("communityId", id);
            resp.put("joined", true);
            resp.put("memberRole", communityRepository.getMemberRole(id, userId));
            resp.put("memberCount", communityRepository.countMembers(id));
            resp.put("message", "Already a member of this community");
            return resp;
        }

        communityRepository.addMember(id, userId, "MEMBER");
        int count = communityRepository.countMembers(id);

        try {
            notificationService.createNotification(
                    userId,
                    "COMMUNITY",
                    "Welcome to " + c.getName() + " Guild",
                    "You are designated as community MEMBER. Check the creator moderation guidelines and introductions.",
                    userId,
                    c.getName(),
                    c.getCoverImage() != null && !c.getCoverImage().isBlank() ? c.getCoverImage() : "/images/category_fine_art.png",
                    "COMMUNITY",
                    id,
                    "/pages/communities.html?id=" + id
            );
        } catch (Exception ignored) {}

        Map<String, Object> resp = new HashMap<>();
        resp.put("communityId", id);
        resp.put("joined", true);
        resp.put("memberRole", "MEMBER");
        resp.put("memberCount", count);
        resp.put("message", "Successfully joined " + c.getName());
        return resp;
    }

    @Override
    @Transactional
    public Map<String, Object> leaveCommunity(Long id, Long currentUserId) {
        Long userId = resolveCurrentUserId(currentUserId);
        communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + id));

        communityRepository.removeMember(id, userId);
        int count = communityRepository.countMembers(id);

        Map<String, Object> resp = new HashMap<>();
        resp.put("communityId", id);
        resp.put("joined", false);
        resp.put("memberRole", null);
        resp.put("memberCount", count);
        resp.put("message", "Successfully left community");
        return resp;
    }

    @Override
    public List<CommunityMemberResponse> getCommunityMembers(Long id) {
        communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + id));
        return communityRepository.findMembers(id);
    }

    @Override
    public List<PostResponse> getCommunityPosts(Long id, String category, Long currentUserId) {
        Long userId = resolveCurrentUserId(currentUserId);
        communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + id));

        List<Post> posts = communityRepository.findCommunityPosts(id, category);
        return posts.stream().map(p -> mapPostToResponse(p, userId)).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PostResponse createCommunityPost(Long id, CommunityPostCreateRequest request, Long currentUserId) {
        Long userId = resolveCurrentUserId(currentUserId);
        communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + id));

        Post post = new Post();
        post.setUserId(userId);
        post.setCommunityId(id);
        post.setTitle(request.getTitle() != null && !request.getTitle().isBlank() ? request.getTitle().trim() : "Community Post");
        post.setCaption(request.getCaption().trim());
        post.setMediaUrl(request.getMediaUrl() != null && !request.getMediaUrl().isBlank() ? request.getMediaUrl().trim() : "/images/comm_post_sunset_painting.png");
        post.setMediaType(request.getMediaType() != null ? request.getMediaType() : "image");
        post.setCategory(request.getCategory() != null && !request.getCategory().isBlank() ? request.getCategory().trim() : "Artworks");
        post.setArtForm("All");
        post.setLocation("Mumbai, MH");
        post.setTags(request.getTags() != null ? request.getTags().trim() : "#creativesouls,#art");
        post.setVisibility("Public");
        post.setLikesCount(0);
        post.setCommentsCount(0);
        post.setSharesCount(0);
        post.setSavesCount(0);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        Post saved = postRepository.save(post);
        return mapPostToResponse(saved, userId);
    }

    @Override
    public List<CommunityEventResponse> getCommunityEvents(Long id, String type, Long currentUserId) {
        Long userId = resolveCurrentUserId(currentUserId);
        communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + id));

        List<Event> events = communityRepository.findCommunityEvents(id, type);
        List<String> defaultAvatars = Arrays.asList(
                "/images/artist_aanya_avatar.png",
                "/images/artist_rohan_avatar.png",
                "/images/avatar_riya.png",
                "/images/avatar_sneha.png"
        );

        return events.stream().map(e -> {
            CommunityEventResponse r = new CommunityEventResponse();
            r.setId(e.getId());
            r.setCommunityId(id);
            r.setTitle(e.getTitle());
            r.setOrganizer(e.getOrganizer());
            r.setLocation(e.getLocation());
            r.setEventDate(e.getEventDate());
            r.setEventTime(e.getEventTime());
            r.setImageUrl(e.getImageUrl());
            r.setDescription(e.getDescription());
            r.setEventType("Workshop".equals(e.getTitle()) ? "Workshop" : ("Exhibition".contains(e.getTitle()) ? "Exhibition" : ("Meetup".contains(e.getTitle()) ? "Meetup" : "Live Session")));
            r.setAttendeesCount(24);
            r.setRegistered(communityRepository.isEventRegistered(e.getId(), userId));
            r.setAttendeeAvatars(defaultAvatars);
            return r;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> registerForEvent(Long eventId, Long currentUserId) {
        Long userId = resolveCurrentUserId(currentUserId);
        boolean registered = communityRepository.registerEvent(eventId, userId);

        Map<String, Object> res = new HashMap<>();
        res.put("eventId", eventId);
        res.put("registered", registered);
        res.put("message", "You're all set! Successfully registered for the event.");
        return res;
    }

    private CommunityResponse mapToResponse(Community c, Long userId) {
        CommunityResponse r = new CommunityResponse();
        populateBaseResponse(r, c, userId);
        return r;
    }

    private void populateBaseResponse(CommunityResponse r, Community c, Long userId) {
        r.setId(c.getId());
        r.setName(c.getName());
        r.setDescription(c.getDescription());
        r.setMemberCount(c.getMemberCount() != null ? c.getMemberCount() : 0);
        r.setCategory(c.getCategory());
        r.setImageUrl(c.getImageUrl());
        r.setCoverImage(c.getCoverImage());
        r.setLocation(c.getLocation());
        r.setArtForms(c.getArtForms());
        r.setIsFeatured(c.getIsFeatured());
        r.setJoined(communityRepository.isMember(c.getId(), userId));
        r.setMemberRole(communityRepository.getMemberRole(c.getId(), userId));
    }

    private PostResponse mapPostToResponse(Post post, Long userId) {
        PostResponse resp = new PostResponse();
        resp.setId(post.getId());
        resp.setTitle(post.getTitle());
        resp.setCaption(post.getCaption());
        resp.setMediaUrl(post.getMediaUrl());
        resp.setMediaType(post.getMediaType());
        resp.setArtForm(post.getArtForm());
        resp.setCategory(post.getCategory());
        resp.setLocation(post.getLocation());
        resp.setVisibility(post.getVisibility());
        resp.setLikesCount(post.getLikesCount());
        resp.setCommentsCount(post.getCommentsCount());
        resp.setSharesCount(post.getSharesCount());
        resp.setSavesCount(post.getSavesCount());
        resp.setTimeAgo(formatTimeAgo(post.getCreatedAt()));

        if (post.getCreatedAt() != null) {
            resp.setFormattedDate(post.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        } else {
            resp.setFormattedDate("12 Sept 2024");
        }

        List<String> tagList = new ArrayList<>();
        if (post.getTags() != null && !post.getTags().isBlank()) {
            for (String tag : post.getTags().split("[, ]+")) {
                String clean = tag.trim();
                if (!clean.isEmpty()) {
                    if (!clean.startsWith("#")) clean = "#" + clean;
                    tagList.add(clean);
                }
            }
        }
        resp.setTags(tagList);

        userRepository.findById(post.getUserId()).ifPresentOrElse(user -> {
            resp.setArtistId(user.getId());
            resp.setArtistName(user.getFullName());
            resp.setArtistUsername(user.getUsername());
            resp.setArtistAvatar(user.getProfilePicture() != null ? user.getProfilePicture() : "/images/artist_profile_avatar.png");
            resp.setArtistType(user.getArtistType() != null ? user.getArtistType() : "Artist");
        }, () -> {
            resp.setArtistId(post.getUserId());
            resp.setArtistName("Aanya Verma");
            resp.setArtistUsername("aanyaart");
            resp.setArtistAvatar("/images/artist_profile_avatar.png");
            resp.setArtistType("Artist");
        });

        if (userId != null) {
            resp.setLiked(postRepository.isLikedByUser(post.getId(), userId));
            resp.setSaved(postRepository.isSavedByUser(post.getId(), userId));
        }

        return resp;
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = duration.toMinutes();
        if (minutes < 60) return minutes + "m ago";
        long hours = duration.toHours();
        if (hours < 24) return hours + "h ago";
        long days = duration.toDays();
        if (days < 30) return days + "d ago";
        return (days / 30) + "mo ago";
    }

    @Override
    public CommunityResponse createCommunity(Map<String, String> request, Long currentUserId) {
        Long userId = (currentUserId != null) ? currentUserId : 101L;
        Community c = new Community();
        c.setName(request.getOrDefault("name", "New Community").trim());
        c.setDescription(request.getOrDefault("description", "").trim());
        c.setCategory(request.getOrDefault("category", "All").trim());
        c.setLocation(request.getOrDefault("location", "Global").trim());
        c.setArtForms(request.getOrDefault("artForms", c.getCategory()).trim());
        c.setCoverImage("/images/comm_creative_souls_cover.png");
        c.setImageUrl("/images/comm_creative_souls_avatar.png");
        c.setMemberCount(1);
        c.setIsFeatured(false);
        c.setOwnerId(userId);
        c.setCreatedDate("Just now");
        c.setRules("Be kind and respectful\nShare original work\nGive constructive feedback\nNo hate or spam\nKeep it art-related");

        Community saved = communityRepository.save(c);
        communityRepository.addMember(saved.getId(), userId, "ADMIN");

        CommunityResponse resp = mapToResponse(saved, userId);
        resp.setJoined(true);
        resp.setMemberRole("ADMIN");
        return resp;
    }
}
