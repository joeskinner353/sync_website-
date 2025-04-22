import { supabase, loadFTVImages } from '../supabase.js';

jest.setTimeout(10000); // Increase timeout for storage operations

describe('Supabase Connection', () => {
  test('should connect to Supabase', async () => {
    expect(supabase).toBeDefined();
    expect(supabase.storage).toBeDefined();
  });

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

  test('should be able to list storage buckets', async () => {
    const { data, error } = await supabase.storage.listBuckets();
    if (error && error.message?.includes('Permission denied')) {
      console.warn('Storage permission denied - this is expected for anon users');
      return;
    }
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

describe('FTV Images', () => {
  test('should fetch FTV images from storage', async () => {
    const images = await loadFTVImages();
    expect(Array.isArray(images)).toBeTruthy();
    
    // If there are images, verify their structure
    if (images.length > 0) {
      images.forEach(image => {
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('name');
        expect(typeof image.url).toBe('string');
        expect(typeof image.name).toBe('string');
        expect(image.url).toContain('site-assets');
        expect(image.url).toContain('ftv');
      });
    } else {
      console.warn('No FTV images found in the bucket');
    }
  });

  test('should handle FTV image loading', async () => {
    const images = await loadFTVImages();
    expect(Array.isArray(images)).toBeTruthy();
    
    if (images.length > 0) {
      images.forEach(image => {
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('name');
        expect(typeof image.url).toBe('string');
        expect(typeof image.name).toBe('string');
      });
    } else {
      console.warn('No FTV images found - this might be expected if no images are uploaded yet');
    }
  });
});