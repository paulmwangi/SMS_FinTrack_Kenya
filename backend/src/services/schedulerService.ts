import cron from 'node-cron';
import prisma from '../config/database';
import { StatementService } from './statementService';
import logger from '../config/logger';

export class SchedulerService {
  /**
   * Start all scheduled jobs
   */
  static startScheduledJobs() {
    // Run monthly statement generation on the 1st of each month at 2:00 AM
    cron.schedule('0 2 1 * *', async () => {
      logger.info('Starting monthly statement generation...');
      await this.generateMonthlyStatements();
    });

    logger.info('Scheduled jobs started successfully');
  }

  /**
   * Generate statements for all active members for the previous month
   */
  private static async generateMonthlyStatements() {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const month = lastMonth.getMonth() + 1;
      const year = lastMonth.getFullYear();

      // Get all active members
      const members = await prisma.member.findMany({
        where: { isActive: true },
      });

      logger.info(`Generating statements for ${members.length} members for ${month}/${year}`);

      let successCount = 0;
      let errorCount = 0;

      for (const member of members) {
        try {
          // Check if statement already exists
          const existingStatement = await prisma.statement.findUnique({
            where: {
              memberId_month_year: {
                memberId: member.id,
                month,
                year,
              },
            },
          });

          if (existingStatement) {
            logger.info(`Statement already exists for member ${member.id}`);
            continue;
          }

          // Generate statement
          await StatementService.generateMonthlyStatement(member.id, month, year);
          successCount++;
        } catch (error) {
          logger.error(`Failed to generate statement for member ${member.id}:`, error);
          errorCount++;
        }
      }

      logger.info(`Statement generation complete: ${successCount} successful, ${errorCount} failed`);
    } catch (error) {
      logger.error('Monthly statement generation error:', error);
    }
  }

  /**
   * Manually trigger statement generation for all members
   */
  static async triggerMonthlyStatements(month: number, year: number) {
    try {
      const members = await prisma.member.findMany({
        where: { isActive: true },
      });

      logger.info(`Manually generating statements for ${members.length} members for ${month}/${year}`);

      const results = {
        success: 0,
        failed: 0,
        skipped: 0,
      };

      for (const member of members) {
        try {
          const existingStatement = await prisma.statement.findUnique({
            where: {
              memberId_month_year: {
                memberId: member.id,
                month,
                year,
              },
            },
          });

          if (existingStatement) {
            results.skipped++;
            continue;
          }

          await StatementService.generateMonthlyStatement(member.id, month, year);
          results.success++;
        } catch (error) {
          logger.error(`Failed to generate statement for member ${member.id}:`, error);
          results.failed++;
        }
      }

      logger.info(`Manual statement generation complete:`, results);
      return results;
    } catch (error) {
      logger.error('Trigger monthly statements error:', error);
      throw error;
    }
  }
}
