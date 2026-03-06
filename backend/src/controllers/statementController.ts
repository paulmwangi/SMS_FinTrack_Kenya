import { Request, Response } from 'express';
import { StatementService } from '../services/statementService';
import logger from '../config/logger';
import { join } from 'path';
import { existsSync } from 'fs';

export class StatementController {
  static async generateStatement(req: Request, res: Response) {
    try {
      const { memberId, month, year } = req.body;
      const user = req.user as any;

      if (!month || !year) {
        return res.status(400).json({ error: 'Month and year are required' });
      }

      // Determine the target memberId
      let targetMemberId = memberId;
      if (!targetMemberId) {
        // If no memberId provided, use the logged-in user's member ID
        targetMemberId = user.member?.id;
      }

      if (!targetMemberId) {
        return res.status(400).json({ error: 'Member ID is required' });
      }

      const statement = await StatementService.generateMonthlyStatement(
        targetMemberId,
        parseInt(month),
        parseInt(year)
      );

      res.status(201).json({
        message: 'Statement generated successfully',
        statement,
      });
    } catch (error: any) {
      logger.error('Generate statement controller error:', error);
      res.status(400).json({ error: error.message || 'Failed to generate statement' });
    }
  }

  static async getStatements(req: Request, res: Response) {
    try {
      const user = req.user as any;
      let memberId = user.member?.id;

      // If admin/treasurer/chairman, allow querying all statements
      if (['ADMIN', 'TREASURER', 'CHAIRMAN'].includes(user.role)) {
        memberId = (req.query.memberId as string) || memberId;
      }

      if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required' });
      }

      const statements = await StatementService.getStatements(memberId);
      res.json({ statements });
    } catch (error: any) {
      logger.error('Get statements controller error:', error);
      res.status(500).json({ error: 'Failed to fetch statements' });
    }
  }

  static async getStatementById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statementId = Array.isArray(id) ? id[0] : id;
      const statement = await StatementService.getStatementById(statementId);

      if (!statement) {
        return res.status(404).json({ error: 'Statement not found' });
      }

      res.json({ statement });
    } catch (error: any) {
      logger.error('Get statement controller error:', error);
      res.status(500).json({ error: 'Failed to fetch statement' });
    }
  }

  static async downloadStatement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statementId = Array.isArray(id) ? id[0] : id;
      const statement = await StatementService.getStatementById(statementId);

      if (!statement) {
        return res.status(404).json({ error: 'Statement not found' });
      }

      if (!statement.pdfUrl) {
        return res.status(404).json({ error: 'PDF not available for this statement' });
      }

      // pdfUrl is stored as /statements/filename.pdf, resolve to absolute path
      const statementsDir = join(process.cwd(), 'statements');
      const pdfPath = join(process.cwd(), statement.pdfUrl);

      // Prevent path traversal attacks
      if (!pdfPath.startsWith(statementsDir)) {
        return res.status(400).json({ error: 'Invalid statement path' });
      }

      if (!existsSync(pdfPath)) {
        return res.status(404).json({ error: 'PDF file not found' });
      }

      const fileName = `statement-${statement.month}-${statement.year}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.sendFile(pdfPath);
    } catch (error: any) {
      logger.error('Download statement controller error:', error);
      res.status(500).json({ error: 'Failed to download statement' });
    }
  }

  static async deleteStatement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statementId = Array.isArray(id) ? id[0] : id;

      const statement = await StatementService.getStatementById(statementId);
      if (!statement) {
        return res.status(404).json({ error: 'Statement not found' });
      }

      await StatementService.deleteStatement(statementId);
      res.json({ message: 'Statement deleted successfully' });
    } catch (error: any) {
      logger.error('Delete statement controller error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete statement' });
    }
  }
}
