import { Router } from 'express';
import mongoose from 'mongoose';
import Asset from '../models/Asset';

const router = Router();

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.category_id) filter.category_id = req.query.category_id;
    if (req.query.status) filter.status = req.query.status;
    
    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    let query = Asset.find(filter).populate('category_id');
    
    if (req.query.sort === 'latest') {
      query = query.sort({ createdAt: -1 });
    }
    
    if (req.query.limit) {
      query = query.limit(Number(req.query.limit));
    }

    const assets = await query;
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/assets/:id
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('category_id');
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import { verifyToken, requireAdmin } from '../middleware/authMiddleware';

// POST /api/assets (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const newAsset = new Asset(req.body);
    await newAsset.save();
    res.status(201).json(newAsset);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/assets/:id (Admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!asset) return res.status(404).json({ error: 'Not found' });
    res.json(asset);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/assets/:id (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
