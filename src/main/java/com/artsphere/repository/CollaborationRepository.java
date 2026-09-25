package com.artsphere.repository;

import com.artsphere.model.Collaboration;
import com.artsphere.model.CollaborationRequest;

import java.util.List;
import java.util.Optional;

public interface CollaborationRepository {

    Collaboration save(Collaboration collaboration);

    Optional<Collaboration> findById(Long id);

    List<Collaboration> findAll(String skill, String location, String search);

    List<Collaboration> findByCreatorId(Long creatorId);

    boolean updateStatus(Long id, String status);

    // Collaboration Requests
    CollaborationRequest saveRequest(CollaborationRequest request);

    Optional<CollaborationRequest> findRequestById(Long id);

    List<CollaborationRequest> findReceivedRequests(Long userId);

    List<CollaborationRequest> findSentRequests(Long userId);

    List<CollaborationRequest> findApprovedRequests(Long userId);

    boolean updateRequestStatus(Long id, String status);

    int countRequestsForCollaboration(Long collaborationId);

    boolean hasUserRequestedCollaboration(Long collaborationId, Long userId);
}