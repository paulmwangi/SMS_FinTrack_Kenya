import { Request, Response } from 'express';
import { MemberService } from '../services/memberService';
import { AuthService } from '../services/authService';
import logger from '../config/logger';

export class MemberController {
  static async createMember(req: Request, res: Response) {
    try {
      const { userId, firstName, lastName, phoneNumber, nationalId, email, password } = req.body;

      if (!firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ error: 'First name, last name, and phone number are required' });
      }

      let memberUserId = userId;

      // If email and password provided, create a user account for login
      if (!memberUserId && email && password) {
        if (password.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        const user = await AuthService.register(email, password, 'MEMBER');
        memberUserId = user.id;
      }

      if (!memberUserId) {
        return res.status(400).json({ error: 'Either userId or email/password are required to create a member account' });
      }

      const member = await MemberService.createMember(memberUserId, {
        firstName,
        lastName,
        phoneNumber,
        nationalId,
      });

      res.status(201).json({ message: 'Member created successfully', member });
    } catch (error: any) {
      logger.error('Create member controller error:', error);
      res.status(400).json({ error: error.message || 'Failed to create member' });
    }
  }

  static async getMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const memberId = Array.isArray(id) ? id[0] : id;
      const member = await MemberService.getMemberById(memberId);

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.json({ member });
    } catch (error: any) {
      logger.error('Get member controller error:', error);
      res.status(500).json({ error: 'Failed to fetch member' });
    }
  }

  static async getAllMembers(req: Request, res: Response) {
    try {
      const members = await MemberService.getAllMembers();
      res.json({ members });
    } catch (error: any) {
      logger.error('Get all members controller error:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  }

  static async updateMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const memberId = Array.isArray(id) ? id[0] : id;
      const updates = req.body;

      const member = await MemberService.updateMember(memberId, updates);
      res.json({ message: 'Member updated successfully', member });
    } catch (error: any) {
      logger.error('Update member controller error:', error);
      res.status(400).json({ error: error.message || 'Failed to update member' });
    }
  }

  static async deleteMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const memberId = Array.isArray(id) ? id[0] : id;

      const member = await MemberService.getMemberById(memberId);
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      await MemberService.deleteMember(memberId);
      res.json({ message: 'Member deleted successfully' });
    } catch (error: any) {
      logger.error('Delete member controller error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete member' });
    }
  }
}
