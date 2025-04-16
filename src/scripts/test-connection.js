import { supabase } from './supabase.js';

async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('composers')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('Connection test failed:', error.message);
            return;
        }
        
        console.log('Supabase connection successful!');
        console.log('Sample data:', data);
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testConnection();