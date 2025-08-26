/**
 * Mobile Composer Page JavaScript
 * Handles the mobile-optimized composer profile experience
 */

import { supabase } from './supabase.js';
import { getCurrentVersion } from './site-version.js';

class MobileComposerPage {
    constructor() {
        this.currentVideoIndex = 0;
        this.videos = [];
        this.composer = null;
        this.initializePage();
    }
    
    async initializePage() {
        try {
            // Show loading state
            this.showLoading();
            
            // Get composer slug from URL
            const slug = new URLSearchParams(window.location.search).get('slug');
            if (!slug) {
                this.showError('No composer specified');
                return;
            }
            
            // Load composer data
            this.composer = await this.loadComposer(slug);
            if (!this.composer) {
                this.showError('Composer not found');
                return;
            }
            
            // Render the mobile composer page
            this.renderMobileComposer(this.composer);
            this.initializeMobileFeatures();
            
        } catch (error) {
            console.error('Error initializing mobile composer page:', error);
            this.showError('Error loading composer information');
        }
    }
    
    async loadComposer(slug) {
        try {
            const currentVersion = getCurrentVersion();
            console.log('Loading mobile composer for version:', currentVersion);
            
            // Try contains first (for JSON arrays)
            let { data: composer, error } = await supabase
                .from('composers')
                .select('*')
                .contains('site_version', [currentVersion])
                .eq('slug', slug)
                .eq('is_visible', true)
                .single();

            // If no results, try equality (for single values)
            if (!composer && error?.code === 'PGRST116') {
                const { data: singleVersionData, error: singleError } = await supabase
                    .from('composers')
                    .select('*')
                    .eq('site_version', currentVersion)
                    .eq('slug', slug)
                    .eq('is_visible', true)
                    .single();
                
                composer = singleVersionData;
                error = singleError;
            }

            if (error) {
                console.error('Error loading composer:', error);
                return null;
            }

            console.log('Loaded mobile composer:', composer.name);
            return composer;
            
        } catch (err) {
            console.error('Error in loadComposer:', err);
            return null;
        }
    }
    
    renderMobileComposer(composer) {
        try {
            // Set page title
            document.title = `${composer.name} | Concord Music Publishing`;
            
            // Set composer name
            const nameElement = document.getElementById('composer-name');
            if (nameElement) {
                nameElement.textContent = composer.name;
            }
            
            // Set photo
            const photo = document.getElementById('composer-photo');
            if (photo) {
                photo.src = composer.primary_photo_url || 'assets/images/default-composer.jpg';
                photo.alt = composer.name;
                
                // Handle photo load error
                photo.onerror = () => {
                    photo.style.background = '#D9D9D9';
                    photo.style.display = 'none';
                };
            }
            
            // Render bio
            this.renderMobileBio(composer.bio);
            
            // Render social links
            this.renderMobileSocialLinks(composer);
            
            // Render videos
            this.renderMobileVideos(composer);
            
            // Render Spotify integration
            this.renderMobileSpotify(composer.disco_playlist);
            
            console.log('Mobile composer rendered successfully');
            
        } catch (error) {
            console.error('Error rendering mobile composer:', error);
            this.showError('Error displaying composer information');
        }
    }
    
    renderMobileBio(bio) {
        const bioContent = document.getElementById('composer-bio');
        if (bioContent) {
            if (bio && bio.trim()) {
                bioContent.innerHTML = bio;
                bioContent.style.color = 'rgba(0, 0, 0, 0.80)';
            } else {
                bioContent.innerHTML = 'No biography available at this time.';
                bioContent.style.color = 'rgba(0, 0, 0, 0.50)';
            }
        }
    }
    
