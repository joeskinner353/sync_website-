// main.js

import { loadVisibleComposers, createComposerElement } from './composers.js';
import { loadFTVImages, supabase } from './supabase.js';

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

    // Clear existing static content
    writersTrack.innerHTML = '';

    // Load composers from Supabase
    const composers = await loadVisibleComposers();
    
    // Add composers to carousel
    composers.forEach(composer => {
        const composerElement = createComposerElement(composer);
        writersTrack.appendChild(composerElement);
    });

    // Clone composers for infinite scroll
    composers.forEach(composer => {
        const composerElement = createComposerElement(composer);
        writersTrack.appendChild(composerElement.cloneNode(true));
    });
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

// Function to initialize the application
async function init() {
    console.log("Application initialized");
    try {
        initSmoothScroll();
        await Promise.all([
            initComposersCarousel().catch(err => console.error('Composers carousel error:', err)),
            initFTVCarousel().catch(err => console.error('FTV carousel error:', err))
        ]);
        initCarousels(); // Initialize carousels after dynamic content is loaded
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