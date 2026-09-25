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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OpportunityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve all open opportunities")
    void testGetOpportunities() throws Exception {
        mockMvc.perform(get("/api/opportunities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should filter opportunities by category")
    void testFilterByCategory() throws Exception {
        mockMvc.perform(get("/api/opportunities?category=Auditions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].category").value("Auditions"))
                .andExpect(jsonPath("$.data[0].title", containsString("Campus Band")));
    }

    @Test
    @DisplayName("Should filter opportunities by location")
    void testFilterByLocation() throws Exception {
        mockMvc.perform(get("/api/opportunities?location=Remote"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should search opportunities by keyword")
    void testSearchOpportunities() throws Exception {
        mockMvc.perform(get("/api/opportunities/search?q=Photography"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title", containsString("Lens & Life")));
    }

    @Test
    @DisplayName("Should get opportunity details by ID")
    void testGetOpportunityById() throws Exception {
        mockMvc.perform(get("/api/opportunities/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(101))
                .andExpect(jsonPath("$.data.title").value("Campus Art Exhibition"))
                .andExpect(jsonPath("$.data.organizer").value("MGM College Arts Club"))
                .andExpect(jsonPath("$.data.deadline").value("20 Oct 2024"))
                .andExpect(jsonPath("$.data.whoCanApply").isArray())
                .andExpect(jsonPath("$.data.whatYouGet").isArray());
    }

    @Test
    @DisplayName("Should apply to opportunity and prevent duplicate application")
    void testApplyToOpportunity() throws Exception {
        // First application
        mockMvc.perform(post("/api/opportunities/101/apply?userId=102")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"notes\": \"I would love to participate in the exhibition!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Application submitted successfully"))
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        // Second application from same user should fail
        mockMvc.perform(post("/api/opportunities/101/apply?userId=102")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"notes\": \"Duplicate application\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("already applied")));
    }

    @Test
    @DisplayName("Should retrieve featured opportunity")
    void testGetFeaturedOpportunity() throws Exception {
        mockMvc.perform(get("/api/opportunities/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.featured").value(true));
    }
}
