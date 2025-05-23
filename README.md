# Concord Music Publishing Website

A responsive web platform for Concord Music Publishing that showcases music catalogs, writers (composers), and Film/TV content. Built with vanilla JavaScript, HTML, and CSS, with Supabase as the backend database.

## Site Versions

- **Main Version**: Contains catalogs, writers (composers), and Film/TV content
- **Roster-Only Version**: Focused exclusively on writers/composers without catalogs or FTV sections
  - Available on the `roster_only` branch
  - Deployed on a separate Netlify URL
  - Uses YouTube's privacy-enhanced mode for video embedding

## Features

- **Dynamic Writer Showcase**:
  - Carousel view with smooth horizontal scrolling and auto-animation
  - Grid view option for easy browsing of all composers
  - Toggle between views with persistent state management
  - Responsive design for all device sizes

- **Composer Profiles**:
  - Individual pages for each composer with biography
  - Social media integration (Spotify, Instagram, TikTok)
  - Interactive video gallery with fullscreen support using privacy-enhanced YouTube embeds
  - Spotify playlist embedding

- **Catalog Integration**:
  - Direct links to catalog platforms including Boosey & Hawkes, Fania, Rodgers & Hammerstein, Pulse, and Pusher
  - Seamless navigation to external platforms

- **FTV Content Showcase**:
  - Dedicated Film & TV page explaining the royalty generation process
  - Interactive process flow with visual steps and directional arrows
  - Email contact functionality for inquiries
  - Responsive layout adapting to various screen sizes
  - Horizontally scrolling FTV content carousel on home page
  - All carousel images and section title linked to FTV page
  - Dynamic loading of content from Supabase

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

April 23, 2025