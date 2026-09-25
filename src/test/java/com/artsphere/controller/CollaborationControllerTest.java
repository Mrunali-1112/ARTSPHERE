package com.artsphere.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CollaborationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve all open collaborations successfully")
    void testGetCollaborations() throws Exception {
        mockMvc.perform(get("/api/collaborations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title", notNullValue()));
    }

    @Test
    @DisplayName("Should filter collaborations by skill")
    void testFilterBySkill() throws Exception {
        mockMvc.perform(get("/api/collaborations?skill=Digital Art"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should search collaborations by keyword")
    void testSearchCollaborations() throws Exception {
        mockMvc.perform(get("/api/collaborations/search?q=Short Film"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title", containsString("Short Film")));
    }

    @Test
    @DisplayName("Should retrieve collaboration details by ID")
    void testGetCollaborationDetails() throws Exception {
        mockMvc.perform(get("/api/collaborations/501"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(501))
                .andExpect(jsonPath("$.data.creatorName", notNullValue()))
                .andExpect(jsonPath("$.data.title", containsString("Digital Artist")));
    }

    @Test
    @DisplayName("Should create a new collaboration post successfully")
    void testCreateCollaboration() throws Exception {
        String json = """
                {
                    "title": "Looking for a Concept Artist for Fantasy Novel",
                    "description": "Need an artist to illustrate world maps and creatures.",
                    "purpose": "Work on a Project",
                    "skills": "Concept Art, Digital Painting",
                    "tags": "#fantasy, #conceptart",
                    "location": "Mumbai, MH",
                    "collaborationType": "Book Project",
                    "availability": "Flexible",
                    "peopleNeeded": "1 artist"
                }
                """;

        mockMvc.perform(post("/api/collaborations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andExpect(jsonPath("$.data.title").value("Looking for a Concept Artist for Fantasy Novel"));
    }

    @Test
    @DisplayName("Should update collaboration status")
    void testUpdateStatus() throws Exception {
        String json = "{\"status\": \"CLOSED\"}";
        mockMvc.perform(put("/api/collaborations/501/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CLOSED"));
    }

    @Test
    @DisplayName("Should send collaboration request for a post")
    void testSendRequestForCollab() throws Exception {
        String json = "{\"message\": \"I'd love to help design concepts for your short film!\"}";
        mockMvc.perform(post("/api/collaborations/502/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id", notNullValue()));
    }

    @Test
    @DisplayName("Should retrieve received collaboration requests")
    void testGetReceivedRequests() throws Exception {
        mockMvc.perform(get("/api/collaboration-requests?type=received"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should retrieve sent collaboration requests")
    void testGetSentRequests() throws Exception {
        mockMvc.perform(get("/api/collaboration-requests?type=sent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should retrieve approved collaboration requests")
    void testGetApprovedRequests() throws Exception {
        mockMvc.perform(get("/api/collaboration-requests?type=approved"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should accept a collaboration request")
    void testAcceptRequest() throws Exception {
        mockMvc.perform(post("/api/collaboration-requests/1/accept"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    @DisplayName("Should reject a collaboration request")
    void testRejectRequest() throws Exception {
        mockMvc.perform(post("/api/collaboration-requests/2/reject"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("REJECTED"));
    }
}
