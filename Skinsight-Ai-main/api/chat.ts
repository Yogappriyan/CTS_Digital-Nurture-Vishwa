import { chatWithSkinAssistantWithGemini } from '../server/geminiService';

async function getJsonBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = await getJsonBody(req);
    const { prompt, analysisContext, chatHistory, imageBase64 } = body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required in request body.' });
    }

    const answer = await chatWithSkinAssistantWithGemini({
      prompt,
      analysisContext,
      chatHistory,
      imageBase64
    });

    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error('[SkinSight Vercel API] Error in /api/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate chat response.'
    });
  }
}
