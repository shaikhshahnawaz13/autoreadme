# Contributing to AutoReadme

Thanks for your interest in contributing. AutoReadme is open source and welcomes pull requests, bug reports, and feature suggestions.

## Getting Started

```bash
# Fork the repo, then clone your fork
git clone https://github.com/YOUR_USERNAME/autoreadme.git
cd autoreadme

# Serve locally
npx serve .
# Open http://localhost:3000
```

## Project Structure

```
autoreadme/
├── index.html                    # Entire frontend — single file
├── netlify/
│   └── functions/
│       ├── generate.js           # Groq AI proxy (server-side keys)
│       └── github.js             # GitHub API proxy (server-side tokens)
├── netlify.toml                  # Netlify build config
├── config.js                     # Local keys — gitignored, never committed
├── tests/
│   └── autoreadme.test.js        # Unit tests
├── .gitignore
├── package.json
├── CONTRIBUTING.md
└── LICENSE
```

## How to Contribute

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Make your changes
# Run tests
npm test

# Commit with a clear message
git commit -m "feat: describe your change"

# Push and open a Pull Request
git push origin feature/your-feature
```

## Commit Message Format

Use conventional commits:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `style:` — formatting, no logic change
- `refactor:` — code change that is neither fix nor feature
- `test:` — adding or updating tests

## What to Work On

- Improving the README prompt quality
- Better markdown rendering
- Mobile UI improvements
- More section toggles
- Performance improvements
- Bug fixes

## Rules

- Keep `config.js` out of commits — it is gitignored
- Never hardcode API keys in any file that gets committed
- Keep the single-file architecture for `index.html`
- Test your changes locally before opening a PR

## Reporting Bugs

Open an issue on GitHub with steps to reproduce, expected behavior, and actual behavior.
