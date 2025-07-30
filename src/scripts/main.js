// main.js

import { loadVisibleComposers, createComposerElement } from './composers.js';
import { loadFTVImages, supabase } from './supabase.js';
import { getCurrentVersion, appendVersionToUrl } from './site-version.js';

// Cache for composer data to prevent redundant fetches
const composerCache = new Map();

// Global state for carousel animations
const carouselStates = new Map();

// Initialize smooth scrolling for image containers with touch and mouse support
function initSmoothScroll() {
    const containers = document.querySelectorAll('.scrollable-container');
    
    containers.forEach((container, containerIndex) => {
        let isDown = false;
        let startX;
        let startTransform;
        let lastX = 0;
        let velocity = 0;

        // Helper function to get X coordinate from mouse or touch event
        function getEventX(e) {
            return e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        }

        // Helper function to get current transform value from state
        function getCurrentTransform() {
            const state = carouselStates.get(containerIndex);
            if (state) {
                return state.manualPosition !== null ? state.manualPosition : state.currentPosition;
            }
            // Fallback: read from DOM
            const track = container.querySelector('.carousel-track');
            if (!track) return 0;
            const transform = track.style.transform || 'translateX(0px)';
            const match = transform.match(/translateX\(([^)]+)\)/);
            return match ? parseFloat(match[1]) : 0;
        }

        // Helper function to set manual transform via state
        function setManualTransform(value) {
            const state = carouselStates.get(containerIndex);
            if (state) {
                state.manualPosition = value;
            }
        }

        // Helper function to start drag/scroll
        function startDrag(e) {
            // Prevent default to avoid any browser drag behaviors
            e.preventDefault();
            e.stopPropagation();
            
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = getEventX(e) - container.offsetLeft;
            lastX = getEventX(e);
            velocity = 0;
            startTransform = getCurrentTransform();
            
            // Set dragging state
            const state = carouselStates.get(containerIndex);
            if (state) {
                state.isDragging = true;
                state.manualPosition = startTransform;
                state.isPaused = true; // Also pause auto-scroll
            }
        }

        // Helper function to end drag/scroll
        function endDrag(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            isDown = false;
            container.style.cursor = 'grab';
            
            // Clear dragging state and smoothly transition to auto-scroll
            const state = carouselStates.get(containerIndex);
            if (state) {
                state.isDragging = false;
                
                // Apply momentum if there was significant velocity
                if (Math.abs(velocity) > 2 && state.manualPosition !== null) {
                    const momentumDistance = velocity * 20; // Adjust momentum effect
                    state.manualPosition += momentumDistance;
                }
                
                // Update the auto-scroll position to match final manual position
                if (state.manualPosition !== null) {
                    state.currentPosition = state.manualPosition;
                    state.manualPosition = null;
                }
                
                // Reset velocity
                velocity = 0;
                
                // Resume auto-scroll after a brief pause
                setTimeout(() => {
                    if (state && !state.isDragging) {
                        state.isPaused = false;
                    }
                }, 100); // Shorter delay for smoother experience
            }
        }

        // Helper function to handle drag/scroll movement
        function handleMove(e) {
            if (!isDown) return;
            e.preventDefault();
            e.stopPropagation();
            
            const currentX = getEventX(e);
            const x = currentX - container.offsetLeft;
            const walk = (x - startX) * 1.5; // Adjust sensitivity
            const newTransform = startTransform + walk;
            
            // Calculate velocity for momentum
            velocity = currentX - lastX;
            lastX = currentX;
            
            setManualTransform(newTransform);
        }

        // Mouse events with explicit event handling
        container.addEventListener('mousedown', (e) => {
            // Only handle left mouse button
            if (e.button !== 0) return;
            startDrag(e);
        }, { passive: false });

        container.addEventListener('mouseleave', endDrag, { passive: false });
        container.addEventListener('mouseup', endDrag, { passive: false });
        
        container.addEventListener('mousemove', handleMove, { passive: false });

        // Global mouseup to catch drags that end outside the container
        document.addEventListener('mouseup', (e) => {
            if (isDown) {
                endDrag(e);
            }
        }, { passive: false });

        // Touch events for mobile support
        container.addEventListener('touchstart', startDrag, { passive: false });
        container.addEventListener('touchend', endDrag, { passive: false });
        container.addEventListener('touchmove', handleMove, { passive: false });

        // Prevent text selection and context menu during drag
        container.addEventListener('selectstart', (e) => {
            if (isDown) e.preventDefault();
        });
        
        container.addEventListener('contextmenu', (e) => {
            if (isDown) e.preventDefault();
        });

        // Prevent drag on child elements from interfering
        container.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    });
}

