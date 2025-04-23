// main.js

import { loadVisibleComposers, createComposerElement } from './composers.js';
import { loadFTVImages, supabase } from './supabase.js';
import { getCurrentVersion, appendVersionToUrl } from './site-version.js';

// Cache for composer data to prevent redundant fetches
const composerCache = new Map();

// Initialize smooth scrolling for image containers
function initSmoothScroll() {
    const containers = document.querySelectorAll('.scrollable-container');
    
    containers.forEach(container => {
        let isDown = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });
    });
}

// Initialize carousel animations
function initCarousels() {
    const carousels = document.querySelectorAll('.scrollable-container');
    
    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const links = track.querySelectorAll('.carousel-link');
        
        // Clone enough items to ensure smooth scrolling
        const itemsToClone = 3; // Clone more items for smoother transition
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

        function animate() {
            if (!isPaused) {
                currentPosition -= scrollSpeed;
                
                // Get width of one complete set of items
                const itemSetWidth = Array.from(links).reduce((sum, link) => sum + link.offsetWidth, 0);
                
                // Reset position smoothly when we've scrolled through one complete set
                if (-currentPosition >= itemSetWidth) {
                    currentPosition += itemSetWidth;
                }
                
                track.style.transform = `translateX(${currentPosition}px)`;
            }
            animationId = requestAnimationFrame(animate);
        }

        // Start animation
        animate();

        // Pause on hover
        carousel.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        // Resume on mouse leave
        carousel.addEventListener('mouseleave', () => {
            isPaused = false;
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            isPaused = document.hidden;
        });
    });
}

// Initialize composers carousel
async function initComposersCarousel() {
    const writersTrack = document.querySelector('.WritersImages .carousel-track');
    if (!writersTrack) return;

    // Performance: Track loading time
    const startTime = performance.now();

    // Clear existing static content
    writersTrack.innerHTML = '';

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
        console.log('Fetched fresh composer data for carousel');
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
    console.log(`Loaded composers carousel in ${loadTime.toFixed(2)}ms`);
    
    // If there's a saved preference for grid view, switch to it
    const savedView = localStorage.getItem('preferredView');
    if (savedView === 'grid') {
        showGridView(composers);
    }
    
    return composers; // Return composers for grid view
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
            // Add back the default image as fallback
            ftvTrack.innerHTML = '<a href="#" class="carousel-link"><img src="assets/images/ftv.png" alt="FTV"></a>';
            return;
        }

        // Add FTV images to carousel
        ftvImages.forEach(image => {
            const link = document.createElement('a');
            link.href = '#';
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
        // Add back the default image as fallback
        const ftvTrack = document.querySelector('.FtvImages .carousel-track');
        if (ftvTrack) {
            ftvTrack.innerHTML = '<a href="#" class="carousel-link"><img src="assets/images/ftv.png" alt="FTV"></a>';
        }
    }
}

// Initialize view toggle functionality
function initViewToggle(composers) {
    const carouselViewBtn = document.querySelector('.toggle-button.carousel-view');
    const gridViewBtn = document.querySelector('.toggle-button.grid-view');
    
    if (!carouselViewBtn || !gridViewBtn) return;
    
    // Performance: Use passive event listeners for better scroll performance
    carouselViewBtn.addEventListener('click', showCarouselView, { passive: true });
    gridViewBtn.addEventListener('click', () => showGridView(composers), { passive: true });
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
    
    // Save preference
    localStorage.setItem('preferredView', 'carousel');
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
    
    // Save preference
    localStorage.setItem('preferredView', 'grid');
    
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
        
        initSmoothScroll();
        
        // Load composers and initialize carousels
        const composers = await initComposersCarousel().catch(err => console.error('Composers carousel error:', err));
        await initFTVCarousel().catch(err => console.error('FTV carousel error:', err));
        
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