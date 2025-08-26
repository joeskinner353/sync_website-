/**
 * Mobile Detection and Routing Utility
 * Handles automatic redirection to mobile-optimized templates
 */

class MobileDetection {
    /**
     * Comprehensive mobile device detection
     * @returns {boolean} - True if mobile device detected
     */
    static isMobileDevice() {
        // User agent detection
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        
        // Screen size detection
        const screenSize = window.innerWidth <= 768;
        
        // Touch capability detection
        const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Combined detection logic
        const isMobileUA = mobileRegex.test(userAgent);
        const isMobileScreen = screenSize && touchCapable;
        
        return isMobileUA || isMobileScreen;
    }
    
    /**
     * Check if device is specifically a tablet
     * @returns {boolean} - True if tablet detected
     */
    static isTablet() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const tabletRegex = /iPad|Android.*(?!Mobile)|Tablet/i;
        const isLargeScreen = window.innerWidth >= 768 && window.innerWidth <= 1024;
        
        return tabletRegex.test(userAgent) || (this.isMobileDevice() && isLargeScreen);
    }
    
    /**
     * Redirect to mobile template if mobile device detected
     */
    static redirectToMobileTemplate() {
        // Don't redirect if already on mobile template
        if (window.location.pathname.includes('-mobile.html')) {
            return;
        }
        
        // Don't redirect tablets to mobile template (they can handle desktop version)
        if (this.isTablet() && !this.isMobileDevice()) {
            return;
        }
        
        // Only redirect actual mobile devices
        if (this.isMobileDevice() && !this.isTablet()) {
            const currentPage = window.location.pathname;
            const urlParams = new URLSearchParams(window.location.search);
            
            // Handle composer page redirection
            if (currentPage.includes('composer.html') && !currentPage.includes('composer-mobile.html')) {
                const composerSlug = urlParams.get('slug');
                if (composerSlug) {
                    const mobileUrl = currentPage.replace('composer.html', 'composer-mobile.html');
                    const newUrl = `${mobileUrl}?slug=${composerSlug}`;
                    
                    console.log('Redirecting mobile device to:', newUrl);
                    window.location.replace(newUrl);
                }
            }
            
            // Add more page redirections here as needed
            // Example for grid page:
            // if (currentPage.includes('composer_grid.html')) {
            //     window.location.replace(currentPage.replace('composer_grid.html', 'composer-grid-mobile.html'));
            // }
        }
    }
    
    /**
     * Add mobile-specific CSS class to body
     */
    static addMobileClasses() {
        if (this.isMobileDevice()) {
            document.body.classList.add('mobile-device');
            
            if (this.isTablet()) {
                document.body.classList.add('tablet-device');
            } else {
                document.body.classList.add('phone-device');
            }
        }
    }
    
    /**
     * Handle orientation changes on mobile devices
     */
    static handleOrientationChange() {
        if (this.isMobileDevice()) {
            const handleResize = () => {
                // Force height recalculation on mobile devices
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            // Initial calculation
            handleResize();
            
            // Handle orientation changes
            window.addEventListener('orientationchange', () => {
                setTimeout(handleResize, 100); // Small delay to ensure correct dimensions
            });
            
            // Handle regular resize events
            window.addEventListener('resize', handleResize);
        }
    }
    
    /**
     * Initialize all mobile detection features
     */
    static init() {
        this.addMobileClasses();
        this.handleOrientationChange();
        this.redirectToMobileTemplate();
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    MobileDetection.init();
});

// Also run immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileDetection.init());
} else {
    MobileDetection.init();
}

export { MobileDetection };
