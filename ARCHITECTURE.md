# Concord Music Publishing Website Architecture

## Overview

The application is a web-based platform for Concord Music Publishing that showcases their catalogs, writers (composers), and FTV content. It's built with vanilla JavaScript, HTML, and CSS, using Supabase as the backend database.

## Core Components

### 1. Page Structure
- **Main Page (index.html)**
  - Catalogs section with direct links to catalog platforms:
    - Boosey & Hawkes (represents.boosey.com)
    - Fania (disco.ac)
    - Rodgers & Hammerstein (disco.ac)
    - Pulse (pulsesync.disco.ac)
    - Pusher (disco.ac)
  - Writers section (composers from database) with dual view modes:
    - Carousel view (default) - horizontally scrolling composer cards
    - Grid view - responsive grid layout of composer cards
  - FTV content section with scrolling carousel of Film & TV content
    - All items in carousel link directly to the FTV page
    - Section title also acts as a clickable link to the FTV page
  - Header with Concord logo
  - Note: Top navigation links have been removed in the latest update

- **Composer Pages (composer.html)**
  - Individual pages for each composer
  - Profile photo
  - Biography with customizable typography
  - Social media links (Spotify, Instagram, TikTok) with standardized SVG icons
  - **New in V3**: Single video carousel with navigation arrows:
    - One-video-at-a-time display format
    - Left/right navigation buttons for video switching
    - Indicator dots showing current position
    - Keyboard arrow key navigation
    - Fullscreen video support with keyboard controls (Escape/Backspace)
  - Spotify playlist integration with centered alignment
  - **New in V3**: Improved spacing and layout with consistent margins
  - **New in V3**: Cleaner container styling with transparent backgrounds

- **Composer Grid Page (composer_grid.html)**
  - Full grid view of all composers
  - Responsive layout with consistent spacing
  - Direct links to individual composer pages
  - Optimized for large collections

- **Film & TV Page (ftv.html)**
  - Dedicated page showcasing Concord's Film & TV offerings
  - Fixed-width layout (1200px) with responsive behavior for smaller screens
  - Clean black background with white typography for high contrast
  - Visual flow diagram explaining the royalty generation process:
    - Step 1: Producer acquiring rights from composer
    - Step 2: Producer selling rights to Concord
    - Step 3: Concord tracking royalties worldwide
  - Two main headline sections:
    - "Filmmakers can make money from their music content"
    - "Music for Film & TV has long-term value as films/series are syndicated worldwide"
  - "Contact us" call-to-action button linked to email functionality
  - Concord logo positioned in the top-left corner
  - Navigation links to Home and All Composers pages
  - Mobile-optimized layout that transforms the flow diagram from horizontal to vertical on smaller screens

### 2. Key Features

#### Carousel System
Two types of scrolling mechanisms are implemented:

1. **Manual Scrolling (initSmoothScroll)**
   - Click and drag functionality
   - Smooth scrolling behavior
   - Cursor feedback (grab/grabbing)
   - Mouse event handling

2. **Automatic Scrolling (initCarousels)**
   - Infinite scroll animation
   - Automatic horizontal scrolling
   - Content cloning for seamless loops
   - Hover pause functionality
   - Page visibility handling

#### FTV Integration Features
- Dynamic loading of FTV content from Supabase storage
- Automatic carousel creation with properly formatted image names
- All FTV carousel images link directly to the ftv.html page
- FTV section title linked to the FTV page for improved discoverability
- Responsive design adapting to screen sizes
- Email contact functionality from the dedicated FTV page
- Visual process flow with SVG arrow indicators
- Consistent branding with main site while maintaining a focused presentation
- Fallback image handling if database content isn't available

#### View Toggle System
- Toggle between carousel view and grid view for writers section
- Carousel view (default): Horizontally scrolling, animated content
- Grid view: Responsive grid layout with consistent spacing
- View state resets to carousel when returning from other pages
- Animation-based transitions between view modes
- Toggle button UI with active state indicators

#### Video Player Features (Updated in V3)
- Single-video display with navigation controls
- Previous/next video navigation with arrow buttons
- Visual indicators for current video position
- Keyboard navigation support (left/right arrows)
- Vimeo integration with optimized embed parameters
- Fullscreen support with keyboard controls
- Responsive video sizing with consistent dimensions
- Dynamic video loading from composer data
- Smooth transitions between videos

### 3. Database Integration

