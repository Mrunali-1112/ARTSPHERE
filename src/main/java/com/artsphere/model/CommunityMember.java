package com.artsphere.model;

import java.time.LocalDateTime;

public class CommunityMember {

    private Long id;
    private Long communityId;
    private Long userId;
    private String role;
    private LocalDateTime joinedAt;

    public CommunityMember() {}

    public CommunityMember(Long id, Long communityId, Long userId, String role, LocalDateTime joinedAt) {
        this.id = id;
        this.communityId = communityId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}

