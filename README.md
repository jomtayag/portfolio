<<<<<<< HEAD
# portfolio
=======
# Jomari Tayag — Portfolio

Personal portfolio of **Jomari Tayag**, a full-stack web developer (Vue 3 · Laravel · TypeScript) with 11+ years of experience and an AI-augmented workflow built around Claude Code and OpenAI Codex.

Built with **Vue 3 + Vite**. There's no UI framework and no animation library: every effect is plain Canvas, SVG, and CSS.

## Features

- **Interactive background.** A grid of dots ripples over time and lights up around the cursor.
- **Animated name.** The letters scramble in sequence, in step with the typed role line, and move away from the cursor on hover.
- **Career timeline.** A chart of every role from 2015 to today. Drag through it or press play to see what was happening at any point.
- **Selected work.** A project list with a floating preview on hover and a details window for each project.
- **Lab.** Products I'm building on my own, each with its current status.
- **Skill map.** Every skill linked to the projects that used it. Hover any point to see its connections.
- **AI workflow.** A replay of an AI-assisted development session.
- **Contact form.** Validates input and sends through Web3Forms. Without a key, it opens the visitor's email app instead.
- **Command palette.** Press `Ctrl` / `⌘` + `K` to jump to any section or project.
- Responsive down to phone widths, keyboard accessible, and respects reduced-motion settings.

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

## Editing content

All text lives in [`src/data/portfolio.js`](src/data/portfolio.js): profile, stats, experience, projects, products, skills, and AI principles. Edit it there and every section updates.

| Section | Component |
| --- | --- |
| Hero | `src/components/HeroSection.vue` |
| About | `src/components/AboutSection.vue` |
| Career timeline | `src/components/CareerSection.vue` |
| Selected work | `src/components/ProjectsSection.vue` |
| Lab (own products) | `src/components/ProductsSection.vue` |
| Skill map | `src/components/SkillGraph.vue` |
| AI workflow | `src/components/AiSection.vue` |
| Contact form | `src/components/ContactSection.vue` |

Colors, fonts, and shared styles are in [`src/styles/main.css`](src/styles/main.css).

## Contact form

The form posts to [Web3Forms](https://web3forms.com), which forwards messages to email.

1. Get a free access key at web3forms.com.
2. **Local:** copy `.env.example` to `.env` and set `VITE_WEB3FORMS_KEY`.
3. **GitHub Pages:** add a repository secret named `VITE_WEB3FORMS_KEY` (Settings → Secrets and variables → Actions).

Without a key, the form opens the visitor's email app with the message filled in.

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes the site to GitHub Pages on every push to `main`.

One-time setup: **Settings → Pages → Source → GitHub Actions**.

The build uses relative asset paths, so it works both as a user site (`username.github.io`) and as a project site (`username.github.io/repo`). The `dist/` folder can also go on any static host.

## Contact

- Email: [jomtayag@gmail.com](mailto:jomtayag@gmail.com)
- Location: Pampanga, Philippines (GMT+8)

---

© Jomari Tayag. All rights reserved.
>>>>>>> fb0ac1e (Initial portfolio)
