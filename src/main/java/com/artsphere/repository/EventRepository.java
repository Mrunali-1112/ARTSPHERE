package com.artsphere.repository;

import com.artsphere.model.Event;

import java.util.List;
import java.util.Optional;

public interface EventRepository {

    List<Event> findAll(String artForm, String search);

    List<Event> findFeatured();

    Optional<Event> findById(Long id);

    boolean isUserRegistered(Long eventId, Long userId);

    boolean registerUser(Long eventId, Long userId);

    int countRegistrations(Long eventId);

    List<String> findAttendeeAvatars(Long eventId);
}
