package com.artsphere.model.dto;

import java.util.List;

public class CommunityDetailResponse extends CommunityResponse {

    private String rules;
    private String createdDate;
    private Long ownerId;
    private String ownerName;
    private String ownerUsername;
    private String ownerAvatar;
    private Integer postsCount;
    private Integer eventsCount;
    private List<CommunityMemberResponse> topMembers;
    private List<ArtworkResponse> featuredWorks;

    public CommunityDetailResponse() {}

    public String getRules() { return rules; }
    public void setRules(String rules) { this.rules = rules; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getOwnerUsername() { return ownerUsername; }
    public void setOwnerUsername(String ownerUsername) { this.ownerUsername = ownerUsername; }

    public String getOwnerAvatar() { return ownerAvatar; }
    public void setOwnerAvatar(String ownerAvatar) { this.ownerAvatar = ownerAvatar; }

    public Integer getPostsCount() { return postsCount; }
    public void setPostsCount(Integer postsCount) { this.postsCount = postsCount; }

    public Integer getEventsCount() { return eventsCount; }
    public void setEventsCount(Integer eventsCount) { this.eventsCount = eventsCount; }

    public List<CommunityMemberResponse> getTopMembers() { return topMembers; }
    public void setTopMembers(List<CommunityMemberResponse> topMembers) { this.topMembers = topMembers; }

    public List<ArtworkResponse> getFeaturedWorks() { return featuredWorks; }
    public void setFeaturedWorks(List<ArtworkResponse> featuredWorks) { this.featuredWorks = featuredWorks; }
}

