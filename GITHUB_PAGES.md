# GitHub Pages Setup

This project includes a live demo hosted on GitHub Pages.

## 🚀 Viewing the Demo

Visit [https://oneluiz.github.io/ng-dual-datepicker/](https://oneluiz.github.io/ng-dual-datepicker/) to see the component in action.

## 🛠️ Building the Demo Locally

To build and preview the demo locally:

```bash
# Install dependencies
npm install

# Serve the demo locally
npm run demo:serve

# Build the demo for production
npm run demo:build
```

The built demo will be placed in the `docs/` directory, which is configured for GitHub Pages deployment.

## 📝 GitHub Pages Configuration

To enable GitHub Pages for this repository:

1. Go to your repository settings on GitHub
2. Navigate to **Pages** in the left sidebar
3. Under **Source**, select:
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/docs`
4. Click **Save**
5. Your site will be published at `https://[username].github.io/ng-dual-datepicker/`

## 🔄 Updating the Demo

After making changes to the demo:

```bash
# Rebuild the demo
npm run demo:build

# Move files from browser subfolder to docs root
cd docs && mv browser/* . && rm -r browser && cd ..

# Commit and push changes
git add docs/
git commit -m "Update demo"
git push
```

GitHub Pages will automatically deploy the updated demo within a few minutes.

## 📁 Project Structure

```
ng-dual-datepicker/
├── src/                    # Source code for the component
├── demo/                   # Demo application source
│   └── src/
│       ├── app/           # Demo app components
│       ├── index.html     # Demo HTML template
│       └── styles.scss    # Demo styles
├── docs/                   # Built demo (GitHub Pages)
│   ├── .nojekyll          # Tells GitHub not to use Jekyll
│   ├── index.html
│   └── *.js, *.css        # Compiled assets
└── dist/                   # Built library package
```

## 🎨 Customizing the Demo

The demo source code is in `demo/src/app/`. You can:

- Edit `app.component.html` to change the layout
- Edit `app.component.ts` to add new examples
- Edit `app.component.scss` or `styles.scss` for styling

After making changes, rebuild with `npm run demo:build`.
