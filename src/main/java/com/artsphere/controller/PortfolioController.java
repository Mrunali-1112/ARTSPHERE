package com.artsphere.controller;

import com.artsphere.model.Artwork;
import com.artsphere.model.dto.ApiResponse;
import com.artsphere.model.dto.ArtworkRequest;
import com.artsphere.model.dto.ArtworkResponse;
import com.artsphere.service.ArtworkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final ArtworkService artworkService;

    public PortfolioController(ArtworkService artworkService) {
        this.artworkService = artworkService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ArtworkResponse>>> getAllPortfolio(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        List<Artwork> artworks = artworkService.getFeed(category, search);
        List<ArtworkResponse> responses = artworks.stream()
                .map(ArtworkResponse::fromArtwork)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Portfolio items retrieved successfully", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArtworkResponse>> getPortfolioById(@PathVariable Long id) {
        Artwork artwork = artworkService.getArtworkById(id);
        return ResponseEntity.ok(ApiResponse.success("Portfolio item retrieved successfully", ArtworkResponse.fromArtwork(artwork)));
    }

    @GetMapping("/artist/{artistId}")
    public ResponseEntity<ApiResponse<List<ArtworkResponse>>> getPortfolioByArtist(
            @PathVariable Long artistId,
            @RequestParam(required = false) String category) {
        List<Artwork> artworks = artworkService.getPortfolioByArtist(artistId, category);
        List<ArtworkResponse> responses = artworks.stream()
                .map(ArtworkResponse::fromArtwork)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Artist portfolio retrieved successfully", responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ArtworkResponse>> createPortfolioItem(
            @Valid @RequestBody ArtworkRequest request,
            Authentication authentication) {
        String currentUsername = authentication != null ? authentication.getName() : null;
        Artwork created = artworkService.createPortfolioItem(request, currentUsername);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Portfolio item created successfully", ArtworkResponse.fromArtwork(created)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ArtworkResponse>> updatePortfolioItem(
            @PathVariable Long id,
            @Valid @RequestBody ArtworkRequest request,
            Authentication authentication) {
        String currentUsername = authentication != null ? authentication.getName() : null;
        Artwork updated = artworkService.updatePortfolioItem(id, request, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Portfolio item updated successfully", ArtworkResponse.fromArtwork(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePortfolioItem(
            @PathVariable Long id,
            Authentication authentication) {
        String currentUsername = authentication != null ? authentication.getName() : null;
        artworkService.deletePortfolioItem(id, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Portfolio item deleted successfully"));
    }
}
