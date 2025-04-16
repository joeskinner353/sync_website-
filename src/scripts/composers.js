import { supabase } from './supabase.js'

export async function loadVisibleComposers() {
    const { data: composers, error } = await supabase
        .from('composers')
        .select('*')
        .eq('is_visible', true)
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

    composerLink.appendChild(img)
    return composerLink
}