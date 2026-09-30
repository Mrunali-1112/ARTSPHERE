package com.artsphere.service;

import com.artsphere.exception.ResourceNotFoundException;
import com.artsphere.model.Opportunity;
import com.artsphere.model.dto.OpportunityDetailResponse;
import com.artsphere.model.dto.OpportunityResponse;
import com.artsphere.repository.OpportunityRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OpportunityServiceImpl implements OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final NotificationService notificationService;

    public OpportunityServiceImpl(OpportunityRepository opportunityRepository, NotificationService notificationService) {
        this.opportunityRepository = opportunityRepository;
        this.notificationService = notificationService;
    }

    @Override
    public List<OpportunityResponse> getOpportunities(String category, String location, String search) {
        List<Opportunity> opps = opportunityRepository.findAll(category, location, search);
        return opps.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public OpportunityDetailResponse getOpportunityDetails(Long id, Long currentUserId) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));

        OpportunityDetailResponse detail = new OpportunityDetailResponse();
        detail.setId(opp.getId());
        detail.setTitle(opp.getTitle());
        detail.setSubtitle(opp.getSubtitle());
        detail.setDescription(opp.getDescription());
        detail.setCategory(opp.getCategory());
        detail.setArtCategory(opp.getArtCategory());
        detail.setOrganizer(opp.getOrganizer());
        detail.setOrganizerType(opp.getOrganizerType() != null ? opp.getOrganizerType() : "Organization");
        detail.setOrganizerAvatar(opp.getOrganizerAvatar() != null ? opp.getOrganizerAvatar() : "/images/organizer_mgm.png");
        detail.setLocation(opp.getLocation());
        detail.setDaysLeft(opp.getDaysLeft());
        detail.setDeadline(opp.getDeadline());
        detail.setDuration(opp.getDuration() != null ? opp.getDuration() : "1 Day");
        detail.setImageUrl(opp.getImageUrl());
        detail.setFeatured(opp.isFeatured());
        detail.setQuoteText(opp.getQuoteText());
        detail.setQuoteAuthor(opp.getQuoteAuthor());

        if (opp.getRequirements() != null && !opp.getRequirements().trim().isEmpty()) {
            detail.setWhoCanApply(Arrays.stream(opp.getRequirements().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList()));
        } else {
            detail.setWhoCanApply(new ArrayList<>());
        }

        if (opp.getBenefits() != null && !opp.getBenefits().trim().isEmpty()) {
            detail.setWhatYouGet(Arrays.stream(opp.getBenefits().split(";"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList()));
        } else {
            detail.setWhatYouGet(new ArrayList<>());
        }

        if (currentUserId != null) {
            detail.setHasApplied(opportunityRepository.hasUserApplied(currentUserId, id));
        } else {
            detail.setHasApplied(false);
        }

        return detail;
    }

    @Override
    public OpportunityResponse getFeaturedOpportunity() {
        return opportunityRepository.findFeatured()
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    public boolean applyToOpportunity(Long opportunityId, Long userId, String notes) {
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + opportunityId));

        if (!"OPEN".equalsIgnoreCase(opp.getStatus())) {
            throw new IllegalArgumentException("This opportunity is no longer open for applications");
        }

        if (opportunityRepository.hasUserApplied(userId, opportunityId)) {
            throw new IllegalArgumentException("You have already applied for this opportunity");
        }

        int inserted = opportunityRepository.apply(userId, opportunityId, notes);
        if (inserted > 0 && notificationService != null) {
            notificationService.createNotification(
                    userId,
                    "OPPORTUNITY",
                    "Application submitted: " + opp.getTitle(),
                    "Your application has been received for " + opp.getTitle() + ".",
                    null,
                    opp.getOrganizer() != null ? opp.getOrganizer() : "ArtSphere Opportunities",
                    opp.getOrganizerAvatar() != null ? opp.getOrganizerAvatar() : "/images/comm_creative_souls_avatar.png",
                    "OPPORTUNITY",
                    opp.getId(),
                    "/pages/my-applications.html"
            );
        }
        return inserted > 0;
    }

    private OpportunityResponse mapToResponse(Opportunity opp) {
        OpportunityResponse resp = new OpportunityResponse();
        resp.setId(opp.getId());
        resp.setTitle(opp.getTitle());
        resp.setSubtitle(opp.getSubtitle());
        resp.setDescription(opp.getDescription());
        resp.setCategory(opp.getCategory());
        resp.setArtCategory(opp.getArtCategory());
        resp.setOrganizer(opp.getOrganizer());
        resp.setOrganizerAvatar(opp.getOrganizerAvatar());
        resp.setLocation(opp.getLocation());
        resp.setDaysLeft(opp.getDaysLeft());
        resp.setDeadline(opp.getDeadline());
        resp.setDuration(opp.getDuration());
        resp.setImageUrl(opp.getImageUrl());
        resp.setFeatured(opp.isFeatured());
        resp.setBookmarked(false);
        return resp;
    }
}
