import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import logger from '../config/logger';

export class AuthService {
  static async register(email: string, password: string, role: string = 'MEMBER') {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role as any,
        },
      });

      logger.info(`User registered: ${email}`);
      return user;
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  static async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { member: true },
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret || (process.env.NODE_ENV === 'production' && jwtSecret === 'default-secret')) {
        throw new Error('JWT_SECRET environment variable is not configured securely');
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      logger.info(`User logged in: ${email}`);
      
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid old password');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info(`Password changed for user: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  static async updateProfile(userId: string, updates: { email?: string; phoneNumber?: string }) {
    try {
      if (updates.email) {
        const existingUser = await prisma.user.findUnique({ where: { email: updates.email } });
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Email already in use');
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(updates.email && { email: updates.email }),
        },
        include: { member: true },
      });

      // Update phone number on the member record if provided
      if (updates.phoneNumber && user.member) {
        const existingMember = await prisma.member.findUnique({ where: { phoneNumber: updates.phoneNumber } });
        if (existingMember && existingMember.id !== user.member.id) {
          throw new Error('Phone number already in use by another member');
        }
        await prisma.member.update({
          where: { id: user.member.id },
          data: { phoneNumber: updates.phoneNumber },
        });
      }

      // Re-fetch the user with updated member
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { member: true },
      });

      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      logger.info(`Profile updated for user: ${updatedUser.email}`);
      return userWithoutPassword;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }
}
