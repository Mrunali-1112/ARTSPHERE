package com.artsphere.model.dto;

import com.artsphere.model.Artwork;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ArtworkResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String imageUrl;
    private BigDecimal price;
    private boolean forSale;
    private Long artistId;
    private String artistName;
    private String artistUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ArtworkResponse() {
    }

    public ArtworkResponse(Long id, String title, String description, String category, String imageUrl,
                           BigDecimal price, boolean forSale, Long artistId, String artistName,
                           String artistUsername, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.imageUrl = imageUrl;
        this.price = price;
        this.forSale = forSale;
        this.artistId = artistId;
        this.artistName = artistName;
        this.artistUsername = artistUsername;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ArtworkResponse fromArtwork(Artwork artwork) {
        if (artwork == null) {
            return null;
        }
        return new ArtworkResponse(
                artwork.getId(),
                artwork.getTitle(),
                artwork.getDescription(),
                artwork.getCategory(),
                artwork.getImageUrl(),
                artwork.getPrice(),
                artwork.isForSale(),
                artwork.getArtistId(),
                artwork.getArtistName(),
                artwork.getArtistUsername(),
                artwork.getCreatedAt(),
                artwork.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isForSale() {
        return forSale;
    }

    public void setForSale(boolean forSale) {
        this.forSale = forSale;
    }

    public Long getArtistId() {
        return artistId;
    }

    public void setArtistId(Long artistId) {
        this.artistId = artistId;
    }

    public String getArtistName() {
        return artistName;
    }

    public void setArtistName(String artistName) {
        this.artistName = artistName;
    }

    public String getArtistUsername() {
        return artistUsername;
    }

    public void setArtistUsername(String artistUsername) {
        this.artistUsername = artistUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
