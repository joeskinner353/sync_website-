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
  - Writers section (composers from database)
  - FTV content section
  - Header with Concord logo

- **Composer Pages (composer.html)**
  - Individual pages for each composer
  - Profile photo
  - Biography
  - Social media links (Spotify, Instagram, TikTok)
  - Interactive video gallery:
    - Horizontally scrollable video section
    - Click-to-play functionality
    - Fullscreen video support with keyboard controls (Escape/Backspace)
  - Spotify playlist integration

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

#### Video Player Features
- Horizontal scrolling video gallery
- Vimeo integration with optimized embed parameters
- Fullscreen support with keyboard controls
- Responsive video sizing
- Dynamic video loading from composer data

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

### 4. Technical Implementation

#### Content Loading
- Dynamic loading from Supabase
- Visibility filtering
- Order-based display
- Dynamic image and video loading
- External catalog platform integration

#### Performance Optimizations
- Lazy loading of composer data
- Efficient carousel animations using requestAnimationFrame
- Animation pausing when page is not visible
- Minimal element cloning for infinite scroll
- Optimized video embedding parameters
- Secure external linking with noopener/noreferrer

#### Testing
- Jest-based testing suite
- Supabase connectivity tests
- Data structure validation

#### Styling
- Custom CircularXX font
- Responsive design
- Black background theme
- Smooth animations and transitions
- Consistent spacing and layout

### 5. Error Handling
- Database connection validation
- Required field validation
- Graceful content fallbacks
- Video embed error handling
- External link security measures

## File Structure

```
src/
├── composer.html          # Individual composer page template
├── index.html            # Main landing page
├── assets/
│   ├── data/
│   │   └── catalog-links.md  # Catalog platform URLs
│   ├── images/          # Static images and logos
│   ├── fonts/           # Custom font files
│   └── styles/          # CSS stylesheets
├── components/          # Reusable UI components
└── scripts/
    ├── composer-page.js # Composer page logic
    ├── composers.js     # Composer data handling
    ├── main.js         # Core application logic
    ├── supabase.js     # Database connectivity
    └── __tests__/      # Test files
```

## Best Practices

1. **Performance**
   - Efficient DOM manipulation
   - Optimized animations
   - Resource lazy loading
   - Optimized video embedding

2. **Maintainability**
   - Modular JavaScript structure
   - Clear separation of concerns
   - Comprehensive error handling
   - Documentation of external links

3. **User Experience**
   - Smooth animations
   - Responsive design
   - Intuitive navigation
   - Interactive video controls
   - Direct catalog access

4. **Security**
   - Secure external linking
   - Protected database access
   - Safe iframe embedding
   - Content security policies