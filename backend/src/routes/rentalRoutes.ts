import { Router } from 'express';
import Rental from '../models/Rental';
import Asset from '../models/Asset';

const router = Router();

// POST /api/rentals (Checkout start)
router.post('/', async (req, res) => {
  try {
    const { asset_id, user_info } = req.body;
    
    // Verify asset
    const asset = await Asset.findById(asset_id);
    if (!asset || asset.status !== 'available') {
      return res.status(400).json({ error: 'Asset is not available for rent' });
    }

    // Mock rental setup
    const newRental = new Rental({
      asset_id,
      user_info,
      status: 'pending_payment',
      deposit_amount: asset.deposit_amount,
      rental_amount: asset.price_per_hour, // First hour required or something similar
    });
    await newRental.save();

    // Mark asset as rented momentarily or pending? Let's say pending payment doesn't lock heavily without timeout, but let's lock it.
    asset.status = 'rented';
    await asset.save();

    res.status(201).json({ rental: newRental, mockPaymentUrl: `/mock-checkout/${newRental._id}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rentals (Admin views all, user views by phone/id)
router.get('/', async (req, res) => {
  try {
    const rentals = await Rental.find().populate('asset_id');
    res.json(rentals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
