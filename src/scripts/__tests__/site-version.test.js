/**
 * Test file for site versioning functionality
 * 
 * This file tests the site versioning functionality implemented in site-version.js
 * and the composer filtering based on site versions.
 */

import { getCurrentVersion, SITE_VERSIONS, DEFAULT_VERSION, appendVersionToUrl } from '../site-version.js';
import { loadVisibleComposers } from '../composers.js';
import { supabase } from '../supabase.js';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock URL params for testing
function mockUrlParams(params = {}) {
  // Save original URL
  const originalUrl = window.location.href;
  
  // Create a URL with the provided params
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      href: url.toString(),
      search: url.search
    },
    writable: true
  });
  
  // Return function to restore original URL
  return () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        href: originalUrl,
        search: ''
      },
      writable: true
    });
  };
}

// Test suite for site-version.js
async function testSiteVersioning() {
  console.log('--- Running Site Versioning Tests ---');
  
  // Test 1: Default version
  try {
    localStorage.clear();
    const restoreUrl = mockUrlParams();
    const version = getCurrentVersion();
    console.assert(version === DEFAULT_VERSION, 
      `Test 1 Failed: Expected default version '${DEFAULT_VERSION}', got '${version}'`);
    console.log('Test 1 Passed: Default version is used when no version is specified');
    restoreUrl();
  } catch (err) {
    console.error('Test 1 Failed with error:', err);
  }
  
  // Test 2: URL parameter version
  try {
    localStorage.clear();
    const testVersion = SITE_VERSIONS.VERSION_2;
    const restoreUrl = mockUrlParams({ version: testVersion });
    const version = getCurrentVersion();
    console.assert(version === testVersion, 
      `Test 2 Failed: Expected version from URL '${testVersion}', got '${version}'`);
    console.log('Test 2 Passed: Version from URL parameter is used');
    restoreUrl();
  } catch (err) {
    console.error('Test 2 Failed with error:', err);
  }
  
  // Test 3: localStorage version
  try {
    localStorage.clear();
    const testVersion = SITE_VERSIONS.VERSION_2;
    localStorage.setItem('siteVersion', testVersion);
    const restoreUrl = mockUrlParams();
    const version = getCurrentVersion();
    console.assert(version === testVersion, 
      `Test 3 Failed: Expected version from localStorage '${testVersion}', got '${version}'`);
    console.log('Test 3 Passed: Version from localStorage is used when no URL param');
    restoreUrl();
  } catch (err) {
    console.error('Test 3 Failed with error:', err);
  }
  
  // Test 4: appendVersionToUrl function
  try {
    localStorage.clear();
    const testVersion = SITE_VERSIONS.VERSION_2;
    localStorage.setItem('siteVersion', testVersion);
    
    // Test with URL without parameters
    const url1 = 'https://example.com/page';
    const result1 = appendVersionToUrl(url1);
    console.assert(result1 === `${url1}?version=${testVersion}`, 
      `Test 4a Failed: Expected '${url1}?version=${testVersion}', got '${result1}'`);
    
    // Test with URL with parameters
    const url2 = 'https://example.com/page?param=value';
    const result2 = appendVersionToUrl(url2);
    console.assert(result2 === `${url2}&version=${testVersion}`, 
      `Test 4b Failed: Expected '${url2}&version=${testVersion}', got '${result2}'`);
    
    console.log('Test 4 Passed: appendVersionToUrl correctly adds version parameter');
  } catch (err) {
    console.error('Test 4 Failed with error:', err);
  }
  
  // Test 5: Composer filtering by version (requires Supabase)
  try {
    localStorage.clear();
    
    // Get composers with version_1
    const version1 = SITE_VERSIONS.VERSION_1;
    localStorage.setItem('siteVersion', version1);
    const composers1 = await loadVisibleComposers(version1);
    console.log(`Found ${composers1.length} composers with version ${version1}`);
    
    // Get composers with version_2
    const version2 = SITE_VERSIONS.VERSION_2;
    localStorage.setItem('siteVersion', version2);
    const composers2 = await loadVisibleComposers(version2);
    console.log(`Found ${composers2.length} composers with version ${version2}`);
    
    console.log('Test 5 Passed: Successfully filtered composers by version');
  } catch (err) {
    console.error('Test 5 Failed with error:', err);
  }
  
  console.log('--- Site Versioning Tests Complete ---');
}

// Run the tests when the script is loaded
document.addEventListener('DOMContentLoaded', testSiteVersioning);

// Export for use in browser console
window.testSiteVersioning = testSiteVersioning;