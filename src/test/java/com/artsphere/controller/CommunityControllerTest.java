package com.artsphere.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CommunityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve all communities successfully")
    void testGetCommunities() throws Exception {
        mockMvc.perform(get("/api/communities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name", notNullValue()));
    }

    @Test
    @DisplayName("Should filter communities by category")
    void testFilterCommunitiesByCategory() throws Exception {
        mockMvc.perform(get("/api/communities?category=Painting"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].category", equalToIgnoringCase("Painting")));
    }

    @Test
    @DisplayName("Should search communities by keyword")
    void testSearchCommunities() throws Exception {
        mockMvc.perform(get("/api/communities/search?q=Creative"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name", containsString("Creative")));
    }

    @Test
    @DisplayName("Should retrieve community details by ID")
    void testGetCommunityDetails() throws Exception {
        mockMvc.perform(get("/api/communities/601"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(601))
                .andExpect(jsonPath("$.data.name").value("Creative Souls"))
                .andExpect(jsonPath("$.data.rules", notNullValue()));
    }

    @Test
    @DisplayName("Should create a new community")
    void testCreateCommunity() throws Exception {
        String json = """
                {
                    "name": "Sculptors Guild",
                    "description": "A guild for 3D sculptors and ceramicists.",
                    "category": "Crafts",
                    "location": "Mumbai, India"
                }
                """;

        mockMvc.perform(post("/api/communities?userId=101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Sculptors Guild"))
                .andExpect(jsonPath("$.data.category").value("Crafts"));
    }

    @Test
    @DisplayName("Should join and leave community")
    void testJoinAndLeaveCommunity() throws Exception {
        // Leave 601 first to be safe
        mockMvc.perform(post("/api/communities/601/leave?userId=103"))
                .andExpect(status().isOk());

        // Now join 601
        mockMvc.perform(post("/api/communities/601/join?userId=103"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.joined").value(true));

        // Now leave 601
        mockMvc.perform(post("/api/communities/601/leave?userId=103"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.joined").value(false));
    }

    @Test
    @DisplayName("Should retrieve community members")
    void testGetCommunityMembers() throws Exception {
        mockMvc.perform(get("/api/communities/601/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].role", notNullValue()));
    }

    @Test
    @DisplayName("Should retrieve community posts")
    void testGetCommunityPosts() throws Exception {
        mockMvc.perform(get("/api/communities/601/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should create community post")
    void testCreateCommunityPost() throws Exception {
        String json = """
                {
                    "title": "Fresh Watercolor Study",
                    "caption": "Practicing morning light with watercolors!",
                    "mediaUrl": "/images/comm_post_sunset_painting.png",
                    "mediaType": "image",
                    "category": "Artworks",
                    "tags": "#watercolor,#morning"
                }
                """;

        mockMvc.perform(post("/api/communities/601/posts?userId=101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.caption", containsString("Practicing morning light")));
    }

    @Test
    @DisplayName("Should retrieve community events")
    void testGetCommunityEvents() throws Exception {
        mockMvc.perform(get("/api/communities/601/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should register for community event")
    void testRegisterForCommunityEvent() throws Exception {
        mockMvc.perform(post("/api/communities/events/801/register?userId=105"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.registered").value(true));
    }
}
