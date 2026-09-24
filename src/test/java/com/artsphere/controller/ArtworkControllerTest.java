package com.artsphere.controller;

import com.artsphere.model.dto.ArtworkRequest;
import com.artsphere.model.dto.LoginRequest;
import com.artsphere.model.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ArtworkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private MockHttpSession registerAndLogin(String username, String role) throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                username,
                username + "@artsphere.com",
                "Secret123!",
                "Artist " + username
        );
        registerReq.setRole(role);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = new LoginRequest(username, "Secret123!");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) loginResult.getRequest().getSession(false);
    }

    @Test
    @DisplayName("Public user can browse community feed and single artwork without login")
    void testPublicBrowsing() throws Exception {
        mockMvc.perform(get("/api/artworks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Should require authentication to publish artwork")
    void testUnauthenticatedPublishFails() throws Exception {
        ArtworkRequest request = new ArtworkRequest(
                "Starry Night", "Post-impressionist masterpiece",
                "Painting", "https://example.com/starry.jpg",
                new BigDecimal("500.00"), true
        );

        mockMvc.perform(post("/api/artworks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Authenticated artist can publish, retrieve, filter, update, and delete their artwork")
    void testArtworkLifecycleAndOwnership() throws Exception {
        String artist1 = "vangogh_" + System.currentTimeMillis();
        String artist2 = "dali_" + System.currentTimeMillis();

        MockHttpSession session1 = registerAndLogin(artist1, "ROLE_ARTIST");
        MockHttpSession session2 = registerAndLogin(artist2, "ROLE_ARTIST");

        // 1. Artist 1 publishes artwork
        ArtworkRequest createReq = new ArtworkRequest(
                "Sunflowers",
                "Still life with yellow sunflowers",
                "Painting",
                "https://example.com/sunflowers.jpg",
                new BigDecimal("750.00"),
                true
        );

        MvcResult createResult = mockMvc.perform(post("/api/artworks")
                        .session(session1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Sunflowers"))
                .andExpect(jsonPath("$.data.artistUsername").value(artist1))
                .andReturn();

        Number artworkId = com.jayway.jsonpath.JsonPath.read(createResult.getResponse().getContentAsString(), "$.data.id");

        // 2. Fetch artwork by ID publicly
        mockMvc.perform(get("/api/artworks/" + artworkId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Sunflowers"));

        // 3. Search feed with keyword
        mockMvc.perform(get("/api/artworks?search=sunflowers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Sunflowers"));

        // 4. Filter feed by category
        mockMvc.perform(get("/api/artworks?category=Painting"))
                .andExpect(status().isOk());

        // 5. Artist 2 tries to update Artist 1's artwork -> 403 Forbidden
        ArtworkRequest hackReq = new ArtworkRequest(
                "Hacked Title", "Hacked Description",
                "Painting", "https://example.com/hack.jpg",
                BigDecimal.ZERO, false
        );
        mockMvc.perform(put("/api/artworks/" + artworkId)
                        .session(session2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hackReq)))
                .andExpect(status().isForbidden());

        // 6. Artist 1 updates their artwork -> 200 OK
        ArtworkRequest updateReq = new ArtworkRequest(
                "Sunflowers (Updated Edition)",
                "Vibrant yellow tones",
                "Painting",
                "https://example.com/sunflowers-v2.jpg",
                new BigDecimal("850.00"),
                true
        );
        mockMvc.perform(put("/api/artworks/" + artworkId)
                        .session(session1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Sunflowers (Updated Edition)"))
                .andExpect(jsonPath("$.data.price").value(850.00));

        // 7. Artist 2 tries to delete Artist 1's artwork -> 403 Forbidden
        mockMvc.perform(delete("/api/artworks/" + artworkId).session(session2))
                .andExpect(status().isForbidden());

        // 8. Artist 1 deletes their artwork -> 200 OK
        mockMvc.perform(delete("/api/artworks/" + artworkId).session(session1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Artwork deleted successfully"));
    }

    @Test
    @DisplayName("Should upload image file and return static path")
    void testImageUpload() throws Exception {
        String artist = "rembrandt_" + System.currentTimeMillis();
        MockHttpSession session = registerAndLogin(artist, "ROLE_ARTIST");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "canvas.png",
                "image/png",
                "image content bytes".getBytes()
        );

        mockMvc.perform(multipart("/api/artworks/upload")
                        .file(file)
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.imageUrl").isString());
    }
}
