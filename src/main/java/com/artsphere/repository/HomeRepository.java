package com.artsphere.repository;

import com.artsphere.model.Community;
import com.artsphere.model.Event;
import com.artsphere.model.dto.FeaturedArtistResponse;

import java.util.List;

public interface HomeRepository {

    List<FeaturedArtistResponse> findFeaturedArtists();

    List<Event> findUpcomingEvents();

    List<Community> findCommunities();
}
