package com.artsphere.controller;

import com.artsphere.model.Artwork;
import com.artsphere.model.dto.ApiResponse;
import com.artsphere.model.dto.ArtworkRequest;
import com.artsphere.model.dto.ArtworkResponse;
import com.artsphere.service.ArtworkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/artworks")
public class ArtworkController {

    private final ArtworkService artworkService;

    public ArtworkController(ArtworkService artworkService) {
        this.artworkService = artworkService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ArtworkResponse>>> getFeed(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        List<Artwork> artworks = artworkService.getFeed(category, search);
        List<ArtworkResponse> responses = artworks.stream()
                .map(ArtworkResponse::fromArtwork)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Artworks retrieved successfully", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArtworkResponse>> getArtworkById(@PathVariable Long id) {
        Artwork artwork = artworkService.getArtworkById(id);
        return ResponseEntity.ok(ApiResponse.success("Artwork retrieved successfully", ArtworkResponse.fromArtwork(artwork)));
    }

    @GetMapping("/artist/{artistId}")
    public ResponseEntity<ApiResponse<List<ArtworkResponse>>> getArtworksByArtist(@PathVariable Long artistId) {
        List<Artwork> artworks = artworkService.getArtworksByArtist(artistId);
        List<ArtworkResponse> responses = artworks.stream()
                .map(ArtworkResponse::fromArtwork)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Artist artworks retrieved successfully", responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ArtworkResponse>> createArtwork(
            @Valid @RequestBody ArtworkRequest request,
            Authentication authentication) {
        Artwork created = artworkService.createArtwork(request, authentication.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Artwork published successfully", ArtworkResponse.fromArtwork(created)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ArtworkResponse>> updateArtwork(
            @PathVariable Long id,
            @Valid @RequestBody ArtworkRequest request,
            Authentication authentication) {
        Artwork updated = artworkService.updateArtwork(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Artwork updated successfully", ArtworkResponse.fromArtwork(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteArtwork(
            @PathVariable Long id,
            Authentication authentication) {
        artworkService.deleteArtwork(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Artwork deleted successfully"));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = artworkService.storeArtworkImage(file);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", Map.of("imageUrl", url)));
    }
}
