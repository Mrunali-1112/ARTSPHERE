package com.artsphere.repository;

import com.artsphere.model.Artwork;

import java.util.List;
import java.util.Optional;

public interface ArtworkRepository {

    Artwork save(Artwork artwork);

    Optional<Artwork> findById(Long id);

    List<Artwork> findAll(String category, String search);

    List<Artwork> findByArtistId(Long artistId);

    int update(Artwork artwork);

    int deleteById(Long id);

    boolean existsById(Long id);
}
