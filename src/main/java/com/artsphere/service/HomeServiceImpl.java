package com.artsphere.service;

import com.artsphere.model.Community;
import com.artsphere.model.Event;
import com.artsphere.model.dto.FeaturedArtistResponse;
import com.artsphere.repository.HomeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HomeServiceImpl implements HomeService {

    private final HomeRepository homeRepository;

    public HomeServiceImpl(HomeRepository homeRepository) {
        this.homeRepository = homeRepository;
    }

    @Override
    public List<FeaturedArtistResponse> getFeaturedArtists() {
        return homeRepository.findFeaturedArtists();
    }

    @Override
    public List<Event> getUpcomingEvents() {
        return homeRepository.findUpcomingEvents();
    }

    @Override
    public List<Community> getCommunities() {
        return homeRepository.findCommunities();
    }
}
