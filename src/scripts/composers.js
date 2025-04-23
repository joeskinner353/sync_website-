import { supabase } from './supabase.js'

/**
 * Loads visible composers filtered by site version
 * @param {string} siteVersion - The site version to filter by (default: 'version_1')
 * @returns {Promise<Array>} - Array of composer objects
 */
export async function loadVisibleComposers(siteVersion = 'version_1') {
    const { data: composers, error } = await supabase
        .from('composers')
        .select('*')
        .eq('is_visible', true)
        .contains('site_version', [siteVersion])
        .order('display_order')

    if (error) {
        console.error('Error loading composers:', error)
        return []
    }

    return composers
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