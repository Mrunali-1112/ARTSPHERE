package com.artsphere.model.dto;

import java.util.List;

public class MyApplicationsResponse {

    private MyApplicationsSummary summary;
    private List<MyApplicationItemResponse> applications;

    public MyApplicationsResponse() {
    }

    public MyApplicationsResponse(MyApplicationsSummary summary, List<MyApplicationItemResponse> applications) {
        this.summary = summary;
        this.applications = applications;
    }

    public MyApplicationsSummary getSummary() {
        return summary;
    }

    public void setSummary(MyApplicationsSummary summary) {
        this.summary = summary;
    }

    public List<MyApplicationItemResponse> getApplications() {
        return applications;
    }

    public void setApplications(List<MyApplicationItemResponse> applications) {
        this.applications = applications;
    }
}
