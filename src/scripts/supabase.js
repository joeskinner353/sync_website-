// Import Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm'

// Get Supabase URL and API key from environment variables if available
// Otherwise fall back to the hardcoded values for local development
const supabaseUrl = typeof process !== 'undefined' && process.env.SUPABASE_URL 
    ? process.env.SUPABASE_URL 
    : 'https://lycmyaohsycrdergwpmq.supabase.co';

const supabaseKey = typeof process !== 'undefined' && process.env.SUPABASE_KEY
    ? process.env.SUPABASE_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Y215YW9oc3ljcmRlcmd3cG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTM2NjMsImV4cCI6MjA1OTE4OTY2M30.5j6yCAuQEkTCKfkFK7eETPn_2TOR9bpGUBuzsbdlRfY';

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function loadFTVImages() {
    try {
        console.log('Creating public URLs for FTV images with correct formats...');
        
        // Define the known images, including Mr Loverman with underscore in filename
        const knownImages = [
            { filename: 'catastrophe.jpg', name: 'Catastrophe' },
            { filename: 'night_manager.png', name: 'Night Manager' }, 
            { filename: 'taskmaster.png', name: 'Taskmaster' },
            { filename: 'unforgotten.png', name: 'Unforgotten' },
            // Updated to use underscore in filename
            { filename: 'loverman.png', name: 'Mr Loverman' },
            { filename: 'frankenstein.png', name: 'The Frankenstein Chronicles' },
            { filename: 'pb falcon.png', name: 'The Peanut Butter Falcon' },
            { filename: 'Altered Carbon.png', name: 'Altered Carbon' }
        ];
        
        // Generate URLs for all images
        const images = knownImages.map(img => {
            // For all images, generate the URL using the standard method
            const { data } = supabase
                .storage
                .from('site-assets')
                .getPublicUrl(`ftv/${img.filename}`);
            
            console.log(`Generated URL for ${img.name}:`, data.publicUrl);
            
            return {
                url: data.publicUrl,
                name: img.name
            };
        });
        
        console.log('Final processed FTV images:', images);
        return images;
    } catch (err) {
        console.error('Error in loadFTVImages:', err);
        
        // Return default FTV image as fallback
        return [{
            url: 'assets/images/ftv.png',
            name: 'FTV'
        }];
    }
}