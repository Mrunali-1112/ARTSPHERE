package com.artsphere.model.dto;

import com.artsphere.model.User;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String bio;
    private String profilePicture;
    private String role;
    private String location;
    private String coverImage;
    private String artistType;
    private String skills;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String username, String email, String fullName, String bio, String profilePicture, String role, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.bio = bio;
        this.profilePicture = profilePicture;
        this.role = role;
        this.createdAt = createdAt;
    }

    public static UserResponse fromUser(User user) {
        if (user == null) {
            return null;
        }
        UserResponse response = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getBio(),
                user.getProfilePicture(),
                user.getRole(),
                user.getCreatedAt()
        );
        response.setLocation(user.getLocation());
        response.setCoverImage(user.getCoverImage());
        response.setArtistType(user.getArtistType());
        response.setSkills(user.getSkills());
        return response;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getArtistType() {
        return artistType;
    }

    public void setArtistType(String artistType) {
        this.artistType = artistType;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
