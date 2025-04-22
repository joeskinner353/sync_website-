# Concord Music Publishing Website Architecture

This document outlines the architecture and functionality of the Concord Music Publishing website.

## Overview

The application is a web-based platform for Concord Music Publishing that showcases their catalogs, writers (composers), and FTV content. It's built with vanilla JavaScript, HTML, and CSS, using Supabase as the backend database.

## Core Components

### 1. Page Structure
- **Main Page (index.html)**
  - Catalogs section (Boosey & Hawkes, Fania, etc.)
  - Writers section (composers from database)
  - FTV content section
  - Header with Concord logo

- **Composer Pages (composer.html)**
  - Individual pages for each composer
  - Profile photo
  - Biography
  - Social media links
  - Embedded videos

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

### 3. Database Integration

Uses Supabase with the following schema for composers:
- name
- slug (URL-friendly name)
- bio
- primary_photo_url
- social media links
- video links
- is_visible flag
- display_order

### 4. Technical Implementation

#### Content Loading
- Dynamic loading from Supabase
- Visibility filtering
- Order-based display
- Dynamic image and video loading

#### Performance Optimizations
- Lazy loading of composer data
- Efficient carousel animations using requestAnimationFrame
- Animation pausing when page is not visible
- Minimal element cloning for infinite scroll

#### Testing
- Jest-based testing suite
- Supabase connectivity tests
- Data structure validation

#### Styling
- Custom CircularXX font
- Responsive design
- Black background theme
- Smooth animations and transitions

### 5. Error Handling
- Database connection validation
- Required field validation
- Graceful content fallbacks

## File Structure

```
src/
├── composer.html          # Individual composer page template
├── index.html            # Main landing page
├── assets/               # Static assets (images, fonts)
├── components/           # Reusable UI components
└── scripts/
    ├── composer-page.js  # Composer page logic
    ├── composers.js      # Composer data handling
    ├── main.js          # Core application logic
    ├── supabase.js      # Database connectivity
    └── __tests__/       # Test files
```

## Best Practices

1. **Performance**
   - Efficient DOM manipulation
   - Optimized animations
   - Resource lazy loading

2. **Maintainability**
   - Modular JavaScript structure
   - Clear separation of concerns
   - Comprehensive error handling

3. **User Experience**
   - Smooth animations
   - Responsive design
   - Intuitive navigation