/**
 * Site versioning utility functions
 * This file handles site version detection and management
 */

// Available site versions
export const SITE_VERSIONS = {
    VERSION_1: 'version_1',  // Main/primary site version (main branch)
    VERSION_2: 'version_2',  // Version 2 site (main_version2 branch)
    VERSION_3: 'version_3',  // Version 3 site (main_version3 branch)
};

// Default site version (version 3 site)
export const DEFAULT_VERSION = SITE_VERSIONS.VERSION_3;

/**
 * Gets the current site version based on hostname, URL parameters, or localStorage
 * @returns {string} - The current site version
 */
export function getCurrentVersion() {
    // First, check hostname for version-specific deployments
    const hostname = window.location.hostname;
    
    if (hostname.includes('concordpub-sync') || hostname.includes('netlify')) {
        // This branch (main_version3) deployment is version_3
        return SITE_VERSIONS.VERSION_3;
    }
    
    // Check URL parameters second (for local development or override)
    const urlParams = new URLSearchParams(window.location.search);
    const versionParam = urlParams.get('version');
    
    if (versionParam && Object.values(SITE_VERSIONS).includes(versionParam)) {
        // Store the selected version in localStorage for consistency across pages
        localStorage.setItem('siteVersion', versionParam);
        return versionParam;
    }
    
    // If no URL parameter, check localStorage for previously selected version
    const storedVersion = localStorage.getItem('siteVersion');
    if (storedVersion && Object.values(SITE_VERSIONS).includes(storedVersion)) {
        return storedVersion;
    }
    
    // Default to the default version if nothing is specified
    return DEFAULT_VERSION;
}

/**
 * Sets the current site version
 * @param {string} version - The site version to set
 */
export function setCurrentVersion(version) {
    if (Object.values(SITE_VERSIONS).includes(version)) {
        localStorage.setItem('siteVersion', version);
    }
}

/**
 * Appends the current version as a URL parameter
 * @param {string} url - The URL to append the version parameter to
 * @returns {string} - The URL with the version parameter
 */
export function appendVersionToUrl(url) {
    const version = getCurrentVersion();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}version=${version}`;
}