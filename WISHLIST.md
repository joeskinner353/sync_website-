# Concord Music Publishing Website - Enhancement Wishlist

This document tracks desired improvements and new features for future development. These items have been identified as valuable enhancements but are not yet implemented.

## Recent Completions

### Font Loading System
- [x] **Fix font loading issues** _(Completed June 10, 2025)_
  - Resolved CORS issues preventing cross-origin font loading
  - Fixed relative path resolution problems in CSS
  - Added proper CORS headers to local server and Netlify configuration
  - Implemented absolute font paths for consistent loading
  - Added font-specific MIME types and caching headers

### Writers Carousel Loading
- [x] **Fix writers carousel not loading** _(Completed June 10, 2025)_
  - Resolved Content Security Policy (CSP) blocking Supabase API connections
  - Updated CSP connect-src directive in all HTML files 
  - Added proper allowlist for Supabase API and CDN connections
  - Improved error handling and fallback mechanisms for data loading

## User Experience Improvements

### Navigation & Interface
- [x] **Remove top navigation links** _(Completed May 21, 2025)_
  - Removed navigation container from homepage
  - Created cleaner interface with focus on content
  - Improved visual hierarchy

### Social Media Integration
- [ ] **Change social links to open in new tab**
  - Update all social media links to use `target="_blank"` attribute
  - Add `rel="noopener noreferrer"` for security
  - Ensure this applies to Spotify, Instagram, and TikTok links

## New Features

### Content Expansion
- [x] **Create new FTV page** _(Completed May 6, 2025)_
  - Implemented dedicated FTV page with visual process flow
  - All images in FTV carousel now link to the FTV page
  - Added FTV section title link for improved navigation
  - Mobile-responsive design with adaptive layout

### Media Playback
- [ ] **Improve video playback**
  - fix bug where videos are not playing full screen by default
  - add functionality so that pressing 'f' key will toggle fullscreen. 'escape' key should cancel fullscreen
  - Implement smoother transitions between videos
  - Fix any loading/buffering issues




## Additional Notes

- All changes should maintain the existing design language and color scheme
- Mobile responsiveness must be maintained across all enhancements
- Performance optimization should be considered with each change

## Last Updated

June 10, 2025