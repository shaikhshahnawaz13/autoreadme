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

  const SERVER_KEYS = [
    process.env.GROQ_KEY_1, process.env.GROQ_KEY_2, process.env.GROQ_KEY_3,
    process.env.GROQ_KEY_4, process.env.GROQ_KEY_5,
  ].filter(Boolean);

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch(_) {}
  const { prompt, userKey } = body || {};

  if (!prompt) return { statusCode: 400, headers: CORS, body: 'Missing prompt' };

  // User key goes FIRST if provided and valid format
  const keys = [
    ...(userKey && userKey.startsWith('gsk_') ? [userKey] : []),
    ...SERVER_KEYS,
  ];

  if (!keys.length) return {
    statusCode: 500,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'No Groq keys available. Add your own key in Settings.' })
  };

  let lastError = '';
  for (const key of keys) {
    const isUserKey = key === userKey;
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a senior open-source engineer. Output ONLY valid Markdown. No preamble. No explanation. Just the README.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7, max_tokens: 8192, stream: false
        })
      });
      if (res.status === 401) { lastError = isUserKey ? 'Your API key is invalid' : 'Server key invalid'; continue; }
      if (res.status === 429) { lastError = isUserKey ? 'Your key is rate limited' : 'Server key rate limited'; continue; }
      if (!res.ok) { lastError = 'HTTP ' + res.status; continue; }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      if (!text) { lastError = 'Empty response'; continue; }
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, usedUserKey: isUserKey })
      };
    } catch(e) { lastError = e.message; continue; }
  }

  return {
    statusCode: 429,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'All keys failed. Last: ' + lastError })
  };
};
