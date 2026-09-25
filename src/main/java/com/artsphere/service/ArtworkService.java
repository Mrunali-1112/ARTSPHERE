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

    List<Artwork> getPortfolioByArtist(Long artistId, String category);

    Artwork createPortfolioItem(ArtworkRequest request, String currentUsername);

    Artwork updatePortfolioItem(Long id, ArtworkRequest request, String currentUsername);

    void deletePortfolioItem(Long id, String currentUsername);

    Artwork updateArtwork(Long id, ArtworkRequest request, String currentUsername);

    void deleteArtwork(Long id, String currentUsername);

    String storeArtworkImage(MultipartFile file);
}
