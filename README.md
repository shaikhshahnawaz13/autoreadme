<div align="center">

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=C3D809&height=200&section=header&text=AutoReadme&fontSize=80&fontColor=222022&fontAlignY=35&desc=AI-Powered%20README%20Generator&descAlignY=58&descSize=20&descColor=222022&animation=fadeIn" width="100%"/>

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Barlow+Condensed&weight=800&size=32&duration=3000&pause=1000&color=C3D809&background=22202200&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=80&lines=Paste+a+GitHub+URL.;Get+a+production+README+in+seconds.;Powered+by+Groq+LLaMA+3.3.)](https://auto-readme.netlify.app)

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-auto--readme.netlify.app-C3D809?style=for-the-badge&logo=netlify&logoColor=222022)](https://auto-readme.netlify.app)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Live-C3D809?style=for-the-badge&logo=github&logoColor=222022)](https://shaikhshahnawaz13.github.io/autoreadme/)
[![License](https://img.shields.io/badge/License-MIT-C3D809?style=for-the-badge&logoColor=222022)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.0-C3D809?style=for-the-badge&logoColor=222022)](https://github.com/shaikhshahnawaz13/autoreadme)

<br/>

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://netlify.com)
[![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=flat-square&logo=groq&logoColor=white)](https://console.groq.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

<br/>

> *"From a GitHub URL to a polished README in under 15 seconds — no forms, no setup, no backend required on your end."*

<br/>

---

</div>

## What is AutoReadme?

**AutoReadme** is a free, open-source AI tool that generates production-quality README files from any GitHub repository URL. Paste a link, click Generate, and watch your README appear — complete with badges, feature tables, tech stack, project structure, and more.

It fetches real data from the GitHub API — your actual languages, dependencies, file tree, topics, and description — and feeds it into Groq's LLaMA 3.3 70B model to write a README that feels like it was crafted by the actual developer.

No login. No credit card. No backend to manage. Works on any public GitHub repository in the world.

---

## Live Demo

<div align="center">

**[auto-readme.netlify.app](https://auto-readme.netlify.app)** · **[shaikhshahnawaz13.github.io/autoreadme](https://shaikhshahnawaz13.github.io/autoreadme/)**

Both URLs work identically. GitHub Pages calls the Netlify backend by full URL — keys never exposed.

</div>

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User pastes GitHub URL (or owner/repo shorthand)                │
│           │                                                          │
│           ▼                                                          │
│  2. Frontend calls /.netlify/functions/github                       │
│     → Fetches: repo metadata, languages, file tree,                 │
│       package.json / requirements.txt                               │
│           │                                                          │
│           ▼                                                          │
│  3. Frontend builds a structured prompt with all repo data          │
│           │                                                          │
│           ▼                                                          │
│  4. Frontend calls /.netlify/functions/generate                     │
│     → Server tries user key first (if set)                          │
│     → Falls back through 5 server Groq keys                         │
│     → Groq LLaMA 3.3 70B generates complete README                 │
│           │                                                          │
│           ▼                                                          │
│  5. Response animates word-by-word into the preview panel           │
│           │                                                          │
│           ▼                                                          │
│  6. User copies or downloads README.md                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                            │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Browser (GitHub Pages / Netlify)                                     │
│       │                                                                │
│       │  POST { prompt, userKey? }    POST { path }                   │
│       ▼                               ▼                                │
│  /.netlify/functions/generate    /.netlify/functions/github            │
│       │                               │                                │
│       │  GROQ_KEY_1..5                │  GH_TOKEN_1..3                 │
│       │  (Netlify env vars)           │  (Netlify env vars)            │
│       ▼                               ▼                                │
│  api.groq.com                    api.github.com                        │
│                                                                        │
│  Keys NEVER reach the browser. CORS locked to known origins.          │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---|---|
| **Instant Generation** | Produces a full README in under 15 seconds from any public repo |
| **Real Repo Data** | Reads actual languages, dependencies, file tree, topics, and description via GitHub API |
| **Smart Project Detection** | Auto-detects project type — frontend, backend, CLI, library, ML, static site — and adapts structure |
| **Animated Preview** | README appears word-by-word with a live streaming animation |
| **Preview + Raw Tabs** | Switch between rendered Markdown preview and copyable raw text |
| **One-Click Download** | Saves `README.md` directly to your computer |
| **Copy to Clipboard** | Copies full Markdown with one click |
| **User API Key** | Add your own Groq key in Settings — used first, with server keys as fallback |
| **5 Server Keys** | Built-in Groq key rotation — 5 keys × 14,400 req/day = 72,000 free generations/day |
| **GitHub Token Rotation** | 3 GitHub tokens rotated automatically — 3 × 5,000 req/hr = 15,000 GitHub API calls/hr |
| **Example Repos** | Quick-try chips for `facebook/react` and `vercel/next.js` |
| **Dual Deployment** | Works on both Netlify and GitHub Pages — GitHub Pages calls Netlify backend by full URL |
| **Page Load Animation** | Animated logo, progress bar, and staggered hero entrance on first load |
| **Fully Responsive** | Works on mobile, tablet, and desktop |
| **Zero Dependencies** | Single HTML file frontend — no React, no bundler, no npm install |
| **CI/CD Pipeline** | GitHub Actions runs 20 unit tests and scans for leaked secrets on every push |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript — single `index.html`, zero build step |
| AI Model | Groq LLaMA 3.3 70B Versatile — fastest LLM inference available |
| Backend Functions | Netlify Serverless Functions (Node.js 20) — two functions: `generate.js` and `github.js` |
| GitHub Data | GitHub REST API v3 — repo metadata, language stats, file tree, file contents |
| Hosting | Netlify (primary) + GitHub Pages (mirror) — both fully functional |
| Fonts | Barlow Condensed (headings) + Barlow (body) + JetBrains Mono (code/input) |
| CI/CD | GitHub Actions — unit tests + secret scanning on every push |
| Key Storage | Netlify Environment Variables (server) + browser `localStorage` (user key) |

---

## Project Structure

```
autoreadme/
├── index.html                        # HTML shell — 244 lines, links to CSS and JS
├── style.css                         # All styles — 628 lines, dark theme, animations, responsive
├── script.js                         # All logic — 607 lines, URL parser, GitHub fetch, prompt builder, renderer
│
├── netlify/
│   └── functions/
│       ├── generate.js               # Groq AI proxy — accepts userKey + server key rotation
│       └── github.js                 # GitHub API proxy — token rotation + CORS headers
│
├── tests/
│   └── autoreadme.test.js            # 20 unit tests — URL parsing + file structure checks
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI — runs tests + scans for leaked API keys
│
├── netlify.toml                      # Netlify build config — publish dir + functions dir
├── config.js                         # Local dev keys — gitignored, never committed
├── package.json                      # Project manifest — scripts, metadata, engine
├── CONTRIBUTING.md                   # Contributor guide — setup, commit format, rules
├── LICENSE                           # MIT License
└── .gitignore                        # Ignores config.js, node_modules, .env
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/shaikhshahnawaz13/autoreadme.git
cd autoreadme

# Serve locally
npx serve .
# Open http://localhost:3000
```

For local Groq generation, add your keys to `config.js`:

```js
const AUTOREADME_CONFIG = {
  groqKeys: ['gsk_your_key_here'],  // console.groq.com — free
  ghTokens: ['ghp_your_token_here'] // github.com/settings/tokens — no scopes needed
};
```

No build step. No `npm install`. Open and use.

---

## API Keys Setup

### For the live site (Netlify)
Keys are already configured in Netlify environment variables — just use the site.

### For your own deployment
Add these environment variables in Netlify → Site configuration → Environment variables:

| Variable | Description |
|---|---|
| `GROQ_KEY_1` – `GROQ_KEY_5` | Groq API keys — free at [console.groq.com](https://console.groq.com/keys) |
| `GH_TOKEN_1` – `GH_TOKEN_3` | GitHub tokens — free at [github.com/settings/tokens](https://github.com/settings/tokens/new) (no scopes needed) |

### For users
Click **Settings** in the navbar → paste your own Groq key → Save. Your key is used first, server keys as fallback. Stored in browser `localStorage` only — never sent to any server except Groq directly.

---

## Running Tests

```bash
node tests/autoreadme.test.js
```

```
AutoReadme v2 — Test Suite

parseUrl()
  ✓ full URL
  ✓ owner/repo shorthand
  ✓ trailing .git stripped
  ✓ with whitespace
  ✓ dotted repo name
  ✓ invalid returns null
  ✓ just owner returns null
  ✓ github.com prefix only

File structure
  ✓ Main app exists (index.html)
  ✓ Netlify config exists (netlify.toml)
  ✓ Generate function exists (netlify/functions/generate.js)
  ✓ GitHub proxy exists (netlify/functions/github.js)
  ✓ Git ignore exists (.gitignore)
  ✓ Package manifest exists (package.json)
  ✓ MIT license exists (LICENSE)
  ✓ Contributing guide exists (CONTRIBUTING.md)
  ✓ config.js is gitignored
  ✓ generate.js has no hardcoded keys
  ✓ github.js has no hardcoded tokens
  ✓ index.html has no hardcoded Groq keys

20 tests: 20 passed, 0 failed
```

---

## Contributing

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/autoreadme.git
cd autoreadme

# Create a branch
git checkout -b feature/your-feature

# Make changes, test
node tests/autoreadme.test.js

# Commit and push
git commit -m "feat: describe your change"
git push origin feature/your-feature

# Open a Pull Request
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## Roadmap

- [ ] Streaming SSE from Netlify functions for true real-time generation
- [ ] README history saved to localStorage — revisit past generations
- [ ] Section toggles — choose which sections to include
- [ ] Custom prompt editor — tweak the AI instructions
- [ ] Private repo support via user-supplied GitHub token
- [ ] Dark/light theme toggle
- [ ] Multiple README style presets

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=C3D809&height=120&section=footer&fontColor=222022" width="100%"/>

**Built by [shaikhshahnawaz13](https://github.com/shaikhshahnawaz13)**

[![GitHub](https://img.shields.io/badge/GitHub-shaikhshahnawaz13-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shaikhshahnawaz13)
[![Devora](https://img.shields.io/badge/Devora-Visit-C3D809?style=for-the-badge&logoColor=222022)](https://shaikhshahnawaz13.github.io/devora/)

<br/>

*If this helped you, leave a star — it means a lot.*

[![Star](https://img.shields.io/github/stars/shaikhshahnawaz13/autoreadme?style=for-the-badge&color=C3D809&logo=github&logoColor=222022)](https://github.com/shaikhshahnawaz13/autoreadme)

<br/>

`AI · README · Groq · LLaMA · Netlify · Open Source · Free Forever`

</div>
