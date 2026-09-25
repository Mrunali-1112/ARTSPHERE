package com.artsphere.service;

import com.artsphere.model.dto.*;

import java.util.List;
import java.util.Map;

public interface CommunityService {

    List<CommunityResponse> getCommunities(String category, String search, Long currentUserId);

    CommunityDetailResponse getCommunityDetails(Long id, Long currentUserId);

    Map<String, Object> joinCommunity(Long id, Long currentUserId);

    Map<String, Object> leaveCommunity(Long id, Long currentUserId);

    List<CommunityMemberResponse> getCommunityMembers(Long id);

    List<PostResponse> getCommunityPosts(Long id, String category, Long currentUserId);

    PostResponse createCommunityPost(Long id, CommunityPostCreateRequest request, Long currentUserId);

    List<CommunityEventResponse> getCommunityEvents(Long id, String type, Long currentUserId);

    Map<String, Object> registerForEvent(Long eventId, Long currentUserId);

    CommunityResponse createCommunity(Map<String, String> request, Long currentUserId);
}
