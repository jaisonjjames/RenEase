import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

import categoryRoutes from './routes/categoryRoutes';
import assetRoutes from './routes/assetRoutes';
import rentalRoutes from './routes/rentalRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import User from './models/User';
import Category from './models/Category';
import Asset from './models/Asset';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RentEase API is running' });
});

const PORT = process.env.PORT || 5000;

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      const newAdmin = new User({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: 'admin',
        role: 'superadmin'
      });
      await newAdmin.save();
      console.log('Seeded initial superadmin account: admin@gmail.com / admin');
    }
  } catch (err) {
    console.error('Failed to seed admin', err);
  }
};

const seedData = async () => {
  try {
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log('Seeding initial mock categories and assets...');
      const c1 = new Category({ name: 'Beach Chairs', slug: 'beach-chairs', description: 'Comfortable loungers.', displayOrder: 1 });
      const c2 = new Category({ name: 'Umbrellas', slug: 'umbrellas', description: 'Stay cool.', displayOrder: 2 });
      await Promise.all([c1.save(), c2.save()]);

      const a1 = new Asset({ name: 'Premium Recliner Chair', category_id: c1._id, location: 'South Beach', price_per_hour: 15, deposit_amount: 20, status: 'available' });
      const a2 = new Asset({ name: 'Standard Beach Chair', category_id: c1._id, location: 'Miami Beach', price_per_hour: 10, deposit_amount: 10, status: 'available' });
      const a3 = new Asset({ name: 'Large UV Umbrella', category_id: c2._id, location: 'South Beach', price_per_hour: 12, deposit_amount: 15, status: 'available' });
      await Promise.all([a1.save(), a2.save(), a3.save()]);
      console.log('Finished seeding data.');
    }
  } catch (err) {
    console.error('Failed to seed data', err);
  }
};

const startServer = async () => {
  await connectDB();
  await seedAdmin();
  await seedData();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