// Initialize carousel animations
function initCarousels() {
    const carousels = document.querySelectorAll('.scrollable-container');
    
    carousels.forEach((carousel, carouselIndex) => {
        const track = carousel.querySelector('.carousel-track');
        if (!track) return; // Skip if track doesn't exist
        
        const links = track.querySelectorAll('.carousel-link');
        if (links.length === 0) return; // Skip if no links exist yet
        
        // Clone enough items to ensure smooth scrolling
        const itemsToClone = 8; // Increased clones for better infinite scroll, especially for catalogs with fewer items
        for (let i = 0; i < itemsToClone; i++) {
            links.forEach(link => {
                const clone = link.cloneNode(true);
                track.appendChild(clone);
            });
        }

        let currentPosition = 0;
        const scrollSpeed = 0.5; // Reduced speed for smoother animation
        let animationId;
        let isPaused = false;
        let isDragging = false;
        let manualPosition = null;
        
        // Store state for this carousel
        const carouselState = {
            currentPosition: 0,
            isPaused: false,
            isDragging: false,
            manualPosition: null,
            track: track
        };
        carouselStates.set(carouselIndex, carouselState);
        
        // Calculate itemSetWidth only once initially
        const originalLinks = Array.from(links);
        const itemSetWidth = originalLinks.reduce((sum, link) => sum + link.offsetWidth, 0);
        
        // Skip animation if itemSetWidth is 0 (no visible items)
        if (itemSetWidth === 0) return;

        function animate() {
            const state = carouselStates.get(carouselIndex);
            
            // Use manual position if dragging, otherwise auto-animate
            if (state.isDragging && state.manualPosition !== null) {
                track.style.transform = `translateX(${state.manualPosition}px)`;
            } else if (!state.isPaused && !state.isDragging) {
                state.currentPosition -= scrollSpeed;
                
                // FIX: Use Math.floor to handle fractional pixel values and ensure precise reset
                if (Math.abs(state.currentPosition) >= itemSetWidth) {
                    // Reset to exact itemSetWidth multiple to prevent drift
                    state.currentPosition = state.currentPosition % itemSetWidth;
                    
                    // If we ended up with a negative remainder, adjust to maintain proper position
                    if (state.currentPosition < 0) {
                        state.currentPosition += itemSetWidth;
                    }
                }
                
                track.style.transform = `translateX(${state.currentPosition}px)`;
            }
            animationId = requestAnimationFrame(animate);
        }

        // Start animation
        animate();

        // Pause on hover and touch (but only if not dragging)
        carousel.addEventListener('mouseenter', () => {
            const state = carouselStates.get(carouselIndex);
            if (state && !state.isDragging) {
                state.isPaused = true;
            }
        });

        // Resume on mouse leave (but not if dragging)
        carousel.addEventListener('mouseleave', () => {
            const state = carouselStates.get(carouselIndex);
            if (state && !state.isDragging) {
                state.isPaused = false;
            }
        });

        // Pause on touch start (mobile)
        carousel.addEventListener('touchstart', () => {
            const state = carouselStates.get(carouselIndex);
            if (state) {
                state.isPaused = true;
            }
        }, { passive: true });

        // Resume after touch end with delay (mobile)
        carousel.addEventListener('touchend', () => {
            setTimeout(() => {
                const state = carouselStates.get(carouselIndex);
                if (state && !state.isDragging) {
                    state.isPaused = false;
                }
            }, 1000); // Resume after 1 second delay
        }, { passive: true });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            const state = carouselStates.get(carouselIndex);
            if (state) {
                state.isPaused = document.hidden;
            }
        });
    });
}

