package com.artsphere.repository;

import com.artsphere.model.Opportunity;

import java.util.List;
import java.util.Optional;

public interface OpportunityRepository {

    List<Opportunity> findAll(String category, String location, String search);

    Optional<Opportunity> findById(Long id);

    Optional<Opportunity> findFeatured();

    boolean hasUserApplied(Long userId, Long opportunityId);

    int apply(Long userId, Long opportunityId, String notes);
}
