import { Router } from 'express';
import { MemberController } from '../controllers/memberController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'CHAIRMAN', 'TREASURER'), MemberController.createMember);
router.get('/', authenticate, authorize('ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'), MemberController.getAllMembers);
router.get('/:id', authenticate, MemberController.getMember);
router.put('/:id', authenticate, authorize('ADMIN', 'CHAIRMAN', 'TREASURER'), MemberController.updateMember);
router.delete('/:id', authenticate, authorize('ADMIN', 'CHAIRMAN'), MemberController.deleteMember);

export default router;
