package com.artsphere.model.dto;

public class CommunityResponse {

    private Long id;
    private String name;
    private String description;
    private Integer memberCount;
    private String category;
    private String imageUrl;
    private String coverImage;
    private String location;
    private String artForms;
    private Boolean isFeatured;
    private boolean joined;
    private String memberRole;

    public CommunityResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getArtForms() { return artForms; }
    public void setArtForms(String artForms) { this.artForms = artForms; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public boolean isJoined() { return joined; }
    public void setJoined(boolean joined) { this.joined = joined; }

    public String getMemberRole() { return memberRole; }
    public void setMemberRole(String memberRole) { this.memberRole = memberRole; }
}
