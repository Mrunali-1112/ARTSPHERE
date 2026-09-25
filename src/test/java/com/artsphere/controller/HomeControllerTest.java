package com.artsphere.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class HomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve featured artists for home page")
    void testGetFeaturedArtists() throws Exception {
        mockMvc.perform(get("/api/home/featured-artists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Aanya Deshmukh"))
                .andExpect(jsonPath("$.data[0].profession").value("Visual Artist"))
                .andExpect(jsonPath("$.data[0].coverImageUrl").value("/images/artist_aanya_cover.png"));
    }

    @Test
    @DisplayName("Should retrieve upcoming events for home page")
    void testGetUpcomingEvents() throws Exception {
        mockMvc.perform(get("/api/home/upcoming-events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("Watercolor Workshop"))
                .andExpect(jsonPath("$.data[0].location").value("ArtHouse, Mumbai"))
                .andExpect(jsonPath("$.data[0].eventDate").value("25 SEP"));
    }

    @Test
    @DisplayName("Should retrieve communities for home page")
    void testGetCommunities() throws Exception {
        mockMvc.perform(get("/api/home/communities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Let's Create Together"));
    }
}
