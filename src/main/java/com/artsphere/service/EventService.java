package com.artsphere.service;

import com.artsphere.model.dto.EventDetailResponse;
import com.artsphere.model.dto.EventResponse;

import java.util.List;
import java.util.Map;

public interface EventService {

    List<EventResponse> getEvents(String artForm, String search, Long currentUserId);

    List<EventResponse> getFeaturedEvents(Long currentUserId);

    EventDetailResponse getEventDetails(Long id, Long currentUserId);

    Map<String, Object> registerForEvent(Long id, Long currentUserId);

    Map<String, Object> getRegistrationStatus(Long id, Long currentUserId);
}
