import { Router, Request, Response, NextFunction } from 'express';
import { SMSController } from '../controllers/smsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Validate Africa's Talking webhook secret when AT_API_KEY is configured
const validateWebhook = (req: Request, res: Response, next: NextFunction) => {
  const expectedKey = process.env.AT_API_KEY;
  if (!expectedKey) {
    // No key configured – allow all requests (local dev / unconfigured)
    return next();
  }
  const providedKey = req.headers['apikey'] as string | undefined;
  if (!providedKey || providedKey !== expectedKey) {
    return res.status(403).json({ error: 'Forbidden: invalid API key' });
  }
  next();
};

// Public endpoint for SMS webhook (Africa's Talking)
router.post('/ingest', validateWebhook, SMSController.ingestSMS);

// Authenticated endpoint for manual SMS processing from the frontend
router.post('/process', authenticate, SMSController.ingestSMS);

export default router;
