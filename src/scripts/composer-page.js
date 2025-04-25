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

// Initialize PDF download functionality
function initPdfDownload() {
    const downloadButton = document.getElementById('download-pdf');
    if (!downloadButton) return;
    
    downloadButton.addEventListener('click', async () => {
        // Get loading overlay
        const loadingOverlay = document.getElementById('pdf-loading');
        
        try {
            // Show loading overlay
            if (loadingOverlay) loadingOverlay.style.display = 'flex';
            
            // Get composer name for the filename
            const composerName = document.querySelector('.ComposerName')?.textContent || 'composer';
            const filename = `${composerName.trim().replace(/\s+/g, '_')}_profile.pdf`;
            
            // Create PDF content container matching Figma layout exactly
            const contentContainer = document.createElement('div');
            contentContainer.className = 'pdf-container OneSheetPdf';
            contentContainer.style.width = '595px';
            contentContainer.style.height = '842px';
            contentContainer.style.position = 'absolute';
            contentContainer.style.left = '-9999px';
            contentContainer.style.backgroundColor = '#F4A461';
            contentContainer.style.overflow = 'hidden';
            
            // 1. Add Concord Logo - exactly as in Figma
            const logoImg = document.createElement('img');
            logoImg.className = 'ConcordCIconRed1';
            logoImg.src = 'assets/images/concord-C-icon-red.png';
            logoImg.style.width = '100px';
            logoImg.style.height = '100px';
            logoImg.style.left = '22px';
            logoImg.style.top = '15px';
            logoImg.style.position = 'absolute';
            contentContainer.appendChild(logoImg);

            // 2. Add "concord music publishing" text
            const publishingText = document.createElement('div');
            publishingText.className = 'ConcordMusicPublishing';
            publishingText.textContent = 'concord music publishing';
            publishingText.style.width = '630px';
            publishingText.style.height = '62px';
            publishingText.style.left = '-118px';
            publishingText.style.top = '31px';
            publishingText.style.position = 'absolute';
            publishingText.style.textAlign = 'right';
            publishingText.style.display = 'flex';
            publishingText.style.flexDirection = 'column';
            publishingText.style.justifyContent = 'center';
            publishingText.style.color = 'white';
            publishingText.style.fontSize = '30px';
            publishingText.style.fontFamily = 'CircularXX TT';
            publishingText.style.fontWeight = '900';
            publishingText.style.wordWrap = 'break-word';
            contentContainer.appendChild(publishingText);
            
            // 3. Add Composer Name - exactly as in Figma
            const nameElement = document.createElement('div');
            nameElement.className = 'ComposerName';
            nameElement.textContent = composerName;
            nameElement.style.width = '502px';
            nameElement.style.height = '67px';
            nameElement.style.left = '31px';
            nameElement.style.top = '137px';
            nameElement.style.position = 'absolute';
            nameElement.style.color = 'black';
            nameElement.style.fontSize = '30px';
            nameElement.style.fontFamily = 'CircularXX TT';
            nameElement.style.fontWeight = '900';
            nameElement.style.wordWrap = 'break-word';
            contentContainer.appendChild(nameElement);

            // 4. Composer Bio - with reduced text size and font weight
            const bioElement = document.querySelector('.ComposerBio');
            if (bioElement) {
                const bioContent = document.createElement('div');
                bioContent.className = 'ComposerBio';
                bioContent.innerHTML = bioElement.innerHTML;
                bioContent.style.width = '233px';
                bioContent.style.height = '233px';
                bioContent.style.left = '300px';
                bioContent.style.top = '137px';
                bioContent.style.position = 'absolute';
                bioContent.style.color = 'rgba(0, 0, 0, 0.80)';
                bioContent.style.fontSize = '13.5px'; // Reduced by 10% from original 15px
                bioContent.style.fontFamily = 'CircularXX TT';
                bioContent.style.fontWeight = '500'; // Reduced from 900 to 500
                bioContent.style.wordWrap = 'break-word';
                contentContainer.appendChild(bioContent);
            }
            
            // 5. Social Icons Frame - updated position to match new layout
            const socialFrame = document.createElement('div');
            socialFrame.className = 'Frame1';
            socialFrame.style.left = '34px';
            socialFrame.style.top = '204px'; // Updated to match new position
            socialFrame.style.position = 'absolute';
            socialFrame.style.display = 'inline-flex';
            socialFrame.style.justifyContent = 'flex-start';
            socialFrame.style.alignItems = 'center';
            socialFrame.style.gap = '20px';
            
            // Extract composer social URLs directly from the DOM for reliability
            // We need to get the actual href attributes from the page
            const composerSpotifyUrl = document.querySelector('a[href*="spotify.com"]')?.href || '';
            const composerInstagramUrl = document.querySelector('a[href*="instagram.com"]')?.href || '';
            const composerTiktokUrl = document.querySelector('a[href*="tiktok.com"]')?.href || '';
            
            // Add Spotify icon if available
            if (composerSpotifyUrl) {
                const spotifyContainer = document.createElement('a');
                spotifyContainer.href = composerSpotifyUrl;
                spotifyContainer.target = '_blank';
                spotifyContainer.className = 'SocialIcons';
                spotifyContainer.style.width = '24px';
                spotifyContainer.style.height = '24px';
                spotifyContainer.style.position = 'relative';
                
                // Use the provided SVG for Spotify
                spotifyContainer.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.9633 0C5.35629 0 0 5.35614 0 11.9631C0 18.5704 5.35629 23.9261 11.9633 23.9261C18.571 23.9261 23.9267 18.5704 23.9267 11.9631C23.9267 5.35657 18.571 0.000571425 11.9631 0.000571425L11.9633 0ZM17.4496 17.2543C17.2353 17.6057 16.7753 17.7171 16.4239 17.5014C13.615 15.7857 10.079 15.3971 5.91471 16.3486C5.51343 16.44 5.11343 16.1886 5.022 15.7871C4.93014 15.3857 5.18057 14.9857 5.58286 14.8943C10.14 13.8527 14.049 14.3014 17.2024 16.2286C17.5539 16.4443 17.6653 16.9029 17.4496 17.2543ZM18.9139 13.9964C18.6439 14.4357 18.0696 14.5743 17.631 14.3043C14.4153 12.3273 9.51343 11.7549 5.70986 12.9094C5.21657 13.0584 4.69557 12.7804 4.54586 12.288C4.39729 11.7947 4.67543 11.2747 5.16786 11.1247C9.51257 9.80643 14.9139 10.445 18.6067 12.7143C19.0453 12.9843 19.1839 13.5584 18.9139 13.9964ZM19.0396 10.6044C15.1839 8.31429 8.82243 8.10371 5.14114 9.221C4.55 9.40029 3.92486 9.06657 3.74571 8.47543C3.56657 7.884 3.9 7.25929 4.49157 7.07957C8.71743 5.79671 15.7424 6.04457 20.1816 8.67986C20.7144 8.99543 20.8887 9.68214 20.573 10.2131C20.2587 10.7449 19.5701 10.9201 19.0401 10.6044H19.0396Z" fill="#1ED760"/>
                    </svg>
                `;
                
                socialFrame.appendChild(spotifyContainer);
            }
            
            // Add Instagram icon if available
            if (composerInstagramUrl) {
                const instaContainer = document.createElement('a');
                instaContainer.href = composerInstagramUrl;
                instaContainer.target = '_blank';
                instaContainer.className = 'SocialIcons';
                instaContainer.style.width = '24px';
                instaContainer.style.height = '24px';
                instaContainer.style.position = 'relative';
                instaContainer.style.overflow = 'hidden';
                
                // Use the provided SVG for Instagram
                instaContainer.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_124_39)">
                            <path d="M12 2.16094C15.2063 2.16094 15.5859 2.175 16.8469 2.23125C18.0188 2.28281 18.6516 2.47969 19.0734 2.64375C19.6313 2.85938 20.0344 3.12188 20.4516 3.53906C20.8734 3.96094 21.1313 4.35938 21.3469 4.91719C21.5109 5.33906 21.7078 5.97656 21.7594 7.14375C21.8156 8.40937 21.8297 8.78906 21.8297 11.9906C21.8297 15.1969 21.8156 15.5766 21.7594 16.8375C21.7078 18.0094 21.5109 18.6422 21.3469 19.0641C21.1313 19.6219 20.8688 20.025 20.4516 20.4422C20.0297 20.8641 19.6313 21.1219 19.0734 21.3375C18.6516 21.5016 18.0141 21.6984 16.8469 21.75C15.5813 21.8063 15.2016 21.8203 12 21.8203C8.79375 21.8203 8.41406 21.8063 7.15313 21.75C5.98125 21.6984 5.34844 21.5016 4.92656 21.3375C4.36875 21.1219 3.96563 20.8594 3.54844 20.4422C3.12656 20.0203 2.86875 19.6219 2.65313 19.0641C2.48906 18.6422 2.29219 18.0047 2.24063 16.8375C2.18438 15.5719 2.17031 15.1922 2.17031 11.9906C2.17031 8.78438 2.18438 8.40469 2.24063 7.14375C2.29219 5.97187 2.48906 5.33906 2.65313 4.91719C2.86875 4.35938 3.13125 3.95625 3.54844 3.53906C3.97031 3.11719 4.36875 2.85938 4.92656 2.64375C5.34844 2.47969 5.98594 2.28281 7.15313 2.23125C8.41406 2.175 8.79375 2.16094 12 2.16094ZM12 0C8.74219 0 8.33438 0.0140625 7.05469 0.0703125C5.77969 0.126563 4.90313 0.332812 4.14375 0.628125C3.35156 0.9375 2.68125 1.34531 2.01563 2.01562C1.34531 2.68125 0.9375 3.35156 0.628125 4.13906C0.332812 4.90313 0.126563 5.775 0.0703125 7.05C0.0140625 8.33437 0 8.74219 0 12C0 15.2578 0.0140625 15.6656 0.0703125 16.9453C0.126563 18.2203 0.332812 19.0969 0.628125 19.8563C0.9375 20.6484 1.34531 21.3188 2.01563 21.9844C2.68125 22.65 3.35156 23.0625 4.13906 23.3672C4.90313 23.6625 5.775 23.8687 7.05 23.925C8.32969 23.9812 8.7375 23.9953 11.9953 23.9953C15.2531 23.9953 15.6609 23.9812 16.9406 23.925C18.2156 23.8687 19.0922 23.6625 19.8516 23.3672C20.6391 23.0625 21.3094 22.65 21.975 21.9844C22.6406 21.3188 23.0531 20.6484 23.3578 19.8609C23.6531 19.0969 23.8594 18.225 23.9156 16.95C23.9719 15.6703 23.9859 15.2625 23.9859 12.0047C23.9859 8.74688 23.9719 8.33906 23.9156 7.05938C23.8594 5.78438 23.6531 4.90781 23.3578 4.14844C23.0625 3.35156 22.6547 2.68125 21.9844 2.01562C21.3188 1.35 20.6484 0.9375 19.8609 0.632812C19.0969 0.3375 18.225 0.13125 16.95 0.075C15.6656 0.0140625 15.2578 0 12 0Z" fill="#000100"/>
                            <path d="M12 5.83594C8.59688 5.83594 5.83594 8.59688 5.83594 12C5.83594 15.4031 8.59688 18.1641 12 18.1641C15.4031 18.1641 18.1641 15.4031 18.1641 12C18.1641 8.59688 15.4031 5.83594 12 5.83594ZM12 15.9984C9.79219 15.9984 8.00156 14.2078 8.00156 12C8.00156 9.79219 9.79219 8.00156 12 8.00156C14.2078 8.00156 15.9984 9.79219 15.9984 12C15.9984 14.2078 14.2078 15.9984 12 15.9984Z" fill="#000100"/>
                            <path d="M19.8469 5.5922C19.8469 6.38908 19.2 7.03127 18.4078 7.03127C17.6109 7.03127 16.9688 6.38439 16.9688 5.5922C16.9688 4.79533 17.6156 4.15314 18.4078 4.15314C19.2 4.15314 19.8469 4.80001 19.8469 5.5922Z" fill="#000100"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_124_39">
                                <rect width="24" height="24" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
                `;
                
                socialFrame.appendChild(instaContainer);
            }
            
            // Add TikTok icon if available
            if (composerTiktokUrl) {
                const tiktokContainer = document.createElement('a');
                tiktokContainer.href = composerTiktokUrl;
                tiktokContainer.target = '_blank';
                tiktokContainer.className = 'SocialIcons';
                tiktokContainer.style.width = '24px';
                tiktokContainer.style.height = '24px';
                tiktokContainer.style.position = 'relative';
                
                // Use the provided SVG for TikTok
                tiktokContainer.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.1762 8.66347C18.7196 9.77064 20.6102 10.4221 22.6523 10.4221V6.47861C22.2658 6.47869 21.8803 6.43825 21.5023 6.35786V9.46193C19.4604 9.46193 17.57 8.81049 16.0262 7.7034V15.7509C16.0262 19.7766 12.7743 23.0399 8.76309 23.0399C7.26641 23.0399 5.87531 22.5858 4.71973 21.807C6.03864 23.1604 7.87796 24 9.91285 24C13.9243 24 17.1764 20.7367 17.1764 16.7108V8.66347H17.1762V8.66347ZM18.5949 4.68499C17.8061 3.82023 17.2883 2.70267 17.1762 1.46717V0.959961H16.0864C16.3607 2.53028 17.2964 3.87187 18.5949 4.68499ZM7.25681 18.7178C6.81614 18.1379 6.578 17.4286 6.57907 16.6992C6.57907 14.858 8.06647 13.3651 9.90153 13.3651C10.2435 13.365 10.5835 13.4176 10.9094 13.5214V9.48977C10.5285 9.43739 10.1441 9.41515 9.75986 9.4233V12.5613C9.4337 12.4575 9.0936 12.4048 8.75152 12.4051C6.91646 12.4051 5.42914 13.8979 5.42914 15.7393C5.42914 17.0414 6.1726 18.1687 7.25681 18.7178Z" fill="#FF004F"/>
                        <path d="M16.027 7.70332C17.5707 8.81041 19.4611 9.46185 21.503 9.46185V6.35778C20.3632 6.11414 19.3543 5.5164 18.5956 4.68499C17.2971 3.87179 16.3615 2.5302 16.0872 0.959961H13.2246V16.7106C13.2181 18.5468 11.7332 20.0336 9.90211 20.0336C8.82306 20.0336 7.86443 19.5174 7.25731 18.7178C6.17318 18.1687 5.42972 17.0413 5.42972 15.7394C5.42972 13.8981 6.91704 12.4052 8.7521 12.4052C9.10369 12.4052 9.44256 12.4602 9.76044 12.5614V9.42338C5.8197 9.50509 2.65039 12.7365 2.65039 16.7107C2.65039 18.6946 3.43962 20.4931 4.72055 21.8071C5.87614 22.5858 7.26724 23.04 8.76391 23.04C12.7752 23.04 16.027 19.7765 16.027 15.7509V7.70332H16.027Z" fill="black"/>
                        <path d="M21.5025 6.3578V5.51848C20.4748 5.52005 19.4672 5.23119 18.5952 4.68493C19.3671 5.53306 20.3835 6.11787 21.5025 6.3578ZM16.0867 0.959983C16.0605 0.809911 16.0404 0.658851 16.0265 0.507214V0H12.074V15.7508C12.0677 17.5868 10.5829 19.0736 8.75164 19.0736C8.214 19.0736 7.70638 18.9455 7.25685 18.7179C7.86397 19.5174 8.82259 20.0336 9.90164 20.0336C11.7326 20.0336 13.2177 18.5469 13.2241 16.7107V0.959983H16.0867ZM9.76014 9.42341V8.52989C9.42988 8.48459 9.09691 8.46186 8.76353 8.46202C4.75192 8.46194 1.5 11.7254 1.5 15.7508C1.5 18.2745 2.77806 20.4987 4.72017 21.807C3.43924 20.493 2.65001 18.6944 2.65001 16.7106C2.65001 12.7365 5.81924 9.50511 9.76014 9.42341Z" fill="#00F2EA"/>
                    </svg>
                `;
                
                socialFrame.appendChild(tiktokContainer);
            }
            
            contentContainer.appendChild(socialFrame);
            
            // 6. Composer Image - updated position to match new layout
            const profileImage = document.querySelector('.ComposerImage');
            if (profileImage && profileImage.style.backgroundImage) {
                const imageUrl = profileImage.style.backgroundImage.replace(/url\(['"](.+)['"]\)/, '$1');
                if (imageUrl) {
                    const imgElement = document.createElement('div');
                    imgElement.className = 'ComposerImage';
                    imgElement.style.width = '230px';
                    imgElement.style.height = '230px';
                    imgElement.style.left = '29px'; // Updated to match new position
                    imgElement.style.top = '255px'; // Updated to match new position
                    imgElement.style.position = 'absolute';
                    imgElement.style.backgroundImage = `url(${imageUrl})`;
                    imgElement.style.backgroundSize = 'cover';
                    imgElement.style.backgroundPosition = 'center';
                    contentContainer.appendChild(imgElement);
                }
            }
            
            // 7. Add date and copyright at bottom
            const dateElement = document.createElement('div');
            dateElement.style.position = 'absolute';
            dateElement.style.bottom = '20px';
            dateElement.style.right = '31px';
            dateElement.style.fontSize = '10px';
            dateElement.style.color = 'rgba(0, 0, 0, 0.60)';
            dateElement.style.fontFamily = 'CircularXX TT';
            dateElement.textContent = `Generated: ${new Date().toLocaleDateString()}`;
            contentContainer.appendChild(dateElement);
            
            // 8. Add copyright
            const copyrightElement = document.createElement('div');
            copyrightElement.style.position = 'absolute';
            copyrightElement.style.bottom = '20px';
            copyrightElement.style.left = '31px';
            copyrightElement.style.fontSize = '10px';
            copyrightElement.style.color = 'rgba(0, 0, 0, 0.60)';
            copyrightElement.style.fontFamily = 'CircularXX TT';
            copyrightElement.textContent = `© ${new Date().getFullYear()} Concord Music Publishing`;
            contentContainer.appendChild(copyrightElement);
            
            // Temporarily append to document
            document.body.appendChild(contentContainer);
            
            // Generate PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            
            // Render the HTML content to canvas
            const canvas = await html2canvas(contentContainer, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                allowTaint: true,
                backgroundColor: '#F4A461'
            });
            
            // Add the rendered content to the PDF - exact A4 size
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                0,
                595, // A4 width
                842  // A4 height
            );
            
            // Store social media URLs for adding clickable link annotations
            const socialLinks = [];
            
            // Calculate positions for clickable areas on the icons
            if (composerSpotifyUrl) {
                socialLinks.push({
                    url: composerSpotifyUrl,
                    x: 34, // Left position of Spotify icon
                    y: 204, // Top position of Spotify icon
                    width: 24,
                    height: 24
                });
            }
            
            if (composerInstagramUrl) {
                socialLinks.push({
                    url: composerInstagramUrl,
                    x: 78, // Left position of Instagram icon (34 + 24 + 20 gap)
                    y: 204, // Top position
                    width: 24,
                    height: 24
                });
            }
            
            if (composerTiktokUrl) {
                socialLinks.push({
                    url: composerTiktokUrl,
                    x: 122, // Left position of TikTok icon (78 + 24 + 20 gap)
                    y: 204, // Top position
                    width: 24, 
                    height: 24
                });
            }
            
            // Add Concord logo link
            socialLinks.push({
                url: 'https://concord.com/music-publishing/',
                x: 22, // Left position of Concord logo
                y: 15, // Top position of Concord logo
                width: 100, // Width of the logo
                height: 100 // Height of the logo
            });
            
            // Add clickable link annotations to the PDF
            socialLinks.forEach(link => {
                pdf.link(link.x, link.y, link.width, link.height, { url: link.url });
            });
            
            // Save the PDF
            pdf.save(filename);
            
            // Remove the temporary element
            document.body.removeChild(contentContainer);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('There was an error generating the PDF. Please try again.');
        } finally {
            // Hide loading overlay
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadComposerData();
    initPdfDownload();
});