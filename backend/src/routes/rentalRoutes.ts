import { Router } from 'express';
import Rental from '../models/Rental';
import Asset from '../models/Asset';
import Category from '../models/Category';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/rentals/stats (Admin) — dashboard overview stats
router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const activeRentals = await Rental.countDocuments({ status: 'active' });

    // Revenue today: sum rental_amount for rentals created today with status active or completed
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayRentals = await Rental.find({
      createdAt: { $gte: startOfDay },
      status: { $in: ['active', 'completed'] }
    });
    const revenueToday = todayRentals.reduce((sum, r) => sum + (r.rental_amount || 0), 0);

    const totalAssets = await Asset.countDocuments();
    const totalCategories = await Category.countDocuments({ isActive: true });

    res.json({ activeRentals, revenueToday, totalAssets, totalCategories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rentals/my — rentals for the currently logged-in user
router.get('/my', verifyToken, async (req: AuthRequest, res) => {
  try {
    const rentals = await Rental.find({ user_id: req.user!.id })
      .populate('asset_id')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rentals (Checkout start)
router.post('/', async (req, res) => {
  try {
    const { asset_id, user_info, user_id } = req.body;

    // Verify asset
    const asset = await Asset.findById(asset_id);
    if (!asset || asset.status !== 'available') {
      return res.status(400).json({ error: 'Asset is not available for rent' });
    }

    const newRental = new Rental({
      asset_id,
      user_id: user_id || undefined,
      user_info,
      status: 'pending_payment',
      deposit_amount: asset.deposit_amount,
      rental_amount: asset.price_per_hour,
    });
    await newRental.save();

    // Mark asset as rented
    asset.status = 'rented';
    await asset.save();

    res.status(201).json(newRental);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/rentals/:id/confirm — confirm payment (simulated)
router.patch('/:id/confirm', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: 'Rental not found' });
    if (rental.status !== 'pending_payment') {
      return res.status(400).json({ error: 'Rental is not awaiting payment' });
    }

    rental.status = 'active';
    rental.start_time = new Date();
    await rental.save();

    res.json(rental);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rentals (Admin views all)
router.get('/', async (req, res) => {
  try {
    const rentals = await Rental.find().populate('asset_id');
    res.json(rentals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