    renderMobileSocialLinks(composer) {
        const socialContainer = document.getElementById('social-links');
        if (!socialContainer) {
            return;
        }
        
        socialContainer.innerHTML = '';
        let socialHtml = '';
        
        // Spotify
        if (composer.spotify_url && composer.spotify_url.trim()) {
            socialHtml += `
                <a href="${composer.spotify_url}" target="_blank" rel="noopener noreferrer" style="position: absolute; left: 0px; top: 0px;">
                    <div class="SocialIcons" style="width: 24.54px; height: 24.54px; cursor: pointer;">
                        <svg width="24.54" height="24.54" viewBox="0 0 48 48" fill="#1ED760">
                            <path d="M23.9266 0C10.7126 0 0 10.7123 0 23.9263C0 37.1409 10.7126 47.8523 23.9266 47.8523C37.142 47.8523 47.8534 37.1409 47.8534 23.9263C47.8534 10.7131 37.142 0.00114285 23.9263 0.00114285L23.9266 0ZM34.8991 34.5086C34.4706 35.2114 33.5506 35.4343 32.8477 35.0029C27.23 31.5714 20.158 30.7943 11.8294 32.6971C11.0269 32.88 10.2269 32.3771 10.044 31.5743C9.86029 30.7714 10.3611 29.9714 11.1657 29.7886C20.28 27.7054 28.098 28.6029 34.4049 32.4571C35.1077 32.8886 35.3306 33.8057 34.8991 34.5086Z"/>
                        </svg>
                    </div>
                </a>
            `;
        }
        
        // Instagram
        if (composer.instagram_url && composer.instagram_url.trim()) {
            socialHtml += `
                <a href="${composer.instagram_url}" target="_blank" rel="noopener noreferrer" style="position: absolute; left: 51.13px; top: 0px;">
                    <div class="SocialIcons" style="width: 24.54px; height: 24.54px; cursor: pointer;">
                        <svg width="24.54" height="24.54" viewBox="0 0 48 48" fill="#000100">
                            <path d="M24 4.32187C30.4125 4.32187 31.1719 4.35 33.6938 4.4625C36.0375 4.56562 37.3031 4.95938 38.1469 5.2875C39.2625 5.71875 40.0688 6.24375 40.9031 7.07812C41.7469 7.92188 42.2625 8.71875 42.6938 9.83438C43.0219 10.6781 43.4156 11.9531 43.5188 14.2875C43.6313 16.8187 43.6594 17.5781 43.6594 23.9813C43.6594 30.3938 43.6313 31.1531 43.5188 33.675C43.4156 36.0188 43.0219 37.2844 42.6938 38.1281C42.2625 39.2438 41.7375 40.05 40.9031 40.8844C40.0594 41.7281 39.2625 42.2438 38.1469 42.675C37.3031 43.0031 36.0281 43.3969 33.6938 43.5C31.1625 43.6125 30.4031 43.6406 24 43.6406C17.5875 43.6406 16.8281 43.6125 14.3063 43.5C11.9625 43.3969 10.6969 43.0031 9.85313 42.675C8.7375 42.2438 7.93125 41.7188 7.09688 40.8844C6.25313 40.0406 5.7375 39.2438 5.30625 38.1281C4.97813 37.2844 4.58438 36.0094 4.48125 33.675C4.36875 31.1438 4.34063 30.3844 4.34063 23.9813C4.34063 17.5688 4.36875 16.8094 4.48125 14.2875C4.58438 11.9437 4.97813 10.6781 5.30625 9.83438C5.7375 8.71875 6.2625 7.9125 7.09688 7.07812C7.94063 6.23438 8.7375 5.71875 9.85313 5.2875C10.6969 4.95938 11.9719 4.56562 14.3063 4.4625C16.8281 4.35 17.5875 4.32187 24 4.32187ZM24 11.6719C17.1938 11.6719 11.6719 17.1938 11.6719 24C11.6719 30.8062 17.1938 36.3281 24 36.3281C30.8062 36.3281 36.3281 30.8062 36.3281 24C36.3281 17.1938 30.8062 11.6719 24 11.6719ZM24 31.9969C19.5844 31.9969 16.0031 28.4156 16.0031 24C16.0031 19.5844 19.5844 16.0031 24 16.0031C28.4156 16.0031 31.9969 19.5844 31.9969 24C31.9969 28.4156 28.4156 31.9969 24 31.9969Z"/>
                        </svg>
                    </div>
                </a>
            `;
        }
        
        // TikTok
        if (composer.tiktok_url && composer.tiktok_url.trim()) {
            socialHtml += `
                <a href="${composer.tiktok_url}" target="_blank" rel="noopener noreferrer" style="position: absolute; left: 102.26px; top: 0px;">
                    <div class="SocialIcons" style="width: 24.54px; height: 24.54px; cursor: pointer;">
                        <svg width="24.54" height="24.54" viewBox="0 0 48 48">
                            <path d="M34.3529 17.327C37.4396 19.5413 41.221 20.8442 45.305 20.8442V12.9573C44.5321 12.9574 43.7612 12.8765 43.005 12.7158V18.9239C38.9213 18.9239 35.1404 17.621 32.0529 15.4068V31.5018C32.0529 39.5533 25.5491 46.0799 17.5267 46.0799C14.5333 46.0799 11.7511 45.1717 9.43994 43.6141C12.0778 46.3209 15.7564 48 19.8262 48C27.8491 48 34.3533 41.4734 34.3533 33.4216V17.327H34.3529Z" fill="#FF004F"/>
                            <path d="M32.0529 15.4067C35.1404 17.6209 38.9213 18.9237 43.005 18.9237V12.7156C40.7255 12.2283 38.7075 11.0328 37.1903 9.37002C34.5931 7.74361 32.722 5.06043 32.1733 1.91995H26.4482V33.4213C26.4352 37.0937 23.4655 40.0673 19.8032 40.0673C17.6451 40.0673 15.7279 39.0349 14.5136 37.4356C12.3454 36.3374 10.8585 34.0827 10.8585 31.4789C10.8585 27.7963 13.8331 24.8105 17.5032 24.8105C18.2064 24.8105 18.8842 24.9204 19.5199 25.1228V18.8468C11.6384 19.0102 5.2998 25.473 5.2998 33.4214C5.2998 37.3892 6.87827 40.9861 9.44013 43.6143C11.7513 45.1717 14.5335 46.08 17.5268 46.08C25.5494 46.08 32.0531 39.5531 32.0531 31.5018V15.4067H32.0529Z" fill="black"/>
                            <path d="M43.0051 12.7156V11.037C40.9495 11.0401 38.9343 10.4624 37.1903 9.36987C38.7342 11.0661 40.7671 12.2357 43.0051 12.7156Z" fill="#00F2EA"/>
                        </svg>
                    </div>
                </a>
            `;
        }
        
        socialContainer.innerHTML = socialHtml;
    }
    
