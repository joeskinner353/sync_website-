import { supabase } from './supabase.js';

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

        videosSection.innerHTML = videoUrls.map(url => `
            <iframe 
                width="280" 
                height="157" 
                src="${url}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `).join('');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadComposerData);