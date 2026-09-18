# GitHub Pages deployment

1. Upload the CONTENTS of this folder to the root of your GitHub repository.
2. Make sure `.github/workflows/deploy.yml` is present exactly at that path.
3. In GitHub: Settings -> Pages -> Source -> GitHub Actions.
4. Push to the `main` branch (or run the workflow manually from Actions).
5. Open Actions and wait for `Deploy to GitHub Pages` to finish.
6. Open the Pages URL shown by GitHub.

Do not choose `Deploy from a branch` for this project. The Vite source must be built first; the workflow deploys the generated `dist` folder.
