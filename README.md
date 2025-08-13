# Concord Music Publishing Website

A responsive web platform for Concord Music Publishing that showcases music catalogs, writers (composers), and Film/TV content. Built with vanilla JavaScript, HTML, and CSS, with Supabase as the backend database.

## Features

- **Dynamic Writer Showcase**:
  - Carousel view with smooth horizontal scrolling and auto-animation
  - Grid view option for easy browsing of all composers
  - Toggle between views with persistent state management
  - Responsive design for all device sizes

- **Composer Profiles**:
  - Individual pages for each composer with biography
  - Social media integration (Spotify, Instagram, TikTok)
  - Interactive video gallery with fullscreen support
  - Spotify playlist embedding

- **Catalog Integration**:
  - Direct links to catalog platforms including Boosey & Hawkes, Fania, Rodgers & Hammerstein, and Pulse
  - Seamless navigation to external platforms

- **FTV Content Showcase**:
  - Dedicated Film & TV page explaining the royalty generation process
  - Interactive process flow with visual steps and directional arrows
  - Email contact functionality for inquiries
  - Responsive layout adapting to various screen sizes
  - Horizontally scrolling FTV content carousel on home page
  - All carousel images and section title linked to FTV page
  - Dynamic loading of content from Supabase

- **Navigation**:
  - Clean, minimal interface with no header navigation links
  - Direct content access from each section
  - Smart internal linking between related content

## Version Management

- **Multi-Version Support**: Database-driven versioning system allowing multiple site versions
- **Current Version**: `version_1` (production default on main branch)
- **Version Filtering**: Each site version shows only relevant composers based on `site_version` database field
- **Branch-Based Deployment**: Separate git branches for each version with automated synchronization
- **Hostname Detection**: Automatic version detection based on deployment URL
- **Future Versions**: `version_4` and `version_5` planned for future composer rosters

For detailed version information, see [VERSION-MANAGEMENT.md](VERSION-MANAGEMENT.md)

## Font System & Loading

- **Custom Typography**: CircularXX font family for consistent branding
- **Font Loading Optimization**: 
  - CORS headers configured for cross-origin font loading
  - Absolute paths for reliable font file access
  - Proper MIME types for all font formats
  - Cache-optimized headers (1-year cache for font files)
- **Fallback Strategy**: Comprehensive font stack with system font fallbacks
- **Browser Compatibility**: Support for WOFF and WOFF2 formats

## Recent Fixes (August 2025)

### Video Player Bug Fix ✅ COMPLETED
- **Issue**: When navigating between videos using prev/next buttons, previous video continued playing in background
- **Solution**: Modified `updateVideoPosition()` function in `composer-page.js` to stop inactive videos
- **Implementation**: 
  - Sets `iframe.src = 'about:blank'` for non-active videos to stop playback
  - Restores proper embed URL only for the currently active video
  - Prevents multiple videos from playing simultaneously
- **Result**: Only one video plays at a time, improving user experience and performance

### FTV Carousel Content Updates ✅ COMPLETED
- **New Images Added**:
  - The Frankenstein Chronicles (`frankenstein.png`)
  - The Peanut Butter Falcon (`pb falcon.png`)
  - Altered Carbon (`Altered Carbon.png`)
- **Updated Images**:
  - Unforgotten image replaced with new version (with cache-busting)
- **Total FTV Images**: Now 8 carousel images
- **Cache Management**: Added cache-busting for updated images to ensure fresh content loads

### FTV Background Collage Improvements ✅ COMPLETED
- **Square Image Format**: Updated background collage to use square aspect ratios
- **Fixed Sizing**: Changed from percentage-based to viewport width units (`vw`) for consistent square proportions
- **Enhanced Layout**: Added positioning for 8 background images with artistic rotation and scatter effects
- **Image Updates**: Updated all background image URLs to match current FTV carousel content
- **Visual Consistency**: Maintains artistic collage effect while ensuring uniform square shapes

## Recent Fixes (June 2025)

