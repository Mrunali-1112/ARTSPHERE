package com.artsphere.controller;

import com.artsphere.model.Artwork;
import com.artsphere.model.dto.ApiResponse;
import com.artsphere.model.dto.ArtistProfileResponse;
import com.artsphere.model.dto.ArtworkResponse;
import com.artsphere.model.dto.DiscoverArtistResponse;
import com.artsphere.service.ArtworkService;
import com.artsphere.service.DiscoverService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/artists", "/api/discover"})
public class ArtistController {

    private final DiscoverService discoverService;
    private final ArtworkService artworkService;

    public ArtistController(DiscoverService discoverService, ArtworkService artworkService) {
        this.discoverService = discoverService;
        this.artworkService = artworkService;
    }

    @GetMapping({"", "/artists"})
    public ResponseEntity<ApiResponse<List<DiscoverArtistResponse>>> getArtists(
            @RequestParam(value = "artForm", required = false) String artForm,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "search", required = false) String search) {
        String filterForm = (artForm != null && !artForm.isBlank()) ? artForm : category;
        String query = (q != null && !q.isBlank()) ? q : search;
        List<DiscoverArtistResponse> artists = discoverService.getArtists(filterForm, location, query);
        return ResponseEntity.ok(ApiResponse.success("Artists retrieved successfully", artists));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DiscoverArtistResponse>>> searchArtists(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "search", required = false) String search) {
        String searchTerm = (q != null && !q.isBlank()) ? q : (query != null ? query : search);
        List<DiscoverArtistResponse> artists = discoverService.getArtists(null, null, searchTerm);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", artists));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<DiscoverArtistResponse>>> getFeaturedArtists() {
        List<DiscoverArtistResponse> artists = discoverService.getFeaturedArtists();
        return ResponseEntity.ok(ApiResponse.success("Featured artists retrieved successfully", artists));
    }

    @GetMapping("/near-you")
    public ResponseEntity<ApiResponse<List<DiscoverArtistResponse>>> getArtistsNearYou() {
        List<DiscoverArtistResponse> artists = discoverService.getArtistsNearYou();
        return ResponseEntity.ok(ApiResponse.success("Nearby artists retrieved successfully", artists));
    }

    @PostMapping({"/connect/{artistId}", "/{artistId}/connect"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleConnect(
            @PathVariable Long artistId,
            Authentication authentication) {
        String currentUsername = authentication != null ? authentication.getName() : null;
        boolean connected = discoverService.toggleConnection(currentUsername, artistId);
        String message = connected ? "Connected successfully" : "Disconnected successfully";
        return ResponseEntity.ok(ApiResponse.success(message, Map.of(
                "artistId", artistId,
                "connected", connected
        )));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArtistProfileResponse>> getArtistById(
            @PathVariable Long id,
            Authentication authentication) {
        String currentUsername = authentication != null ? authentication.getName() : null;
        ArtistProfileResponse profile = discoverService.getArtistProfile(id, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Artist profile retrieved successfully", profile));
    }

    @GetMapping("/{id}/portfolio")
    public ResponseEntity<ApiResponse<List<ArtworkResponse>>> getArtistPortfolio(
            @PathVariable Long id,
            @RequestParam(value = "category", required = false) String category) {
        List<Artwork> artworks = artworkService.getPortfolioByArtist(id, category);
        List<ArtworkResponse> responses = artworks.stream()
                .map(ArtworkResponse::fromArtwork)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Artist portfolio retrieved successfully", responses));
    }

    @PostMapping({"/follow/{artistId}", "/{artistId}/follow"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFollow(
            @PathVariable Long artistId,
            Authentication authentication) {
        String currentUsername = authentication != null ? authentication.getName() : null;
        boolean following = discoverService.toggleFollow(currentUsername, artistId);
        String message = following ? "Followed artist successfully" : "Unfollowed artist successfully";
        return ResponseEntity.ok(ApiResponse.success(message, Map.of(
                "artistId", artistId,
                "following", following
        )));
    }
}
