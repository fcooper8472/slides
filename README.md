# slides

Personal presentation slideshows, built with [Slidev](https://sli.dev) using the `slidev-theme-oxrse` theme. All presentations are built and deployed to GitHub Pages automatically on push to `main`.

## Structure

```
presentations/
  index-metadata.yaml       # ordering, titles, descriptions for the landing page
  {slug}/
    slides.md               # the presentation (self-contained)
    img/                    # optional images for this presentation
scripts/
  build-index.mjs           # generates dist/index.html (the landing page)
build.sh                    # builds one presentation
build_all.sh                # builds all presentations and the landing page
.github/workflows/deploy.yml
```

Each presentation lives entirely in its own `presentations/{slug}/` directory — there is no shared content submodule.

## Adding a new presentation

1. Create `presentations/{slug}/slides.md` with `theme: oxrse` in the frontmatter:

   ```yaml
   ---
   theme: oxrse
   title: My Presentation
   layout: cover
   highlighter: shiki
   drawings:
     persist: false
   transition: slide-left
   mdc: true
   ---
   ```

2. Add an entry to `presentations/index-metadata.yaml`:

   ```yaml
   my_presentation:
     number: 2
     title: My Presentation
     description: A short description shown on the landing page.
     audience: Topic label
   ```

   The `number` field controls the order on the landing page. Presentations without a `number` are sorted alphabetically after numbered ones.

## Building locally

Install dependencies:

```sh
npm install
```

Build all presentations and the landing page into `dist/`:

```sh
./build_all.sh
```

Build a single presentation:

```sh
./build.sh presentations/example
```

The built site is in `dist/`, with each presentation at `dist/{slug}/index.html` and the landing page at `dist/index.html`.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds everything and deploys to GitHub Pages at `https://fcooper8472.github.io/slides/`.

Pull requests trigger a build-only run (no deployment) to catch errors early.
