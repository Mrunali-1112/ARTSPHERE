package com.artsphere.service;

import com.artsphere.model.Artwork;
import com.artsphere.model.dto.ArtworkRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ArtworkService {

    Artwork createArtwork(ArtworkRequest request, String currentUsername);

    Artwork getArtworkById(Long id);

    List<Artwork> getFeed(String category, String search);

    List<Artwork> getArtworksByArtist(Long artistId);

    Artwork updateArtwork(Long id, ArtworkRequest request, String currentUsername);

    void deleteArtwork(Long id, String currentUsername);

    String storeArtworkImage(MultipartFile file);
}
