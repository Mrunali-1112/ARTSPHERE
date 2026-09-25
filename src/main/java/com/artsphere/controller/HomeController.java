package com.artsphere.controller;

import com.artsphere.model.Community;
import com.artsphere.model.Event;
import com.artsphere.model.dto.ApiResponse;
import com.artsphere.model.dto.FeaturedArtistResponse;
import com.artsphere.service.HomeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @GetMapping("/featured-artists")
    public ResponseEntity<ApiResponse<List<FeaturedArtistResponse>>> getFeaturedArtists() {
        List<FeaturedArtistResponse> artists = homeService.getFeaturedArtists();
        return ResponseEntity.ok(ApiResponse.success("Featured artists retrieved successfully", artists));
    }

    @GetMapping("/upcoming-events")
    public ResponseEntity<ApiResponse<List<Event>>> getUpcomingEvents() {
        List<Event> events = homeService.getUpcomingEvents();
        return ResponseEntity.ok(ApiResponse.success("Upcoming events retrieved successfully", events));
    }

    @GetMapping("/communities")
    public ResponseEntity<ApiResponse<List<Community>>> getCommunities() {
        List<Community> communities = homeService.getCommunities();
        return ResponseEntity.ok(ApiResponse.success("Communities retrieved successfully", communities));
    }
}
