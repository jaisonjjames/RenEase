import { Router } from 'express';
import User from '../models/User';
import { verifyToken, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// GET /api/users/profile - Get current user profile
router.get('/profile', verifyToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users - Superadmin only
router.get('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users - Superadmin adding another user (e.g., admin)
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const newUser = new User({ name, email, password, phone, role });
    await newUser.save();
    
    // omit password in response
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
