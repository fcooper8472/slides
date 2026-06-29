# slides

Personal presentations repo using [Slidev](https://sli.dev) with the `slidev-theme-oxrse` theme. Deploys to GitHub Pages at https://fcooper8472.github.io/slides/.

## Directory structure

```
presentations/
  index-metadata.yaml   # controls landing page card order and metadata
  {slug}/
    slides.md           # the presentation — fully self-contained
    img/                # images (optional)
scripts/
  build-index.mjs       # generates dist/index.html landing page
build.sh                # builds one presentation
build_all.sh            # cleans dist/, builds all presentations, generates index
.github/workflows/deploy.yml
```

Each presentation is self-contained in its own directory — there is no shared content submodule.

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

   The `number` field controls the card order on the landing page. Entries without a number are sorted alphabetically after numbered ones.

## Building locally

```sh
npm install
./build_all.sh                      # full build into dist/
./build.sh presentations/{slug}     # single presentation
```

The built site lands in `dist/`, with each presentation at `dist/{slug}/index.html` and the landing page at `dist/index.html`.

`build_all.sh` accepts an optional `repo_root` argument that sets the URL base path (used by CI to produce correct paths on GitHub Pages).

## CI

- Push to `main` → build + deploy to GitHub Pages
- Pull request → build only, no deploy

The workflow passes `${{ github.event.repository.name }}` as `repo_root` so base paths stay correct regardless of the repo name.

## Conventions

- Commit messages: short single-line only, no body.
