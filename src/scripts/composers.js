import { supabase } from './supabase.js'

/**
 * Loads visible composers filtered by site version
 * @param {string} siteVersion - The site version to filter by (default: 'version_1')
 * @returns {Promise<Array>} - Array of composer objects
 */
export async function loadVisibleComposers(siteVersion = 'version_1') {
    console.log('Loading composers for version:', siteVersion);
    
    // Try with contains first (for array-based site_version)
    let { data: composers, error } = await supabase
        .from('composers')
        .select('*')
        .eq('is_visible', true)
        .contains('site_version', [siteVersion])
        .order('display_order')

    // If no results with contains, try with direct equality (for string-based site_version)
    if (!composers || composers.length === 0) {
        console.log('No composers found with contains, trying direct equality...');
        const { data: composersEq, error: errorEq } = await supabase
            .from('composers')
            .select('*')
            .eq('is_visible', true)
            .eq('site_version', siteVersion)
            .order('display_order')
        
        composers = composersEq;
        error = errorEq;
    }

    // If still no results, fall back to all visible composers
    if (!composers || composers.length === 0) {
        console.log('No composers found with version filter, loading all visible composers...');
        const { data: allVisible, error: allError } = await supabase
            .from('composers')
            .select('*')
            .eq('is_visible', true)
            .order('display_order')
        
        composers = allVisible;
        error = allError;
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