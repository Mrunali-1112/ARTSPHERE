package com.artsphere.model.dto;

public class FeaturedArtistResponse {

    private Long id;
    private String name;
    private String profession;
    private String avatarUrl;
    private String coverImageUrl;
    private String artworkTitle;
    private String artworkCategory;
    private String location;
    private boolean connected;

    public FeaturedArtistResponse() {
    }

    public FeaturedArtistResponse(Long id, String name, String profession, String avatarUrl, String coverImageUrl, String artworkTitle, String artworkCategory, String location) {
        this.id = id;
        this.name = name;
        this.profession = profession;
        this.avatarUrl = avatarUrl;
        this.coverImageUrl = coverImageUrl;
        this.artworkTitle = artworkTitle;
        this.artworkCategory = artworkCategory;
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public String getArtworkTitle() {
        return artworkTitle;
    }

    public void setArtworkTitle(String artworkTitle) {
        this.artworkTitle = artworkTitle;
    }

    public String getArtworkCategory() {
        return artworkCategory;
    }

    public void setArtworkCategory(String artworkCategory) {
        this.artworkCategory = artworkCategory;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }
}
