import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { analyzeSkinImageWithGemini, chatWithSkinAssistantWithGemini, cleanApiKey } from './server/geminiService';

// Load .env and .env.local for local development flexibility
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // High body limit to support high-res dermatological photographs in base64
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    const rawKey = cleanApiKey(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '');
    const hasValidKey = Boolean(rawKey && rawKey !== 'MY_GEMINI_API_KEY' && rawKey.length > 5);
    res.json({
      status: 'ok',
      service: 'SkinSight AI (Express Server)',
      geminiConfigured: hasValidKey,
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Diagnostic Endpoint for Localhost and Cloud Deployment verification
  app.get('/api/config-status', (req, res) => {
    const rawKey = cleanApiKey(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '');
    const hasValidKey = Boolean(rawKey && rawKey !== 'MY_GEMINI_API_KEY' && rawKey.length > 5);
    res.json({
      geminiConfigured: hasValidKey,
      environment: process.env.NODE_ENV || 'development',
      host: 'Node Express Server',
      message: hasValidKey
        ? 'Gemini Multimodal Vision Engine is active and connected.'
        : 'GEMINI_API_KEY is not configured in .env or server environment variables. Real-time Gemini multimodal predictions require a valid key.'
    });
  });

  // Skin Analysis Endpoint
  app.post('/api/analyze-skin', async (req, res) => {
    try {
      const { imageBase64, mimeType, datasetKey } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Image data is required.' });
      }

      const result = await analyzeSkinImageWithGemini({
        imageBase64,
        mimeType,
        datasetKey
      });

      res.json(result);
    } catch (error: any) {
      console.error('[SkinSight Server] Error in /api/analyze-skin:', error);
      res.status(500).json({
        error: error?.message || 'Failed to analyze skin image with AI model.'
      });
    }
  });

  // Chat Assistant Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { prompt, analysisContext, chatHistory, imageBase64 } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
      }

      const answer = await chatWithSkinAssistantWithGemini({
        prompt,
        analysisContext,
        chatHistory,
        imageBase64
      });

      res.json({ answer });
    } catch (error: any) {
      console.error('[SkinSight Server] Error in /api/chat:', error);
      res.status(500).json({
        error: error?.message || 'Failed to generate chat response.'
      });
    }
  });

  // Vite middleware for development vs static asset serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkinSight AI Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
