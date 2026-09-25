package com.artsphere.service;

import com.artsphere.exception.ResourceNotFoundException;
import com.artsphere.model.Collaboration;
import com.artsphere.model.CollaborationRequest;
import com.artsphere.model.User;
import com.artsphere.model.dto.*;
import com.artsphere.repository.CollaborationRepository;
import com.artsphere.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CollaborationServiceImpl implements CollaborationService {

    private final CollaborationRepository collaborationRepository;
    private final UserRepository userRepository;

    public CollaborationServiceImpl(CollaborationRepository collaborationRepository, UserRepository userRepository) {
        this.collaborationRepository = collaborationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<CollaborationResponse> getCollaborations(String skill, String location, String search, Long currentUserId) {
        List<Collaboration> list = collaborationRepository.findAll(skill, location, search);
        return list.stream()
                .map(c -> mapToResponse(c, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public CollaborationDetailResponse getCollaborationDetails(Long id, Long currentUserId) {
        Collaboration c = collaborationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collaboration not found with id: " + id));

        CollaborationDetailResponse detail = new CollaborationDetailResponse();
        populateBaseResponse(detail, c, currentUserId);

        userRepository.findById(c.getCreatorId()).ifPresent(user -> {
            detail.setCreatorBio(user.getBio());
        });

        detail.setRequestsCount(collaborationRepository.countRequestsForCollaboration(id));
        detail.setUserHasRequested(collaborationRepository.hasUserRequestedCollaboration(id, currentUserId));

        return detail;
    }

    @Override
    @Transactional
    public CollaborationResponse createCollaboration(CollaborationCreateRequest request, Long currentUserId) {
        Long creatorId = currentUserId != null ? currentUserId : 101L;

        Collaboration c = new Collaboration();
        c.setCreatorId(creatorId);
        c.setTitle(request.getTitle().trim());
        c.setDescription(request.getDescription().trim());
        c.setPurpose(request.getPurpose() != null && !request.getPurpose().isBlank() ? request.getPurpose().trim() : "Work on a Project");
        c.setSkills(request.getSkills() != null ? request.getSkills().trim() : "");
        c.setTags(request.getTags() != null ? request.getTags().trim() : "");
        c.setLocation(request.getLocation() != null && !request.getLocation().isBlank() ? request.getLocation().trim() : "Mumbai, MH");
        c.setCollaborationType(request.getCollaborationType() != null && !request.getCollaborationType().isBlank() ? request.getCollaborationType().trim() : "Short Film");
        c.setAvailability(request.getAvailability() != null && !request.getAvailability().isBlank() ? request.getAvailability().trim() : "Flexible");
        c.setPeopleNeeded(request.getPeopleNeeded() != null && !request.getPeopleNeeded().isBlank() ? request.getPeopleNeeded().trim() : "1-2 collaborators");
        c.setReferenceUrl(request.getReferenceUrl() != null ? request.getReferenceUrl().trim() : "");
        c.setStatus("OPEN");
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());

        Collaboration saved = collaborationRepository.save(c);
        return mapToResponse(saved, creatorId);
    }

    @Override
    public boolean updateCollaborationStatus(Long id, String status, Long currentUserId) {
        Collaboration c = collaborationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collaboration not found with id: " + id));
        return collaborationRepository.updateStatus(id, status);
    }

    @Override
    @Transactional
    public CollabRequestItemResponse sendCollaborationRequest(Long collaborationId, CollabSendRequest request, Long currentUserId) {
        Long senderId = currentUserId != null ? currentUserId : 101L;
        Long targetCollabId = collaborationId != null ? collaborationId : request.getCollaborationId();
        Long receiverId = request.getReceiverId();

        if (targetCollabId != null) {
            Collaboration c = collaborationRepository.findById(targetCollabId)
                    .orElseThrow(() -> new ResourceNotFoundException("Collaboration post not found with id: " + targetCollabId));
            if (receiverId == null) {
                receiverId = c.getCreatorId();
            }
        }

        if (receiverId == null) {
            receiverId = 101L;
        }

        CollaborationRequest req = new CollaborationRequest();
        req.setCollaborationId(targetCollabId);
        req.setSenderId(senderId);
        req.setReceiverId(receiverId);
        req.setMessage(request.getMessage() != null ? request.getMessage().trim() : "Let's collaborate!");
        req.setStatus("PENDING");
        req.setCreatedAt(LocalDateTime.now());
        req.setUpdatedAt(LocalDateTime.now());

        CollaborationRequest saved = collaborationRepository.saveRequest(req);
        return mapToItemResponse(saved);
    }

    @Override
    public List<CollabRequestItemResponse> getRequests(String type, Long currentUserId) {
        Long userId = currentUserId != null ? currentUserId : 101L;
        String filter = type != null ? type.toLowerCase().trim() : "received";

        List<CollaborationRequest> raw;
        if ("sent".equals(filter)) {
            raw = collaborationRepository.findSentRequests(userId);
        } else if ("approved".equals(filter)) {
            raw = collaborationRepository.findApprovedRequests(userId);
        } else {
            raw = collaborationRepository.findReceivedRequests(userId);
        }

        return raw.stream().map(this::mapToItemResponse).collect(Collectors.toList());
    }

    @Override
    public boolean respondToRequest(Long requestId, String status, Long currentUserId) {
        CollaborationRequest req = collaborationRepository.findRequestById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + requestId));
        String newStatus = "APPROVED".equalsIgnoreCase(status) ? "APPROVED" : "REJECTED";
        return collaborationRepository.updateRequestStatus(requestId, newStatus);
    }

    private CollaborationResponse mapToResponse(Collaboration c, Long currentUserId) {
        CollaborationResponse resp = new CollaborationResponse();
        populateBaseResponse(resp, c, currentUserId);
        return resp;
    }

    private void populateBaseResponse(CollaborationResponse resp, Collaboration c, Long currentUserId) {
        resp.setId(c.getId());
        resp.setCreatorId(c.getCreatorId());
        resp.setTitle(c.getTitle());
        resp.setDescription(c.getDescription());
        resp.setPurpose(c.getPurpose());
        resp.setLocation(c.getLocation());
        resp.setCollaborationType(c.getCollaborationType());
        resp.setAvailability(c.getAvailability());
        resp.setPeopleNeeded(c.getPeopleNeeded());
        resp.setReferenceUrl(c.getReferenceUrl());
        resp.setStatus(c.getStatus());
        resp.setTimeAgo(formatTimeAgo(c.getCreatedAt()));
        resp.setCreatedAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : "");

        boolean own = currentUserId != null && currentUserId.equals(c.getCreatorId());
        resp.setOwnPost(own);

        // Parse skills
        List<String> skillList = new ArrayList<>();
        if (c.getSkills() != null && !c.getSkills().isBlank()) {
            for (String s : c.getSkills().split(",")) {
                String trimmed = s.trim();
                if (!trimmed.isEmpty()) {
                    skillList.add(trimmed);
                }
            }
        }
        resp.setSkills(skillList);

        // Parse tags
        List<String> tagList = new ArrayList<>();
        if (c.getTags() != null && !c.getTags().isBlank()) {
            for (String t : c.getTags().split("[, ]+")) {
                String clean = t.trim();
                if (!clean.isEmpty()) {
                    if (!clean.startsWith("#")) {
                        clean = "#" + clean;
                    }
                    tagList.add(clean);
                }
            }
        }
        resp.setTags(tagList);

        // Creator details
        userRepository.findById(c.getCreatorId()).ifPresentOrElse(u -> {
            resp.setCreatorName(u.getFullName());
            resp.setCreatorUsername(u.getUsername());
            resp.setCreatorAvatar(u.getProfilePicture() != null ? u.getProfilePicture() : "/images/avatar_creator_mrunali.png");
            resp.setCreatorArtistType(u.getArtistType() != null ? u.getArtistType() : "Creator");
            resp.setCreatorLocation(u.getLocation() != null ? u.getLocation() : c.getLocation());
        }, () -> {
            resp.setCreatorName("Mrunali S.");
            resp.setCreatorUsername("mrunali");
            resp.setCreatorAvatar("/images/avatar_creator_mrunali.png");
            resp.setCreatorArtistType("Digital Artist & Animator");
            resp.setCreatorLocation(c.getLocation() != null ? c.getLocation() : "Mumbai, MH");
        });
    }

    private CollabRequestItemResponse mapToItemResponse(CollaborationRequest req) {
        CollabRequestItemResponse item = new CollabRequestItemResponse();
        item.setId(req.getId());
        item.setCollaborationId(req.getCollaborationId());
        item.setSenderId(req.getSenderId());
        item.setReceiverId(req.getReceiverId());
        item.setMessage(req.getMessage());
        item.setStatus(req.getStatus());
        item.setTimeAgo(formatTimeAgo(req.getCreatedAt()));
        item.setCreatedAt(req.getCreatedAt() != null ? req.getCreatedAt().toString() : "");

        if (req.getCollaborationId() != null) {
            collaborationRepository.findById(req.getCollaborationId()).ifPresent(c -> {
                item.setCollaborationTitle(c.getTitle());
            });
        }

        userRepository.findById(req.getSenderId()).ifPresent(s -> {
            item.setSenderName(s.getFullName());
            item.setSenderUsername(s.getUsername());
            item.setSenderAvatar(s.getProfilePicture() != null ? s.getProfilePicture() : "/images/user_avatar_nav.png");
            item.setSenderArtistType(s.getArtistType() != null ? s.getArtistType() : "Artist");
            item.setSenderLocation(s.getLocation() != null ? s.getLocation() : "Mumbai, MH");
        });

        userRepository.findById(req.getReceiverId()).ifPresent(r -> {
            item.setReceiverName(r.getFullName());
            item.setReceiverUsername(r.getUsername());
            item.setReceiverAvatar(r.getProfilePicture() != null ? r.getProfilePicture() : "/images/user_avatar_nav.png");
            item.setReceiverArtistType(r.getArtistType() != null ? r.getArtistType() : "Artist");
            item.setReceiverLocation(r.getLocation() != null ? r.getLocation() : "Mumbai, MH");
        });

        return item;
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        if (days < 7) return days + "d ago";
        return (days / 7) + "w ago";
    }
}
