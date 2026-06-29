#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import YAML from 'yaml'

const repoRoot = process.cwd()
const distDir = path.join(repoRoot, 'dist')
const presentationsDir = path.join(repoRoot, 'presentations')
const courseMetadataPath = path.join(repoRoot, 'presentations', 'index-metadata.yaml')

async function readCourseMetadata() {
  const contents = await fs.readFile(courseMetadataPath, 'utf8')
  const parsed = YAML.parse(contents)
  return parsed && typeof parsed === 'object' ? parsed : {}
}

async function readPresentationFrontmatter(slug) {
  const file = path.join(presentationsDir, slug, 'slides.md')
  const contents = await fs.readFile(file, 'utf8')
  const frontmatterMatch = contents.match(/^---\n([\s\S]*?)\n---/)
  return frontmatterMatch ? (YAML.parse(frontmatterMatch[1]) ?? {}) : {}
}

function humanize(slug) {
  return slug
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function getPresentationEntries() {
  const courseMetadata = await readCourseMetadata()
  const dirEntries = await fs.readdir(presentationsDir, { withFileTypes: true })
  const presentationDirs = new Set(
    dirEntries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name),
  )
  const metadataEntries = Object.entries(courseMetadata)
  const metadataSlugs = new Set(metadataEntries.map(([slug]) => slug))
  const slugs = [
    ...metadataEntries.map(([slug]) => slug),
    ...[...presentationDirs].filter(slug => !metadataSlugs.has(slug)).sort(),
  ]

  const entries = await Promise.all(slugs.map(async (slug) => {
    const metadata = courseMetadata?.[slug] ?? {}
    const hasSlides = presentationDirs.has(slug)
    const frontmatter = hasSlides ? await readPresentationFrontmatter(slug) : {}
    const href = hasSlides ? `./${slug}/index.html` : (metadata.href || null)
    const available = metadata.available ?? Boolean(href)

    return {
      slug,
      number: metadata.number,
      title: metadata.title || frontmatter.title || humanize(slug),
      description: metadata.description || 'Slideshow',
      audience: metadata.audience || 'Presentation',
      href,
      available,
      ctaLabel: available ? 'Open presentation' : 'Slides not available',
    }
  }))
  return entries
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderCards(presentations) {
  return presentations.map((presentation) => {
    const tagName = presentation.available && presentation.href ? 'a' : 'div'
    const hrefAttribute = presentation.available && presentation.href ? ` href="${presentation.href}"` : ''
    const availabilityClass = presentation.available ? '' : ' deck-card-unavailable'
    const statusMarkup = presentation.available
      ? `<span class="card-cta">${escapeHtml(presentation.ctaLabel)}</span>`
      : `<span class="card-cta card-cta-muted">${escapeHtml(presentation.ctaLabel)}</span>`

    return `
          <${tagName} class="deck-card${availabilityClass}"${hrefAttribute}>
            <span class="card-index">${presentation.number ?? '?'}</span>
            <div class="card-copy">
              <p class="card-kicker">${escapeHtml(presentation.audience)}</p>
              <h3>${escapeHtml(presentation.title)}</h3>
              <p>${escapeHtml(presentation.description)}</p>
            </div>
            ${statusMarkup}
          </${tagName}>`
  }).join('')
}

function renderHtml(presentations) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Presentations</title>
  <meta name="description" content="Browse available presentations." />
  <style>
    :root {
      --oxrse-blue: #002147;
      --oxrse-blue-strong: #00152f;
      --oxrse-ink: #122033;
      --oxrse-muted: #536277;
      --oxrse-line: rgba(0, 33, 71, 0.12);
      --oxrse-highlight-strong: #78b3cf;
      --oxrse-wash: #edf4f8;
      --oxrse-shadow: 0 24px 80px rgba(0, 33, 71, 0.14);
      --oxrse-radius: 28px;
      --oxrse-max-width: 1200px;
    }

    * { box-sizing: border-box; }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: var(--oxrse-ink);
      background:
        radial-gradient(circle at top left, rgba(120, 179, 207, 0.38), transparent 28rem),
        radial-gradient(circle at top right, rgba(0, 33, 71, 0.1), transparent 26rem),
        linear-gradient(180deg, #f7fafc 0%, #edf4f8 42%, #ffffff 100%);
      min-height: 100vh;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(0, 33, 71, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 33, 71, 0.03) 1px, transparent 1px);
      background-size: 28px 28px;
      mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.42), transparent 72%);
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .page-shell {
      width: min(calc(100% - 2rem), var(--oxrse-max-width));
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero {
      margin: 1rem auto 0;
      padding: 1rem;
    }

    .hero-panel {
      overflow: hidden;
      position: relative;
      background:
        linear-gradient(140deg, rgba(0, 33, 71, 0.98), rgba(0, 21, 47, 0.96)),
        var(--oxrse-blue);
      color: white;
      border-radius: calc(var(--oxrse-radius) + 6px);
      box-shadow: var(--oxrse-shadow);
      padding: clamp(1.25rem, 3vw, 2rem);
      isolation: isolate;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 2rem;
    }

    .hero-panel::before,
    .hero-panel::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      background: rgba(185, 217, 235, 0.16);
      z-index: -1;
    }

    .hero-panel::before {
      width: 28rem;
      height: 28rem;
      right: -8rem;
      top: -12rem;
    }

    .hero-panel::after {
      width: 16rem;
      height: 16rem;
      left: 46%;
      bottom: -9rem;
      background: rgba(255, 255, 255, 0.08);
    }

    .hero-title {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(1.8rem, 3.2vw, 2.8rem);
      line-height: 1.1;
      opacity: 0.92;
      text-align: right;
    }

    .content {
      padding: 1rem 1rem 3rem;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .deck-card {
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: start;
      min-height: 100%;
      padding: 1.15rem 1.2rem;
      border-radius: var(--oxrse-radius);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.92));
      border: 1px solid var(--oxrse-line);
      box-shadow: 0 10px 30px rgba(0, 33, 71, 0.07);
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }

    .deck-card::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 7px;
      background: linear-gradient(180deg, var(--oxrse-highlight-strong), var(--oxrse-blue));
    }

    .deck-card:hover,
    .deck-card:focus-visible {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 33, 71, 0.12);
      border-color: rgba(0, 33, 71, 0.18);
    }

    .card-index {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.8rem;
      height: 2.8rem;
      border-radius: 18px;
      background: var(--oxrse-wash);
      color: var(--oxrse-blue);
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .card-copy h3 {
      margin: 0.1rem 0 0.55rem;
      font-size: 1.3rem;
      line-height: 1.2;
      color: var(--oxrse-blue);
    }

    .card-copy p {
      margin: 0;
      color: var(--oxrse-muted);
      line-height: 1.6;
    }

    .card-kicker {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.78rem;
      color: #6b7b90;
    }

    .card-cta {
      align-self: center;
      color: var(--oxrse-blue);
      font-weight: 700;
      white-space: nowrap;
    }

    .deck-card-unavailable {
      background: linear-gradient(180deg, rgba(245, 248, 250, 0.98), rgba(240, 244, 247, 0.94));
    }

    .deck-card-unavailable:hover {
      transform: none;
      box-shadow: 0 10px 30px rgba(0, 33, 71, 0.07);
      border-color: var(--oxrse-line);
    }

    .deck-card-unavailable::before {
      background: linear-gradient(180deg, #a9b8c7, #74859a);
    }

    .deck-card-unavailable .card-index {
      background: #eef2f5;
      color: #5a6b7f;
    }

    .card-cta-muted {
      color: #5a6b7f;
    }

    .footer {
      padding: 0 1rem 2.5rem;
      color: var(--oxrse-muted);
      font-size: 0.95rem;
    }

    .footer-panel {
      border-top: 1px solid var(--oxrse-line);
      padding-top: 1.1rem;
    }

    @media (max-width: 980px) {
      .hero-panel {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .hero-title {
        text-align: left;
      }

      .cards {
        grid-template-columns: 1fr;
      }

      .deck-card {
        grid-template-columns: auto 1fr;
      }

      .card-cta {
        grid-column: 2;
      }
    }

    @media (max-width: 640px) {
      .hero,
      .content,
      .footer {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }

      .hero-panel {
        border-radius: 24px;
      }

      .deck-card {
        grid-template-columns: 1fr;
      }

      .card-index,
      .card-cta {
        grid-column: auto;
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="page-shell hero-panel">
        <h1 class="hero-title">Presentations</h1>
      </div>
    </section>

    <section class="content">
      <div class="page-shell">
        <div class="cards">
${renderCards(presentations)}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="page-shell footer-panel">
      <span>Fergus Cooper</span>
    </div>
  </footer>
</body>
</html>
`
}

async function main() {
  const presentations = await getPresentationEntries()
  await fs.writeFile(path.join(distDir, 'index.html'), renderHtml(presentations))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
