import prisma from '../config/database';
import logger from '../config/logger';
import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NotificationService } from './notificationService';

export class StatementService {
  static async generateMonthlyStatement(memberId: string, month: number, year: number) {
    try {
      const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: { user: true },
      });

      if (!member) {
        throw new Error('Member not found');
      }

      // Get start and end dates for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Get all transactions for the month
      const transactions = await prisma.transaction.findMany({
        where: {
          memberId,
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { transactionDate: 'asc' },
      });

      // Calculate totals
      const totalDeposits = transactions
        .filter((t) => t.type === 'DEPOSIT')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalWithdrawals = transactions
        .filter((t) => t.type === 'WITHDRAWAL')
        .reduce((sum, t) => sum + t.amount, 0);

      // Get opening balance (balance from previous month's last transaction)
      const previousTransaction = await prisma.transaction.findFirst({
        where: {
          memberId,
          transactionDate: {
            lt: startDate,
          },
        },
        orderBy: { transactionDate: 'desc' },
      });

      const openingBalance = previousTransaction?.balance || 0;
      const closingBalance = transactions.length > 0 
        ? transactions[transactions.length - 1].balance 
        : openingBalance;

      // Create statement record
      const statement = await prisma.statement.create({
        data: {
          memberId,
          month,
          year,
          startDate,
          endDate,
          openingBalance,
          closingBalance,
          totalDeposits,
          totalWithdrawals,
        },
      });

      // Generate PDF
      const pdfPath = await this.generatePDF(member, statement, transactions);

      // Update statement with PDF URL
      await prisma.statement.update({
        where: { id: statement.id },
        data: { pdfUrl: pdfPath },
      });

      logger.info(`Statement generated for member ${memberId}: ${statement.id}`);

      // Send notification to the member
      if (member.user) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        await NotificationService.createNotification(member.user.id, {
          title: 'Monthly Statement Generated',
          message: `Your ${monthNames[month - 1]} ${year} statement is ready. Closing balance: KES ${closingBalance.toLocaleString()}`,
          type: 'STATEMENT',
          link: '/statements',
        });
      }

      return { ...statement, pdfUrl: pdfPath };
    } catch (error) {
      logger.error('Generate statement error:', error);
      throw error;
    }
  }

  private static async generatePDF(member: any, statement: any, transactions: any[]) {
    try {
      const html = this.generateHTML(member, statement, transactions);

      // Create statements directory if it doesn't exist
      const statementsDir = join(process.cwd(), 'statements');
      await mkdir(statementsDir, { recursive: true });

      const fileName = `statement-${member.id}-${statement.year}-${statement.month}.pdf`;
      const filePath = join(statementsDir, fileName);

      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html);
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      return `/statements/${fileName}`;
    } catch (error) {
      logger.error('PDF generation error:', error);
      throw error;
    }
  }

  private static generateHTML(member: any, statement: any, transactions: any[]) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #2c5530; margin: 0; }
          .header h2 { color: #666; margin: 5px 0; }
          .member-info { margin-bottom: 20px; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2c5530; color: white; }
          .text-right { text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SMS-FinTrack Kenya</h1>
          <h2>Monthly Statement - ${monthNames[statement.month - 1]} ${statement.year}</h2>
        </div>

        <div class="member-info">
          <p><strong>Member:</strong> ${member.firstName} ${member.lastName}</p>
          <p><strong>Phone:</strong> ${member.phoneNumber}</p>
          <p><strong>Member ID:</strong> ${member.id}</p>
        </div>

        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Opening Balance:</strong> KES ${statement.openingBalance.toLocaleString()}</p>
          <p><strong>Total Deposits:</strong> KES ${statement.totalDeposits.toLocaleString()}</p>
          <p><strong>Total Withdrawals:</strong> KES ${statement.totalWithdrawals.toLocaleString()}</p>
          <p><strong>Closing Balance:</strong> KES ${statement.closingBalance.toLocaleString()}</p>
        </div>

        <h3>Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Bank</th>
              <th>Description</th>
              <th class="text-right">Amount</th>
              <th class="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${new Date(t.transactionDate).toLocaleDateString()}</td>
                <td>${t.type}</td>
                <td>${t.bankProvider}</td>
                <td>${t.description.substring(0, 50)}</td>
                <td class="text-right">KES ${t.amount.toLocaleString()}</td>
                <td class="text-right">KES ${t.balance.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>This is an automatically generated statement from SMS-FinTrack Kenya</p>
        </div>
      </body>
      </html>
    `;
  }

  static async getStatements(memberId: string) {
    try {
      const statements = await prisma.statement.findMany({
        where: { memberId },
        orderBy: { generatedAt: 'desc' },
      });

      return statements;
    } catch (error) {
      logger.error('Get statements error:', error);
      throw error;
    }
  }

  static async getStatementById(id: string) {
    try {
      const statement = await prisma.statement.findUnique({
        where: { id },
        include: { member: true },
      });

      return statement;
    } catch (error) {
      logger.error('Get statement error:', error);
      throw error;
    }
  }

  static async deleteStatement(id: string) {
    try {
      await prisma.statement.delete({
        where: { id },
      });

      logger.info(`Statement deleted: ${id}`);
    } catch (error) {
      logger.error('Delete statement error:', error);
      throw error;
    }
  }
}