    renderMobileVideos(composer) {
        // Collect video URLs
        this.videos = [
            composer.video_link_1,
            composer.video_link_2,
            composer.video_link_3,
            composer.video_link_4
        ].filter(url => url && url.trim());
        
        const videoSection = document.getElementById('video-section');
        if (!videoSection) return;
        
        if (this.videos.length === 0) {
            videoSection.style.display = 'none';
            return;
        }
        
        videoSection.style.display = 'block';
        
        // Set up first video
        this.currentVideoIndex = 0;
        this.updateMobileVideo();
        
        // Create indicators
        this.renderVideoIndicators();
        
        // Set up navigation
        this.setupVideoNavigation();
    }
    
    updateMobileVideo() {
        if (this.videos.length === 0) return;
        
        const videoPlayer = document.getElementById('mobile-video-player');
        const currentVideo = this.videos[this.currentVideoIndex];
        
        if (currentVideo) {
            const embedUrl = this.getVideoEmbedUrl(currentVideo);
            videoPlayer.src = embedUrl;
        }
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prev-video');
        const nextBtn = document.getElementById('next-video');
        
        if (prevBtn) prevBtn.disabled = this.currentVideoIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentVideoIndex === this.videos.length - 1;
        
        // Update indicators
        this.updateVideoIndicators();
    }
    
