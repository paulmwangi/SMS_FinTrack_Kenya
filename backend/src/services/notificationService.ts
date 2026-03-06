import prisma from '../config/database';
import logger from '../config/logger';

export class NotificationService {
  static async createNotification(userId: string, data: {
    title: string;
    message: string;
    type?: string;
    link?: string;
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title: data.title,
          message: data.message,
          type: data.type || 'INFO',
          link: data.link,
        },
      });

      logger.info(`Notification created for user ${userId}: ${notification.id}`);
      return notification;
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  static async getNotifications(userId: string, unreadOnly = false) {
    try {
      const where: Record<string, unknown> = { userId };
      if (unreadOnly) {
        where.isRead = false;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return notifications;
    } catch (error) {
      logger.error('Get notifications error:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: { userId, isRead: false },
      });
      return count;
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
      return notification;
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      logger.info(`Marked ${result.count} notifications as read for user ${userId}`);
      return result;
    } catch (error) {
      logger.error('Mark all as read error:', error);
      throw error;
    }
  }

  static async notifyAllUsers(data: {
    title: string;
    message: string;
    type?: string;
    link?: string;
  }) {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      const notifications = await prisma.notification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          title: data.title,
          message: data.message,
          type: data.type || 'INFO',
          link: data.link,
        })),
      });

      logger.info(`Broadcast notification sent to ${users.length} users`);
      return notifications;
    } catch (error) {
      logger.error('Notify all users error:', error);
      throw error;
    }
  }
}
