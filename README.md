<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI Studio Restaurant Order Management System

A Vite + React restaurant order management app with waiter terminal, kitchen display, cashier billing, and settlement workflows.

View your app in AI Studio: https://ai.studio/apps/90de39b8-5fb4-4cbd-8f4b-d28a06eaf50f

## Prerequisites

- Node.js 18+ installed
- npm package manager
- Optional: `.env.local` for secrets such as `GEMINI_API_KEY`

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file if you need API keys:
   ```bash
   echo GEMINI_API_KEY=your_api_key > .env.local
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the local URL shown in your terminal.

## Build for Production

1. Build the app:
   ```bash
   npm run build
   ```
2. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Deploy to GitHub

### Option 1: GitHub Pages

1. Create a GitHub repository, for example `restaurant-order-management-system`.
2. Initialize git and push your project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/restaurant-order-management-system.git
   git push -u origin main
   ```
3. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```
4. Add deploy scripts to `package.json`:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview",
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
5. Deploy the app:
   ```bash
   npm run deploy
   ```
6. In GitHub repository settings, enable Pages and set the source to the `gh-pages` branch.

### Option 2: GitHub Actions

1. Push your repository to GitHub.
2. Add a workflow under `.github/workflows/deploy.yml` to build and publish the `dist` folder.
3. Configure GitHub Pages to serve from the generated deployment branch or `docs` folder.

## GitHub Pages notes

- If using `https://<username>.github.io/<repo-name>/`, update `vite.config.ts`:
  ```ts
  export default defineConfig({
    base: '/restaurant-order-management-system/',
    plugins: [react()],
  });
  ```
- For `docs/` folder deployment, push built files to `docs/` and point Pages to that folder.

## App Features

- Waiter station for order entry and table seating
- Kitchen display system for cooking status
- Cashier billing terminal with settlement and payment method selection
- Daily, monthly, and yearly sales analytics
- Inventory storage reporting and low-stock alerts
- Prebill print preview for actual receipt printing

## Support

If you want to deploy the app from AI Studio to GitHub, push the repository and follow the GitHub Pages or GitHub Actions steps above.