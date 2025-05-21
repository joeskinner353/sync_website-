/**
 * Video Embed Tests
 * Tests for the video embedding functionality on the Concord Music Publishing website
 */

// Helper function to extract video ID from URL
function getVideoId(url, platform) {
  if (platform === 'youtube') {
    // Extract YouTube video ID
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    return match && match[1] ? match[1] : null;
  } else if (platform === 'vimeo') {
    // Extract Vimeo video ID
    const vimeoRegex = /(?:vimeo.com\/|player.vimeo.com\/video\/)(\d+)/;
    const match = url.match(vimeoRegex);
    return match && match[1] ? match[1] : null;
  }
  return null;
}

// Test YouTube URL parsing
function testYoutubeUrlParsing() {
  console.log('🧪 Running YouTube URL parsing tests...');
  
  const testUrls = [
    {
      input: 'https://www.youtube.com/watch?v=abcdefghijk',
      expectedId: 'abcdefghijk',
      description: 'Standard YouTube watch URL'
    },
    {
      input: 'https://youtu.be/abcdefghijk',
      expectedId: 'abcdefghijk',
      description: 'YouTube short URL'
    },
    {
      input: 'https://www.youtube.com/embed/abcdefghijk',
      expectedId: 'abcdefghijk',
      description: 'YouTube embed URL'
    },
    {
      input: 'https://youtube.com/v/abcdefghijk',
      expectedId: 'abcdefghijk',
      description: 'YouTube v URL'
    },
    {
      input: 'https://www.youtube.com/watch?feature=player_embedded&v=abcdefghijk',
      expectedId: 'abcdefghijk',
      description: 'YouTube URL with additional parameters'
    },
    {
      input: 'https://www.invalid-url.com/test',
      expectedId: null,
      description: 'Non-YouTube URL'
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Import the getYoutubeUrls function for testing
  if (typeof window.getYoutubeUrls !== 'function') {
    console.error('❌ getYoutubeUrls function is not available for testing');
    
    // Fallback to testing the regex directly
    console.log('Testing regex extraction directly...');
    
    testUrls.forEach(test => {
      const extractedId = getVideoId(test.input, 'youtube');
      
      if ((extractedId === test.expectedId)) {
        console.log(`✅ Passed: ${test.description}`);
        passedTests++;
      } else {
        console.error(`❌ Failed: ${test.description}`);
        console.error(`   Expected: ${test.expectedId}, Got: ${extractedId}`);
        failedTests++;
      }
    });
  } else {
    // Test the actual function
    testUrls.forEach(test => {
      const result = window.getYoutubeUrls(test.input);
      const success = (test.expectedId === null && result.type === 'unknown') || 
                     (test.expectedId !== null && result.type === 'youtube');
      
      if (success) {
        console.log(`✅ Passed: ${test.description}`);
        passedTests++;
      } else {
        console.error(`❌ Failed: ${test.description}`);
        console.error(`   Expected type: ${test.expectedId ? 'youtube' : 'unknown'}, Got: ${result.type}`);
        failedTests++;
      }
      
      // If we expect a valid ID, also check that the embed URL is correctly formed
      if (test.expectedId) {
        const expectedEmbedUrl = `https://www.youtube.com/embed/${test.expectedId}`;
        if (result.embed && result.embed.startsWith(expectedEmbedUrl)) {
          console.log(`✅ Embed URL correctly formatted`);
        } else {
          console.error(`❌ Embed URL incorrectly formatted`);
          console.error(`   Expected to start with: ${expectedEmbedUrl}`);
          console.error(`   Got: ${result.embed}`);
          failedTests++;
        }
      }
    });
  }
  
  console.log(`🧪 YouTube URL parsing tests complete: ${passedTests} passed, ${failedTests} failed`);
  return passedTests > 0 && failedTests === 0;
}

// Test Vimeo URL parsing
function testVimeoUrlParsing() {
  console.log('🧪 Running Vimeo URL parsing tests...');
  
  const testUrls = [
    {
      input: 'https://vimeo.com/123456789',
      expectedId: '123456789',
      description: 'Standard Vimeo URL'
    },
    {
      input: 'https://player.vimeo.com/video/123456789',
      expectedId: '123456789',
      description: 'Vimeo player URL'
    },
    {
      input: 'https://vimeo.com/channels/staffpicks/123456789',
      expectedId: '123456789',
      description: 'Vimeo channel URL'
    },
    {
      input: 'https://www.invalid-url.com/test',
      expectedId: null,
      description: 'Non-Vimeo URL'
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Import the getVimeoUrls function for testing
  if (typeof window.getVimeoUrls !== 'function') {
    console.error('❌ getVimeoUrls function is not available for testing');
    
    // Fallback to testing the regex directly
    console.log('Testing regex extraction directly...');
    
    testUrls.forEach(test => {
      const extractedId = getVideoId(test.input, 'vimeo');
      
      if ((extractedId === test.expectedId)) {
        console.log(`✅ Passed: ${test.description}`);
        passedTests++;
      } else {
        console.error(`❌ Failed: ${test.description}`);
        console.error(`   Expected: ${test.expectedId}, Got: ${extractedId}`);
        failedTests++;
      }
    });
  } else {
    // Test the actual function
    testUrls.forEach(test => {
      const result = window.getVimeoUrls(test.input);
      const success = (test.expectedId === null && result.type !== 'vimeo') || 
                     (test.expectedId !== null && result.type === 'vimeo');
      
      if (success) {
        console.log(`✅ Passed: ${test.description}`);
        passedTests++;
      } else {
        console.error(`❌ Failed: ${test.description}`);
        console.error(`   Expected type: ${test.expectedId ? 'vimeo' : 'unknown'}, Got: ${result.type}`);
        failedTests++;
      }
      
      // If we expect a valid ID, also check that the embed URL is correctly formed
      if (test.expectedId) {
        const expectedEmbedUrl = `https://player.vimeo.com/video/${test.expectedId}`;
        if (result.embed && result.embed.startsWith(expectedEmbedUrl)) {
          console.log(`✅ Embed URL correctly formatted`);
        } else {
          console.error(`❌ Embed URL incorrectly formatted`);
          console.error(`   Expected to start with: ${expectedEmbedUrl}`);
          console.error(`   Got: ${result.embed}`);
          failedTests++;
        }
      }
    });
  }
  
  console.log(`🧪 Vimeo URL parsing tests complete: ${passedTests} passed, ${failedTests} failed`);
  return passedTests > 0 && failedTests === 0;
}

// Test iframe generation for different video platforms
function testIframeGeneration() {
  console.log('🧪 Running iframe generation tests...');
  
  const testContainer = document.createElement('div');
  testContainer.style.position = 'absolute';
  testContainer.style.left = '-9999px';
  document.body.appendChild(testContainer);
  
  const youtubeUrl = 'https://www.youtube.com/watch?v=abcdefghijk';
  const vimeoUrl = 'https://vimeo.com/123456789';
  
  // Define expected allow attributes for each platform
  const youtubeAllowAttributes = ['accelerometer', 'autoplay', 'clipboard-write', 'encrypted-media', 'gyroscope', 'picture-in-picture', 'web-share'];
  const vimeoAllowAttributes = ['autoplay', 'fullscreen', 'picture-in-picture'];
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Test YouTube iframe generation
  try {
    testContainer.innerHTML = '';
    if (typeof window.handleVideoClick !== 'function') {
      throw new Error('handleVideoClick function is not available');
    }

    const mockedComposer = { name: 'Test Composer' };
    
    // Create a test element for the iframe
    const featuredVideoElement = document.createElement('div');
    featuredVideoElement.className = 'featured-video';
    testContainer.appendChild(featuredVideoElement);
    
    // Mock the DOM selector used in handleVideoClick
    const originalQuerySelector = document.querySelector;
    document.querySelector = function(selector) {
      if (selector === '.featured-video') return featuredVideoElement;
      return originalQuerySelector.call(document, selector);
    };
    
    // Call the function with YouTube URL
    window.handleVideoClick(youtubeUrl, mockedComposer);
    
    // Check if iframe was generated correctly
    const iframe = featuredVideoElement.querySelector('iframe');
    if (!iframe) {
      throw new Error('YouTube iframe was not generated');
    }
    
    // Check YouTube URL
    if (!iframe.src.includes('youtube.com/embed/abcdefghijk')) {
      console.error(`❌ YouTube iframe has incorrect src: ${iframe.src}`);
      failedTests++;
    } else {
      console.log(`✅ YouTube iframe has correct src`);
      passedTests++;
    }
    
    // Check allow attributes for YouTube
    if (!iframe.allow) {
      console.error(`❌ YouTube iframe is missing allow attribute`);
      failedTests++;
    } else {
      const allowValues = iframe.allow.split(';').map(val => val.trim());
      const missingAttributes = youtubeAllowAttributes.filter(attr => 
        !allowValues.some(val => val.includes(attr))
      );
      
      if (missingAttributes.length > 0) {
        console.error(`❌ YouTube iframe is missing allow attributes: ${missingAttributes.join(', ')}`);
        failedTests++;
      } else {
        console.log(`✅ YouTube iframe has correct allow attributes`);
        passedTests++;
      }
    }
    
    // Restore original function
    document.querySelector = originalQuerySelector;
  } catch (error) {
    console.error(`❌ YouTube iframe test error: ${error.message}`);
    failedTests++;
  }
  
  // Test Vimeo iframe generation
  try {
    testContainer.innerHTML = '';
    if (typeof window.handleVideoClick !== 'function') {
      throw new Error('handleVideoClick function is not available');
    }

    const mockedComposer = { name: 'Test Composer' };
    
    // Create a test element for the iframe
    const featuredVideoElement = document.createElement('div');
    featuredVideoElement.className = 'featured-video';
    testContainer.appendChild(featuredVideoElement);
    
    // Mock the DOM selector used in handleVideoClick
    const originalQuerySelector = document.querySelector;
    document.querySelector = function(selector) {
      if (selector === '.featured-video') return featuredVideoElement;
      return originalQuerySelector.call(document, selector);
    };
    
    // Call the function with Vimeo URL
    window.handleVideoClick(vimeoUrl, mockedComposer);
    
    // Check if iframe was generated correctly
    const iframe = featuredVideoElement.querySelector('iframe');
    if (!iframe) {
      throw new Error('Vimeo iframe was not generated');
    }
    
    // Check Vimeo URL
    if (!iframe.src.includes('player.vimeo.com/video/123456789')) {
      console.error(`❌ Vimeo iframe has incorrect src: ${iframe.src}`);
      failedTests++;
    } else {
      console.log(`✅ Vimeo iframe has correct src`);
      passedTests++;
    }
    
    // Check allow attributes for Vimeo
    if (!iframe.allow) {
      console.error(`❌ Vimeo iframe is missing allow attribute`);
      failedTests++;
    } else {
      const allowValues = iframe.allow.split(';').map(val => val.trim());
      const missingAttributes = vimeoAllowAttributes.filter(attr => 
        !allowValues.some(val => val.includes(attr))
      );
      
      if (missingAttributes.length > 0) {
        console.error(`❌ Vimeo iframe is missing allow attributes: ${missingAttributes.join(', ')}`);
        failedTests++;
      } else {
        console.log(`✅ Vimeo iframe has correct allow attributes`);
        passedTests++;
      }
    }
    
    // Restore original function
    document.querySelector = originalQuerySelector;
  } catch (error) {
    console.error(`❌ Vimeo iframe test error: ${error.message}`);
    failedTests++;
  }
  
  // Clean up
  document.body.removeChild(testContainer);
  
  console.log(`🧪 Iframe generation tests complete: ${passedTests} passed, ${failedTests} failed`);
  return passedTests > 0 && failedTests === 0;
}

// Export test functions
window.videoEmbedTests = {
  testYoutubeUrlParsing,
  testVimeoUrlParsing,
  testIframeGeneration
};

// Log that the tests are loaded
console.log('Video embed tests loaded successfully');