// Initialize composers carousel
async function initComposersCarousel() {
    const writersTrack = document.querySelector('.WritersImages .carousel-track');
    if (!writersTrack) {
        console.error('Writers track element not found');
        return [];
    }

    // Performance: Track loading time
    const startTime = performance.now();

    // Clear existing static content
    writersTrack.innerHTML = '';

    try {
        // Get current site version and load composers from Supabase
        const currentVersion = getCurrentVersion();
        console.log(`Loading composers for site version: ${currentVersion}`);
        
        // Use cache if available
        let composers;
        const cacheKey = `composers_${currentVersion}`;
        
        if (composerCache.has(cacheKey)) {
            composers = composerCache.get(cacheKey);
            console.log('Using cached composer data for carousel');
        } else {
            composers = await loadVisibleComposers(currentVersion);
            composerCache.set(cacheKey, composers);
            console.log('Fetched fresh composer data for carousel:', composers);
        }
        
        if (!composers || composers.length === 0) {
            console.warn('No composers returned from database');
            return [];
        }

        // Performance: Use document fragment for batch DOM updates
        const fragment = document.createDocumentFragment();
        
        // Add composers to carousel
        composers.forEach(composer => {
            const composerElement = createComposerElement(composer);
            fragment.appendChild(composerElement);
        });

        // Performance: Second fragment for clone elements
        const cloneFragment = document.createDocumentFragment();
        
        // Clone composers for infinite scroll
        composers.forEach(composer => {
            const composerElement = createComposerElement(composer);
            cloneFragment.appendChild(composerElement.cloneNode(true));
        });
        
        // Batch DOM updates
        writersTrack.appendChild(fragment);
        writersTrack.appendChild(cloneFragment);
        
        // Performance: Log loading time
        const loadTime = performance.now() - startTime;
        console.log(`Loaded composers carousel in ${loadTime.toFixed(2)}ms with ${composers.length} composers`);
        
        // MODIFIED: Always ensure carousel view is visible on page load/return
        showCarouselView();
        
        return composers; // Return composers for grid view
    } catch (err) {
        console.error('Error in initComposersCarousel:', err);
        return [];
    }
}

// Initialize FTV carousel
async function initFTVCarousel() {
    try {
        const ftvTrack = document.querySelector('.FtvImages .carousel-track');
        if (!ftvTrack) {
            console.error('FTV track element not found');
            return;
        }

        // Clear existing static content
        ftvTrack.innerHTML = '';

        // Load FTV images from Supabase
        const ftvImages = await loadFTVImages();
        console.log('Loaded FTV images:', ftvImages);
        
        if (!ftvImages || ftvImages.length === 0) {
            console.warn('No FTV images found');
            // Add back the default image as fallback with link to ftv.html
            ftvTrack.innerHTML = '<a href="ftv.html" class="carousel-link"><img src="assets/images/ftv.png" alt="FTV"></a>';
            return;
        }

        // Add FTV images to carousel
        ftvImages.forEach(image => {
            const link = document.createElement('a');
            link.href = "ftv.html"; // Link to ftv.html instead of "#"
            link.className = 'carousel-link';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.name;
            console.log('Creating image element with URL:', image.url);
            
            const overlay = document.createElement('div');
            overlay.className = 'composer-name-overlay';
            overlay.textContent = image.name;
            
            link.appendChild(img);
            link.appendChild(overlay);
            ftvTrack.appendChild(link);
        });

        // Clone FTV images for infinite scroll
        const links = Array.from(ftvTrack.querySelectorAll('.carousel-link'));
        if (links.length > 0) {
            links.forEach(link => {
                ftvTrack.appendChild(link.cloneNode(true));
            });
        }
    } catch (err) {
        console.error('Error initializing FTV carousel:', err);
        // Add back the default image as fallback with link to ftv.html
        const ftvTrack = document.querySelector('.FtvImages .carousel-track');
        if (ftvTrack) {
            ftvTrack.innerHTML = '<a href="ftv.html" class="carousel-link"><img src="assets/images/ftv.png" alt="FTV"></a>';
        }
    }
}

// Initialize view toggle functionality
function initViewToggle(composers) {
    const carouselViewBtn = document.querySelector('.toggle-button.carousel-view');
    const gridViewBtn = document.querySelector('.toggle-button.grid-view');
    
    if (!carouselViewBtn || !gridViewBtn) return;
    
    // Performance: Use passive event listeners for better scroll performance
    carouselViewBtn.addEventListener('click', () => {
        showCarouselView();
        // Save preference only when user explicitly clicks the button
        localStorage.setItem('preferredView', 'carousel');
    }, { passive: true });
    
    gridViewBtn.addEventListener('click', () => {
        showGridView(composers);
        // Save preference only when user explicitly clicks the button
        localStorage.setItem('preferredView', 'grid');
    }, { passive: true });
}

// Show carousel view
function showCarouselView() {
    const carouselViewBtn = document.querySelector('.toggle-button.carousel-view');
    const gridViewBtn = document.querySelector('.toggle-button.grid-view');
    const writersCarousel = document.querySelector('.WritersImages');
    const writersGrid = document.querySelector('.writers-grid');
    
    if (!carouselViewBtn || !gridViewBtn || !writersCarousel || !writersGrid) return;
    
    // Performance: Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
        // Update button states
        carouselViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        
        // Show carousel, hide grid
        writersCarousel.style.display = 'block';
        writersGrid.style.display = 'none';
    });
}

