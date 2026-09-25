package com.artsphere.service;

import com.artsphere.model.dto.MyApplicationsResponse;
import com.artsphere.model.dto.MyApplicationsSummary;

public interface MyApplicationService {

    MyApplicationsResponse getMyApplications(Long userId, String category, String status);

    MyApplicationsSummary getSummary(Long userId);
}
