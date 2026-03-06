import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import logger from '../config/logger';

const PAGE_SIZE_MAX = 100;

export class TransactionController {
  static async getTransactions(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { startDate, endDate, type, bankProvider, search } = req.query;

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(PAGE_SIZE_MAX, Math.max(1, parseInt(req.query.limit as string) || 20));

      let memberId = user.member?.id;

      // If admin/treasurer/chairman, allow querying all transactions or specific member
      if (['ADMIN', 'TREASURER', 'CHAIRMAN'].includes(user.role)) {
        memberId = (req.query.memberId as string) || memberId;
      }

      if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required' });
      }

      const filters: any = {};
      if (startDate && endDate) {
        filters.transactionDate = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }
      if (type) filters.type = type;
      if (bankProvider) filters.bankProvider = bankProvider;
      if (search) {
        filters.description = { contains: search as string, mode: 'insensitive' };
      }

      const { transactions, total } = await TransactionService.getTransactions(memberId, filters, page, limit);
      const totalPages = Math.ceil(total / limit);

      res.json({ transactions, total, page, totalPages });
    } catch (error: any) {
      logger.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  static async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transactionId = Array.isArray(id) ? id[0] : id;
      const transaction = await TransactionService.getTransactionById(transactionId);

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({ transaction });
    } catch (error: any) {
      logger.error('Get transaction error:', error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }
}
