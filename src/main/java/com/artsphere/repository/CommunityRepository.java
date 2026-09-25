package com.artsphere.repository;

import com.artsphere.model.Community;
import com.artsphere.model.Event;
import com.artsphere.model.Post;
import com.artsphere.model.dto.CommunityMemberResponse;

import java.util.List;
import java.util.Optional;

public interface CommunityRepository {

    List<Community> findAll(String category, String search);

    Optional<Community> findById(Long id);

    Optional<Community> findFeatured();

    boolean isMember(Long communityId, Long userId);

    String getMemberRole(Long communityId, Long userId);

    boolean addMember(Long communityId, Long userId, String role);

    boolean removeMember(Long communityId, Long userId);

    List<CommunityMemberResponse> findMembers(Long communityId);

    int countMembers(Long communityId);

    int countPosts(Long communityId);

    int countEvents(Long communityId);

    List<Post> findCommunityPosts(Long communityId, String category);

    List<Event> findCommunityEvents(Long communityId, String eventType);

    boolean isEventRegistered(Long eventId, Long userId);

    boolean registerEvent(Long eventId, Long userId);

    Community save(Community community);
}
