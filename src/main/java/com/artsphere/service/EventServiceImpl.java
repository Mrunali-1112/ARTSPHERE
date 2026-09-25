package com.artsphere.service;

import com.artsphere.exception.ResourceNotFoundException;
import com.artsphere.model.Event;
import com.artsphere.model.dto.EventDetailResponse;
import com.artsphere.model.dto.EventResponse;
import com.artsphere.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    private static final List<String> DEFAULT_AVATARS = Arrays.asList(
            "/images/artist_profile_avatar.png",
            "/images/artist_rohan_avatar.png",
            "/images/artist_kavya_avatar.png",
            "/images/avatar_riya.png",
            "/images/avatar_sneha.png"
    );

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public List<EventResponse> getEvents(String artForm, String search, Long currentUserId) {
        Long userId = (currentUserId != null) ? currentUserId : 101L;
        List<Event> list = eventRepository.findAll(artForm, search);
        return list.stream().map(e -> mapToResponse(e, userId)).collect(Collectors.toList());
    }

    @Override
    public List<EventResponse> getFeaturedEvents(Long currentUserId) {
        Long userId = (currentUserId != null) ? currentUserId : 101L;
        List<Event> list = eventRepository.findFeatured();
        return list.stream().map(e -> mapToResponse(e, userId)).collect(Collectors.toList());
    }

    @Override
    public EventDetailResponse getEventDetails(Long id, Long currentUserId) {
        Long userId = (currentUserId != null) ? currentUserId : 101L;
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        EventDetailResponse detail = new EventDetailResponse();
        populateBase(detail, event, userId);

        detail.setWhatYoullLearn(parseLines(event.getWhatYoullLearn()));
        detail.setWhoCanJoin(event.getWhoCanJoin() != null ? event.getWhoCanJoin() : "Open to all art lovers, especially beginners! No prior experience is required.");
        detail.setThingsToBring(parseLines(event.getThingsToBring()));
        detail.setGuidelines(parseLines(event.getGuidelines()));
        detail.setQuote(event.getQuote() != null ? event.getQuote() : "Art is better when shared.");

        return detail;
    }

    @Override
    @Transactional
    public Map<String, Object> registerForEvent(Long id, Long currentUserId) {
        Long userId = (currentUserId != null) ? currentUserId : 101L;
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        boolean alreadyRegistered = eventRepository.isUserRegistered(id, userId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("eventId", id);
        resp.put("eventTitle", event.getTitle());

        if (alreadyRegistered) {
            resp.put("registered", true);
            resp.put("attendeesCount", event.getAttendeesCount() != null ? event.getAttendeesCount() : 24);
            resp.put("message", "You are already registered for this event.");
            return resp;
        }

        eventRepository.registerUser(id, userId);
        int updatedCount = (event.getAttendeesCount() != null ? event.getAttendeesCount() : 24) + 1;

        resp.put("registered", true);
        resp.put("attendeesCount", updatedCount);
        resp.put("message", "Hooray! You're all set for the " + event.getTitle() + ".");
        return resp;
    }

    @Override
    public Map<String, Object> getRegistrationStatus(Long id, Long currentUserId) {
        Long userId = (currentUserId != null) ? currentUserId : 101L;
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        boolean registered = eventRepository.isUserRegistered(id, userId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("eventId", id);
        resp.put("registered", registered);
        resp.put("attendeesCount", event.getAttendeesCount() != null ? event.getAttendeesCount() : 24);
        return resp;
    }

    private EventResponse mapToResponse(Event event, Long userId) {
        EventResponse resp = new EventResponse();
        populateBase(resp, event, userId);
        return resp;
    }

    private void populateBase(EventResponse resp, Event event, Long userId) {
        resp.setId(event.getId());
        resp.setTitle(event.getTitle());
        resp.setOrganizer(event.getOrganizer() != null ? event.getOrganizer() : "ArtSphere");
        resp.setOrganizerRole(event.getOrganizerRole() != null ? event.getOrganizerRole() : "Organizer");
        resp.setOrganizerAvatar(event.getOrganizerAvatar() != null ? event.getOrganizerAvatar() : "/images/comm_creative_souls_avatar.png");
        resp.setLocation(event.getLocation());
        resp.setVenue(event.getVenue() != null ? event.getVenue() : event.getLocation());
        resp.setEventDate(event.getEventDate());
        resp.setEventTime(event.getEventTime());
        resp.setImageUrl(event.getImageUrl() != null ? event.getImageUrl() : "/images/comm_event_watercolor.png");
        resp.setCoverImage(event.getCoverImage() != null ? event.getCoverImage() : "/images/comm_event_detail_cover.png");
        resp.setDescription(event.getDescription());
        resp.setCommunityId(event.getCommunityId());
        resp.setEventType(event.getEventType() != null ? event.getEventType() : "Workshop");
        resp.setAttendeesCount(event.getAttendeesCount() != null ? event.getAttendeesCount() : 24);
        resp.setArtForm(event.getArtForm() != null ? event.getArtForm() : "All");
        resp.setIsFeatured(event.getIsFeatured() != null ? event.getIsFeatured() : false);
        resp.setRegistered(eventRepository.isUserRegistered(event.getId(), userId));

        List<String> avatars = eventRepository.findAttendeeAvatars(event.getId());
        if (avatars == null || avatars.isEmpty()) {
            resp.setAttendeeAvatars(DEFAULT_AVATARS);
        } else {
            List<String> combined = new ArrayList<>(avatars);
            for (String def : DEFAULT_AVATARS) {
                if (combined.size() < 5 && !combined.contains(def)) {
                    combined.add(def);
                }
            }
            resp.setAttendeeAvatars(combined);
        }
    }

    private List<String> parseLines(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        return Arrays.stream(raw.split("\r?\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
