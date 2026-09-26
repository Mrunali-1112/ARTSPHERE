/**
 * ArtSphere – Artist Profile Module
 * Source of Truth: Approved page_12.jpg reference
 * Loads artist dynamic data from GET /api/artists/{id}
 */

document.addEventListener('DOMContentLoaded', () => {
    initArtistProfile();
});

let currentArtistId = 101;
let currentArtistData = null;

async function initArtistProfile() {
    // 1. Read artist ID from URL params (e.g. ?id=101)
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id');
    if (paramId && !isNaN(paramId)) {
        currentArtistId = parseInt(paramId, 10);
    }

    // Bind navigation buttons
    bindNavActions();

    // 2. Load artist data dynamically from Spring Boot REST API
    await loadArtistData(currentArtistId);
}

function bindNavActions() {
    const btnBack = document.getElementById('btnBack');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/pages/discover.html';
            }
        });
    }

    const btnMoreOptions = document.getElementById('btnMoreOptions');
    if (btnMoreOptions) {
        btnMoreOptions.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: currentArtistData ? currentArtistData.fullName : 'ArtSphere Artist',
                    url: window.location.href
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Artist Profile link copied to clipboard!');
            }
        });
    }

    // Tabs toggle
    const tabs = document.querySelectorAll('.profile-nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            if (tabName === 'about') {
                const bio = document.getElementById('artistBio');
                if (bio) bio.scrollIntoView({ behavior: 'smooth' });
            } else if (tabName === 'portfolio') {
                const portfolio = document.querySelector('.profile-portfolio-section');
                if (portfolio) portfolio.scrollIntoView({ behavior: 'smooth' });
            } else if (tabName === 'opportunities') {
                window.location.href = '/pages/opportunities.html';
            }
        });
    });

    // Central + Action button
    const centralCreateBtn = document.getElementById('centralCreateBtn');
    if (centralCreateBtn) {
        centralCreateBtn.addEventListener('click', () => {
            window.location.href = `/pages/portfolio.html?id=${currentArtistId}&action=add`;
        });
    }
}

async function loadArtistData(artistId) {
    try {
        let artist = null;
        if (window.ArtSphereAPI && typeof window.ArtSphereAPI.getArtistProfile === 'function') {
            artist = await window.ArtSphereAPI.getArtistProfile(artistId);
        } else {
            const res = await fetch(`/api/artists/${artistId}`);
            const json = await res.json();
            artist = json.data;
        }

        if (!artist) {
            console.warn('Artist data not found for id:', artistId);
            return;
        }

        currentArtistData = artist;
        renderArtistProfile(artist);
    } catch (err) {
        console.error('Failed to fetch artist profile:', err);
    }
}

