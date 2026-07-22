import { Router, Response } from 'express';
import { listOrdersForUser, listAllOrders } from '../db/orderRepository';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/orders - the logged-in user's own purchase history.
// Admins can pass ?all=true to see every order across all users.
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const wantsAll = req.query.all === 'true';

  if (wantsAll && req.user?.role === 'admin') {
    return res.status(200).json({ orders: listAllOrders() });
  }

  const orders = listOrdersForUser(req.user!.userId);
  return res.status(200).json({ orders });
});

export default router;
