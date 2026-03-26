'use strict';

// ── State ──
let generatedMd = '';
let abortCtrl   = null;
let isGenerating = false;
let currentTab  = 'preview';

// ── Detect environment ──
// On Netlify: call local functions. On GitHub Pages or anywhere else: call Netlify functions by full URL.
const IS_NETLIFY = location.hostname.includes('netlify.app') || location.hostname.includes('netlify.com');
const NETLIFY_BASE = IS_NETLIFY ? '' : 'https://auto-readme.netlify.app';

// ── URL Parser ──
function parseUrl(raw) {
  const s = raw.trim().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/^github\.com\//,'');
  const m = s.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
  return m ? { owner: m[1], repo: m[2].replace(/\.git$/,'') } : null;
}

// ── Input handler ──
function onInput() {
  const err = document.getElementById('err-flash');
  err.classList.remove('on');
}

// ── Try example ──
function tryExample(val) {
  document.getElementById('repo-url').value = val;
  onInput();
  generate();
}

// ── Toast ──
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ── Progress ──
function setProgress(pct) {
  document.getElementById('prog-fill').style.width = pct + '%';
}
function setStatus(msg) {
  const el = document.getElementById('status-text');
  el.textContent = msg;
  el.classList.toggle('on', !!msg);
}
function showError(msg) {
  const el = document.getElementById('err-flash');
  el.innerHTML = msg;
  el.classList.add('on');
}
function hideError() {
  document.getElementById('err-flash').classList.remove('on');
}

// ── Loading state ──
function setLoading(on) {
  isGenerating = on;
  const btn = document.getElementById('btn-gen');
  const stop = document.getElementById('btn-stop');
  const prog = document.getElementById('prog-bar');
  btn.disabled = on;
  btn.innerHTML = on
    ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="animation:spin 1s linear infinite"><path d="M8 1.5A6.5 6.5 0 1 0 14.5 8a.75.75 0 0 1 1.5 0A8 8 0 1 1 8 0a.75.75 0 0 1 0 1.5Z"/></svg> Generating...'
    : '<svg class="btn-icon" width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8.25 2.75a.75.75 0 0 0-1.5 0v5.69L4.28 5.97a.75.75 0 0 0-1.06 1.06l4.25 4.25a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 0 0-1.06-1.06L8.25 8.44V2.75Z"/> Generate README';
  stop.style.display = on ? 'flex' : 'none';
  prog.classList.toggle('on', on);
}

// ── Tab switch ──
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-preview').classList.toggle('active', tab === 'preview');
  document.getElementById('tab-raw').classList.toggle('active', tab === 'raw');
  document.getElementById('panel-preview').classList.toggle('active', tab === 'preview');
  document.getElementById('panel-raw').classList.toggle('active', tab === 'raw');
  if (tab === 'raw' && generatedMd) {
    document.getElementById('raw-pre').textContent = generatedMd;
  }
}

