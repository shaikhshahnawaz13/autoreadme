exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.referer || '*';
  const allowed = ['https://auto-readme.netlify.app','https://shaikhshahnawaz13.github.io','http://localhost:3000','http://127.0.0.1:3000'];
  const allowedOrigin = allowed.some(o => origin.startsWith(o)) ? origin : 'https://auto-readme.netlify.app';
  const CORS = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' };

  const GH_TOKENS = [
    process.env.GH_TOKEN_1, process.env.GH_TOKEN_2, process.env.GH_TOKEN_3,
  ].filter(Boolean);

  let path;
  try { path = JSON.parse(event.body || '{}').path; } catch(_) {}
  if (!path) return { statusCode: 400, headers: CORS, body: 'Missing path' };

  const url = 'https://api.github.com/' + path;
  const base = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'AutoReadme/2.0' };

  const tryFetch = async (headers) => {
    const res = await fetch(url, { headers });
    if (res.status === 404) return { status: 404, body: JSON.stringify({ message: 'Not Found' }) };
    if (res.ok) return { status: 200, body: await res.text() };
    return null;
  };

  for (const tok of GH_TOKENS) {
    try {
      const r = await tryFetch({ ...base, 'Authorization': 'Bearer ' + tok });
      if (r) return { statusCode: r.status, headers: { ...CORS, 'Content-Type': 'application/json' }, body: r.body };
    } catch(_) { continue; }
  }

  // Fallback without token
  try {
    const r = await tryFetch(base);
    if (r) return { statusCode: r.status, headers: { ...CORS, 'Content-Type': 'application/json' }, body: r.body };
  } catch(_) {}

  return { statusCode: 503, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'GitHub API unreachable' }) };
};
