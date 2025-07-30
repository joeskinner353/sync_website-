import { supabase } from './supabase.js'

/**
 * Loads visible composers filtered by site version
 * @param {string} siteVersion - The site version to filter by (default: 'version_2')
 * @returns {Promise<Array>} - Array of composer objects
 */
export async function loadVisibleComposers(siteVersion = 'version_2') {
    console.log('Loading composers for version:', siteVersion);
    
        // Try contains first (for JSON arrays)
    let { data: composers, error } = await supabase
        .from('composers')
        .select('*')
        .contains('site_version', [siteVersion])
        .eq('is_visible', true)
        .order('display_order');

    // If no results, try equality (for single values)
    if (!composers || composers.length === 0) {
        console.log('Trying equality filter for version...');
        const { data: singleVersionData, error: singleError } = await supabase
            .from('composers')
            .select('*')
            .eq('site_version', siteVersion)
            .eq('is_visible', true)
            .order('display_order')
        
        composers = singleVersionData;
        error = singleError;
    }

    // No fallback - if no composers match the version, show none
    if (!composers || composers.length === 0) {
        console.log(`No composers found for version '${siteVersion}' - this is correct behavior`);
        composers = [];
        error = null;
    }

    if (error) {
        console.error('Error loading composers:', error)
        return []
    }

    console.log(`Loaded ${composers?.length || 0} composers`);
    return composers || []
}

export function createComposerElement(composer) {
    const composerLink = document.createElement('a')
    composerLink.href = `composer.html?slug=${composer.slug}`
    composerLink.className = 'carousel-link'

    const img = document.createElement('img')
    img.src = composer.primary_photo_url
    img.alt = composer.name

    const nameOverlay = document.createElement('div')
    nameOverlay.className = 'composer-name-overlay'
    nameOverlay.textContent = composer.name

    composerLink.appendChild(img)
    composerLink.appendChild(nameOverlay)
    return composerLink
}