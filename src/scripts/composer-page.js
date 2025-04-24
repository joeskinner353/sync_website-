import { supabase } from './supabase.js';
import { getCurrentVersion } from './site-version.js';

// Convert Vimeo URL to embed URL and thumbnail URL
function getVimeoUrls(url) {
    try {
        const vimeoRegex = /(?:vimeo.com\/|player.vimeo.com\/video\/)(\d+)/;
        const match = url.match(vimeoRegex);
        if (match && match[1]) {
            const videoId = match[1];
            return {
                embed: `https://player.vimeo.com/video/${videoId}?h=&title=0&byline=0&portrait=0`,
                thumbnail: `https://vumbnail.com/${videoId}.jpg`
            };
        }
        return { embed: url, thumbnail: null };
    } catch (err) {
        console.error('Error processing Vimeo URL:', err);
        return { embed: url, thumbnail: null };
    }
}

// Convert Vimeo URL to embed URL
function getVimeoEmbedUrl(url) {
    try {
        const vimeoRegex = /(?:vimeo.com\/|player.vimeo.com\/video\/)(\d+)/;
        const match = url.match(vimeoRegex);
        if (match && match[1]) {
            const videoId = match[1];
            return `https://player.vimeo.com/video/${videoId}?h=&title=0&byline=0&portrait=0`;
        }
        return url;
    } catch (err) {
        console.error('Error processing Vimeo URL:', err);
        return url;
    }
}

// Initialize smooth scrolling for video thumbnails
function initVideoScroll() {
    const videoThumbnails = document.querySelector('.video-thumbnails');
    if (!videoThumbnails) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    videoThumbnails.addEventListener('mousedown', (e) => {
        isDown = true;
        videoThumbnails.style.cursor = 'grabbing';
        startX = e.pageX - videoThumbnails.offsetLeft;
        scrollLeft = videoThumbnails.querySelector('.video-track').style.transform || 'translateX(0)';
        scrollLeft = parseInt(scrollLeft.match(/-?\d+/) || 0);
    });

    videoThumbnails.addEventListener('mouseleave', () => {
        isDown = false;
        videoThumbnails.style.cursor = 'grab';
    });

    videoThumbnails.addEventListener('mouseup', () => {
        isDown = false;
        videoThumbnails.style.cursor = 'grab';
    });

    videoThumbnails.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - videoThumbnails.offsetLeft;
        const walk = (x - startX) * 2;
        const track = videoThumbnails.querySelector('.video-track');
        track.style.transform = `translateX(${scrollLeft + walk}px)`;
    });
}

// Function to handle video selection
function handleVideoClick(url, composer) {
    const featuredVideo = document.querySelector('.featured-video');
    if (featuredVideo) {
        const urls = getVimeoUrls(url);
        featuredVideo.innerHTML = `
            <iframe 
                src="${urls.embed}" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer"
                title="${composer.name}'s Featured Video">
            </iframe>
        `;
    }
}

// Handle fullscreen for active video
function setupVideoFullscreen() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Backspace') {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    });
}

async function loadComposerData() {
    // Get slug from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        console.error('No composer slug provided');
        return;
    }
    
    // Get current site version
    const currentVersion = getCurrentVersion();
    console.log(`Loading composer for site version: ${currentVersion}`);

    // Fetch composer data from Supabase with site version filtering
    const { data: composer, error } = await supabase
        .from('composers')
        .select('*')
        .eq('slug', slug)
        .eq('is_visible', true)
        .contains('site_version', [currentVersion])
        .single();

    if (error || !composer) {
        console.error('Error loading composer:', error);
        // If composer not found for current version, try without version filter
        // as a fallback (useful for transitioning between versions)
        const { data: fallbackComposer, error: fallbackError } = await supabase
            .from('composers')
            .select('*')
            .eq('slug', slug)
            .eq('is_visible', true)
            .single();
            
        if (fallbackError || !fallbackComposer) {
            console.error('Composer not found even with fallback:', fallbackError);
            document.body.innerHTML = '<div style="text-align: center; padding: 50px;"><h1>Composer not found</h1><p>The composer you are looking for is not available in the current site version.</p></div>';
            return;
        }
        
        console.log('Using fallback composer data (not filtered by version)');
        populateComposerData(fallbackComposer);
        return;
    }

    populateComposerData(composer);
}

