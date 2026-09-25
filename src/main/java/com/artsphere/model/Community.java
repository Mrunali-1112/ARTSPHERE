package com.artsphere.model;

import java.time.LocalDateTime;

public class Community {

    private Long id;
    private String name;
    private String description;
    private Integer memberCount;
    private String category;
    private String imageUrl;
    private LocalDateTime createdAt;

    public Community() {
    }

    public Community(Long id, String name, String description, Integer memberCount, String category, String imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.memberCount = memberCount;
        this.category = category;
        this.imageUrl = imageUrl;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
