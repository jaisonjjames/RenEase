import { Router } from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category';

const router = Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('displayOrder');
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:slug - for admin mostly to get details or checking
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import { verifyToken, requireAdmin } from '../middleware/authMiddleware';

// POST /api/categories (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/categories/:id (Admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