### Font Loading System Fixes ✅ COMPLETED
- **CORS Issues**: Fixed server CORS headers for font files in both Node.js server and Netlify configuration
- **Font Path Issues**: Corrected relative font paths in CSS files
- **Font Consistency**: Unified all website text to use CircularXX font family consistently across all pages
- **Font Preloading**: Added proper font preloading with crossorigin attributes to all HTML files
- **CSP Headers**: Added Content Security Policy headers for improved security

### Writers Carousel Loading Issue ✅ COMPLETED  
- **Root Cause**: Content Security Policy (CSP) was blocking connections to Supabase API and video embeds
- **Solution**: Updated CSP directives in all HTML files:
  - Added `connect-src` for Supabase API (`https://lycmyaohsycrdergwpmq.supabase.co`) and CDN (`https://cdn.jsdelivr.net`)
  - Added `frame-src` for video embeds (Vimeo, YouTube) and Disco playlists (`https://concord-music-publishing.disco.ac`)
- **Files Updated**: All HTML files (index.html, composer.html, ftv.html, composer_grid.html)
- **Result**: Writers carousel loads composer data and videos/playlists embed correctly

### Font System Improvements ✅ COMPLETED
- **CORS Configuration**: Added proper CORS headers for font files in both local server and Netlify deployment
- **Path Resolution**: Fixed relative font paths (`../fonts/`) to absolute paths (`/src/assets/fonts/`)
- **Server Configuration**: Updated `server.js` with font-specific CORS and caching headers
- **Netlify Deployment**: Added font MIME types and CORS headers to `netlify.toml`
- **Font Consistency**: Unified all website text to use CircularXXSub-Black font family across all pages

## Project Structure

```
sync_website/
├── src/                  # Source code
│   ├── composer_grid.html  # Full grid view of all composers
│   ├── composer.html     # Individual composer page template
│   ├── index.html        # Main landing page with toggle view
│   ├── ftv.html          # Film & TV dedicated page
│   ├── assets/           # Static resources
│   │   ├── data/         # Configuration data
│   │   ├── fonts/        # Custom CircularXX font files
│   │   ├── images/       # Logos and static images
│   │   └── styles/       # CSS stylesheets
│   │       ├── grid.css  # Grid-specific styles
│   │       └── main.css  # Main stylesheet
│   ├── components/       # Reusable UI components
│   └── scripts/          # JavaScript files
│       ├── composer-grid.js  # Grid view functionality
│       ├── composer-page.js  # Composer page functionality
│       ├── composers.js  # Composer data handling
│       ├── main.js       # Core application logic
│       ├── site-version.js # Version handling
│       ├── supabase.js   # Database connectivity
│       └── tests/        # Test files
├── ARCHITECTURE.md       # Detailed architecture documentation
├── babel.config.js       # Babel configuration for modern JS
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sync_website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

4. **Run the development server:**
   ```bash
   npm start
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Database Schema

The application uses Supabase with the following schema for composers:

- `name`: Composer's full name
- `slug`: URL-friendly name for routing
- `bio`: Composer biography
- `primary_photo_url`: Main profile image URL
- `spotify_url`: Spotify profile link
- `instagram_url`: Instagram profile link
- `tiktok_url`: TikTok profile link
- `video_link_1` through `video_link_4`: Vimeo video URLs
- `disco_playlist`: Spotify embed code
- `is_visible`: Visibility toggle
- `display_order`: Ordering preference
- `site_version`: For multi-version support

## Key Technical Features

- **View Toggle System**: Switch between carousel and grid views
- **Carousel Animation**: Smooth infinite scrolling with pause-on-hover
- **Lazy Loading**: Intersection Observer for efficient image loading
- **Performance Optimizations**: Document fragments, requestAnimationFrame
- **Responsive Design**: Adapts to various screen sizes
- **Caching Strategy**: Prevents redundant database fetches

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Last Updated

August 13, 2025 - ✅ Video player bug fixes, FTV carousel content updates, and background collage improvements completed