// ── Render markdown ──
function renderMd(md, final) {
  const el = document.getElementById('md-render');
  // Simple markdown renderer
  let html = md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    // Code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    // Bold/italic
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    // Links and images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1"/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>')
    // HR
    .replace(/^---+$/gm,'<hr/>')
    // Blockquote
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
    // Tables
    .replace(/\|(.+)\|\n\|[-|: ]+\|\n((?:\|.+\|\n?)*)/g, (_, hdr, rows) => {
      const ths = hdr.split('|').filter(c=>c.trim()).map(c=>`<th>${c.trim()}</th>`).join('');
      const trs = rows.trim().split('\n').map(r=>{
        const tds = r.split('|').filter(c=>c.trim()).map(c=>`<td>${c.trim()}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    })
    // Lists
    .replace(/^[\*\-] (.+)$/gm,'<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g,'<ul>$1</ul>')
    // Paragraphs
    .replace(/\n\n([^<\n][^\n]*)/g,'\n\n<p>$1</p>')
    .replace(/^([^<\n][^\n]+)$/gm,'<p>$1</p>');

  el.innerHTML = html + (final ? '' : '<span class="stream-cursor"></span>');
  if (!final) el.scrollIntoView({behavior:'smooth',block:'end'});
}

// ── GitHub API ──
async function ghGet(path) {
  // Always use Netlify function — full URL when not on Netlify (GitHub Pages etc.)
  try {
    const res = await fetch(NETLIFY_BASE + '/.netlify/functions/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    if (res.status === 404) { const e = new Error('Repository not found. Check the URL and make sure it is public.'); e.hard = true; throw e; }
    if (res.ok) return res.json();
    throw new Error('GitHub API error ' + res.status + '. Try again.');
  } catch(e) {
    if (e.hard) throw e;
    // Fallback: direct GitHub API with local tokens if available
    const tokens = (typeof AUTOREADME_CONFIG !== 'undefined' && AUTOREADME_CONFIG.ghTokens) || [];
    const url = 'https://api.github.com/' + path;
    const base = { 'Accept': 'application/vnd.github+json' };
    for (const tok of tokens) {
      try {
        const r = await fetch(url, { headers: { ...base, 'Authorization': 'Bearer ' + tok } });
        if (r.status === 404) { const e2 = new Error('Repository not found.'); e2.hard = true; throw e2; }
        if (r.ok) return r.json();
      } catch(e2) { if (e2.hard) throw e2; }
    }
    const r = await fetch(url, { headers: base });
    if (r.status === 404) { const e2 = new Error('Repository not found.'); e2.hard = true; throw e2; }
    if (r.ok) return r.json();
    throw new Error('Could not reach GitHub API. Check your internet connection.');
  }

  // Local: direct call with tokens from config.js
  const tokens = (typeof AUTOREADME_CONFIG !== 'undefined' && AUTOREADME_CONFIG.ghTokens) || [];
  const url = 'https://api.github.com/' + path;
  const base = { 'Accept': 'application/vnd.github+json' };

  for (const tok of tokens) {
    try {
      const res = await fetch(url, { headers: { ...base, 'Authorization': 'Bearer ' + tok } });
      if (res.status === 404) { const e = new Error('Repository not found.'); e.hard = true; throw e; }
      if (res.status === 403) continue;
      if (res.ok) return res.json();
    } catch(e) { if (e.hard) throw e; }
  }
  // No-token fallback
  const res = await fetch(url, { headers: base });
  if (res.status === 404) { const e = new Error('Repository not found.'); e.hard = true; throw e; }
  if (!res.ok) throw new Error('Could not reach GitHub API. Check your internet connection.');
  return res.json();
}

// ── Fetch repo data ──
async function fetchRepo(owner, repo) {
  setStatus('Fetching repo data...');
  setProgress(15);
  const meta = await ghGet(`repos/${owner}/${repo}`);
  setProgress(30);
  setStatus('Reading languages...');
  const langs = await ghGet(`repos/${owner}/${repo}/languages`).catch(() => ({}));
  setProgress(45);
  setStatus('Scanning files...');
  let files = [], pkgJson = null, requirements = null;
  try {
    const tree = await ghGet(`repos/${owner}/${repo}/git/trees/HEAD?recursive=1`);
    files = (tree.tree || []).filter(f => f.type === 'blob').map(f => f.path).slice(0, 80);
    const pkgFile = (tree.tree || []).find(f => f.path === 'package.json');
    if (pkgFile) {
      const raw = await ghGet(`repos/${owner}/${repo}/contents/package.json`);
      pkgJson = JSON.parse(atob(raw.content.replace(/\s/g,'')));
    }
    const reqFile = (tree.tree || []).find(f => f.path === 'requirements.txt');
    if (reqFile) {
      const raw = await ghGet(`repos/${owner}/${repo}/contents/requirements.txt`);
      requirements = atob(raw.content.replace(/\s/g,'')).split('\n').slice(0,20).join('\n');
    }
  } catch(_) {}
  setProgress(65);
  return { meta, langs, files, pkgJson, requirements };
}

// ── Build prompt ──
function buildPrompt(owner, repo, data) {
  const { meta, langs, files, pkgJson, requirements } = data;
  const langList = Object.keys(langs).join(', ') || 'not detected';
  const fileList = files.join('\n') || 'not available';
  const topics   = (meta.topics || []).join(', ') || 'none';
  const license  = meta.license?.name || 'MIT';
  const homepage = meta.homepage || '';
  let pkgStr = '';
  if (pkgJson) {
    const deps = Object.keys(Object.assign({}, pkgJson.dependencies, pkgJson.devDependencies)).slice(0,25).join(', ');
    pkgStr = `\npackage.json: name=${pkgJson.name||''} version=${pkgJson.version||''}\nScripts: ${JSON.stringify(pkgJson.scripts||{})}\nDeps: ${deps}`;
  }
  const reqStr = requirements ? `\nrequirements.txt:\n${requirements}` : '';

  return `You are a senior open-source developer. Write a README.md for this repository.

REPOSITORY DATA:
Repo: ${meta.full_name}
Description: ${meta.description || 'none'}
Homepage: ${homepage || 'none'}
Language: ${meta.language || 'unknown'}
All languages: ${langList}
Topics: ${topics}
Stars: ${meta.stargazers_count} | Forks: ${meta.forks_count} | License: ${license}
Clone URL: https://github.com/${owner}/${repo}.git${pkgStr}${reqStr}

FILE TREE:
${fileList}

STRICT RULES:
1. Output ONLY valid Markdown. Nothing before the first line. Nothing after the last line.
2. NO emojis anywhere.
3. Be specific to THIS repository. Use real file names, real deps, real scripts.
4. Headers: plain English — "What is X?", "How It Works", "Getting Started"
5. Feature table: bold name | one direct sentence (max 12 words, starts with verb)
6. Tech stack: 2 columns — Layer | Technology — brief note
7. Project structure: actual file tree with inline comments
8. No filler words: innovative, powerful, robust, seamlessly, leveraging, comprehensive
9. Never start with "This project" or "The application"
10. Tables use |---|---| separators

OUTPUT THIS STRUCTURE:
<div align="center">

**[Bold tagline — verb phrase, one line]**

*[Italic subtitle — value delivered]*

[![License](https://img.shields.io/badge/License-${license.replace(/ /g,'_')}-brightgreen?style=for-the-badge)](LICENSE)
${homepage ? `[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit-blue?style=for-the-badge)](${homepage})` : ''}
[2-3 more relevant for-the-badge badges]

[4-6 flat-square tech badges based on actual detected languages]

</div>

## What is ${meta.name}?

[2-3 short paragraphs. Direct and factual.]

---

## Features

| Feature | Description |
|---|---|
[6-8 rows]

---

## Tech Stack

| Layer | Technology |
|---|---|
[4-6 rows based on ${langList}]

---

## Project Structure

\`\`\`
${repo}/
[actual file tree with inline comments]
\`\`\`

---

## Getting Started

\`\`\`bash
git clone https://github.com/${owner}/${repo}.git
cd ${repo}
[real install and start commands]
\`\`\`

---

## Contributing

\`\`\`bash
git checkout -b feature/your-feature
git commit -m "feat: your change"
git push origin feature/your-feature
# Open a Pull Request
\`\`\`

---

## License

${license} — free to use, modify, and distribute.

---

<div align="center">

**Built by [${owner}](https://github.com/${owner})**

[![GitHub](https://img.shields.io/badge/GitHub-${owner}-181717?style=for-the-badge&logo=github)](https://github.com/${owner})

</div>`;
}

// ── Stream / Generate ──
async function streamReadme(owner, repo, data, signal) {
  const prompt = buildPrompt(owner, repo, data);

  document.getElementById('result-section').style.display = 'block';
  document.getElementById('md-render').innerHTML = '<span class="stream-cursor"></span>';
  generatedMd = '';
  setProgress(78);

  // Always use Netlify backend (full URL when not on Netlify)
  if (true) {
    setStatus('Generating README...');
    const userKey = getUserKey();
    const res = await fetch(NETLIFY_BASE + '/.netlify/functions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, ...(userKey ? { userKey } : {}) }),
      signal
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Server error ' + res.status }));
      throw new Error(err.error || 'Server error');
    }
    const resData = await res.json();
    const full = resData.text || '';
    if (!full) throw new Error('Empty response. Try again.');
    if (resData.usedUserKey) setStatus('Generated using your personal key');

    // Progressive reveal
    const words = full.split(' ');
    for (let i = 0; i < words.length; i += 15) {
      if (signal && signal.aborted) break;
      generatedMd += words.slice(i, i + 15).join(' ') + ' ';
      renderMd(generatedMd, false);
      await new Promise(r => setTimeout(r, 30));
    }
    if (!signal || !signal.aborted) generatedMd = full;

  } else {
    // Local: direct Groq streaming
    const groqKeys = (typeof AUTOREADME_CONFIG !== 'undefined' && AUTOREADME_CONFIG.groqKeys) || [];
    if (!groqKeys.length) throw new Error('No Groq keys in config.js. Add them for local use.');

    let res = null, lastErr = '';
    for (const key of groqKeys) {
      setStatus('Generating README...');
      try {
        const attempt = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'Output ONLY valid Markdown. No preamble. Just the README.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7, max_tokens: 8192, stream: true
          }),
          signal
        });
        if (attempt.status === 429) { lastErr = 'Rate limited'; continue; }
        if (!attempt.ok) { lastErr = 'HTTP ' + attempt.status; continue; }
        res = attempt; break;
      } catch(e) { if (e.name === 'AbortError') throw e; lastErr = e.message; }
    }
    if (!res) throw new Error('All Groq keys failed: ' + lastErr);

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    const timer = setInterval(() => { if (generatedMd) renderMd(generatedMd, false); }, 200);
    try {
      while (true) {
        if (signal && signal.aborted) { reader.cancel(); break; }
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          const raw = line.trim().replace(/^data:\s*/,'');
          if (!raw || raw === '[DONE]') continue;
          try {
            const txt = JSON.parse(raw).choices?.[0]?.delta?.content;
            if (txt) generatedMd += txt;
          } catch(_) {}
        }
        await new Promise(r => setTimeout(r, 10));
      }
    } catch(e) { clearInterval(timer); if (e.name !== 'AbortError') throw e; }
    clearInterval(timer);
  }

  if (!generatedMd) throw new Error('Empty response. Try again.');
  renderMd(generatedMd, true);
  if (currentTab === 'raw') document.getElementById('raw-pre').textContent = generatedMd;
}

// ── Main generate ──
async function generate() {
  const raw = document.getElementById('repo-url').value.trim();
  if (!raw) { showError('Please enter a GitHub repository URL.'); return; }
  const parsed = parseUrl(raw);
  if (!parsed) { showError('Invalid URL. Try: <code>owner/repo</code> or the full GitHub URL.'); return; }

  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();
  setLoading(true);
  hideError();
  setProgress(5);

  try {
    const data = await fetchRepo(parsed.owner, parsed.repo);
    await streamReadme(parsed.owner, parsed.repo, data, abortCtrl.signal);
    setProgress(100);
    setTimeout(() => setProgress(0), 800);
    setStatus('');
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
  } catch(e) {
    if (e.name !== 'AbortError') showError(e.message || 'Something went wrong. Try again.');
    setProgress(0);
    setStatus('');
  }
  setLoading(false);
}

function stopGenerate() {
  if (abortCtrl) { abortCtrl.abort(); abortCtrl = null; }
  setLoading(false);
  setStatus('');
  if (generatedMd) { renderMd(generatedMd, true); toast('Stopped'); }
}

function copyMd() {
  if (!generatedMd) { toast('Nothing to copy yet'); return; }
  navigator.clipboard.writeText(generatedMd).then(() => toast('Copied!')).catch(() => toast('Copy failed'));
}

function downloadMd() {
  if (!generatedMd) { toast('Nothing to download yet'); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([generatedMd], { type: 'text/markdown' }));
  a.download = 'README.md';
  a.click();
  toast('Downloaded!');
}



// ── Page Loader ──
(function() {
  const loader = document.getElementById('loader');
  const hero = document.querySelector('.hero');

  // Stagger hero elements after load
  function animateHero() {
    const badge  = document.querySelector('.hero-badge');
    const title  = document.querySelector('.hero-title');
    const sub    = document.querySelector('.hero-sub');
    const card   = document.querySelector('.input-card');
    const stats  = document.querySelector('.stats-row');

    if (badge)  badge.style.setProperty('--d', '0.05s');
    if (title)  title.style.setProperty('--d', '0.15s');
    if (sub)    sub.style.setProperty('--d', '0.3s');
    if (card)   card.style.setProperty('--d', '0.45s');
    if (stats)  stats.style.setProperty('--d', '0.6s');
  }

  // Dismiss loader after animations complete
  function dismissLoader() {
    loader.classList.add('hidden');
    animateHero();
    // Focus input after entrance
    setTimeout(() => {
      const inp = document.getElementById('repo-url');
      if (inp) inp.focus();
    }, 800);
  }

  // Wait for fonts + min duration for logo animation
  const minDuration = new Promise(r => setTimeout(r, 2200));
  const domReady = new Promise(r => {
    if (document.readyState === 'complete') r();
    else window.addEventListener('load', r);
  });

  Promise.all([minDuration, domReady]).then(dismissLoader);
})();

// ── User key (localStorage) ──
const USER_KEY_STORAGE = 'ar_user_groq_key';

function getUserKey() {
  try { return localStorage.getItem(USER_KEY_STORAGE) || ''; } catch(_) { return ''; }
}

function openSettings() {
  const key = getUserKey();
  document.getElementById('user-groq-key').value = key;
  updateKeyStatusBadge(key);
  document.getElementById('modal-status').className = 'modal-status';
  document.getElementById('settings-modal').classList.add('open');
  setTimeout(() => document.getElementById('user-groq-key').focus(), 100);
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('open');
}

function updateKeyStatusBadge(key) {
  const badge = document.getElementById('user-key-badge');
  if (key && key.startsWith('gsk_')) {
    badge.textContent = 'Your key: ' + key.slice(0,12) + '...';
    badge.className = 'key-status key-active';
  } else {
    badge.textContent = 'No user key set';
    badge.className = 'key-status key-none';
  }
}

function saveUserKey() {
  const key = document.getElementById('user-groq-key').value.trim();
  const status = document.getElementById('modal-status');
  if (!key) {
    status.textContent = 'Please enter a key first.';
    status.className = 'modal-status err';
    return;
  }
  if (!key.startsWith('gsk_')) {
    status.textContent = 'Invalid key — Groq keys start with gsk_';
    status.className = 'modal-status err';
    return;
  }
  try {
    localStorage.setItem(USER_KEY_STORAGE, key);
    updateKeyStatusBadge(key);
    status.textContent = '✓ Key saved — it will be used first on your next generation';
    status.className = 'modal-status ok';
    // Update settings btn to show active
    document.getElementById('settings-btn').style.color = 'var(--lime)';
  } catch(_) {
    status.textContent = 'Could not save — localStorage may be blocked.';
    status.className = 'modal-status err';
  }
}

function clearUserKey() {
  try { localStorage.removeItem(USER_KEY_STORAGE); } catch(_) {}
  document.getElementById('user-groq-key').value = '';
  updateKeyStatusBadge('');
  const status = document.getElementById('modal-status');
  status.textContent = 'Key cleared — server keys will be used.';
  status.className = 'modal-status ok';
  document.getElementById('settings-btn').style.color = '';
}

// Close on Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSettings(); });

// On load — show indicator if user has a key saved
document.addEventListener('DOMContentLoaded', () => {
  const key = getUserKey();
  if (key && key.startsWith('gsk_')) {
    document.getElementById('settings-btn').style.color = 'var(--lime)';
  }
});

// Spinner keyframe
const style = document.createElement('style');
style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(style);
