# Concord Music Publishing Website - Project Plan

This document outlines the step-by-step implementation plan for the new features requested for the Concord Music Publishing website.

## Feature Overview

1. **Site Versioning via Supabase**
   - Filter composers by `site_version` array field in database
   - No UI elements for version control (backend-only implementation)

2. **New Page: composer_grid.html**
   - Grid layout view of all composers (filtered by visibility and site version)
   - Frontend filters for composer types:
     - Artist (`is_artist`)
     - Producer (`is_producer`)
     - Songwriter (`is_songwriter`)

3. **Homepage View Toggle**
   - Add a toggle button on the homepage to switch between carousel and grid views
   - Seamless transition between view modes

## Implementation Roadmap

### Phase 1: Site Versioning Implementation

#### Step 1: Update Supabase Query Logic
- Modify the composer loading function in `composers.js` to filter by site version
- Add version parameter to composer loading functions
- Test query functionality with existing site version data

```javascript
// Update loadVisibleComposers function to include site version filtering
export async function loadVisibleComposers(siteVersion = 'version_1') {
    const { data: composers, error } = await supabase
        .from('composers')
        .select('*')
        .eq('is_visible', true)
        .contains('site_version', [siteVersion])
        .order('display_order');

    if (error) {
        console.error('Error loading composers:', error);
        return [];
    }

    return composers;
}
```

#### Step 2: Version Detection Logic
- Create utility function to determine the current site version
- Add configuration file or constants for available versions
- Implement version selection logic based on URL parameters (optional)

#### Step 3: Testing & Validation
- Create test composers with different version tags
- Verify filtering works correctly
- Ensure backward compatibility

### Phase 2: Composer Grid Page Creation

#### Step 1: Create HTML Template
- Create new `composer_grid.html` file
- Set up basic page structure with header and grid container
- Add filter buttons/toggles for artist, producer, songwriter

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Composer Grid | Concord Music Publishing</title>
    <link rel="stylesheet" href="assets/styles/main.css">
    <link rel="stylesheet" href="assets/styles/grid.css">
</head>
<body>
    <div class="grid-container">
        <header>
            <img class="logo" src="assets/images/concord-C-icon-red.png" alt="Concord C Icon">
            <div class="title">concord music publishing</div>
        </header>
        
        <div class="filter-controls">
            <button class="filter-button active" data-filter="all">All</button>
            <button class="filter-button" data-filter="artist">Artists</button>
            <button class="filter-button" data-filter="producer">Producers</button>
            <button class="filter-button" data-filter="songwriter">Songwriters</button>
        </div>
        
        <div class="composer-grid">
            <!-- Grid items will be dynamically inserted here -->
        </div>
    </div>
    <script type="module" src="scripts/composer-grid.js"></script>
</body>
</html>
```

#### Step 2: Create Grid Stylesheet
- Create new CSS file for grid layout
- Define responsive grid styling
- Style filter buttons and interactions

#### Step 3: Implement Grid JavaScript Logic
- Create new `composer-grid.js` file
- Import Supabase and composer functions
- Add functions for:
  - Loading composers with version filtering
  - Creating grid items
  - Handling filter button interactions
  - Applying filters to grid items

```javascript
// Sample structure for composer-grid.js
import { supabase } from './supabase.js';
import { loadVisibleComposers } from './composers.js';

// Load composers and create grid
async function initComposerGrid() {
    const gridContainer = document.querySelector('.composer-grid');
    const composers = await loadVisibleComposers(getCurrentVersion());
    
    // Clear grid
    gridContainer.innerHTML = '';
    
    // Add composers to grid
    composers.forEach(composer => {
        const gridItem = createComposerGridItem(composer);
        gridContainer.appendChild(gridItem);
    });
    
    // Init filter functionality
    initFilters();
}

// Create grid item for composer
function createComposerGridItem(composer) {
    const item = document.createElement('div');
    item.className = 'grid-item';
    
    // Add data attributes for filtering
    if (composer.is_artist) item.dataset.artist = true;
    if (composer.is_producer) item.dataset.producer = true;
    if (composer.is_songwriter) item.dataset.songwriter = true;
    
    // Create item content
    item.innerHTML = `
        <a href="composer.html?slug=${composer.slug}">
            <div class="grid-image">
                <img src="${composer.primary_photo_url}" alt="${composer.name}">
            </div>
            <div class="grid-name">${composer.name}</div>
        </a>
    `;
    
    return item;
}

// Initialize filter buttons
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Apply filter
            applyFilter(button.dataset.filter);
        });
    });
}