Uses Supabase with the following schema for composers:
- name
- slug (URL-friendly name)
- bio
- primary_photo_url
- social media links:
  - spotify_url
  - instagram_url
  - tiktok_url
- video links:
  - video_link_1
  - video_link_2
  - video_link_3
  - video_link_4
- disco_playlist (Spotify embed code)
- is_visible flag
- display_order
- site_version (for multi-version support)

### 4. Technical Implementation

#### Content Loading
- Dynamic loading from Supabase
- Visibility filtering
- Order-based display
- Dynamic image and video loading
- External catalog platform integration
- Cached composer data to prevent redundant database fetches

#### PDF Generation
- One-click composer profile PDF export
- Implementation using html2canvas and jsPDF libraries
- PDF download with composer-specific filename
- Custom PDF layout matching brand design:
  - Concord logo with hyperlink to company website
  - Composer name and biography
  - Social media links as interactive, clickable icons
  - Composer photo placement
  - Branded theming with consistent styling
- Interactive elements in PDF:
  - Clickable social media icons (Spotify, Instagram, TikTok)
  - Clickable Concord logo linking to music publishing homepage
- Technical approach:
  - DOM-to-canvas rendering for visual elements
  - Custom link annotation placement for interactive elements
  - PDF metadata and copyright information
  - A4 format with precise element positioning
  - Load state management with visual feedback during generation
  - Error handling for failed PDF creation

#### View Management
- Dynamic view switching without page reload
- Responsive grid layout with CSS Grid
- Lazy loading of grid images with Intersection Observer API
- Animation delay for staggered grid item appearance
- Session-based view state management
- Cross-page view state handling

#### Performance Optimizations
- Lazy loading of composer data
- Efficient carousel animations using requestAnimationFrame
- Animation pausing when page is not visible
- Minimal element cloning for infinite scroll
- Optimized video embedding parameters
- Secure external linking with noopener/noreferrer
- Document fragments for batch DOM updates
- Session caching of composer data
- Optimized image loading in grid view

#### Styling (Updated for V3)
- Custom CircularXX font
- Responsive design
- Warm background theme (#F4A461)
- Consistent spacing with optimized margins:
  - 25px bottom margin for composer bio
  - 0px top margin for composer videos
  - 25px top margin for Spotify playlist
- Improved visual hierarchy with refined typography
- Standardized social media icon implementation
- Navigation controls with hover effects
- Transparent containers for cleaner visual presentation
- Video player with subtle background and rounded corners

#### Testing
- Jest-based testing suite
- Supabase connectivity tests
- Data structure validation
- Carousel animation testing

### 5. Error Handling
- Database connection validation
- Required field validation
- Graceful content fallbacks
- Video embed error handling
- External link security measures
- Element existence checks before DOM operations
- Detailed error logging for debugging

## File Structure

```
src/
├── composer.html          # Individual composer page template
├── composer_grid.html     # Full grid view of all composers
├── index.html             # Main landing page with toggle view feature
├── ftv.html               # Dedicated Film & TV page
├── assets/
│   ├── data/
│   │   └── catalog-links.md  # Catalog platform URLs
│   ├── images/          # Static images and logos
│   ├── fonts/           # Custom font files
│   └── styles/
│       ├── main.css     # Main stylesheet
│       └── grid.css     # Grid-specific styles
├── components/          # Reusable UI components
└── scripts/
    ├── composer-page.js # Composer page logic
    ├── composer-grid.js # Grid view logic
    ├── composers.js     # Composer data handling
    ├── main.js          # Core application logic with view toggle
    ├── site-version.js  # Version handling for multi-version support
    ├── supabase.js      # Database connectivity
    └── tests/           # Test files
        ├── carousel-test-runner.html
        └── carousel-tests.js
```

## Best Practices

1. **Performance**
   - Efficient DOM manipulation with document fragments
   - Optimized animations with requestAnimationFrame
   - Resource lazy loading with Intersection Observer
   - Optimized video embedding
   - Caching strategies for database queries

2. **Maintainability**
   - Modular JavaScript structure
   - Clear separation of concerns
   - Comprehensive error handling
   - Documentation of external links
   - Consistent view state management

3. **User Experience**
   - Smooth animations and transitions between views
   - Responsive design with grid and carousel options
   - Intuitive navigation with visual toggle indicators
   - Interactive video controls
   - Direct catalog access
   - Consistent view state when navigating between pages

4. **Security**
   - Secure external linking
   - Protected database access
   - Safe iframe embedding
   - Content security policies