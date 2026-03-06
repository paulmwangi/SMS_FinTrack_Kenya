import prisma from '../config/database';
import logger from '../config/logger';
import { SMSParser } from './smsParser';
import { NotificationService } from './notificationService';

export class TransactionService {
  static async processSMS(smsContent: string, phoneNumber?: string) {
    try {
      const parsed = SMSParser.parse(smsContent);
      if (!parsed) {
        throw new Error('Unable to parse SMS');
      }

      // Find member by phone number
      if (!phoneNumber) {
        throw new Error('Phone number is required to process SMS');
      }

      const member = await prisma.member.findUnique({
        where: { phoneNumber },
        include: { user: { select: { id: true } } },
      });

      if (!member) {
        throw new Error(`No member found for phone number: ${phoneNumber}`);
      }

      // Check for duplicate transaction
      const existingTransaction = await prisma.transaction.findUnique({
        where: { reference: parsed.reference },
      });

      if (existingTransaction) {
        logger.warn(`Duplicate transaction detected: ${parsed.reference}`);
        return { ...existingTransaction, isDuplicate: true };
      }

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          memberId: member.id,
          type: parsed.type,
          amount: parsed.amount,
          balance: parsed.balance,
          description: parsed.description,
          bankProvider: parsed.bankProvider,
          reference: parsed.reference,
          smsContent,
          transactionDate: parsed.transactionDate,
        },
      });

      // Update member balance
      await prisma.member.update({
        where: { id: member.id },
        data: { balance: parsed.balance },
      });

      // Send notification to the member
      if (member.user) {
        const typeLabels: Record<string, string> = {
          DEPOSIT: 'Deposit',
          WITHDRAWAL: 'Withdrawal',
          TRANSFER: 'Transfer',
          FEE: 'Fee',
        };
        const typeLabel = typeLabels[parsed.type] || parsed.type;
        await NotificationService.createNotification(member.user.id, {
          title: `New ${typeLabel} Detected`,
          message: `A ${typeLabel.toLowerCase()} of KES ${parsed.amount.toLocaleString()} via ${parsed.bankProvider} was processed. Balance: KES ${parsed.balance.toLocaleString()}`,
          type: 'TRANSACTION',
          link: '/transactions',
        });
      }

      logger.info(`Transaction created: ${transaction.id} for member ${member.id}`);
      return transaction;
    } catch (error) {
      logger.error('Process SMS error:', error);
      throw error;
    }
  }

  static async getTransactions(memberId: string, filters?: any, page = 1, limit = 20) {
    try {
      const where = { memberId, ...filters };
      const [transactions, total] = await prisma.$transaction([
        prisma.transaction.findMany({
          where,
          orderBy: { transactionDate: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.transaction.count({ where }),
      ]);

      return { transactions, total };
    } catch (error) {
      logger.error('Get transactions error:', error);
      throw error;
    }
  }

  static async getTransactionById(id: string) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { member: true },
      });

      return transaction;
    } catch (error) {
      logger.error('Get transaction error:', error);
      throw error;
    }
  }
}