function renderArtistProfile(artist) {
    // 1. Text Info
    const nameEl = document.getElementById('artistName');
    if (nameEl) nameEl.textContent = artist.fullName || 'Aanya Kulkarni';

    const craftEl = document.getElementById('artistCraft');
    if (craftEl) craftEl.textContent = artist.artistType || 'Visual Artist';

    const locationEl = document.getElementById('artistLocation');
    if (locationEl) locationEl.textContent = artist.location || 'Mumbai, MH';

    const bioEl = document.getElementById('artistBio');
    if (bioEl) bioEl.textContent = artist.bio || 'Illustrator and digital artist exploring everyday moments through art.';

    // 2. Images
    const coverEl = document.getElementById('artistCoverImg');
    if (coverEl && artist.coverImage) {
        coverEl.src = artist.coverImage;
    }

    const avatarEl = document.getElementById('artistAvatarImg');
    if (avatarEl && artist.profilePicture) {
        avatarEl.src = artist.profilePicture;
    }

    // 3. Stats
    const postsEl = document.getElementById('postsCount');
    if (postsEl) {
        postsEl.textContent = artist.postsCount != null ? artist.postsCount : 24;
    }

    const followersEl = document.getElementById('followersCount');
    if (followersEl) {
        followersEl.textContent = artist.followersCount || '1.8K';
    }

    const followingEl = document.getElementById('followingCount');
    if (followingEl) {
        followingEl.textContent = artist.followingCount != null ? artist.followingCount : 356;
    }

    // 4. Skills Pills
    const skillsContainer = document.getElementById('artistSkillsContainer');
    if (skillsContainer && artist.skills && artist.skills.length > 0) {
        skillsContainer.innerHTML = artist.skills.map(skill => `
            <span class="profile-skill-pill">${escapeHtml(skill)}</span>
        `).join('');
    }

    // 5. Social Links
    const igLink = document.getElementById('socialInstagram');
    if (igLink && artist.instagramUrl) igLink.href = artist.instagramUrl;

    const behanceLink = document.getElementById('socialBehance');
    if (behanceLink && artist.behanceUrl) behanceLink.href = artist.behanceUrl;

    const webLink = document.getElementById('socialWebsite');
    if (webLink && artist.websiteUrl) webLink.href = artist.websiteUrl;

    // 6. See All Portfolio Link
    const seeAllLink = document.getElementById('linkSeeAllPortfolio');
    if (seeAllLink) {
        seeAllLink.href = `/pages/portfolio.html?id=${artist.id}`;
    }

    // 7. Follow Button
    const btnFollow = document.getElementById('btnFollow');
    if (btnFollow) {
        if (artist.following) {
            btnFollow.classList.add('following');
            btnFollow.textContent = 'Following';
        } else {
            btnFollow.classList.remove('following');
            btnFollow.textContent = 'Follow';
        }

        btnFollow.onclick = async () => {
            btnFollow.disabled = true;
            try {
                let res;
                if (window.ArtSphereAPI && typeof window.ArtSphereAPI.toggleFollowArtist === 'function') {
                    res = await window.ArtSphereAPI.toggleFollowArtist(artist.id);
                } else {
                    const response = await fetch(`/api/artists/${artist.id}/follow`, { method: 'POST' });
                    const json = await response.json();
                    res = json.data;
                }
                const isNowFollowing = res && res.following;
                if (isNowFollowing) {
                    btnFollow.classList.add('following');
                    btnFollow.textContent = 'Following';
                } else {
                    btnFollow.classList.remove('following');
                    btnFollow.textContent = 'Follow';
                }
            } catch (err) {
                console.error('Follow toggle error:', err);
                // Fallback UI toggle
                const isNowFollowing = btnFollow.classList.toggle('following');
                btnFollow.textContent = isNowFollowing ? 'Following' : 'Follow';
            } finally {
                btnFollow.disabled = false;
            }
        };
    }

    // 8. Message Button
    const btnMessage = document.getElementById('btnMessage');
    if (btnMessage) {
        btnMessage.href = `/pages/messages.html?artistId=${artist.id}&name=${encodeURIComponent(artist.fullName || '')}`;
    }

    // 9. Portfolio Grid (Top 6 Preview)
    renderPortfolioGrid(artist.portfolio || [], artist.id);
}

function renderPortfolioGrid(artworks, artistId) {
    const grid = document.getElementById('profilePortfolioGrid');
    if (!grid) return;

    // If artworks exist, take up to 6 items; otherwise fallback to default preview artworks
    const displayArtworks = (artworks && artworks.length > 0) ? artworks.slice(0, 6) : [
        { imageUrl: '/images/artwork_sunlit.png', title: 'Sunlit' },
        { imageUrl: '/images/artwork_beyond_the_hills.png', title: 'Beyond the Hills' },
        { imageUrl: '/images/artwork_curious.png', title: 'Curious' },
        { imageUrl: '/images/artwork_still.png', title: 'Still' },
        { imageUrl: '/images/artwork_city_shades.png', title: 'City Shades' },
        { imageUrl: '/images/artwork_bloom.png', title: 'Bloom' }
    ];

    grid.innerHTML = displayArtworks.map(art => `
        <div class="portfolio-thumb-card" role="button" tabindex="0" onclick="window.location.href='/pages/portfolio.html?id=${artistId}'" title="${escapeHtml(art.title || 'Artwork')}">
            <img src="${escapeHtml(art.imageUrl || '/images/artwork_sunlit.png')}"
                 alt="${escapeHtml(art.title || 'Portfolio Work')}"
                 class="portfolio-thumb-img"
                 onerror="this.src='/images/artwork_sunlit.png'">
        </div>
    `).join('');
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
