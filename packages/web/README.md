# SplitFool Web Frontend

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Deployment to Cloudflare Pages

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
3. Connect your GitHub repository
4. Use these build settings:
   - Build command: `pnpm install && pnpm build`
   - Build output directory: `dist`
   - Root directory: `packages/web`
5. Add environment variable:
   - `VITE_API_URL`: Your AWS Lambda Function URL

### Option 2: Direct Deployment

1. Install Wrangler CLI:
   ```bash
   pnpm add -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Deploy:
   ```bash
   pnpm deploy:cf
   ```

### Option 3: GitHub Actions

1. Add these secrets to your GitHub repository:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

2. Add this variable:
   - `VITE_API_URL`: Your AWS Lambda Function URL

3. Push to main branch or trigger manually

## Environment Variables

Create `.env.local` for local development:
```env
VITE_API_URL=http://localhost:3000
```

For production, set in Cloudflare Pages dashboard:
```env
VITE_API_URL=https://<url-id>.lambda-url.<region>.on.aws/
```
The production URL is an output of the `pnpm deploy:aws` command from the `packages/api` directory.

## Tech Stack

- **Svelte 5**: Reactive UI framework
- **TypeScript**: Type safety throughout
- **Vite**: Fast development and optimized builds
- **Tailwind CSS**: Utility-first CSS framework
- **Biome**: Fast linting and formatting

## Features

- **Modal System**: Custom modals for confirmations and errors
- **Toast Notifications**: Non-blocking success/error messages
- **Member Management**: Separate view/edit modes for better UX
- **Responsive Design**: Mobile-first with custom CSS grid
- **Security Headers**: Configured in `public/_headers`
- **SPA Routing**: Configured in `public/_redirects`
- **Build Optimization**: Code splitting and caching in `vite.config.ts`
- **CI/CD**: GitHub Actions workflow in `.github/workflows/deploy-web.yml`

## Free Tier Benefits

- ✅ Unlimited bandwidth
- ✅ Global CDN (200+ locations)
- ✅ Automatic HTTPS/SSL
- ✅ DDoS protection
- ✅ Analytics included
- ✅ Preview deployments