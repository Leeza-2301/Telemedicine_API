import { Router } from 'express';
import { authenticateUser, authorizeRole } from '../middleware/Auth.ts';
import { createAdmin, deleteUser } from '../controllers/adminController';

const router = Router();

// Protect routes with authenticateUser and authorizeRole
router.post('/create', authenticateUser, authorizeRole(['superadmin']), createAdmin);
router.delete('/:userType/:userId', authenticateUser, authorizeRole(['admin']), deleteUser);

export default router;
