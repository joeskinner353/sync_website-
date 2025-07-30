# Vers|## Version Overview

| Version | Name | Description | Status | Deployment URL | Branch |
|---------|------|-------------|--------|----------------|---------|
| version_1 | Default/Production | Current production version with enhanced features | 🟢 Active | concordpub-sync.netlify.app | main |
| version_2 | Version 2 Site | Second version for additional composers | 🟡 Active | TBD | main_version2 |
| version_3 | Version 3 Site | Third version for additional composers | 🟡 Active | TBD | main_version3 | | Name | Description | Status | Deployment URL | Branch |
|---------|------|-------------|--------|----------------|---------|
| version_1 | Default/Production | Current production version with enhanced features | 🟢 Active | concordpub-sync.netlify.app | main |
| version_2 | Version 2 Site | Second version for additional composers | 🟡 Active | TBD | main_version2 |nagement

This document tracks all versions of the Concord Music Publishing website and their deployment details.

## Version Overview

| Version | Name | Description | Status | Deployment URL | Branch |
|---------|------|-------------|--------|----------------|---------|
| version_1 | Default/Production | Current production version with enhanced features | 🟢 Active | concordpub-sync.netlify.app | main |
| version_2 | Version 2 Site | Second version for additional composers | 🟡 Active | TBD | main_version2 |
| version_4 | TBD | Future version with new composers | � Planned | concordpub-v4.netlify.app | v4-deployment |
| version_5 | TBD | Future version | 🔴 Reserved | concordpub-v5.netlify.app | v5-deployment |

## Version Details

### version_1 - Default/Production
- **Current Status**: Active production version
- **Features**: 
  - Single video carousel with navigation arrows
  - Improved spacing and layout with consistent margins
  - Cleaner container styling with transparent backgrounds
  - Hover animations for navigation elements
  - PDF generation for composer profiles
- **Deployment**: Main branch deploys to primary Netlify URL
- **Database Filter**: `site_version` containing `'version_1'`

### version_2 - Version 2 Site
- **Current Status**: Active branch for version 2 composers
- **Features**: Inherits all version_1 features
- **Deployment**: main_version2 branch (ready for separate Netlify deployment)
- **Database Filter**: `site_version` containing `'version_2'`
- **Branch**: `main_version2`

### version_4 - TBD
- **Current Status**: Planned for future deployment
- **Features**: Will inherit all version_1 features plus new additions
- **Deployment**: v4-deployment branch will deploy to separate Netlify URL
- **Database Filter**: `site_version` containing `'version_4'`

### version_5 - TBD
- **Current Status**: Reserved for future use
- **Features**: Will inherit all previous features plus new additions
- **Deployment**: v5-deployment branch will deploy to separate Netlify URL
- **Database Filter**: `site_version` containing `'version_5'`

## Deployment Architecture

```
Production Sites:
├── concordpub-sync.netlify.app     (version_1 - main branch)
├── TBD                             (version_2 - main_version2 branch)
├── concordpub-v4.netlify.app       (version_4 - v4-deployment branch)
└── concordpub-v5.netlify.app       (version_5 - v5-deployment branch)

Git Branches:
├── main                            (version_1 codebase)
├── main_version2                   (version_2 with site-version.js configured for version_2)
├── v4-deployment                   (version_4 with specific site-version.js)
└── v5-deployment                   (version_5 with specific site-version.js)

Database Content:
├── composers with site_version='version_1' (shown on version_1 site)
├── composers with site_version='version_2' (shown on version_2 site)
├── composers with site_version='version_4' (shown on version_4 site)
└── composers with site_version='version_5' (shown on version_5 site)
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

- **version_1** (Current): Launched with enhanced video player and navigation features
- **version_2** (Active): Branch created for composers tagged with version_2
- **version_4** (Planned): Reserved for new composer roster
- **version_5** (Planned): Reserved for future expansion

---

*Last Updated: July 30, 2025*
