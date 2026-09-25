package com.artsphere.model.dto;

import java.util.List;

public class ArtistProfileResponse {

    private Long id;
    private String username;
    private String fullName;
    private String artistType;
    private String location;
    private String bio;
    private String profilePicture;
    private String coverImage;
    private List<String> skills;
    private Integer postsCount;
    private String followersCount;
    private Integer followingCount;
    private boolean following;
    private String instagramUrl;
    private String behanceUrl;
    private String websiteUrl;
    private List<ArtworkResponse> portfolio;

    public ArtistProfileResponse() {
    }

    public ArtistProfileResponse(Long id, String username, String fullName, String artistType, String location,
                                 String bio, String profilePicture, String coverImage, List<String> skills,
                                 Integer postsCount, String followersCount, Integer followingCount,
                                 boolean following, String instagramUrl, String behanceUrl, String websiteUrl,
                                 List<ArtworkResponse> portfolio) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.artistType = artistType;
        this.location = location;
        this.bio = bio;
        this.profilePicture = profilePicture;
        this.coverImage = coverImage;
        this.skills = skills;
        this.postsCount = postsCount;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.following = following;
        this.instagramUrl = instagramUrl;
        this.behanceUrl = behanceUrl;
        this.websiteUrl = websiteUrl;
        this.portfolio = portfolio;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getArtistType() {
        return artistType;
    }

    public void setArtistType(String artistType) {
        this.artistType = artistType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public Integer getPostsCount() {
        return postsCount;
    }

    public void setPostsCount(Integer postsCount) {
        this.postsCount = postsCount;
    }

    public String getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(String followersCount) {
        this.followersCount = followersCount;
    }

    public Integer getFollowingCount() {
        return followingCount;
    }

    public void setFollowingCount(Integer followingCount) {
        this.followingCount = followingCount;
    }

    public boolean isFollowing() {
        return following;
    }

    public void setFollowing(boolean following) {
        this.following = following;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(String instagramUrl) {
        this.instagramUrl = instagramUrl;
    }

    public String getBehanceUrl() {
        return behanceUrl;
    }

    public void setBehanceUrl(String behanceUrl) {
        this.behanceUrl = behanceUrl;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public List<ArtworkResponse> getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(List<ArtworkResponse> portfolio) {
        this.portfolio = portfolio;
    }
}
