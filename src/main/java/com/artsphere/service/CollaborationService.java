package com.artsphere.service;

import com.artsphere.model.dto.*;

import java.util.List;

public interface CollaborationService {

    List<CollaborationResponse> getCollaborations(String skill, String location, String search, Long currentUserId);

    CollaborationDetailResponse getCollaborationDetails(Long id, Long currentUserId);

    CollaborationResponse createCollaboration(CollaborationCreateRequest request, Long currentUserId);

    boolean updateCollaborationStatus(Long id, String status, Long currentUserId);

    CollabRequestItemResponse sendCollaborationRequest(Long collaborationId, CollabSendRequest request, Long currentUserId);

    List<CollabRequestItemResponse> getRequests(String type, Long currentUserId);

    boolean respondToRequest(Long requestId, String status, Long currentUserId);
}