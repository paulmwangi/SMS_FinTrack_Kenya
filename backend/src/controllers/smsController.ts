import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import logger from '../config/logger';

export class SMSController {
  static async ingestSMS(req: Request, res: Response) {
    try {
      const { from, text, body } = req.body;
      // Accept 'text' (Africa's Talking webhook) or 'body' (frontend manual entry)
      const smsText = text || body;

      if (!smsText) {
        return res.status(400).json({ error: 'SMS text is required' });
      }

      logger.info(`Received SMS from ${from}: ${smsText}`);

      const result = await TransactionService.processSMS(smsText, from);

      const isDuplicate = result && typeof result === 'object' && 'isDuplicate' in result && result.isDuplicate;

      res.status(isDuplicate ? 200 : 201).json({
        message: isDuplicate
          ? 'Transaction with this reference already exists'
          : 'SMS processed successfully',
        transaction: result,
        isDuplicate: !!isDuplicate,
      });
    } catch (error: any) {
      logger.error('SMS ingestion error:', error);
      res.status(400).json({ error: error.message || 'SMS processing failed' });
    }
  }
}
