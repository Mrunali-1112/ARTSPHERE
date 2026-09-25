package com.artsphere.repository;

import com.artsphere.model.dto.MyApplicationItemResponse;
import java.util.List;

public interface MyApplicationRepository {

    List<MyApplicationItemResponse> findEventRegistrationsByUserId(Long userId);

    List<MyApplicationItemResponse> findCollaborationRequestsByUserId(Long userId);

    List<MyApplicationItemResponse> findOpportunityApplicationsByUserId(Long userId);

    List<MyApplicationItemResponse> findAllByUserId(Long userId);
}
