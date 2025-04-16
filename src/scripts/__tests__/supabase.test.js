import { supabase } from '../supabase.js';

describe('Supabase Connection', () => {
  test('should connect to Supabase and fetch composers', async () => {
    const { data, error } = await supabase
      .from('composers')
      .select('*')
      .limit(1);
    
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should fetch only visible composers', async () => {
    const { data, error } = await supabase
      .from('composers')
      .select('*')
      .eq('is_visible', true);
    
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBeTruthy();
    data.forEach(composer => {
      expect(composer.is_visible).toBeTruthy();
    });
  });

  test('should have required fields for composers', async () => {
    const { data, error } = await supabase
      .from('composers')
      .select('*')
      .limit(1);
    
    expect(error).toBeNull();
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('slug');
    expect(data[0]).toHaveProperty('is_visible');
    expect(data[0]).toHaveProperty('primary_photo_url');
  });
});