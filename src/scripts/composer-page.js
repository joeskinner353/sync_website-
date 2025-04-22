import { supabase } from './supabase.js';

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

function handleFullscreenChange() {
    if (!document.fullscreenElement) {
        const fullscreenVideo = document.querySelector('.video-container.fullscreen');
        if (fullscreenVideo) {
            fullscreenVideo.classList.remove('fullscreen');
        }
    }
}

function handleKeyboardEvents(e) {
    if ((e.key === 'Escape' || e.key === 'Backspace') && document.querySelector('.video-container.fullscreen')) {
        document.exitFullscreen().catch(err => console.log(err));
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

async function loadComposerData() {
    // Get slug from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        console.error('No composer slug provided');
        return;
    }

    // Fetch composer data from Supabase
    const { data: composer, error } = await supabase
        .from('composers')
        .select('*')
        .eq('slug', slug)
        .eq('is_visible', true)
        .single();

    if (error || !composer) {
        console.error('Error loading composer:', error);
        return;
    }

    // Update page content
    document.querySelector('.ComposerName').textContent = composer.name;
    document.querySelector('.ComposerBio').textContent = composer.bio;

    // Update social links
    const spotifyIcon = document.querySelector('[data-platform="Spotify"]');
    const instagramIcon = document.querySelector('[data-platform="Instagram"]');
    const tiktokIcon = document.querySelector('[data-platform="TikTok"]');

    if (spotifyIcon && composer.spotify_url) {
        spotifyIcon.parentElement.href = composer.spotify_url;
    }
    if (instagramIcon && composer.instagram_url) {
        instagramIcon.parentElement.href = composer.instagram_url;
    }
    if (tiktokIcon && composer.tiktok_url) {
        tiktokIcon.parentElement.href = composer.tiktok_url;
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
            const videoTrack = document.createElement('div');
            videoTrack.className = 'video-track';
            
            videoTrack.innerHTML = videoUrls.map((url, index) => {
                const embedUrl = getVimeoEmbedUrl(url);
                return `
                    <div class="video-container" data-video-url="${url}">
                        <iframe 
                            src="${embedUrl}" 
                            frameborder="0" 
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowfullscreen
                            loading="lazy"
                            referrerpolicy="no-referrer"
                            title="${composer.name}'s Video ${index + 1}">
                        </iframe>
                    </div>
                `;
            }).join('');

            // Add click handlers to video containers
            videoTrack.addEventListener('click', async (e) => {
                const container = e.target.closest('.video-container');
                if (!container) return;
                
                // Toggle fullscreen
                if (container.classList.contains('fullscreen')) {
                    document.exitFullscreen().catch(err => console.log(err));
                } else {
                    // Remove fullscreen from any other video first
                    const currentFullscreen = document.querySelector('.video-container.fullscreen');
                    if (currentFullscreen) {
                        currentFullscreen.classList.remove('fullscreen');
                    }
                    
                    container.classList.add('fullscreen');
                    try {
                        await container.requestFullscreen();
                    } catch (err) {
                        console.log('Fullscreen request failed:', err);
                    }
                }
            });

            videosSection.innerHTML = '';
            videosSection.appendChild(videoTrack);

            // Add event listeners for fullscreen and keyboard events
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('keydown', handleKeyboardEvents);
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