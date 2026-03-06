import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, TransactionController.getTransactions);
router.get('/:id', authenticate, TransactionController.getTransactionById);

export default router;
