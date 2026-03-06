import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import logger from '../config/logger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await AuthService.register(email, password, role);
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
      });
    } catch (error: any) {
      logger.error('Register controller error:', error);
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login(email, password);
      res.json({
        message: 'Login successful',
        ...result,
      });
    } catch (error: any) {
      logger.error('Login controller error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = (req.user as any).id;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new passwords are required' });
      }

      await AuthService.changePassword(userId, oldPassword, newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      logger.error('Change password controller error:', error);
      res.status(400).json({ error: error.message || 'Password change failed' });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      logger.error('Me controller error:', error);
      res.status(500).json({ error: 'Failed to fetch user info' });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { email, phoneNumber } = req.body;

      const user = await AuthService.updateProfile(userId, { email, phoneNumber });
      res.json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
      logger.error('Update profile controller error:', error);
      res.status(400).json({ error: error.message || 'Failed to update profile' });
    }
  }
}
