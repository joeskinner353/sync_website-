# Version Management

This document tracks all versions of the Concord Music Publishing website and their deployment details.

## Version Overview

| Version | Name | Description | Status | Deployment URL | Branch |
|---------|------|-------------|--------|----------------|---------|
| v3 | Default/Production | Current production version with V3 features | 🟢 Active | concordpub-sync.netlify.app | main |
| v4 | TBD | Future version with new composers | 🟡 Planned | concordpub-v4.netlify.app | v4-deployment |
| v5 | TBD | Future version | 🔴 Reserved | concordpub-v5.netlify.app | v5-deployment |

## Version Details

### v3 - Default/Production
- **Current Status**: Active production version
- **Features**: 
  - Single video carousel with navigation arrows
  - Improved spacing and layout with consistent margins
  - Cleaner container styling with transparent backgrounds
  - Hover animations for navigation elements
  - PDF generation for composer profiles
- **Deployment**: Main branch deploys to primary Netlify URL
- **Database Filter**: `site_version = 'v3'`

### v4 - TBD
- **Current Status**: Planned for future deployment
- **Features**: Will inherit all v3 features plus new additions
- **Deployment**: v4-deployment branch will deploy to separate Netlify URL
- **Database Filter**: `site_version = 'v4'`

### v5 - TBD
- **Current Status**: Reserved for future use
- **Features**: Will inherit all previous features plus new additions
- **Deployment**: v5-deployment branch will deploy to separate Netlify URL
- **Database Filter**: `site_version = 'v5'`

## Deployment Architecture

```
Production Sites:
├── concordpub-sync.netlify.app     (v3 - main branch)
├── concordpub-v4.netlify.app       (v4 - v4-deployment branch)
└── concordpub-v5.netlify.app       (v5 - v5-deployment branch)

Git Branches:
├── main                            (v3 codebase)
├── v4-deployment                   (v4 with specific site-version.js)
└── v5-deployment                   (v5 with specific site-version.js)

Database Content:
├── composers with site_version='v3' (shown on v3 site)
├── composers with site_version='v4' (shown on v4 site)
└── composers with site_version='v5' (shown on v5 site)
```

## Automated Sync Process

- **Trigger**: Any push to main branch
- **Action**: GitHub Actions automatically syncs changes to all version branches
- **Preservation**: Each branch maintains its specific site-version.js file
- **Deployment**: Netlify automatically deploys each branch to its respective URL

## Creating a New Version

1. **Add to Version Matrix**: Update `.github/workflows/sync-version-branches.yml`
2. **Update This Document**: Add new version to the table above
3. **Create Branch**: GitHub Actions will create the branch on next main push
4. **Configure Netlify**: Set up new Netlify site for the new branch
5. **Update Database**: Add composers with the new site_version value

## Version History

- **v3** (Current): Launched with enhanced video player and navigation features
- **v4** (Planned): Reserved for new composer roster
- **v5** (Planned): Reserved for future expansion

---

*Last Updated: July 30, 2025*
