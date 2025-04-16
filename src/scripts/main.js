// main.js

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
        
        // Clone links (which contain the images) for infinite scroll effect
        links.forEach(link => {
            const clone = link.cloneNode(true);
            track.appendChild(clone);
        });

        let currentPosition = 0;
        const scrollSpeed = 1;
        let animationId;

        function animate() {
            currentPosition -= scrollSpeed;
            
            // Reset position when we've scrolled through the original set
            const totalWidth = Array.from(links).reduce((sum, link) => sum + link.offsetWidth, 0);
            if (-currentPosition >= totalWidth) {
                currentPosition = 0;
            }
            
            track.style.transform = `translateX(${currentPosition}px)`;
            animationId = requestAnimationFrame(animate);
        }

        // Start animation
        animate();

        // Pause on hover
        carousel.addEventListener('mouseenter', () => {
            cancelAnimationFrame(animationId);
        });

        // Resume on mouse leave
        carousel.addEventListener('mouseleave', () => {
            animate();
        });
    });
}

// Function to initialize the application
function init() {
    console.log("Application initialized");
    // Add event listeners or other initialization code here
    initSmoothScroll();
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

// Initialize carousel animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initCarousels);