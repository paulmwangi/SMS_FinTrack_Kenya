import prisma from '../config/database';
import logger from '../config/logger';

export class MemberService {
  static async createMember(userId: string, memberData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    nationalId?: string;
  }) {
    try {
      const member = await prisma.member.create({
        data: {
          userId,
          ...memberData,
        },
      });

      logger.info(`Member created: ${member.id}`);
      return member;
    } catch (error) {
      logger.error('Create member error:', error);
      throw error;
    }
  }

  static async getMemberById(id: string) {
    try {
      const member = await prisma.member.findUnique({
        where: { id },
        include: {
          user: {
            select: { email: true, role: true, isActive: true },
          },
        },
      });

      return member;
    } catch (error) {
      logger.error('Get member error:', error);
      throw error;
    }
  }

  static async getAllMembers() {
    try {
      const members = await prisma.member.findMany({
        include: {
          user: {
            select: { email: true, role: true, isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return members;
    } catch (error) {
      logger.error('Get all members error:', error);
      throw error;
    }
  }

  static async updateMember(id: string, updates: any) {
    try {
      const member = await prisma.member.update({
        where: { id },
        data: updates,
      });

      logger.info(`Member updated: ${member.id}`);
      return member;
    } catch (error) {
      logger.error('Update member error:', error);
      throw error;
    }
  }

  static async getMemberByPhoneNumber(phoneNumber: string) {
    try {
      const member = await prisma.member.findUnique({
        where: { phoneNumber },
      });

      return member;
    } catch (error) {
      logger.error('Get member by phone error:', error);
      throw error;
    }
  }

  static async deleteMember(id: string) {
    try {
      await prisma.member.delete({
        where: { id },
      });

      logger.info(`Member deleted: ${id}`);
    } catch (error) {
      logger.error('Delete member error:', error);
      throw error;
    }
  }
}
