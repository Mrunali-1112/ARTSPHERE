package com.artsphere.repository;

import com.artsphere.model.dto.DiscoverArtistResponse;

import java.util.List;

public interface DiscoverRepository {

    List<DiscoverArtistResponse> findArtists(String artForm, String location, String search);

    List<DiscoverArtistResponse> findFeaturedArtists();

    List<DiscoverArtistResponse> findArtistsNearYou();

    boolean toggleConnection(Long userId, Long artistId);

    boolean isConnected(Long userId, Long artistId);
}
