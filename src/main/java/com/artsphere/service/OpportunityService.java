package com.artsphere.service;

import com.artsphere.model.dto.OpportunityDetailResponse;
import com.artsphere.model.dto.OpportunityResponse;

import java.util.List;

public interface OpportunityService {

    List<OpportunityResponse> getOpportunities(String category, String location, String search);

    OpportunityDetailResponse getOpportunityDetails(Long id, Long currentUserId);

    OpportunityResponse getFeaturedOpportunity();

    boolean applyToOpportunity(Long opportunityId, Long userId, String notes);
}
