package com.artsphere.model.dto;

public class CollaborationDetailResponse extends CollaborationResponse {

    private String creatorBio;
    private int requestsCount;
    private boolean userHasRequested;

    public CollaborationDetailResponse() {
        super();
    }

    public String getCreatorBio() { return creatorBio; }
    public void setCreatorBio(String creatorBio) { this.creatorBio = creatorBio; }

    public int getRequestsCount() { return requestsCount; }
    public void setRequestsCount(int requestsCount) { this.requestsCount = requestsCount; }

    public boolean isUserHasRequested() { return userHasRequested; }
    public void setUserHasRequested(boolean userHasRequested) { this.userHasRequested = userHasRequested; }
}