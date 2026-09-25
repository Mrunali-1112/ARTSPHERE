package com.artsphere.service;

import com.artsphere.model.dto.MyApplicationItemResponse;
import com.artsphere.model.dto.MyApplicationsResponse;
import com.artsphere.model.dto.MyApplicationsSummary;
import com.artsphere.repository.MyApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MyApplicationServiceImpl implements MyApplicationService {

    private final MyApplicationRepository myApplicationRepository;

    public MyApplicationServiceImpl(MyApplicationRepository myApplicationRepository) {
        this.myApplicationRepository = myApplicationRepository;
    }

    @Override
    public MyApplicationsResponse getMyApplications(Long userId, String category, String status) {
        Long targetUserId = (userId != null) ? userId : 101L;

        List<MyApplicationItemResponse> events = myApplicationRepository.findEventRegistrationsByUserId(targetUserId);
        List<MyApplicationItemResponse> collabs = myApplicationRepository.findCollaborationRequestsByUserId(targetUserId);
        List<MyApplicationItemResponse> opps = myApplicationRepository.findOpportunityApplicationsByUserId(targetUserId);

        List<MyApplicationItemResponse> all = new ArrayList<>();
        all.addAll(events);
        all.addAll(collabs);
        all.addAll(opps);

        int totalCount = all.size();
        int eventsCount = events.size();
        int collabsCount = collabs.size();
        int oppsCount = opps.size();

        int upcomingCount = 0;
        int acceptedCount = 0;
        int pendingCount = 0;
        int rejectedCount = 0;

        for (MyApplicationItemResponse item : all) {
            String group = item.getStatusGroup();
            if ("UPCOMING".equalsIgnoreCase(group)) {
                upcomingCount++;
            } else if ("ACCEPTED".equalsIgnoreCase(group)) {
                acceptedCount++;
            } else if ("PENDING".equalsIgnoreCase(group)) {
                pendingCount++;
            } else if ("REJECTED".equalsIgnoreCase(group)) {
                rejectedCount++;
            }
        }

        MyApplicationsSummary summary = new MyApplicationsSummary(
                totalCount, eventsCount, collabsCount, oppsCount,
                upcomingCount, acceptedCount, pendingCount, rejectedCount
        );

        List<MyApplicationItemResponse> filtered;
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            String catUpper = category.trim().toUpperCase();
            if (catUpper.startsWith("EVENT")) {
                filtered = new ArrayList<>(events);
            } else if (catUpper.startsWith("COLLAB")) {
                filtered = new ArrayList<>(collabs);
            } else if (catUpper.startsWith("OPP")) {
                filtered = new ArrayList<>(opps);
            } else {
                filtered = new ArrayList<>(all);
            }
        } else {
            filtered = new ArrayList<>(all);
        }

        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            String statUpper = status.trim().toUpperCase();
            filtered = filtered.stream()
                    .filter(item -> statUpper.equalsIgnoreCase(item.getStatusGroup())
                            || statUpper.equalsIgnoreCase(item.getStatus()))
                    .toList();
        }

        return new MyApplicationsResponse(summary, filtered);
    }

    @Override
    public MyApplicationsSummary getSummary(Long userId) {
        return getMyApplications(userId, "ALL", "ALL").getSummary();
    }
}
