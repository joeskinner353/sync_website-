/**
 * Composer Grid Page JavaScript
 * Handles loading composer data, rendering the grid, and filter functionality
 */

import { loadVisibleComposers } from './composers.js';
import { getCurrentVersion, appendVersionToUrl } from './site-version.js';

// Cache for composer data to prevent redundant fetches
const composerCache = new Map();

/**
 * Initialize the composer grid
 */
async function initComposerGrid() {
    const gridContainer = document.querySelector('.composer-grid');
    if (!gridContainer) return;
    
    try {
        // Performance: Track render time
        const renderStart = performance.now();
        
        // Get current site version
        const currentVersion = getCurrentVersion();
        console.log(`Loading composers for grid view (version: ${currentVersion})`);
        
        // Load visible composers filtered by current site version, using cache if available
        let composers;
        const cacheKey = `composers_${currentVersion}`;
        
        if (composerCache.has(cacheKey)) {
            composers = composerCache.get(cacheKey);
            console.log('Using cached composer data');
        } else {
            composers = await loadVisibleComposers(currentVersion);
            composerCache.set(cacheKey, composers);
            console.log('Fetched fresh composer data');
        }
        
        // Remove loading indicator
        const loadingElement = gridContainer.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        if (composers.length === 0) {
            gridContainer.innerHTML = '<div class="loading">No composers found for the current version.</div>';
            return;
        }
        
        // Performance: Use document fragment to minimize DOM operations
        const fragment = document.createDocumentFragment();
        
        // Create and append composer grid items
        composers.forEach((composer, index) => {
            const gridItem = createComposerGridItem(composer);
            // Add staggered animation delay
            gridItem.style.animationDelay = `${Math.min(index * 30, 500)}ms`;
            fragment.appendChild(gridItem);
        });
        
        // Perform a single DOM update
        gridContainer.appendChild(fragment);
        
        // Initialize filter buttons
        initFilters();
        
        // Performance: Log render time
        const renderTime = performance.now() - renderStart;
        console.log(`Loaded ${composers.length} composers in ${renderTime.toFixed(2)}ms`);
        
        // Performance: Apply intersection observer for lazy loading images
        applyLazyLoadingToImages();
        
    } catch (err) {
        console.error('Error initializing composer grid:', err);
        gridContainer.innerHTML = '<div class="loading">Error loading composers. Please try again later.</div>';
    }
}

/**
 * Create a grid item for a composer
 * @param {Object} composer - The composer object
 * @returns {HTMLElement} - The grid item element
 */
function createComposerGridItem(composer) {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    
    // Add data attributes for filtering
    if (composer.is_artist) gridItem.dataset.artist = true;
    if (composer.is_producer) gridItem.dataset.producer = true;
    if (composer.is_songwriter) gridItem.dataset.songwriter = true;
    
    // Create link to composer page
    const link = document.createElement('a');
    link.href = appendVersionToUrl(`composer.html?slug=${composer.slug}`);
    
    // Create image container and image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'grid-image';
    
    // Performance: Improve image loading with data-src for lazy loading
    const img = document.createElement('img');
    img.dataset.src = composer.primary_photo_url; // Use data-src for lazy loading
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3C/svg%3E'; // Tiny placeholder
    img.alt = composer.name;
    img.loading = 'lazy'; // Native lazy loading as fallback
    img.onerror = function() {
        // Use fallback image if composer image fails to load
        this.src = 'assets/images/concord-C-icon-red.png';
    };
    
    imageContainer.appendChild(img);
    
    // Create name element
    const nameElement = document.createElement('div');
    nameElement.className = 'grid-name';
    nameElement.textContent = composer.name;
    
    // Performance: Only create tag elements if they're needed
    if (composer.is_artist || composer.is_producer || composer.is_songwriter) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'grid-tags';
        
        if (composer.is_artist) {
            const artistTag = document.createElement('span');
            artistTag.className = 'tag';
            artistTag.textContent = 'Artist';
            tagsContainer.appendChild(artistTag);
        }
        
        if (composer.is_producer) {
            const producerTag = document.createElement('span');
            producerTag.className = 'tag';
            producerTag.textContent = 'Producer';
            tagsContainer.appendChild(producerTag);
        }
        
        if (composer.is_songwriter) {
            const songwriterTag = document.createElement('span');
            songwriterTag.className = 'tag';
            songwriterTag.textContent = 'Songwriter';
            tagsContainer.appendChild(songwriterTag);
        }
        
        link.appendChild(tagsContainer);
    }
    
    // Assemble the grid item
    link.appendChild(imageContainer);
    link.appendChild(nameElement);
    gridItem.appendChild(link);
    
    return gridItem;
}

/**
 * Apply lazy loading to grid images using Intersection Observer
 */
function applyLazyLoadingToImages() {
    // Use intersection observer for better performance than scroll events
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img); // No need to observe once loaded
                }
            });
        }, {
            rootMargin: '100px' // Start loading when image is 100px from viewport
        });
        
        // Observe all images with data-src attribute
        document.querySelectorAll('.grid-image img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('.grid-image img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

/**
 * Initialize filter buttons with debounced click handling
 */
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    if (!filterButtons.length) return;
    
    // Performance: Create a debounce function to limit filter operations
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    // Apply debounced filtering to prevent rapid consecutive clicks
    const debouncedApplyFilter = debounce((filter) => {
        applyFilter(filter);
    }, 100);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Apply filter with debounce
            debouncedApplyFilter(button.dataset.filter);
        });
    });
}

/**
 * Apply filtering to grid items
 * @param {string} filter - The filter to apply (all, artist, producer, songwriter)
 */
function applyFilter(filter) {
    const items = document.querySelectorAll('.grid-item');
    if (!items.length) return;
    
    // Performance: Use requestAnimationFrame for smoother visual updates
    requestAnimationFrame(() => {
        items.forEach(item => {
            // Default show all items
            if (filter === 'all') {
                showGridItem(item);
                return;
            }
            
            // Check if item has the corresponding data attribute for the filter
            if (item.dataset[filter]) {
                showGridItem(item);
            } else {
                hideGridItem(item);
            }
        });
    });
}

/**
 * Show a grid item with animation
 * @param {HTMLElement} item - The grid item to show
 */
function showGridItem(item) {
    // Performance: Use classList.add/remove instead of modifying style directly when possible
    // Remove any existing animation classes
    item.classList.remove('filtered-out');
    
    // Add filtered-in class for animation
    item.classList.add('filtered-in');
    
    // Make sure the item is visible (in case it was hidden before)
    item.style.display = 'block';
}

/**
 * Hide a grid item with animation
 * @param {HTMLElement} item - The grid item to hide
 */
function hideGridItem(item) {
    // Remove filtered-in class if it exists
    item.classList.remove('filtered-in');
    
    // Add filtered-out class for animation
    item.classList.add('filtered-out');
    
    // Performance: Use requestAnimationFrame to coordinate with browser repaints
    requestAnimationFrame(() => {
        // Set to display none after animation completes
        setTimeout(() => {
            if (item.classList.contains('filtered-out')) {
                item.style.display = 'none';
            }
        }, 300);
    });
}

// Initialize the grid when DOM is loaded
document.addEventListener('DOMContentLoaded', initComposerGrid);

// Performance: Listen for visibility changes to pause/resume heavy operations
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page is now visible - possibly resume heavy animations or operations
    } else {
        // Page is now hidden - pause heavy animations or operations
    }
});