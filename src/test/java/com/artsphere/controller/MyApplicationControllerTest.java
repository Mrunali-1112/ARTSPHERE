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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MyApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve all applications for user 101 successfully")
    void testGetMyApplicationsAll() throws Exception {
        mockMvc.perform(get("/api/my-applications?userId=101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.summary").isMap())
                .andExpect(jsonPath("$.data.summary.totalCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.applications").isArray())
                .andExpect(jsonPath("$.data.applications", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.applications[0].title", notNullValue()))
                .andExpect(jsonPath("$.data.applications[0].detailUrl", notNullValue()));
    }

    @Test
    @DisplayName("Should filter applications by EVENTS category")
    void testFilterByEvents() throws Exception {
        mockMvc.perform(get("/api/my-applications?userId=101&category=EVENTS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.applications").isArray())
                .andExpect(jsonPath("$.data.applications[0].type").value("EVENT"))
                .andExpect(jsonPath("$.data.applications[0].detailUrl", containsString("/pages/event-details.html")));
    }

    @Test
    @DisplayName("Should filter applications by COLLABORATIONS category")
    void testFilterByCollaborations() throws Exception {
        mockMvc.perform(get("/api/my-applications?userId=101&category=COLLABORATIONS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.applications").isArray())
                .andExpect(jsonPath("$.data.applications[0].type").value("COLLABORATION"))
                .andExpect(jsonPath("$.data.applications[0].detailUrl", containsString("/pages/collaboration-details.html")));
    }

    @Test
    @DisplayName("Should filter applications by OPPORTUNITIES category")
    void testFilterByOpportunities() throws Exception {
        mockMvc.perform(get("/api/my-applications?userId=101&category=OPPORTUNITIES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.applications").isArray())
                .andExpect(jsonPath("$.data.applications[0].type").value("OPPORTUNITY"))
                .andExpect(jsonPath("$.data.applications[0].detailUrl", containsString("/pages/opportunity-details.html")));
    }

    @Test
    @DisplayName("Should retrieve application summary metrics")
    void testGetSummary() throws Exception {
        mockMvc.perform(get("/api/my-applications/summary?userId=101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.eventsCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.opportunitiesCount", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("Should return empty list for user with no applications")
    void testEmptyUserApplications() throws Exception {
        mockMvc.perform(get("/api/my-applications?userId=9999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.applications").isArray())
                .andExpect(jsonPath("$.data.applications", hasSize(0)))
                .andExpect(jsonPath("$.data.summary.totalCount").value(0));
    }
}
