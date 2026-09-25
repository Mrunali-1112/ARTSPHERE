package com.artsphere.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should retrieve portfolio items for artist")
    void testGetPortfolio() throws Exception {
        mockMvc.perform(get("/api/portfolio/artist/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should create, update, and delete a portfolio item")
    void testPortfolioLifecycle() throws Exception {
        // 1. Create Portfolio Item
        Map<String, Object> createReq = Map.of(
                "title", "Mystic Dawn",
                "category", "Digital Art",
                "imageUrl", "/images/artwork_sunlit.png",
                "description", "A serene dawn concept painting",
                "artistId", 101
        );

        String createResp = mockMvc.perform(post("/api/portfolio")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Mystic Dawn"))
                .andExpect(jsonPath("$.data.category").value("Digital Art"))
                .andReturn().getResponse().getContentAsString();

        Map<String, Object> respMap = objectMapper.readValue(createResp, Map.class);
        Map<String, Object> data = (Map<String, Object>) respMap.get("data");
        Number newId = (Number) data.get("id");

        // 2. Update Portfolio Item
        Map<String, Object> updateReq = Map.of(
                "title", "Mystic Dawn - Updated",
                "category", "Paintings",
                "imageUrl", "/images/artwork_beyond_the_hills.png",
                "description", "Updated description"
        );

        mockMvc.perform(put("/api/portfolio/" + newId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Mystic Dawn - Updated"))
                .andExpect(jsonPath("$.data.category").value("Paintings"));

        // 3. Delete Portfolio Item
        mockMvc.perform(delete("/api/portfolio/" + newId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
