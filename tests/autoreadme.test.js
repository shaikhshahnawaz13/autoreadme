// AutoReadme v2 — Unit Tests
// Run with: node tests/autoreadme.test.js

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch(e) {
    console.log(`  ✗ ${name}\n    ${e.message}`);
    failed++;
  }
}

function assert(val, msg) {
  if (!val) throw new Error(msg || 'Assertion failed');
}
function assertEqual(a, b) {
  if (a !== b) throw new Error(`Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ── parseUrl (inline for testing) ──
function parseUrl(raw) {
  const s = raw.trim().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/^github\.com\//,'');
  const m = s.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
  return m ? { owner: m[1], repo: m[2].replace(/\.git$/,'') } : null;
}

console.log('\nAutoReadme v2 — Test Suite\n');

console.log('parseUrl()');
test('full URL', () => {
  const r = parseUrl('https://github.com/facebook/react');
  assertEqual(r.owner, 'facebook');
  assertEqual(r.repo, 'react');
});
test('owner/repo shorthand', () => {
  const r = parseUrl('torvalds/linux');
  assertEqual(r.owner, 'torvalds');
  assertEqual(r.repo, 'linux');
});
test('trailing .git stripped', () => {
  const r = parseUrl('https://github.com/vercel/next.js.git');
  assertEqual(r.repo, 'next.js');
});
test('with whitespace', () => {
  const r = parseUrl('  facebook/react  ');
  assertEqual(r.owner, 'facebook');
});
test('dotted repo name', () => {
  const r = parseUrl('vercel/next.js');
  assertEqual(r.repo, 'next.js');
});
test('invalid returns null', () => {
  assert(parseUrl('notaurl') === null);
});
test('just owner returns null', () => {
  assert(parseUrl('facebook') === null);
});
test('github.com prefix only', () => {
  const r = parseUrl('github.com/microsoft/vscode');
  assertEqual(r.owner, 'microsoft');
  assertEqual(r.repo, 'vscode');
});

console.log('\nFile structure');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

[
  ['index.html', 'Main HTML'],
  ['style.css', 'Stylesheet'],
  ['script.js', 'Main script'],
  ['netlify.toml', 'Netlify config'],
  ['netlify/functions/generate.js', 'Generate function'],
  ['netlify/functions/github.js', 'GitHub proxy'],
  ['.gitignore', 'Git ignore'],
  ['package.json', 'Package manifest'],
  ['LICENSE', 'MIT license'],
  ['CONTRIBUTING.md', 'Contributing guide'],
].forEach(([file, label]) => {
  test(`${label} exists (${file})`, () => {
    assert(fs.existsSync(path.join(root, file)), `Missing: ${file}`);
  });
});

test('index.html has no inline <style> blocks', () => {
  const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert(!/<style[\s>]/i.test(src), 'index.html must not contain inline <style> blocks');
});

test('index.html links to style.css', () => {
  const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert(src.includes('href="style.css"'), 'index.html must link to style.css');
});

test('index.html links to script.js', () => {
  const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert(src.includes('src="script.js"'), 'index.html must link to script.js');
});

test('config.js is gitignored', () => {
  const gi = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
  assert(gi.includes('config.js'), '.gitignore must include config.js');
});

test('generate.js has no hardcoded keys', () => {
  const src = fs.readFileSync(path.join(root, 'netlify/functions/generate.js'), 'utf8');
  // Check for actual keys (long gsk_ strings), not just the prefix pattern used in validation
  assert(!/gsk_[a-zA-Z0-9]{20,}/.test(src), 'generate.js must not contain actual Groq keys');
});

test('github.js has no hardcoded tokens', () => {
  const src = fs.readFileSync(path.join(root, 'netlify/functions/github.js'), 'utf8');
  assert(!src.includes('ghp_'), 'github.js must not contain GitHub tokens');
});

test('index.html has no hardcoded Groq keys', () => {
  const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert(!/gsk_[a-zA-Z0-9]{20,}/.test(src), 'index.html must not contain actual Groq keys');
});

test('script.js has no hardcoded Groq keys', () => {
  const src = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
  assert(!/gsk_[a-zA-Z0-9]{20,}/.test(src), 'script.js must not contain actual Groq keys');
});

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