// Function to populate composer data in the UI
function populateComposerData(composer) {
    // Update page content
    document.querySelector('.ComposerName').textContent = composer.name;
    document.querySelector('.ComposerBio').textContent = composer.bio;

    // Update social links
    const spotifyIcon = document.querySelector('a[href] svg path[fill="#1ED760"]')?.closest('a');
    const instagramIcon = document.querySelector('a[href] svg g[clip-path]')?.closest('a');
    const tiktokIcon = document.querySelector('a[href] svg path[fill="#FF004F"]')?.closest('a');

    if (spotifyIcon && composer.spotify_url) {
        spotifyIcon.href = composer.spotify_url;
    } else if (spotifyIcon) {
        spotifyIcon.style.display = 'none';
    }
    
    if (instagramIcon && composer.instagram_url) {
        instagramIcon.href = composer.instagram_url;
    } else if (instagramIcon) {
        instagramIcon.style.display = 'none';
    }
    
    if (tiktokIcon && composer.tiktok_url) {
        tiktokIcon.href = composer.tiktok_url;
    } else if (tiktokIcon) {
        tiktokIcon.style.display = 'none';
    }

    // Update composer image
    const composerImage = document.querySelector('.ComposerImage');
    if (composerImage && composer.primary_photo_url) {
        composerImage.style.backgroundImage = `url(${composer.primary_photo_url})`;
        composerImage.style.backgroundSize = 'cover';
        composerImage.style.backgroundPosition = 'center';
    }

    // Update videos section
    const videosSection = document.querySelector('.ComposerVideos');
    if (videosSection) {
        const videoUrls = [
            composer.video_link_1,
            composer.video_link_2,
            composer.video_link_3,
            composer.video_link_4
        ].filter(url => url);

        if (videoUrls.length > 0) {
            const videoSlider = videosSection.querySelector('.video-slider');
            const videoTrack = videosSection.querySelector('.video-track');
            const videoIndicator = videosSection.querySelector('.video-indicator');
            
            if (videoTrack) {
                // Clear existing content
                videoTrack.innerHTML = '';
                
                // Add videos to track
                videoUrls.forEach((url, index) => {
                    const embedUrl = getVimeoEmbedUrl(url);
                    
                    const videoContainer = document.createElement('div');
                    videoContainer.className = 'video-container';
                    videoContainer.dataset.videoUrl = url;
                    videoContainer.dataset.index = index;
                    
                    videoContainer.innerHTML = `
                        <iframe 
                            src="${embedUrl}" 
                            frameborder="0" 
                            allow="autoplay; fullscreen-request; picture-in-picture" 
                            loading="lazy"
                            referrerpolicy="no-referrer"
                            title="${composer.name}'s Video ${index + 1}">
                        </iframe>
                    `;
                    
                    videoTrack.appendChild(videoContainer);
                    
                    // Add indicator dot for this video
                    const dot = document.createElement('div');
                    dot.className = `video-dot ${index === 0 ? 'active' : ''}`;
                    dot.dataset.index = index;
                    if (videoIndicator) {
                        videoIndicator.appendChild(dot);
                    }
                });
                
                // Set up video navigation
                let currentIndex = 0;
                updateVideoPosition();
                
                // Function to update video position
                function updateVideoPosition() {
                    if (!videoTrack) return;
                    const offset = -currentIndex * 100;
                    videoTrack.style.transform = `translateX(${offset}%)`;
                    
                    // Update indicator dots
                    const dots = videoIndicator.querySelectorAll('.video-dot');
                    dots.forEach((dot, i) => {
                        if (i === currentIndex) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    });
                }
                
                // Add click handlers for navigation buttons
                const prevBtn = videosSection.querySelector('.video-nav-btn.prev');
                const nextBtn = videosSection.querySelector('.video-nav-btn.next');
                
                if (prevBtn) {
                    prevBtn.addEventListener('click', () => {
                        currentIndex = (currentIndex - 1 + videoUrls.length) % videoUrls.length;
                        updateVideoPosition();
                    });
                }
                
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        currentIndex = (currentIndex + 1) % videoUrls.length;
                        updateVideoPosition();
                    });
                }
                
                // Add click handlers for indicator dots
                if (videoIndicator) {
                    videoIndicator.addEventListener('click', (e) => {
                        const dot = e.target.closest('.video-dot');
                        if (dot) {
                            currentIndex = parseInt(dot.dataset.index);
                            updateVideoPosition();
                        }
                    });
                }
                
                // Set up keyboard navigation
                document.addEventListener('keydown', (e) => {
                    // Only handle arrow keys if video section is in viewport
                    const rect = videosSection.getBoundingClientRect();
                    const isInView = (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                    );
                    
                    if (isInView) {
                        if (e.key === 'ArrowLeft') {
                            currentIndex = (currentIndex - 1 + videoUrls.length) % videoUrls.length;
                            updateVideoPosition();
                        } else if (e.key === 'ArrowRight') {
                            currentIndex = (currentIndex + 1) % videoUrls.length;
                            updateVideoPosition();
                        }
                    }
                });
                
                // Handle fullscreen
                setupVideoFullscreen();
            }
        } else {
            videosSection.style.display = 'none';
        }
    }

    // Update disco section with playlist
    const discoSection = document.querySelector('.ComposerDisco');
    if (discoSection && composer.disco_playlist) {
        try {
            discoSection.innerHTML = composer.disco_playlist;
            
            // Add security attributes to the generated iframe
            const iframe = discoSection.querySelector('iframe');
            if (iframe) {
                iframe.setAttribute('loading', 'lazy');
                iframe.setAttribute('referrerpolicy', 'no-referrer');
                iframe.setAttribute('title', `${composer.name}'s Playlist`);
                iframe.style.borderRadius = '12px';
            }
        } catch (err) {
            console.error('Error loading disco playlist:', err);
            discoSection.style.display = 'none';
        }
    } else {
        discoSection.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadComposerData);