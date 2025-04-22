import { supabase } from './supabase.js';

async function testConnection() {
    try {
        // Test database connection
        console.log('Testing database connection...');
        const { data, error } = await supabase
            .from('composers')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('Database connection test failed:', error.message);
        } else {
            console.log('✓ Database connection successful!');
            console.log('Sample composer data:', data);
        }

        // List all buckets
        console.log('\nListing all storage buckets...');
        const { data: buckets, error: bucketError } = await supabase
            .storage
            .listBuckets();

        if (bucketError) {
            console.error('Failed to list buckets:', bucketError);
        } else {
            console.log('Available buckets:', buckets);

            // For each bucket, try to list contents
            for (const bucket of buckets) {
                console.log(`\nInspecting bucket: ${bucket.name}`);
                const { data: rootFiles, error: rootError } = await supabase
                    .storage
                    .from(bucket.name)
                    .list();

                if (rootError) {
                    console.error(`Error listing ${bucket.name} contents:`, rootError);
                } else {
                    console.log(`Contents of ${bucket.name}:`, rootFiles);

                    // If we find an ftv folder, inspect it
                    const ftvFolder = rootFiles?.find(f => f.name === 'ftv');
                    if (ftvFolder) {
                        const { data: ftvFiles, error: ftvError } = await supabase
                            .storage
                            .from(bucket.name)
                            .list('ftv');

                        if (ftvError) {
                            console.error('Error listing ftv folder:', ftvError);
                        } else {
                            console.log('FTV folder contents:', ftvFiles);
                            
                            // Try to get a public URL for each image
                            for (const file of ftvFiles) {
                                if (file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                                    const { data: urlData } = supabase
                                        .storage
                                        .from(bucket.name)
                                        .getPublicUrl(`ftv/${file.name}`);
                                    console.log(`Public URL for ${file.name}:`, urlData.publicUrl);
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testConnection();