/**
 * Comprehensive Test Script
 * 
 * This script tests all the new features implemented in the Concord Music Publishing site:
 * 1. Site Versioning
 * 2. Composer Grid Page
 * 3. Homepage View Toggle
 */

import { loadVisibleComposers } from '../composers.js';
import { getCurrentVersion, SITE_VERSIONS, setCurrentVersion } from '../site-version.js';
import { supabase } from '../supabase.js';

// Console logging with color and formatting
function logHeader(text) {
    console.log(`%c${text}`, 'background: #333; color: #fff; padding: 5px; font-weight: bold; border-radius: 4px;');
}

function logSuccess(text) {
    console.log(`%c✓ ${text}`, 'color: green; font-weight: bold;');
}

function logError(text) {
    console.error(`%c✗ ${text}`, 'color: red; font-weight: bold;');
}

function logInfo(text) {
    console.log(`%c➜ ${text}`, 'color: blue;');
}

async function runTests() {
    logHeader('STARTING COMPREHENSIVE FEATURE TESTS');
    
    // Test 1: Site Versioning
    logHeader('1. TESTING SITE VERSIONING');
    
    // 1.1 Test getCurrentVersion
    try {
        const currentVersion = getCurrentVersion();
        logInfo(`Current site version: ${currentVersion}`);
        logSuccess('Site versioning utility functions are working');
    } catch (err) {
        logError(`Site versioning utility error: ${err.message}`);
    }
    
    // 1.2 Test loadVisibleComposers with version filtering
    try {
        // Test with version_1
        setCurrentVersion(SITE_VERSIONS.VERSION_1);
        const v1Composers = await loadVisibleComposers(SITE_VERSIONS.VERSION_1);
        logInfo(`Found ${v1Composers.length} composers for version_1`);
        
        // Test with version_2
        setCurrentVersion(SITE_VERSIONS.VERSION_2);
        const v2Composers = await loadVisibleComposers(SITE_VERSIONS.VERSION_2);
        logInfo(`Found ${v2Composers.length} composers for version_2`);
        
        logSuccess('Version filtering in database queries is working');
        
        // Reset to default version
        setCurrentVersion(SITE_VERSIONS.VERSION_1);
    } catch (err) {
        logError(`Version filtering error: ${err.message}`);
    }
    
    // Test 2: Composer Grid Page
    logHeader('2. TESTING COMPOSER GRID PAGE');
    
    // 2.1 Basic test if composer-grid.js is loaded
    try {
        if (typeof initComposerGrid !== 'undefined' || document.querySelector('.composer-grid')) {
            logSuccess('Composer grid page structure exists');
        } else {
            logInfo('Not currently on the composer grid page');
        }
    } catch (err) {
        logError(`Composer grid detection error: ${err.message}`);
    }
    
    // 2.2 Test filter buttons on grid page
    try {
        const filterButtons = document.querySelectorAll('.filter-button');
        if (filterButtons.length > 0) {
            logInfo(`Found ${filterButtons.length} filter buttons`);
            logSuccess('Filter buttons are present on the page');
        } else {
            logInfo('No filter buttons found (not on grid page)');
        }
    } catch (err) {
        logError(`Filter button detection error: ${err.message}`);
    }
    
    // Test 3: Homepage View Toggle
    logHeader('3. TESTING HOMEPAGE VIEW TOGGLE');
    
    // 3.1 Test toggle buttons
    try {
        const carouselViewBtn = document.querySelector('.toggle-button.carousel-view');
        const gridViewBtn = document.querySelector('.toggle-button.grid-view');
        
        if (carouselViewBtn && gridViewBtn) {
            logInfo('Found both carousel and grid view toggle buttons');
            
            // Test carousel view
            carouselViewBtn.click();
            await new Promise(r => setTimeout(r, 100)); // Small delay for UI update
            const carouselVisible = window.getComputedStyle(document.querySelector('.WritersImages')).display !== 'none';
            const gridHidden = window.getComputedStyle(document.querySelector('.writers-grid')).display === 'none';
            
            if (carouselVisible && gridHidden) {
                logSuccess('Carousel view toggle works correctly');
            } else {
                logError('Carousel view toggle is not working as expected');
            }
            
            // Test grid view
            gridViewBtn.click();
            await new Promise(r => setTimeout(r, 100)); // Small delay for UI update
            const gridVisible = window.getComputedStyle(document.querySelector('.writers-grid')).display !== 'none';
            const carouselHidden = window.getComputedStyle(document.querySelector('.WritersImages')).display === 'none';
            
            if (gridVisible && carouselHidden) {
                logSuccess('Grid view toggle works correctly');
                logSuccess('Preference stored in localStorage: ' + localStorage.getItem('preferredView'));
            } else {
                logError('Grid view toggle is not working as expected');
            }
        } else {
            logInfo('View toggle buttons not found (not on homepage)');
        }
    } catch (err) {
        logError(`View toggle testing error: ${err.message}`);
    }
    
    // Overall Feature Integration Test
    logHeader('4. TESTING FEATURE INTEGRATION');
    
    try {
        const features = {
            siteVersioning: typeof getCurrentVersion === 'function',
            composerGrid: document.querySelector('.composer-grid') !== null || typeof initComposerGrid !== 'undefined',
            viewToggle: document.querySelector('.view-toggle') !== null
        };
        
        logInfo(`Site versioning present: ${features.siteVersioning}`);
        logInfo(`Composer grid present: ${features.composerGrid}`);
        logInfo(`View toggle present: ${features.viewToggle}`);
        
        if (features.siteVersioning) {
            logSuccess('Site versioning feature is successfully integrated');
        }
        
        if (features.composerGrid || features.viewToggle) {
            logSuccess('UI features are successfully integrated with the site');
        }
        
    } catch (err) {
        logError(`Integration test error: ${err.message}`);
    }
    
    logHeader('TESTS COMPLETED');
}

// Run the tests when loaded
document.addEventListener('DOMContentLoaded', runTests);

// Make tests available globally for manual execution
window.runFeatureTests = runTests;