package com.artsphere.controller;

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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should successfully register a new user, log in, and fetch current profile")
    void testRegisterLoginAndProfileFlow() throws Exception {
        String suffix = String.valueOf(System.currentTimeMillis());
        RegisterRequest registerReq = new RegisterRequest(
                "monet_" + suffix,
                "monet_" + suffix + "@artsphere.com",
                "Secret123!",
                "Claude Monet"
        );
        registerReq.setRole("ROLE_ARTIST");
        registerReq.setBio("Impressionist painter");

        // 1. Register
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value(registerReq.getUsername()))
                .andExpect(jsonPath("$.data.email").value(registerReq.getEmail()))
                .andExpect(jsonPath("$.data.role").value("ROLE_ARTIST"));

        // 2. Duplicate registration attempt should return 409 Conflict
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));

        // 3. Login with valid credentials
        LoginRequest loginReq = new LoginRequest(registerReq.getUsername(), "Secret123!");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value(registerReq.getUsername()))
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        // 4. Fetch current user profile with active session
        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value(registerReq.getUsername()));

        // 5. Fetch current user profile without session should return 401
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject invalid registration data")
    void testValidationFailure() throws Exception {
        RegisterRequest invalidReq = new RegisterRequest("", "invalid-email", "12", "");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    @DisplayName("Should reject login with wrong password")
    void testInvalidLoginCredentials() throws Exception {
        String suffix = String.valueOf(System.currentTimeMillis());
        RegisterRequest registerReq = new RegisterRequest(
                "picasso_" + suffix,
                "picasso_" + suffix + "@artsphere.com",
                "RealPassword",
                "Pablo Picasso"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest wrongLogin = new LoginRequest(registerReq.getUsername(), "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }
}