// Show grid view
function showGridView(composers) {
    const carouselViewBtn = document.querySelector('.toggle-button.carousel-view');
    const gridViewBtn = document.querySelector('.toggle-button.grid-view');
    const writersCarousel = document.querySelector('.WritersImages');
    const writersGrid = document.querySelector('.writers-grid');
    
    if (!carouselViewBtn || !gridViewBtn || !writersCarousel || !writersGrid) return;
    
    // Performance: Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
        // Update button states
        carouselViewBtn.classList.remove('active');
        gridViewBtn.classList.add('active');
        
        // Show grid, hide carousel
        writersCarousel.style.display = 'none';
        writersGrid.style.display = 'grid';
    });
    
    // Populate grid if empty
    if (writersGrid.children.length === 0) {
        populateWritersGrid(writersGrid, composers);
    }
}

// Populate writers grid with composers
function populateWritersGrid(gridContainer, composers) {
    if (!composers || composers.length === 0) return;
    
    // Performance: Track render time
    const renderStart = performance.now();
    
    // Performance: Use document fragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    
    composers.forEach((composer, index) => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        
        // Performance: Limit total animation delay to improve perceived performance
        gridItem.style.animationDelay = `${Math.min(index * 30, 300)}ms`;
        
        const link = document.createElement('a');
        link.href = appendVersionToUrl(`composer.html?slug=${composer.slug}`);
        
        // Performance: Use data-src for lazy loading
        const img = document.createElement('img');
        img.dataset.src = composer.primary_photo_url;
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3C/svg%3E';
        img.alt = composer.name;
        img.loading = 'lazy'; // Native lazy loading as fallback
        
        const nameOverlay = document.createElement('div');
        nameOverlay.className = 'composer-name-overlay';
        nameOverlay.textContent = composer.name;
        
        link.appendChild(img);
        link.appendChild(nameOverlay);
        gridItem.appendChild(link);
        fragment.appendChild(gridItem);
    });
    
    // Batch DOM update
    gridContainer.appendChild(fragment);
    
    // Performance: Apply lazy loading to images
    applyLazyLoadingToGridImages();
    
    // Performance: Log render time
    const renderTime = performance.now() - renderStart;
    console.log(`Rendered writers grid with ${composers.length} items in ${renderTime.toFixed(2)}ms`);
}

/**
 * Apply lazy loading to grid images
 */
function applyLazyLoadingToGridImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        delete img.dataset.src;
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // Start loading when image is 50px from viewport
        });
        
        // Observe all images with data-src attribute
        document.querySelectorAll('.writers-grid img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('.writers-grid img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Function to initialize the application
async function init() {
    console.log("Application initialized");
    try {
        // Performance: Track total initialization time
        const initStart = performance.now();
        
        // Load composers and initialize carousels in the correct order
        const composers = await initComposersCarousel().catch(err => {
            console.error('Composers carousel error:', err);
            return [];
        });
        
        await initFTVCarousel().catch(err => console.error('FTV carousel error:', err));
        
        // Initialize smooth scrolling AFTER content is loaded
        initSmoothScroll();
        
        // Initialize carousels after dynamic content is loaded
        initCarousels();
        
        // Initialize view toggle functionality
        initViewToggle(composers);
        
        // Performance: Log total initialization time
        const initTime = performance.now() - initStart;
        console.log(`Total application initialization completed in ${initTime.toFixed(2)}ms`);
    } catch (err) {
        console.error('Initialization error:', err);
    }
}

// Function to handle button clicks
function handleButtonClick(event) {
    console.log("Button clicked:", event.target);
    // Add functionality for button click here
}

// Example of adding event listeners to buttons
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("button");
    buttons.forEach(button => {
        button.addEventListener("click", handleButtonClick);
    });
});

// Call the init function to start the application
document.addEventListener('DOMContentLoaded', init);

// Performance: Listen for visibility changes to pause/resume animations
document.addEventListener('visibilitychange', () => {
    // Pause animations when page is not visible to save resources
    const isVisible = document.visibilityState === 'visible';
    
    const carousels = document.querySelectorAll('.scrollable-container');
    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        if (track) {
            if (isVisible) {
                // Resume animations when page becomes visible again
                track.style.animationPlayState = 'running';
            } else {
                // Pause animations when page is hidden
                track.style.animationPlayState = 'paused';
            }
        }
    });
});

// Add event listener for page visibility to reset view preference on page navigation
window.addEventListener('pageshow', (event) => {
    // If navigating back to this page
    if (event.persisted) {
        console.log('Page was loaded from cache, resetting to carousel view');
        showCarouselView();
    }
});