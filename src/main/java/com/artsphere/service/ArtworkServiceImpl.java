package com.artsphere.service;

import com.artsphere.exception.ResourceNotFoundException;
import com.artsphere.model.Artwork;
import com.artsphere.model.User;
import com.artsphere.model.dto.ArtworkRequest;
import com.artsphere.repository.ArtworkRepository;
import com.artsphere.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class ArtworkServiceImpl implements ArtworkService {

    private final ArtworkRepository artworkRepository;
    private final UserRepository userRepository;
    private final Path uploadLocation = Paths.get("uploads", "artworks");

    public ArtworkServiceImpl(ArtworkRepository artworkRepository, UserRepository userRepository) {
        this.artworkRepository = artworkRepository;
        this.userRepository = userRepository;
        initUploadDirectory();
    }

    private void initUploadDirectory() {
        try {
            if (!Files.exists(uploadLocation)) {
                Files.createDirectories(uploadLocation);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload folder", e);
        }
    }

    @Override
    @Transactional
    public Artwork createArtwork(ArtworkRequest request, String currentUsername) {
        User artist = userRepository.findByUsername(currentUsername)
                .or(() -> userRepository.findByEmail(currentUsername))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        Artwork artwork = new Artwork();
        artwork.setTitle(request.getTitle().trim());
        artwork.setDescription(request.getDescription());
        artwork.setCategory(request.getCategory().trim());
        artwork.setImageUrl(request.getImageUrl().trim());
        artwork.setPrice(request.getPrice());
        artwork.setForSale(request.isForSale());
        artwork.setArtistId(artist.getId());
        artwork.setArtistName(artist.getFullName());
        artwork.setArtistUsername(artist.getUsername());

        Artwork saved = artworkRepository.save(artwork);
        saved.setArtistName(artist.getFullName());
        saved.setArtistUsername(artist.getUsername());
        return saved;
    }

    @Override
    public Artwork getArtworkById(Long id) {
        return artworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found with id: " + id));
    }

    @Override
    public List<Artwork> getFeed(String category, String search) {
        return artworkRepository.findAll(category, search);
    }

    @Override
    public List<Artwork> getArtworksByArtist(Long artistId) {
        return artworkRepository.findByArtistId(artistId);
    }

    @Override
    @Transactional
    public Artwork updateArtwork(Long id, ArtworkRequest request, String currentUsername) {
        Artwork existing = getArtworkById(id);
        User currentUser = userRepository.findByUsername(currentUsername)
                .or(() -> userRepository.findByEmail(currentUsername))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        if (!existing.getArtistId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to update this artwork");
        }

        existing.setTitle(request.getTitle().trim());
        existing.setDescription(request.getDescription());
        existing.setCategory(request.getCategory().trim());
        existing.setImageUrl(request.getImageUrl().trim());
        existing.setPrice(request.getPrice());
        existing.setForSale(request.isForSale());

        artworkRepository.update(existing);
        return existing;
    }

    @Override
    @Transactional
    public void deleteArtwork(Long id, String currentUsername) {
        Artwork existing = getArtworkById(id);
        User currentUser = userRepository.findByUsername(currentUsername)
                .or(() -> userRepository.findByEmail(currentUsername))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        if (!existing.getArtistId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this artwork");
        }

        artworkRepository.deleteById(id);
    }

    @Override
    public String storeArtworkImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files (JPEG, PNG, WEBP, GIF) are allowed");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        String uniqueFilename = UUID.randomUUID() + extension;
        Path destination = this.uploadLocation.resolve(uniqueFilename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image file", e);
        }

        return "/uploads/artworks/" + uniqueFilename;
    }
}
