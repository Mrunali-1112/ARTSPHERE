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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve all feed posts successfully")
    void testGetPosts() throws Exception {
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should filter posts by art form")
    void testFilterByArtForm() throws Exception {
        mockMvc.perform(get("/api/posts?artForm=Painting"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].artForm").value("Painting"));
    }

    @Test
    @DisplayName("Should search posts by keyword")
    void testSearchPosts() throws Exception {
        mockMvc.perform(get("/api/posts/search?q=peace"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should retrieve post details by ID")
    void testGetPostById() throws Exception {
        mockMvc.perform(get("/api/posts/201"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(201))
                .andExpect(jsonPath("$.data.title").value("A Brighter Day"))
                .andExpect(jsonPath("$.data.artistName", notNullValue()))
                .andExpect(jsonPath("$.data.comments").isArray())
                .andExpect(jsonPath("$.data.moreFromArtist").isArray());
    }

    @Test
    @DisplayName("Should return 404 for non-existent post ID")
    void testGetPostNotFound() throws Exception {
        mockMvc.perform(get("/api/posts/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should create a new post successfully")
    void testCreatePost() throws Exception {
        String postJson = """
                {
                    "title": "Evening Watercolor Study",
                    "caption": "Capturing soft light filtering through cedar branches.",
                    "artForm": "Painting",
                    "category": "Showcase",
                    "location": "Mumbai, MH",
                    "tags": "#watercolor, #nature, #evening",
                    "visibility": "Public",
                    "mediaUrl": "/images/artwork_sunlit.png"
                }
                """;

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(postJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.caption", containsString("Capturing soft light")));
    }

    @Test
    @DisplayName("Should toggle post like status")
    void testToggleLike() throws Exception {
        mockMvc.perform(post("/api/posts/201/like?userId=102"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.liked").value(true));
    }

    @Test
    @DisplayName("Should toggle post save status")
    void testToggleSave() throws Exception {
        mockMvc.perform(post("/api/posts/201/save?userId=102"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.saved").value(true));
    }

    @Test
    @DisplayName("Should retrieve comments for a post")
    void testGetComments() throws Exception {
        mockMvc.perform(get("/api/posts/201/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should add comment to a post successfully")
    void testAddComment() throws Exception {
        String commentJson = """
                {
                    "content": "Truly inspiring brushwork! Love the color balance.",
                    "userId": 102
                }
                """;

        mockMvc.perform(post("/api/posts/201/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(commentJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", containsString("Truly inspiring")));
    }
}
