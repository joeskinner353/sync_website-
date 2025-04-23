# Concord Music Publishing Website - Features Documentation

This document provides documentation for the key features implemented in the Concord Music Publishing website.

## Table of Contents
1. [Site Versioning](#site-versioning)
2. [Composer Grid Page](#composer-grid-page)
3. [Homepage View Toggle](#homepage-view-toggle)
4. [Performance Optimizations](#performance-optimizations)

## Site Versioning

### Overview
The site versioning system allows filtering composers based on their associated site versions without requiring any UI elements. This backend-only implementation enables content managers to control which composers appear in different versions of the site.

### Implementation Details
- Each composer record in the Supabase database contains a `site_version` array field
- Composers can belong to multiple site versions (e.g., `['version_1', 'version_2']`)
- All composer queries are filtered by the current site version

### Configuration
Site versions are defined in `src/scripts/site-version.js`:

```javascript
export const SITE_VERSIONS = {
    VERSION_1: 'version_1',
    VERSION_2: 'version_2'
};

export const DEFAULT_VERSION = SITE_VERSIONS.VERSION_1;
```

### How to Use
- To assign a composer to a specific version, update their `site_version` array in the Supabase database
- To view a specific version of the site, use the URL parameter `?version=version_1` or `?version=version_2`
- The system will remember the last used version in localStorage

### Example
```
https://concord-music-publishing.com/?version=version_2
```

## Composer Grid Page

### Overview
The composer grid page provides a grid-based layout view of all visible composers, with filtering options for artist, producer, and songwriter roles.

### Features
- Responsive grid layout that adapts to screen size
- Role-based filtering (artist, producer, songwriter)
- Visual tags indicating composer roles
- Seamless navigation between grid and individual composer pages
- Maintains site version context when navigating

### How to Use
1. Access the grid page via the "View All Composers" link in the navigation
2. Use the filter buttons at the top to show composers by role:
   - All: Shows all composers
   - Artists: Shows only composers with `is_artist = true`
   - Producers: Shows only composers with `is_producer = true`
   - Songwriters: Shows only composers with `is_songwriter = true`

### Technical Notes
- The grid uses CSS Grid for layout
- Filtering is applied via JavaScript without page reload
- Images are lazy-loaded for better performance

## Homepage View Toggle

### Overview
The homepage now includes a toggle feature that allows users to switch between the default carousel view and a grid view for the Writers section.

### Features
- Toggle buttons for carousel and grid views
- Persistent view preference saved in localStorage
- Smooth transitions between views
- Responsive design for both view modes

### How to Use
1. On the homepage, look for the toggle buttons near the "writers" section
2. Click the carousel icon (horizontal lines) for carousel view
3. Click the grid icon (four squares) for grid view
4. Your preference will be remembered for future visits

### Technical Notes
- View toggle state is stored in localStorage as 'preferredView'
- Grid view elements are created dynamically only when needed
- Images in grid view are lazy-loaded for performance

## Performance Optimizations

### Lazy Loading
- Images in grid views are lazy-loaded using Intersection Observer API
- Images outside viewport aren't loaded until they're about to come into view
- Tiny placeholder SVGs are used until the real image loads

### Data Caching
- Composer data is cached in memory to reduce redundant database queries
- Site versioning uses the same data cache to improve switching speed

### DOM Optimization
- Document fragments are used for batch DOM updates
- Animation delays are capped to improve perceived performance
- Heavy animations are paused when the page is not visible

### Event Handling
- Passive event listeners are used where possible for better scroll performance
- Click handlers use debouncing to prevent rapid consecutive operations
- requestAnimationFrame is used for smoother UI updates

### Best Practices for Content Managers
- Keep image sizes reasonable (recommended max: 1MB per image)
- Use JPEG or WebP format for photos
- Always provide the `site_version` array for new composers
- Regular composers should be in both versions for transitional period