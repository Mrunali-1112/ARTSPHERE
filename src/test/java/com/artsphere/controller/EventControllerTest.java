package com.artsphere.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
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
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve all events successfully")
    void testGetEvents() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].title", notNullValue()));
    }

    @Test
    @DisplayName("Should filter events by art form")
    void testFilterEventsByArtForm() throws Exception {
        mockMvc.perform(get("/api/events?artForm=Painting"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].artForm", equalToIgnoringCase("Painting")));
    }

    @Test
    @DisplayName("Should search events by query keyword")
    void testSearchEvents() throws Exception {
        mockMvc.perform(get("/api/events/search?q=Watercolor"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title", containsStringIgnoringCase("Watercolor")));
    }

    @Test
    @DisplayName("Should retrieve featured events")
    void testGetFeaturedEvents() throws Exception {
        mockMvc.perform(get("/api/events/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Should retrieve event details by ID with full fields")
    void testGetEventDetails() throws Exception {
        mockMvc.perform(get("/api/events/801"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(801))
                .andExpect(jsonPath("$.data.title").value("Watercolor Basics Workshop"))
                .andExpect(jsonPath("$.data.whatYoullLearn").isArray())
                .andExpect(jsonPath("$.data.thingsToBring").isArray())
                .andExpect(jsonPath("$.data.guidelines").isArray())
                .andExpect(jsonPath("$.data.venue", notNullValue()))
                .andExpect(jsonPath("$.data.attendeesCount", notNullValue()));
    }

    @Test
    @DisplayName("Should register user for an event and prevent duplicate registration")
    void testRegisterForEventAndPreventDuplicate() throws Exception {
        Long testUserId = 106L;

        // First registration
        mockMvc.perform(post("/api/events/801/register?userId=" + testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.registered").value(true))
                .andExpect(jsonPath("$.data.message", containsString("all set")));

        // Duplicate registration attempt for same user & event
        mockMvc.perform(post("/api/events/801/register?userId=" + testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.registered").value(true))
                .andExpect(jsonPath("$.data.message", containsString("already registered")));
    }

    @Test
    @DisplayName("Should retrieve registration status for user")
    void testGetRegistrationStatus() throws Exception {
        mockMvc.perform(get("/api/events/801/registration-status?userId=101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.eventId").value(801))
                .andExpect(jsonPath("$.data.registered", notNullValue()));
    }

    @Test
    @DisplayName("Should return 404 for non-existent event")
    void testEventNotFound() throws Exception {
        mockMvc.perform(get("/api/events/999999"))
                .andExpect(status().isNotFound());
    }
}
