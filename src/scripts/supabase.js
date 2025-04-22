// Import Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm'

const supabaseUrl = 'https://lycmyaohsycrdergwpmq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Y215YW9oc3ljcmRlcmd3cG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTM2NjMsImV4cCI6MjA1OTE4OTY2M30.5j6yCAuQEkTCKfkFK7eETPn_2TOR9bpGUBuzsbdlRfY'

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function loadFTVImages() {
    // Define the known FTV images from the bucket, including the new image
    const ftvImages = [
        { name: 'unforgotten', filename: 'unforgotten.jpeg' },
        { name: 'night manager', filename: 'night_manager.jpg' },
        { name: 'catastrophe', filename: 'catastrophe.jpg' },
        { name: 'taskmaster', filename: 'taskmaster.jpg' }  // Changed from top_boy.jpg
    ];

    try {
        // Get public URLs for each image
        const images = ftvImages.map(img => {
            const { data: { publicUrl } } = supabase
                .storage
                .from('site-assets')
                .getPublicUrl(`ftv/${img.filename}`);

            console.log(`Generated public URL for ${img.name}:`, publicUrl);

            return {
                url: publicUrl,
                name: img.name
            };
        });

        console.log('Final processed images:', images);
        return images;
    } catch (err) {
        console.error('Unexpected error in loadFTVImages:', err);
        return [];
    }
}