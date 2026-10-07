export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let rawKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
    rawKey = rawKey.slice(1, -1).trim();
  }
  const hasValidKey = Boolean(rawKey && rawKey !== 'MY_GEMINI_API_KEY' && rawKey.length > 5);

  return res.status(200).json({
    status: 'ok',
    service: 'SkinSight AI (Vercel Serverless)',
    geminiConfigured: hasValidKey,
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
}