// Apply filter to grid items
function applyFilter(filter) {
    const items = document.querySelectorAll('.grid-item');
    
    items.forEach(item => {
        if (filter === 'all') {
            item.style.display = 'block';
        } else if (filter === 'artist' && item.dataset.artist) {
            item.style.display = 'block';
        } else if (filter === 'producer' && item.dataset.producer) {
            item.style.display = 'block';
        } else if (filter === 'songwriter' && item.dataset.songwriter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Get current site version
function getCurrentVersion() {
    // Logic to determine current version
    return 'version_1'; // Default version
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initComposerGrid);
```

#### Step 4: Navigation Integration
- Add navigation links between pages
- Create consistent header across pages
- Ensure proper linking between homepage and grid view

### Phase 3: Homepage View Toggle

#### Step 1: Update Homepage HTML
- Add toggle button in the header or writers section
- Create container for grid view option
- Update CSS for toggle button styling

```html
<!-- Example toggle button HTML -->
<div class="view-toggle">
    <button class="toggle-button carousel-view active" aria-label="Carousel View">
        <svg viewBox="0 0 24 24" width="24" height="24">
            <rect x="2" y="4" width="20" height="2" fill="currentColor"/>
            <rect x="2" y="11" width="20" height="2" fill="currentColor"/>
            <rect x="2" y="18" width="20" height="2" fill="currentColor"/>
        </svg>
    </button>
    <button class="toggle-button grid-view" aria-label="Grid View">
        <svg viewBox="0 0 24 24" width="24" height="24">
            <rect x="3" y="3" width="7" height="7" fill="currentColor"/>
            <rect x="14" y="3" width="7" height="7" fill="currentColor"/>
            <rect x="3" y="14" width="7" height="7" fill="currentColor"/>
            <rect x="14" y="14" width="7" height="7" fill="currentColor"/>
        </svg>
    </button>
</div>
```

#### Step 2: Update Main JavaScript
- Add toggle functionality in `main.js`
- Create function to switch between carousel and grid view
- Implement local storage to remember user preference

```javascript
// Example toggle implementation
function initViewToggle() {
    const carouselView = document.querySelector('.carousel-view');
    const gridView = document.querySelector('.grid-view');
    const writersContainer = document.querySelector('.WritersImages');
    const gridContainer = document.createElement('div');
    gridContainer.className = 'writers-grid';
    gridContainer.style.display = 'none';
    writersContainer.after(gridContainer);
    
    // Load user preference from local storage
    const savedView = localStorage.getItem('preferredView');
    if (savedView === 'grid') {
        showGridView();
    }
    
    carouselView.addEventListener('click', () => {
        showCarouselView();
    });
    
    gridView.addEventListener('click', () => {
        showGridView();
    });
    
    function showCarouselView() {
        carouselView.classList.add('active');
        gridView.classList.remove('active');
        writersContainer.style.display = 'block';
        gridContainer.style.display = 'none';
        localStorage.setItem('preferredView', 'carousel');
    }
    
    function showGridView() {
        gridView.classList.add('active');
        carouselView.classList.remove('active');
        writersContainer.style.display = 'none';
        gridContainer.style.display = 'grid';
        
        // Populate grid if empty
        if (gridContainer.children.length === 0) {
            populateWritersGrid(gridContainer);
        }
        
        localStorage.setItem('preferredView', 'grid');
    }
}

// Populate writers grid with composers
async function populateWritersGrid(container) {
    const composers = await loadVisibleComposers(getCurrentVersion());
    
    composers.forEach(composer => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        
        gridItem.innerHTML = `
            <a href="composer.html?slug=${composer.slug}">
                <div class="grid-image">
                    <img src="${composer.primary_photo_url}" alt="${composer.name}">
                </div>
                <div class="grid-name">${composer.name}</div>
            </a>
        `;
        
        container.appendChild(gridItem);
    });
}
```

#### Step 3: Add Grid Styling to Main CSS
- Create CSS for grid layout on homepage
- Ensure responsive design for different screen sizes
- Style toggle buttons and transitions

### Phase 4: Testing and Deployment

#### Step 1: Comprehensive Testing
- Test site versioning with multiple database entries
- Verify grid layout on different screen sizes
- Test filter functionality on composer grid page
- Ensure toggle functionality works correctly on homepage
- Cross-browser testing

#### Step 2: Performance Optimization
- Optimize image loading in grid view
- Ensure efficient DOM manipulation
- Verify Supabase query efficiency

#### Step 3: Documentation Update
- Update project documentation with new features
- Document the site version implementation for content managers
- Create user guide for frontend filtering

#### Step 4: Deployment
- Deploy updated files to production server
- Verify all functionality in production environment
- Monitor for any issues after deployment

## Progress Tracking

- [x] Project Plan Creation
- [x] Phase 1: Site Versioning Implementation
  - [x] Step 1: Update Supabase Query Logic
  - [x] Step 2: Version Detection Logic
  - [x] Step 3: Testing & Validation
- [x] Phase 2: Composer Grid Page Creation
  - [x] Step 1: Create HTML Template
  - [x] Step 2: Create Grid Stylesheet
  - [x] Step 3: Implement Grid JavaScript Logic
  - [x] Step 4: Navigation Integration
- [x] Phase 3: Homepage View Toggle
  - [x] Step 1: Update Homepage HTML
  - [x] Step 2: Update Main JavaScript
  - [x] Step 3: Add Grid Styling to Main CSS
- [x] Phase 4: Testing and Deployment
  - [x] Step 1: Comprehensive Testing
  - [x] Step 2: Performance Optimization
  - [x] Step 3: Documentation Update
  - [x] Step 4: Deployment