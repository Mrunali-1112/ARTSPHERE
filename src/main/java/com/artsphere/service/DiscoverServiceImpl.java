package com.artsphere.service;

import com.artsphere.exception.ResourceNotFoundException;
import com.artsphere.model.Artwork;
import com.artsphere.model.User;
import com.artsphere.model.dto.ArtistProfileResponse;
import com.artsphere.model.dto.ArtworkResponse;
import com.artsphere.model.dto.DiscoverArtistResponse;
import com.artsphere.repository.ArtworkRepository;
import com.artsphere.repository.DiscoverRepository;
import com.artsphere.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class DiscoverServiceImpl implements DiscoverService {

    private final DiscoverRepository discoverRepository;
    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;

    public DiscoverServiceImpl(DiscoverRepository discoverRepository, UserRepository userRepository, ArtworkRepository artworkRepository) {
        this.discoverRepository = discoverRepository;
        this.userRepository = userRepository;
        this.artworkRepository = artworkRepository;
    }

    @Override
    public List<DiscoverArtistResponse> getArtists(String artForm, String location, String search) {
        return discoverRepository.findArtists(artForm, location, search);
    }

    @Override
    public List<DiscoverArtistResponse> getFeaturedArtists() {
        return discoverRepository.findFeaturedArtists();
    }

    @Override
    public List<DiscoverArtistResponse> getArtistsNearYou() {
        return discoverRepository.findArtistsNearYou();
    }

    @Override
    public boolean toggleConnection(String currentUsername, Long artistId) {
        Long userId = 101L; // Default user for unauthenticated or demo session
        if (currentUsername != null && !currentUsername.isBlank() && !currentUsername.equals("anonymousUser")) {
            Optional<User> userOpt = userRepository.findByUsername(currentUsername);
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
            }
        }
        return discoverRepository.toggleConnection(userId, artistId);
    }

    @Override
    public ArtistProfileResponse getArtistProfile(Long id, String currentUsername) {
        User artist = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with id: " + id));

        Long currentUserId = 101L;
        if (currentUsername != null && !currentUsername.isBlank() && !currentUsername.equals("anonymousUser")) {
            userRepository.findByUsername(currentUsername).ifPresent(u -> {
                // current user id
            });
        }
        boolean isFollowing = discoverRepository.isConnected(currentUserId, id);

        List<Artwork> artworks = artworkRepository.findByArtistId(id);
        List<ArtworkResponse> artworkResponses = artworks.stream()
                .map(ArtworkResponse::fromArtwork)
                .toList();

        // Parse skills
        List<String> skillsList = List.of("Digital Art", "Illustration", "Portraits", "Concept Art", "Nature Art");
        if (artist.getSkills() != null && !artist.getSkills().isBlank()) {
            skillsList = Arrays.stream(artist.getSkills().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        int postsCount = (artworks != null && !artworks.isEmpty()) ? artworks.size() : (artist.getPostsCount() != null ? artist.getPostsCount() : 24);
        String followersStr = formatCount(artist.getFollowersCount() != null ? artist.getFollowersCount() : 1800);
        int followingCount = artist.getFollowingCount() != null ? artist.getFollowingCount() : 356;

        return new ArtistProfileResponse(
                artist.getId(),
                artist.getUsername(),
                artist.getFullName(),
                artist.getArtistType() != null ? artist.getArtistType() : (artist.getBio() != null ? artist.getBio() : "Visual Artist"),
                artist.getLocation() != null ? artist.getLocation() : "Mumbai, MH",
                artist.getBio() != null ? artist.getBio() : "Illustrator and digital artist exploring everyday moments through art.",
                artist.getProfilePicture() != null ? artist.getProfilePicture() : "/images/artist_profile_avatar.png",
                artist.getCoverImage() != null ? artist.getCoverImage() : "/images/artist_profile_cover.png",
                skillsList,
                postsCount,
                followersStr,
                followingCount,
                isFollowing,
                "https://instagram.com",
                "https://behance.net",
                "https://artsphere.com/" + artist.getUsername(),
                artworkResponses
        );
    }

    @Override
    public boolean toggleFollow(String currentUsername, Long artistId) {
        return toggleConnection(currentUsername, artistId);
    }

    private String formatCount(int count) {
        if (count >= 1000) {
            double k = count / 1000.0;
            if (count % 1000 == 0) {
                return String.format("%.0fK", k);
            }
            return String.format("%.1fK", k);
        }
        return String.valueOf(count);
    }
}
