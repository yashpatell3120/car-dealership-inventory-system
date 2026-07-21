import { Router, Request, Response } from 'express';
import { createUser, findUserByEmail } from '../db/userRepository';
import { hashPassword, comparePassword, signToken } from '../utils/auth';
import { registerSchema, loginSchema } from '../utils/validation';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { email, password, role } = parsed.data;

  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'A user with that email already exists' });
  }

  const passwordHash = await hashPassword(password);
  const user = createUser(email, passwordHash, role ?? 'user');

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
    token,
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { email, password } = parsed.data;
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return res.status(200).json({
    user: { id: user.id, email: user.email, role: user.role },
    token,
  });
});

export default router;
