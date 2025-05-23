# Concord Music Publishing Website - Enhancement Wishlist

This document tracks desired improvements and new features for future development. These items have been identified as valuable enhancements but are not yet implemented.

## User Experience Improvements

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
- [x] **Create roster-only version** _(Completed May 23, 2025)_
  - Created `roster_only` branch without catalogs and FTV sections
  - Repositioned writers section to be the focal point of the homepage
  - Removed navigation links while preserving grid toggle functionality
  - Set up separate Netlify deployment configuration
  - Maintained core functionality for composer profiles

### Media Playback
- [x] **Improve video playback** _(Completed May 23, 2025)_
  - Implemented YouTube privacy-enhanced mode with youtube-nocookie.com domain
  - Fixed fullscreen issues with proper iframe allow attributes
  - Standardized embed parameters across YouTube and Vimeo videos
  - Added proper security attributes for all embedded videos
- [ ] **Additional video enhancements**
  - add functionality so that pressing 'f' key will toggle fullscreen
  - Implement smoother transitions between videos




## Additional Notes

- All changes should maintain the existing design language and color scheme
- Mobile responsiveness must be maintained across all enhancements
- Performance optimization should be considered with each change

## Last Updated

May 23, 2025