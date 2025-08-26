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
            console.log('Rendering bio:', composer.bio ? 'exists' : 'missing');
            this.renderMobileBio(composer.bio);
            
            // Render social links
            this.renderMobileSocialLinks(composer);
            
            // Render videos
            this.renderMobileVideos(composer);
            
            // Render Spotify integration
            console.log('Rendering DISCO playlist:', composer.disco_playlist ? 'exists' : 'missing');
            this.renderMobileSpotify(composer.disco_playlist);
            
            console.log('Mobile composer rendered successfully');
            
        } catch (error) {
            console.error('Error rendering mobile composer:', error);
            this.showError('Error displaying composer information');
        }
    }
    
    renderMobileBio(bio) {
        const bioContent = document.getElementById('composer_bio');
        
        if (bioContent) {
            if (bio && bio.trim()) {
                bioContent.innerHTML = bio;
                bioContent.style.color = 'rgba(0, 0, 0, 0.80)';
                bioContent.style.background = 'rgba(0, 0, 0, 0.05)';
                bioContent.style.fontWeight = '100';
            } else {
                bioContent.innerHTML = 'No biography available at this time.';
                bioContent.style.color = 'rgba(0, 0, 0, 0.60)';
                bioContent.style.background = 'rgba(0, 0, 0, 0.05)';
                bioContent.style.fontWeight = '100';
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
        
        // Spotify - Simplified and optimized
        if (composer.spotify_url && composer.spotify_url.trim()) {
            socialHtml += `
                <a href="${composer.spotify_url}" target="_blank" rel="noopener noreferrer" style="position: absolute; left: 0px; top: 0px;">
                    <div class="SocialIcons" style="width: 24.54px; height: 24.54px; cursor: pointer; border-radius: 50%; background: #1DB954; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="margin-top: 1px;">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.32 11.28-1.08 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                    </div>
                </a>
            `;
        }
        
        // Instagram - Cleaner gradient design
        if (composer.instagram_url && composer.instagram_url.trim()) {
            socialHtml += `
                <a href="${composer.instagram_url}" target="_blank" rel="noopener noreferrer" style="position: absolute; left: 51.13px; top: 0px;">
                    <div class="SocialIcons" style="width: 24.54px; height: 24.54px; cursor: pointer; border-radius: 50%; background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" stroke-width="2" fill="none"/>
                            <path d="m7 12 3 3 7-7" stroke="none" fill="none"/>
                            <circle cx="12" cy="12" r="3" stroke="white" stroke-width="2" fill="none"/>
                            <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
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
        
        // Add hover effects with CSS
        const style = document.createElement('style');
        style.textContent = `
            .SocialIcons:hover {
                transform: scale(1.1) !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            }
            .SocialIcons:active {
                transform: scale(0.95) !important;
            }
        `;
        document.head.appendChild(style);
        
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
        
        if (!spotifySection || !spotifyEmbed) {
            console.error('DISCO elements not found');
            return;
        }
        
        if (!discoPlaylist || !discoPlaylist.trim()) {
            console.log('No playlist data, hiding section');
            spotifySection.style.display = 'none';
            return;
        }
        
        console.log('DISCO: Processing playlist for mobile...');
        console.log('DISCO playlist data length:', discoPlaylist.length);
        
        // Add mobile-specific parameters to DISCO embed
        let mobileOptimizedEmbed = discoPlaylist;
        
        // If it's an iframe embed, add mobile parameters
        if (discoPlaylist.includes('<iframe')) {
            console.log('DISCO: Optimizing iframe embed for mobile');
            mobileOptimizedEmbed = discoPlaylist
                // Add mobile detection parameter
                .replace(/src="([^"]+)"/, 'src="$1&mobile=true"')
                // Add responsive width/height
                .replace(/width="[\d%]+"/, 'width="100%"')
                .replace(/height="[\d%]+"/, 'height="100%"')
                // Add mobile-friendly attributes
                .replace('<iframe', '<iframe allow="autoplay; encrypted-media" loading="lazy"');
        }
        
        // If it's a script-based embed, add mobile detection
        if (discoPlaylist.includes('<script')) {
            console.log('DISCO: Optimizing script embed for mobile');
            // Add mobile detection to script embeds
            const scriptContent = discoPlaylist.replace(
                /(<script[^>]*>)/,
                '$1\nwindow.discoMobile = true;\n'
            );
            mobileOptimizedEmbed = scriptContent;
        }
        
        // Show the section
        spotifySection.style.display = 'block';
        
        // Insert the mobile-optimized embed
        spotifyEmbed.innerHTML = mobileOptimizedEmbed;
        
        console.log('DISCO: Mobile-optimized embed inserted');
        
        // Additional mobile optimization after embed loads
        setTimeout(() => {
            this.optimizeDiscoForMobile(spotifyEmbed);
        }, 1000);
    }
    
    optimizeDiscoForMobile(embedContainer) {
        // Find any iframes created by DISCO
        const iframes = embedContainer.querySelectorAll('iframe');
        console.log(`DISCO: Found ${iframes.length} iframes for mobile optimization`);
        
        iframes.forEach((iframe, index) => {
            console.log(`DISCO: Optimizing iframe ${index + 1}`);
            
            // Add mobile-specific parameters to iframe src
            const currentSrc = iframe.src;
            if (currentSrc && !currentSrc.includes('mobile=true')) {
                const separator = currentSrc.includes('?') ? '&' : '?';
                iframe.src = `${currentSrc}${separator}mobile=true&responsive=1&theme=mobile`;
            }
            
            // Ensure iframe is responsive
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            
            // Add mobile-friendly attributes
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('allow', 'autoplay; encrypted-media');
        });
        
        // Handle script-based embeds
        const scripts = embedContainer.querySelectorAll('script');
        if (scripts.length > 0) {
            console.log('DISCO: Found script-based embed, setting mobile context');
            window.discoMobileContext = true;
        }
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
            const active = i === this.currentVideoIndex ? 'background: #F4A461;' : 'background: rgba(244, 164, 97, 0.5);';
            indicatorsHTML += `<div style="width: 8px; height: 8px; border-radius: 50%; ${active} cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(255, 255, 255, 0.3);" data-index="${i}"></div>`;
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
