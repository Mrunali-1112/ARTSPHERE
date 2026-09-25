package com.artsphere.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ArtistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve all artists for discover page")
    void testGetArtists() throws Exception {
        mockMvc.perform(get("/api/artists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should filter artists by artForm")
    void testFilterArtistsByArtForm() throws Exception {
        mockMvc.perform(get("/api/artists?artForm=Music"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Rohan Mehta"));
    }

    @Test
    @DisplayName("Should filter artists by location")
    void testFilterArtistsByLocation() throws Exception {
        mockMvc.perform(get("/api/artists?location=Pune"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Rohan Mehta"));
    }

    @Test
    @DisplayName("Should search artists by query")
    void testSearchArtists() throws Exception {
        mockMvc.perform(get("/api/artists/search?q=Aanya"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name", org.hamcrest.Matchers.containsString("Aanya")));
    }

    @Test
    @DisplayName("Should retrieve featured artists")
    void testGetFeaturedArtists() throws Exception {
        mockMvc.perform(get("/api/artists/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should retrieve artists near you")
    void testGetArtistsNearYou() throws Exception {
        mockMvc.perform(get("/api/artists/near-you"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should toggle connect status with an artist")
    void testConnectArtist() throws Exception {
        mockMvc.perform(post("/api/artists/102/connect"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.artistId").value(102))
                .andExpect(jsonPath("$.data.connected").value(true));
    }

    @Test
    @DisplayName("Should retrieve artist profile by id")
    void testGetArtistProfile() throws Exception {
        mockMvc.perform(get("/api/artists/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(101))
                .andExpect(jsonPath("$.data.fullName", org.hamcrest.Matchers.containsString("Aanya")))
                .andExpect(jsonPath("$.data.skills").isArray())
                .andExpect(jsonPath("$.data.followersCount").exists());
    }

    @Test
    @DisplayName("Should retrieve artist portfolio by artist id")
    void testGetArtistPortfolio() throws Exception {
        mockMvc.perform(get("/api/artists/101/portfolio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should toggle follow status with an artist")
    void testFollowArtist() throws Exception {
        mockMvc.perform(post("/api/artists/101/follow"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.artistId").value(101))
                .andExpect(jsonPath("$.data.following").exists());
    }
}
