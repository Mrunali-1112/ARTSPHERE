package com.artsphere.model.dto;

import java.util.ArrayList;
import java.util.List;

public class PostDetailResponse extends PostResponse {

    private String artistBio;
    private int artistFollowersCount;
    private boolean following;
    private List<CommentResponse> comments = new ArrayList<>();
    private List<PostThumb> moreFromArtist = new ArrayList<>();

    public PostDetailResponse() {
        super();
    }

    public String getArtistBio() { return artistBio; }
    public void setArtistBio(String artistBio) { this.artistBio = artistBio; }

    public int getArtistFollowersCount() { return artistFollowersCount; }
    public void setArtistFollowersCount(int artistFollowersCount) { this.artistFollowersCount = artistFollowersCount; }

    public boolean isFollowing() { return following; }
    public void setFollowing(boolean following) { this.following = following; }

    public List<CommentResponse> getComments() { return comments; }
    public void setComments(List<CommentResponse> comments) { this.comments = comments; }

    public List<PostThumb> getMoreFromArtist() { return moreFromArtist; }
    public void setMoreFromArtist(List<PostThumb> moreFromArtist) { this.moreFromArtist = moreFromArtist; }

    public static class PostThumb {
        private Long id;
        private String title;
        private String imageUrl;
        private int likesCount;

        public PostThumb() {}

        public PostThumb(Long id, String title, String imageUrl, int likesCount) {
            this.id = id;
            this.title = title;
            this.imageUrl = imageUrl;
            this.likesCount = likesCount;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public int getLikesCount() { return likesCount; }
        public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
    }
}
