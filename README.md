# Motm-l-s

A simple browser game built with HTML, CSS and JavaScript.

## Run locally

1. Clone the repository.
2. Start a static file server in the project root, e.g.:

   ```bash
   npx http-server .
   # or
   python3 -m http.server
   ```

3. Open the provided URL (usually `http://localhost:8080` or `http://localhost:8000`) in your browser.

## Deploy to a static host

### GitHub Pages

1. Push the repository to GitHub.
2. In the repository settings, enable **GitHub Pages** for the `main` branch and root folder.
3. Your game will be available at `https://<username>.github.io/<repository>/`.

### Netlify

1. Sign in to Netlify and create a new site from Git.
2. Connect your repository and leave the build command blank.
3. Set the publish directory to `/` and deploy.

Other static hosts (Vercel, Firebase Hosting, etc.) follow similar steps: point to the repository and publish the root directory.

## Mobile installation (PWA)

After PWA support is added (manifest and service worker):

1. Visit the deployed site on a mobile browser.
2. Use the browser's **Add to Home Screen** or **Install** option.
3. The game will install as a standalone app icon for quick access.
