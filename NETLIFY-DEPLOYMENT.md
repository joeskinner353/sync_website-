# Netlify Deployment Guide for Concord Music Publishing Website

## Setup Instructions

### 1. Connect Your Repository to Netlify

1. Log in to Netlify and click "New site from Git"
2. Choose your Git provider (GitHub, GitLab, Bitbucket)
3. Select your repository
4. Use the following build settings:
   - Build command: `mkdir -p dist && npm run build`
   - Publish directory: `dist`

### 2. Set Environment Variables

Go to Site settings > Build & deploy > Environment > Environment variables and add:

- `SUPABASE_URL`: Your Supabase URL (e.g., https://lycmyaohsycrdergwpmq.supabase.co)
- `SUPABASE_KEY`: Your Supabase anon key

### 3. Deploy Settings

The site includes a `netlify.toml` file that configures:
- Build settings
- Redirect rules for SPA functionality

## Troubleshooting

If the site isn't working on Netlify:

1. **Check build logs** for any errors
2. **Verify environment variables** are correctly set
3. **Check network requests** in browser console for CORS issues
4. **Review SPA redirect settings** in netlify.toml

## Local Development

To test the Netlify build process locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and serve the site locally
netlify dev
```