    renderVideoIndicators() {
        const indicatorsContainer = document.getElementById('video-indicators');
        indicatorsContainer.innerHTML = '';
        
        if (this.videos.length <= 1) {
            return; // Don't show indicators for single video
        }
        
        this.videos.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'video-indicator';
            if (index === this.currentVideoIndex) {
                indicator.classList.add('active');
            }
            
            indicator.addEventListener('click', () => {
                this.currentVideoIndex = index;
                this.updateMobileVideo();
            });
            
            indicatorsContainer.appendChild(indicator);
        });
    }
    
    updateVideoIndicators() {
        const indicators = document.querySelectorAll('.video-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentVideoIndex);
        });
    }
    
    getVideoEmbedUrl(url) {
        try {
            // Handle Vimeo URLs
            const vimeoRegex = /(?:vimeo.com\/|player.vimeo.com\/video\/)(\d+)/;
            const vimeoMatch = url.match(vimeoRegex);
            if (vimeoMatch && vimeoMatch[1]) {
                const videoId = vimeoMatch[1];
                return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&autoplay=0`;
            }
            
            // Handle YouTube URLs
            const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const youtubeMatch = url.match(youtubeRegex);
            if (youtubeMatch && youtubeMatch[1]) {
                const videoId = youtubeMatch[1];
                return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
            }
            
            // Return original URL if no pattern matches
            return url;
        } catch (error) {
            console.error('Error processing video URL:', error);
            return url;
        }
    }
    
    renderMobileSpotify(discoPlaylist) {
        const spotifySection = document.getElementById('spotify-section');
        const spotifyEmbed = document.getElementById('mobile-spotify-embed');
        
        if (!spotifySection || !spotifyEmbed) return;
        
        if (!discoPlaylist || !discoPlaylist.trim()) {
            spotifySection.style.display = 'none';
            return;
        }
        
        spotifySection.style.display = 'block';
        spotifyEmbed.innerHTML = discoPlaylist;
    }
    
    setupVideoNavigation() {
        const prevBtn = document.getElementById('prev-video');
        const nextBtn = document.getElementById('next-video');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.videos.length > 1) {
                    this.currentVideoIndex = this.currentVideoIndex > 0 ? this.currentVideoIndex - 1 : this.videos.length - 1;
                    this.updateMobileVideo();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.videos.length > 1) {
                    this.currentVideoIndex = this.currentVideoIndex < this.videos.length - 1 ? this.currentVideoIndex + 1 : 0;
                    this.updateMobileVideo();
                }
            });
        }
    }
    
    renderVideoIndicators() {
        const indicatorsContainer = document.getElementById('video-indicators');
        if (!indicatorsContainer || this.videos.length <= 1) {
            return;
        }
        
        let indicatorsHTML = '';
        for (let i = 0; i < this.videos.length; i++) {
            const active = i === this.currentVideoIndex ? 'background: white;' : 'background: rgba(255,255,255,0.5);';
            indicatorsHTML += `<div style="width: 8px; height: 8px; border-radius: 50%; ${active} cursor: pointer; transition: all 0.3s ease;" data-index="${i}"></div>`;
        }
        
        indicatorsContainer.innerHTML = indicatorsHTML;
        
        // Add click handlers for indicators
        indicatorsContainer.querySelectorAll('div').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.currentVideoIndex = index;
                this.updateMobileVideo();
            });
        });
    }
    
    initializeMobileFeatures() {
        // Simplified - no collapsible bio needed with new layout
        console.log('Mobile features initialized');
    }
    
    showLoading() {
        // Simple loading message
        console.log('Loading composer data...');
    }
    
    hideLoading() {
        // Loading complete
        console.log('Composer data loaded');
    }
    
    showError(message) {
        const container = document.querySelector('.ComposerMobileV1');
        if (container) {
            container.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: black;">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button onclick="history.back()" style="margin-top: 20px; padding: 10px 20px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;">Go Back</button>
                </div>
            `;
        }
    }
}

// Initialize mobile composer page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileComposerPage();
});

export { MobileComposerPage };
