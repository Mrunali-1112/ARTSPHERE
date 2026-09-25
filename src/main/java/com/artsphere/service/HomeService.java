package com.artsphere.service;

import com.artsphere.model.Community;
import com.artsphere.model.Event;
import com.artsphere.model.dto.FeaturedArtistResponse;

import java.util.List;

public interface HomeService {

    List<FeaturedArtistResponse> getFeaturedArtists();

    List<Event> getUpcomingEvents();

    List<Community> getCommunities();
}
