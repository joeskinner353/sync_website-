/**
 * Site versioning utility functions
 * This file handles site version detection and management
 */

// Available site versions
export const SITE_VERSIONS = {
    VERSION_1: 'version_1',
    VERSION_2: 'version_2'
};

// Default site version
export const DEFAULT_VERSION = SITE_VERSIONS.VERSION_1;

/**
 * Gets the current site version based on URL parameters or localStorage
 * @returns {string} - The current site version
 */
export function getCurrentVersion() {
    // Check URL parameters first (for direct links with version)
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