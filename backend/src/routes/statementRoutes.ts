import { Router } from 'express';
import { StatementController } from '../controllers/statementController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticate, StatementController.generateStatement);
router.get('/', authenticate, StatementController.getStatements);
router.get('/:id', authenticate, StatementController.getStatementById);
router.get('/:id/download', authenticate, StatementController.downloadStatement);
router.delete('/:id', authenticate, StatementController.deleteStatement);

export default router;
