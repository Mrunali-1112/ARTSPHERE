package com.artsphere.service;

import com.artsphere.model.dto.DiscoverArtistResponse;

import java.util.List;

public interface DiscoverService {

    List<DiscoverArtistResponse> getArtists(String artForm, String location, String search);

    List<DiscoverArtistResponse> getFeaturedArtists();

    List<DiscoverArtistResponse> getArtistsNearYou();

    boolean toggleConnection(String currentUsername, Long artistId);

    com.artsphere.model.dto.ArtistProfileResponse getArtistProfile(Long id, String currentUsername);

    boolean toggleFollow(String currentUsername, Long artistId);
}
