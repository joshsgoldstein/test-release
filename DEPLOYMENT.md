# Deployment Guide

This guide covers multiple ways to deploy the Notes app to various hosting platforms.

## Table of Contents

1. [GitHub Pages (Recommended)](#github-pages-recommended)
2. [Netlify](#netlify)
3. [Vercel](#vercel)
4. [Cloudflare Pages](#cloudflare-pages)
5. [Surge.sh](#surgesh)

---

## GitHub Pages (Recommended)

**Best for:** Simple, free hosting directly from your GitHub repository.

### Automatic Deployment with GitHub Actions

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main` or `master`.

#### Setup Steps:

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Build and deployment":
     - **Source**: Select "GitHub Actions"

2. **Push to main/master branch:**
   ```bash
   git push origin main
   ```

3. **Your site will be live at:**
   ```
   https://[your-username].github.io/[repository-name]/
   ```

4. **Monitor deployment:**
   - Go to the **Actions** tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow

#### Manual Deployment (Without Actions):

If you prefer manual deployment:

1. Go to **Settings** → **Pages**
2. **Source**: Select "Deploy from a branch"
3. **Branch**: Select `main` (or `master`) and `/ (root)`
4. Click **Save**

### Custom Domain (Optional):

1. Add a `CNAME` file to the repository root:
   ```bash
   echo "your-domain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. Configure DNS at your domain registrar:
   - Add a CNAME record pointing to `[your-username].github.io`

---

## Netlify

**Best for:** Automatic deployments with preview URLs for pull requests.

### Method 1: Continuous Deployment (Recommended)

1. **Sign up at [netlify.com](https://netlify.com)**

2. **Create a new site:**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize
   - Select your repository

3. **Configure build settings:**
   - **Build command:** Leave empty (static site)
   - **Publish directory:** `/` (root)
   - Click "Deploy site"

4. **Your site will be live at:**
   ```
   https://[random-name].netlify.app
   ```

### Method 2: GitHub Actions Deployment

1. **Get Netlify credentials:**
   - Go to Netlify → User Settings → Applications
   - Create a new **Personal access token**
   - Go to your site → Site Settings → General
   - Copy your **Site ID**

2. **Add GitHub secrets:**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add secrets:
     - `NETLIFY_AUTH_TOKEN`: Your personal access token
     - `NETLIFY_SITE_ID`: Your site ID

3. **Enable the workflow:**
   ```bash
   mv .github/workflows/deploy-netlify.yml.example .github/workflows/deploy-netlify.yml
   git add .github/workflows/deploy-netlify.yml
   git commit -m "Enable Netlify deployment"
   git push
   ```

### Custom Domain:

1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

---

## Vercel

**Best for:** Excellent performance and edge functions (if needed later).

### Method 1: Vercel Dashboard (Recommended)

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Import your project:**
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select your repository

3. **Configure project:**
   - **Framework Preset:** Other
   - **Build Command:** Leave empty
   - **Output Directory:** `/` (root)
   - Click "Deploy"

4. **Your site will be live at:**
   ```
   https://[project-name].vercel.app
   ```

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Method 3: GitHub Actions Deployment

1. **Get Vercel credentials:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login and link project
   vercel login
   vercel link
   ```

2. **Get tokens from `.vercel/project.json`:**
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

3. **Create Vercel token:**
   - Go to Vercel → Settings → Tokens
   - Create new token

4. **Add GitHub secrets:**
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

5. **Enable workflow:**
   ```bash
   mv .github/workflows/deploy-vercel.yml.example .github/workflows/deploy-vercel.yml
   git add .github/workflows/deploy-vercel.yml
   git commit -m "Enable Vercel deployment"
   git push
   ```

---

## Cloudflare Pages

**Best for:** Global CDN with excellent performance and DDoS protection.

### Setup:

1. **Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)**

2. **Create a new project:**
   - Click "Create a project"
   - Connect to GitHub
   - Select your repository

3. **Configure build:**
   - **Framework preset:** None
   - **Build command:** Leave empty
   - **Build output directory:** `/`
   - Click "Save and Deploy"

4. **Your site will be live at:**
   ```
   https://[project-name].pages.dev
   ```

### Custom Domain:

If you use Cloudflare for DNS, custom domains are automatic and free with SSL.

---

## Surge.sh

**Best for:** Quick deployments via CLI.

### Setup:

1. **Install Surge CLI:**
   ```bash
   npm install -g surge
   ```

2. **Deploy:**
   ```bash
   surge .
   ```

3. **Follow the prompts:**
   - Create account (if needed)
   - Confirm project path
   - Choose domain (or use auto-generated)

4. **Your site will be live at:**
   ```
   https://[your-domain].surge.sh
   ```

### Automate with GitHub Actions:

Create `.github/workflows/deploy-surge.yml`:

```yaml
name: Deploy to Surge

on:
  push:
    branches: [main, master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - name: Install Surge
        run: npm install -g surge
      - name: Deploy to Surge
        run: surge . https://your-domain.surge.sh --token ${{ secrets.SURGE_TOKEN }}
        env:
          SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
```

Get your token: `surge token`

---

## Comparison Table

| Platform | Free Tier | Custom Domain | Auto Deploy | Build Time | CDN | Best For |
|----------|-----------|---------------|-------------|------------|-----|----------|
| **GitHub Pages** | ✅ Unlimited | ✅ Yes | ✅ Yes | Fast | ✅ Yes | Simple projects |
| **Netlify** | ✅ 100GB/mo | ✅ Yes | ✅ Yes | Fast | ✅ Yes | Teams, previews |
| **Vercel** | ✅ 100GB/mo | ✅ Yes | ✅ Yes | Very Fast | ✅ Yes | Performance |
| **Cloudflare Pages** | ✅ Unlimited | ✅ Yes | ✅ Yes | Fast | ✅ Yes | Global reach |
| **Surge** | ✅ Unlimited | ✅ Yes | ⚠️ Manual | Very Fast | ❌ No | Quick tests |

---

## Recommended Setup

**For this project, I recommend GitHub Pages because:**

1. ✅ **Free and unlimited bandwidth**
2. ✅ **Already set up with GitHub Actions**
3. ✅ **No additional accounts needed**
4. ✅ **Custom domain support**
5. ✅ **Automatic SSL/HTTPS**
6. ✅ **Global CDN included**

**Just enable GitHub Pages in repository settings and push to main!**

---

## Environment Variables

This app doesn't require any environment variables since it's a fully client-side application with local storage.

---

## Troubleshooting

### GitHub Pages 404 Error

- Ensure the branch is correct in Pages settings
- Check that `index.html` is in the root directory
- Wait a few minutes for propagation

### Workflow Permission Error

- Go to Settings → Actions → General
- Under "Workflow permissions", select "Read and write permissions"
- Click Save

### Custom Domain Not Working

- Verify DNS records have propagated (use `dig` or online tools)
- Check for HTTPS redirect issues
- Ensure `CNAME` file contains correct domain

---

## Security Considerations

Since this is a static site with no backend:

- ✅ No server-side vulnerabilities
- ✅ No database to secure
- ✅ Data stored locally in browser
- ✅ HTTPS provided by all platforms
- ⚠️ Users should bookmark or save the URL
- ⚠️ Clearing browser data deletes all notes

---

## Next Steps After Deployment

1. Test the live site on mobile devices
2. Add custom domain (optional)
3. Share with users
4. Monitor analytics (if added)
5. Set up monitoring/uptime checks

---

## Questions?

- GitHub Pages: [docs.github.com/pages](https://docs.github.com/pages)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Cloudflare Pages: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
