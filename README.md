# Slope Field Explorer

Interactive slope-field web app for classroom demos and exploration.

## Local development

```bash
npm install
npm run dev
```

## Tests and production build

```bash
npm test
npm run build
```

## GitHub Pages deployment

This repo is configured for GitHub Pages at:

- `https://github.com/turksmathstuff/slopefields`

After pushing to the `main` branch:

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main` again if needed, or run the `Deploy to GitHub Pages` workflow manually.

The app is built with the Vite base path for:

- `/slopefields/`

So the published site URL should be:

- `https://turksmathstuff.github.io/slopefields/`
