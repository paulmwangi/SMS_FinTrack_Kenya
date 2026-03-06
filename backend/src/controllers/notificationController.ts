import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import logger from '../config/logger';

export class NotificationController {
  static async getNotifications(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const unreadOnly = req.query.unreadOnly === 'true';

      const notifications = await NotificationService.getNotifications(user.id, unreadOnly);
      const unreadCount = await NotificationService.getUnreadCount(user.id);

      res.json({ notifications, unreadCount });
    } catch (error: any) {
      logger.error('Get notifications controller error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const count = await NotificationService.getUnreadCount(user.id);
      res.json({ unreadCount: count });
    } catch (error: any) {
      logger.error('Get unread count controller error:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { id } = req.params;
      const notificationId = Array.isArray(id) ? id[0] : id;

      await NotificationService.markAsRead(notificationId, user.id);
      res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
      logger.error('Mark as read controller error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const user = req.user as any;
      await NotificationService.markAllAsRead(user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      logger.error('Mark all as read controller error:', error);
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  }
}
